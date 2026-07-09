import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { AppTopbar } from '@/components/layout/AppTopbar';
import { TooltipProvider } from '@/components/ui/tooltip';

export default async function DashLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).maybeSingle();
  if (!profile?.is_admin) redirect('/login?error=not_admin');

  return (
    <TooltipProvider delayDuration={0}>
      <div className="flex h-screen overflow-hidden">
        <AppSidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <AppTopbar email={user.email ?? ''} />
          <main className="flex-1 overflow-y-auto bg-muted/30 p-6">{children}</main>
        </div>
      </div>
    </TooltipProvider>
  );
}
