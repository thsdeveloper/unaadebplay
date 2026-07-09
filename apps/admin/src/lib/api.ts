'use client';

import { createApiClient } from '@repo/api-client';
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

/** Browser API client — attaches the current Supabase access token to every request. */
export const api = createApiClient({
  baseUrl: process.env.NEXT_PUBLIC_API_URL!,
  getToken: async () => {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token ?? null;
  },
  onUnauthorized: () => {
    if (typeof window !== 'undefined') window.location.href = '/login';
  },
});
