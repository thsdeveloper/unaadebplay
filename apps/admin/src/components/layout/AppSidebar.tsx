'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, type ComponentType } from 'react';
import { ChevronLeft, LayoutDashboard, Send } from 'lucide-react';
import { cn } from '@/lib/utils';
import { RESOURCES, RESOURCE_GROUPS } from '@/resources/registry';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

function NavLink({
  href,
  icon: Icon,
  label,
  active,
  collapsed,
}: {
  href: string;
  icon: ComponentType<{ className?: string }>;
  label: string;
  active: boolean;
  collapsed: boolean;
}) {
  const link = (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
        active ? 'bg-primary/10 font-medium text-primary' : 'text-muted-foreground hover:bg-accent hover:text-foreground',
        collapsed && 'justify-center px-0',
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {!collapsed && <span className="truncate">{label}</span>}
    </Link>
  );
  if (!collapsed) return link;
  return (
    <Tooltip>
      <TooltipTrigger asChild>{link}</TooltipTrigger>
      <TooltipContent side="right">{label}</TooltipContent>
    </Tooltip>
  );
}

export function AppSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  return (
    <aside className={cn('flex h-screen flex-col border-r bg-card transition-all duration-200', collapsed ? 'w-16' : 'w-64')}>
      <div className="flex h-14 items-center gap-2 border-b px-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
          U
        </div>
        {!collapsed && (
          <span className="text-sm font-semibold">
            UNAADEB <span className="text-primary">Admin</span>
          </span>
        )}
        <button onClick={() => setCollapsed((c) => !c)} className="ml-auto rounded-md p-1.5 text-muted-foreground hover:bg-accent">
          <ChevronLeft className={cn('h-4 w-4 transition-transform', collapsed && 'rotate-180')} />
        </button>
      </div>

      <nav className="flex-1 space-y-3 overflow-y-auto p-2">
        <NavLink href="/" icon={LayoutDashboard} label="Dashboard" active={pathname === '/'} collapsed={collapsed} />
        <NavLink href="/push" icon={Send} label="Enviar Push" active={isActive('/push')} collapsed={collapsed} />
        {RESOURCE_GROUPS.map((group) => (
          <div key={group}>
            {!collapsed && (
              <div className="px-3 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">{group}</div>
            )}
            <div className="space-y-0.5">
              {RESOURCES.filter((r) => r.group === group).map((r) => (
                <NavLink key={r.key} href={`/${r.key}`} icon={r.icon} label={r.label} active={isActive(`/${r.key}`)} collapsed={collapsed} />
              ))}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}
