'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ChevronRight, LogOut } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { getResource } from '@/resources/registry';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function AppTopbar({ email }: { email: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const segments = pathname.split('/').filter(Boolean);

  const crumbs: { label: string; href: string }[] = [{ label: 'Dashboard', href: '/' }];
  if (segments[0]) {
    const res = getResource(segments[0]);
    crumbs.push({ label: res?.label ?? segments[0], href: `/${segments[0]}` });
    if (segments[1] === 'new') crumbs.push({ label: 'Novo', href: pathname });
    else if (segments[1]) crumbs.push({ label: 'Editar', href: pathname });
  }

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b bg-card/60 px-6 backdrop-blur">
      <nav className="flex items-center gap-1.5 text-sm">
        {crumbs.map((c, i) => (
          <span key={c.href + i} className="flex items-center gap-1.5">
            {i > 0 && <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60" />}
            {i < crumbs.length - 1 ? (
              <Link href={c.href} className="text-muted-foreground transition-colors hover:text-foreground">
                {c.label}
              </Link>
            ) : (
              <span className="font-medium">{c.label}</span>
            )}
          </span>
        ))}
      </nav>

      <div className="ml-auto">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-9 gap-2 px-2">
              <Avatar className="h-7 w-7">
                <AvatarFallback className="bg-primary/10 text-xs text-primary">{email.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <span className="hidden text-sm text-muted-foreground sm:inline">{email}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="truncate">{email}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={async () => {
                await supabase.auth.signOut();
                router.push('/login');
                router.refresh();
              }}
            >
              <LogOut className="mr-2 h-4 w-4" /> Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
