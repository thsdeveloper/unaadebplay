'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Send, Users, User, Loader2, CheckCircle2 } from 'lucide-react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';

type Target = 'all' | 'users';
type Profile = { id: string; first_name?: string | null; last_name?: string | null; email?: string | null; status?: string | null };
type SendResult = {
  created: number;
  push: { recipients: number; valid: number; sent: number; errors: number; deactivated: number };
};

function Stat({ label, value, tone }: { label: string; value: number; tone?: 'good' | 'bad' }) {
  return (
    <div className="rounded-md border bg-muted/30 p-3">
      <div className={tone === 'good' ? 'text-lg font-semibold text-primary' : tone === 'bad' && value > 0 ? 'text-lg font-semibold text-destructive' : 'text-lg font-semibold'}>
        {value}
      </div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

export default function PushComposePage() {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [type, setType] = useState('');
  const [target, setTarget] = useState<Target>('all');
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [search, setSearch] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<SendResult | null>(null);

  const usersQuery = useQuery({
    queryKey: ['profiles-picker'],
    queryFn: () => api.adminResource<Profile>('profiles').list({ limit: 500, sort: 'first_name' }),
    enabled: target === 'users',
    staleTime: 60_000,
  });

  const users = usersQuery.data?.data ?? [];
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) => `${u.first_name ?? ''} ${u.last_name ?? ''} ${u.email ?? ''}`.toLowerCase().includes(q));
  }, [users, search]);

  const selectedIds = useMemo(() => Object.keys(selected).filter((k) => selected[k]), [selected]);
  const toggle = (id: string) => setSelected((s) => ({ ...s, [id]: !s[id] }));

  const canSubmit = !!title.trim() && !!body.trim() && (target === 'all' || selectedIds.length > 0) && !submitting;

  async function onSend() {
    if (!canSubmit) return;
    setSubmitting(true);
    setResult(null);
    try {
      const res = (await api.notifications.send({
        title: title.trim(),
        body: body.trim(),
        type: type.trim() || undefined,
        target,
        user_ids: target === 'users' ? selectedIds : undefined,
      })) as SendResult;
      setResult(res);
      toast.success(`Notificação criada para ${res.created} usuário(s) · ${res.push.sent} push enviado(s)`);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Enviar notificação</h1>
        <p className="text-sm text-muted-foreground">
          Cria a notificação in-app e dispara o push remoto (Expo → APNs no iOS / FCM no Android) para os dispositivos ativos.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Conteúdo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="title">Título</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex.: Novo congresso disponível" maxLength={120} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="body">Mensagem</Label>
            <Textarea id="body" value={body} onChange={(e) => setBody(e.target.value)} placeholder="Texto da notificação…" rows={4} maxLength={500} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="type">Tipo (opcional)</Label>
            <Input id="type" value={type} onChange={(e) => setType(e.target.value)} placeholder="Ex.: congresso, noticia, geral" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Destinatários</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button type="button" variant={target === 'all' ? 'default' : 'outline'} onClick={() => setTarget('all')} className="flex-1">
              <Users className="mr-2 h-4 w-4" /> Todos os ativos
            </Button>
            <Button type="button" variant={target === 'users' ? 'default' : 'outline'} onClick={() => setTarget('users')} className="flex-1">
              <User className="mr-2 h-4 w-4" /> Usuários específicos
            </Button>
          </div>

          {target === 'users' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <Input placeholder="Buscar por nome ou e-mail…" value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-xs" />
                <Badge variant="secondary">{selectedIds.length} selecionado(s)</Badge>
              </div>
              <div className="max-h-64 divide-y overflow-y-auto rounded-md border">
                {usersQuery.isLoading && <div className="p-3 text-sm text-muted-foreground">Carregando usuários…</div>}
                {!usersQuery.isLoading && filtered.length === 0 && <div className="p-3 text-sm text-muted-foreground">Nenhum usuário encontrado.</div>}
                {filtered.map((u) => {
                  const name = `${u.first_name ?? ''} ${u.last_name ?? ''}`.trim() || u.email || u.id;
                  return (
                    <div
                      key={u.id}
                      onClick={() => toggle(u.id)}
                      className="flex cursor-pointer items-center gap-3 px-3 py-2 text-sm hover:bg-accent"
                    >
                      <Checkbox checked={!!selected[u.id]} onCheckedChange={() => toggle(u.id)} onClick={(e) => e.stopPropagation()} />
                      <span className="flex-1 truncate">{name}</span>
                      {u.email && <span className="truncate text-xs text-muted-foreground">{u.email}</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {result && (
        <Card className="border-primary/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CheckCircle2 className="h-4 w-4 text-primary" /> Resultado do envio
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              <Stat label="Notificações criadas" value={result.created} />
              <Stat label="Dispositivos alvo" value={result.push.recipients} />
              <Stat label="Tokens válidos" value={result.push.valid} />
              <Stat label="Push enviados" value={result.push.sent} tone="good" />
              <Stat label="Erros" value={result.push.errors} tone="bad" />
              <Stat label="Tokens desativados" value={result.push.deactivated} />
            </div>
            {result.push.recipients === 0 && (
              <p className="text-xs text-muted-foreground">
                Nenhum dispositivo com token ativo — a notificação aparece na lista in-app, mas não houve push. Esperado enquanto não há
                tokens registrados (iOS depende de conta Apple paga; Android via FCM funciona com um build assinado).
              </p>
            )}
          </CardContent>
        </Card>
      )}

      <div className="flex justify-end">
        <Button onClick={onSend} disabled={!canSubmit}>
          {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
          Enviar notificação
        </Button>
      </div>
    </div>
  );
}
