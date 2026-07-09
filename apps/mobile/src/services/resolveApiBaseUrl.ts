import Constants from 'expo-constants';
import { NativeModules } from 'react-native';

/**
 * Resolve a URL base da API Fastify em DEV de forma robusta para simulador E iPhone físico.
 *
 * O problema: `EXPO_PUBLIC_API_URL` é embutido no bundle e costuma trazer um IP de LAN
 * fixo (ex.: 192.168.1.73). Quando o DHCP troca o IP do Mac, o app para de alcançar a API
 * — tanto no simulador quanto no device — porque o IP embutido "morreu".
 *
 * A solução: derivar o host a partir de onde o próprio bundle JS foi baixado (o host do
 * Metro). Esse host é, por definição, alcançável de onde o app está rodando:
 *   - Simulador iOS/Android → host = localhost/127.0.0.1 (compartilha a rede do Mac);
 *   - iPhone/Android físico → host = IP de LAN do Mac (o mesmo que serviu o bundle).
 * Assim a API sempre acompanha o IP atual, sem editar .env nem reiniciar nada.
 *
 * Precedência:
 *   1) Se `EXPO_PUBLIC_API_URL` aponta para um backend REMOTO (prod/staging, não-LAN),
 *      respeita sempre (é uma escolha explícita).
 *   2) Em DEV local, usa o host do Metro + a porta do env (padrão 3333).
 *   3) Fallback: o próprio env, ou localhost (build de release sem Metro).
 */

const DEFAULT_PORT = '3333';

/** true para localhost/127.0.0.1 e faixas privadas de LAN (10/8, 192.168/16, 172.16–31/12). */
function isLanOrLocal(url: string): boolean {
  return /^(https?:\/\/)?(localhost|127\.0\.0\.1|10\.\d|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/i.test(url);
}

/** Host de onde o bundle veio (Metro). Pode ser localhost (simulador) ou IP de LAN (device). */
function metroHost(): string | null {
  const c = Constants as unknown as {
    expoConfig?: { hostUri?: string };
    expoGoConfig?: { debuggerHost?: string };
    manifest?: { debuggerHost?: string; hostUri?: string };
    manifest2?: { extra?: { expoGo?: { debuggerHost?: string } } };
  };

  const hostUri =
    c.expoConfig?.hostUri ||
    c.expoGoConfig?.debuggerHost ||
    c.manifest?.hostUri ||
    c.manifest?.debuggerHost ||
    c.manifest2?.extra?.expoGo?.debuggerHost ||
    '';

  const fromExpo = hostUri.split('/')[0].split(':')[0].trim();
  if (fromExpo) return fromExpo;

  // Fallback: a URL do bundle JS (scriptURL), ex.: "http://192.168.1.77:8081/index.bundle?..."
  const scriptURL: string | undefined = (NativeModules as { SourceCode?: { scriptURL?: string } })?.SourceCode?.scriptURL;
  const m = scriptURL?.match(/^https?:\/\/([^/:]+)/i);
  return m?.[1] ?? null;
}

export function resolveApiBaseUrl(): string {
  const env = process.env.EXPO_PUBLIC_API_URL?.trim();

  // 1) Backend remoto explícito (produção) vence.
  if (env && !isLanOrLocal(env)) return env.replace(/\/$/, '');

  // 2) DEV local: host do Metro + porta do env.
  const port = env?.match(/:(\d+)(?:\/|$)/)?.[1] || DEFAULT_PORT;
  const host = metroHost();
  if (host) return `http://${host}:${port}`;

  // 3) Fallback.
  return (env || `http://localhost:${DEFAULT_PORT}`).replace(/\/$/, '');
}
