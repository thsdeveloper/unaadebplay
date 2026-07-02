import { supabase } from "./supabase";
import {UserTypes} from "@/types/UserTypes";
import {GlobalQueryParams} from "@/types/GlobalQueryParamsTypes";
import {GenericItem} from "./items";

// Colunas reais da tabela profiles que o usuário pode atualizar no próprio perfil.
// Fora desta lista (e bloqueadas em nível de coluna no banco):
//  - role/status: server-controlled (evita auto-elevação/burlar o gate de conta ativa)
//  - id/password/token/tfa_secret/last_page: não são colunas ou são server-only
const PROFILE_UPDATABLE_COLUMNS = [
    'first_name', 'last_name', 'avatar', 'phone', 'gender', 'birthdate', 'sector',
    'theme', 'language', 'title', 'description', 'location', 'tags',
    'responsible_name', 'responsible_phone', 'responsible_email',
] as const;

// Diretório de usuários: lê a fonte SEGURA (RPC get_public_profiles) — só colunas não-PII.
// A tabela profiles tem RLS owner-only, então leitura direta de outros usuários retorna vazio.
export async function getUsers<T extends GenericItem>(params?: GlobalQueryParams): Promise<UserTypes[]> {
    const f: any = params?.filter ?? {};
    const { data, error } = await supabase.rpc('get_public_profiles', {
        p_ids: f.id?._in ?? null,
        p_role: f.role?._eq ?? null,
        p_sector: f.sector?._eq ?? null,
        p_search: f.name?._icontains ?? f.first_name?._icontains ?? null,
        p_status: f.status?._eq ?? 'active',
        p_limit: (params?.limit as number) ?? 50,
        p_offset: (params?.offset as number) ?? 0,
    });
    if (error) throw error;
    return (data ?? []) as unknown as UserTypes[];
}

export async function getUser<T extends GenericItem>(id: string, _params?: GlobalQueryParams): Promise<UserTypes> {
    const { data, error } = await supabase.rpc('get_public_profiles', { p_ids: [id], p_status: null });
    if (error) throw error;
    const row = data?.[0];
    if (!row) throw new Error('Usuário não encontrado.');
    return row as unknown as UserTypes;
}

export async function setUser(_userObject: any): Promise<UserTypes> {
    // Criação de usuários é feita por supabase.auth.signUp (AuthContext.register), não aqui.
    throw new Error('Criação de usuário não suportada por este método. Use o cadastro (signUp).');
}

/** Atualiza o perfil do usuário autenticado (tabela profiles, RLS owner-only). */
export async function updateUserMe(parcelUserObject: any): Promise<UserTypes> {
    const { data: { session } } = await supabase.auth.getSession();
    const uid = session?.user?.id;
    if (!uid) {
        throw new Error('Usuário não autenticado.');
    }

    // Mantém apenas chaves que são colunas de profiles
    const payload: Record<string, any> = {};
    for (const key of PROFILE_UPDATABLE_COLUMNS) {
        if (key in parcelUserObject) payload[key] = parcelUserObject[key];
    }

    const { data, error } = await supabase
        .from('profiles')
        .update(payload as any)
        .eq('id', uid)
        .select('*')
        .single();

    if (error) throw error;
    return data as unknown as UserTypes;
}

/**
 * Auto-desativa a conta do usuário autenticado (status='suspended').
 * `status` é server-controlled — esta é a única transição permitida pelo usuário,
 * via RPC SECURITY DEFINER, em vez de um update direto de coluna privilegiada.
 */
export async function deactivateMyAccount(): Promise<void> {
    const { error } = await supabase.rpc('deactivate_my_account');
    if (error) throw error;
}

// NOTA DE SEGURANÇA: não expomos um endpoint de "este email existe?" (oráculo de
// enumeração de contas). A unicidade do email é garantida pelo próprio signUp do Supabase,
// que retorna erro de duplicidade no cadastro. Estas funções permanecem para compatibilidade
// com os validadores existentes e respondem de forma otimista (disponível).
export const emailExists = async (_email: string): Promise<boolean> => {
    return false;
};

export const checkEmailAvailability = async (_email: string): Promise<boolean> => {
    return true;
};

// Exportar como objeto para facilitar o uso
export const userService = {
    getUsers,
    getUser,
    setUser,
    updateUserMe,
    emailExists,
    checkEmailAvailability,
};