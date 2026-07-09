import React, { useEffect, useMemo, useState } from 'react';
import { View, Text as RNText, StyleSheet } from 'react-native';
import { Crown, Star } from 'lucide-react-native';
import { SectorSelect } from '@/components/molecules';
import { UserAvatar } from '@/components/atoms';
import { useSectors } from '@/hooks/useSectors';
import { getSectorLeadership, type SectorLeader, type SectorLeadership } from '@/services/sectors';

const personName = (p?: SectorLeader | null) =>
  p ? `${p.first_name ?? ''} ${p.last_name ?? ''}`.trim() || 'Membro' : '';

const LeaderRow: React.FC<{ icon: React.ReactNode; role: string; person: SectorLeader }> = ({ icon, role, person }) => (
  <View style={st.row}>
    <UserAvatar userId={person.id} avatar={person.avatar} firstName={person.first_name} lastName={person.last_name} size={40} showPresence={false} />
    <View style={{ flex: 1 }}>
      <RNText style={st.name} numberOfLines={1}>{personName(person)}</RNText>
      <View style={st.roleRow}>{icon}<RNText style={st.role}>{role}</RNText></View>
    </View>
  </View>
);

/**
 * Passo "setor" do cadastro. profiles.sector é UUID; o SectorSelect trabalha com TÍTULO —
 * então guardamos o ID no form e mapeamos título↔id pela lista. Ao selecionar, mostra a
 * liderança do setor (pastor coordenador + líder) via endpoint público (pré-login).
 */
export const SectorBeat: React.FC<{ value: string; onChange: (id: string) => void; error?: string }> = ({ value, onChange, error }) => {
  const { sectors } = useSectors(true);
  const title = useMemo(() => sectors.find((s) => s.id === value)?.title ?? '', [sectors, value]);
  const onPickTitle = (t: string) => {
    const found = sectors.find((s) => s.title === t);
    if (found) onChange(found.id);
  };

  const [lead, setLead] = useState<SectorLeadership | null>(null);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (!value) { setLead(null); return; }
    let alive = true;
    setLoading(true);
    getSectorLeadership(value)
      .then((r) => { if (alive) setLead(r); })
      .catch(() => { if (alive) setLead(null); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [value]);

  const hasLeadership = !!lead && (!!lead.coordinator || !!lead.leader);

  return (
    <View style={{ gap: 16 }}>
      <SectorSelect value={title} onChange={onPickTitle} label="Setor" error={error} />
      {!!value && (
        <View style={st.card}>
          <RNText style={st.cardTitle}>Liderança do {lead?.sectorName || title}</RNText>
          {loading ? (
            <RNText style={st.muted}>Carregando liderança…</RNText>
          ) : hasLeadership ? (
            <View style={{ gap: 12, marginTop: 10 }}>
              {lead!.coordinator && (
                <LeaderRow icon={<Crown size={13} color="#FFD700" />} role="Pastor coordenador setorial" person={lead!.coordinator} />
              )}
              {lead!.leader && (
                <LeaderRow icon={<Star size={13} color="#E51C44" />} role="Líder setorial" person={lead!.leader} />
              )}
            </View>
          ) : (
            <RNText style={st.muted}>Liderança ainda não definida para este setor.</RNText>
          )}
        </View>
      )}
    </View>
  );
};

const st = StyleSheet.create({
  card: { padding: 16, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.10)' },
  cardTitle: { color: '#94A3B8', fontSize: 12, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' },
  muted: { color: '#64748B', fontSize: 13.5, marginTop: 8 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  name: { color: '#F1F5F9', fontSize: 15, fontWeight: '700' },
  roleRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 },
  role: { color: '#94A3B8', fontSize: 12.5 },
});
