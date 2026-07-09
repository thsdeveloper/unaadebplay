import { Expo, type ExpoPushMessage, type ExpoPushTicket } from 'expo-server-sdk';
import type { FastifyInstance } from 'fastify';

/**
 * Emissor de push via Expo Push Service (exp.host → APNs no iOS / FCM no Android).
 *
 * Responsabilidades: ler os device_tokens ATIVOS dos usuários-alvo, validar que são
 * Expo push tokens, quebrar em lotes (<=100) e enviar, e desativar tokens que a Expo
 * reporta como mortos (DeviceNotRegistered / InvalidCredentials) — assim a base de
 * tokens se autolimpa. Recibos assíncronos (getReceipts, ~15min depois) ficam como
 * evolução futura; aqui tratamos os erros imediatos de ticket.
 *
 * Independe da conta Apple: no iOS a entrega real só ocorre quando o app tiver o
 * entitlement aps-environment (conta paga) e uma APNs Key subida no EAS; no Android
 * (FCM) já funciona. Este código está pronto para os dois — só depende de haver tokens.
 */

let expoClient: Expo | null = null;
function getExpo(): Expo {
  if (!expoClient) {
    // EXPO_ACCESS_TOKEN só é necessário se a "Enhanced Security for Push" estiver ligada na conta Expo.
    expoClient = new Expo({ accessToken: process.env.EXPO_ACCESS_TOKEN || undefined });
  }
  return expoClient;
}

export interface PushMessage {
  title: string;
  body: string;
  data?: Record<string, unknown>;
}

export interface PushResult {
  /** device_tokens ativos encontrados para os usuários-alvo. */
  recipients: number;
  /** quantos eram Expo push tokens válidos. */
  valid: number;
  /** tickets com status 'ok'. */
  sent: number;
  /** tickets/lotes com erro. */
  errors: number;
  /** tokens marcados status=false por estarem mortos. */
  deactivated: number;
}

/**
 * Envia um push para todos os device_tokens ativos dos `userIds`. Retorna um resumo
 * (nunca lança por token inválido — só lança em erro de infra, ex.: consulta ao banco).
 */
export async function sendPushToUsers(
  app: FastifyInstance,
  userIds: string[],
  message: PushMessage,
): Promise<PushResult> {
  const result: PushResult = { recipients: 0, valid: 0, sent: 0, errors: 0, deactivated: 0 };
  if (userIds.length === 0) return result;

  const { data: rows, error } = await app.supabaseAdmin
    .from('device_tokens')
    .select('id, token, user_id')
    .in('user_id', userIds)
    .eq('status', true);
  if (error) throw error;

  const tokens = rows ?? [];
  result.recipients = tokens.length;
  if (tokens.length === 0) return result;

  // token → ids das linhas (um token pode repetir em linhas distintas) para desativar em massa.
  const rowsByToken = new Map<string, string[]>();
  const messages: ExpoPushMessage[] = [];
  for (const r of tokens) {
    if (!Expo.isExpoPushToken(r.token)) continue;
    result.valid++;
    const ids = rowsByToken.get(r.token) ?? [];
    ids.push(r.id);
    rowsByToken.set(r.token, ids);
    messages.push({
      to: r.token,
      title: message.title,
      body: message.body,
      data: message.data ?? {},
      sound: 'default',
      priority: 'high',
    });
  }
  if (messages.length === 0) return result;

  const expo = getExpo();
  const invalidTokens = new Set<string>();

  // Processa lote a lote: os tickets vêm na MESMA ordem do lote, então o índice j mapeia
  // ticket → mensagem daquele lote (evita desalinhamento se um lote inteiro falhar).
  for (const chunk of expo.chunkPushNotifications(messages)) {
    let tickets: ExpoPushTicket[] = [];
    try {
      tickets = await expo.sendPushNotificationsAsync(chunk);
    } catch (err) {
      app.log.error({ err }, '[push] falha ao enviar lote para a Expo');
      result.errors += chunk.length;
      continue;
    }
    tickets.forEach((ticket, j) => {
      if (ticket.status === 'ok') {
        result.sent++;
        return;
      }
      result.errors++;
      const badToken = chunk[j]?.to as string | undefined;
      const code = (ticket.details as { error?: string } | undefined)?.error;
      if (badToken && (code === 'DeviceNotRegistered' || code === 'InvalidCredentials')) {
        invalidTokens.add(badToken);
      }
    });
  }

  // Autolimpeza: desativa tokens que a Expo diz estarem mortos.
  if (invalidTokens.size) {
    const ids = [...invalidTokens].flatMap((tk) => rowsByToken.get(tk) ?? []);
    if (ids.length) {
      const { error: deErr } = await app.supabaseAdmin.from('device_tokens').update({ status: false }).in('id', ids);
      if (deErr) app.log.error({ err: deErr }, '[push] falha ao desativar tokens mortos');
      else result.deactivated = ids.length;
    }
  }

  return result;
}
