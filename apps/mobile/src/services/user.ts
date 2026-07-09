import { api } from './apiClient';
import { UserTypes } from '@/types/UserTypes';
import { GlobalQueryParams } from '@/types/GlobalQueryParamsTypes';
import { GenericItem } from './items';

// Colunas do perfil que o usuário pode atualizar (o servidor também aplica esta whitelist
// e o banco bloqueia role/status/is_admin em nível de grant/trigger).
const PROFILE_UPDATABLE_COLUMNS = [
  'first_name', 'last_name', 'avatar', 'cover_image', 'phone', 'gender', 'birthdate', 'sector',
  'theme', 'language', 'title', 'description', 'location', 'tags',
  'responsible_name', 'responsible_phone', 'responsible_email',
  'instagram', 'linkedin', 'tiktok', 'whatsapp', 'social_visibility',
] as const;

// Diretório de usuários: fonte SEGURA (RPC get_public_profiles, não-PII) via API.
export async function getUsers<T extends GenericItem>(params?: GlobalQueryParams): Promise<UserTypes[]> {
  const f: any = params?.filter ?? {};
  const res = await api.users.directory({
    search: f.name?._icontains ?? f.first_name?._icontains ?? undefined,
    role: f.role?._eq ?? undefined,
    sector: f.sector?._eq ?? undefined,
    status: f.status?._eq ?? 'active',
    limit: (params?.limit as number) ?? 50,
    offset: (params?.offset as number) ?? 0,
  });
  return (res.data ?? []) as unknown as UserTypes[];
}

export async function getUser<T extends GenericItem>(id: string, _params?: GlobalQueryParams): Promise<UserTypes> {
  return (await api.users.get(id)) as unknown as UserTypes;
}

// Preview de liderança da Home: membros com título distinto, em ordem variada (não alfabética).
export async function getLeadership(limit = 12): Promise<UserTypes[]> {
  const res = await api.users.leadership(limit);
  return (res.data ?? []) as unknown as UserTypes[];
}

export async function setUser(_userObject: any): Promise<UserTypes> {
  // Criação de usuários é feita por supabase.auth.signUp (AuthContext.register), não aqui.
  throw new Error('Criação de usuário não suportada por este método. Use o cadastro (signUp).');
}

/** Atualiza o perfil do usuário autenticado (API PATCH /me, RLS owner-only). */
export async function updateUserMe(parcelUserObject: any): Promise<UserTypes> {
  const payload: Record<string, any> = {};
  for (const key of PROFILE_UPDATABLE_COLUMNS) {
    if (key in parcelUserObject) payload[key] = parcelUserObject[key];
  }
  return (await api.me.update<UserTypes>(payload)) as unknown as UserTypes;
}

/** Auto-desativa a conta do usuário autenticado (API DELETE /me → RPC SECURITY DEFINER). */
export async function deactivateMyAccount(): Promise<void> {
  await api.me.deactivate();
}

/** Segue o usuário `id` (idempotente). Retorna o novo estado `following`. */
export async function followUser(id: string): Promise<boolean> {
  const res = await api.users.follow(id);
  return res?.following ?? true;
}

/** Deixa de seguir o usuário `id`. */
export async function unfollowUser(id: string): Promise<boolean> {
  const res = await api.users.unfollow(id);
  return res?.following ?? false;
}

/** Perfis que SEGUEM o usuário `id` (seguidores). */
export async function getFollowers(id: string, limit = 100): Promise<UserTypes[]> {
  const res = await api.users.followers(id, { limit });
  return (res?.data ?? []) as unknown as UserTypes[];
}

/** Perfis que o usuário `id` SEGUE (seguindo). */
export async function getFollowing(id: string, limit = 100): Promise<UserTypes[]> {
  const res = await api.users.following(id, { limit });
  return (res?.data ?? []) as unknown as UserTypes[];
}

// Checa se já existe conta com o email (via API pública /auth/email-exists) para oferecer
// login no cadastro. Em caso de falha de rede, responde `false` (não bloqueia o fluxo).
export const emailExists = async (email: string): Promise<boolean> => {
  const e = (email ?? '').trim();
  if (!e) return false;
  try {
    const res = await api.request<{ exists: boolean }>(`/auth/email-exists?email=${encodeURIComponent(e)}`);
    return !!res?.exists;
  } catch {
    return false;
  }
};

export const checkEmailAvailability = async (email: string): Promise<boolean> => !(await emailExists(email));

export const userService = {
  getUsers,
  getUser,
  setUser,
  updateUserMe,
  emailExists,
  checkEmailAvailability,
};
