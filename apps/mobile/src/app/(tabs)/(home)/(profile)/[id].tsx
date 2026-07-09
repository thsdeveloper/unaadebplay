import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text as RNText, Pressable, StyleSheet, ScrollView, ActivityIndicator, Linking } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { ChevronLeft, ShieldCheck, Users, Activity, Award, Crown, UserCheck, Users2, Instagram, Linkedin, Music2, MessageCircle, Pencil } from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import { UserAvatar } from '@/components/atoms';
import { SectorLeadership } from '@/components/users/SectorLeadership';
import { SameSectorMembers } from '@/components/users/SameSectorMembers';
import { UserItem } from '@/components/users';
import { getUser, followUser, unfollowUser, getFollowing, getFollowers } from '@/services/user';
import { getStorageUrl } from '@/services/storage';
import { useSectorDetail } from '@/hooks/useSectorDetail';
import { useAuth } from '@/contexts/AuthContext';
import AlertContext from '@/contexts/AlertContext';
import { SHEET } from '@/constants/sheetTokens';
import type { UserTypes } from '@/types/UserTypes';

// Banner (cover) no estilo do perfil do X: fita full-width que passa POR TRÁS da
// status bar; o avatar sobrepõe a borda inferior. Altura visível ~150.
const COVER_H = 150;
const AVATAR_SIZE = 88;

// 4 abas internas (X-style), cada uma com ÍCONE + rótulo. A barra rola na horizontal
// (bleed edge-to-edge) porque 4 abas com ícone+texto não cabem numa linha só.
const TABS: { key: string; label: string; Icon: LucideIcon }[] = [
  { key: 'lideranca', label: 'Liderança', Icon: Crown },
  { key: 'membros', label: 'Membros', Icon: Users },
  { key: 'seguindo', label: 'Seguindo', Icon: UserCheck },
  { key: 'seguidores', label: 'Seguidores', Icon: Users2 },
];

/**
 * Lista de pessoas (seguindo/seguidores) renderizada por MAP de `UserItem` — nunca uma
 * FlatList vertical aninhada (o perfil já é um ScrollView vertical; aninhar quebra o
 * scroll). Server-cap 100 → um map simples escala de sobra. Estados: skeleton enquanto
 * carrega, vazio amigável e as linhas quando há dados.
 */
const PeopleList = React.memo<{
  data: UserTypes[] | null;
  loading: boolean;
  emptyText: string;
  onPressUser: (u: UserTypes) => void;
}>(({ data, loading, emptyText, onPressUser }) => {
  if (loading && data === null) {
    return (
      <View style={s.listState}>
        <ActivityIndicator color={SHEET.brand} />
      </View>
    );
  }
  if (!data || data.length === 0) {
    return (
      <View style={s.listState}>
        <RNText style={s.emptyText}>{emptyText}</RNText>
      </View>
    );
  }
  return (
    <View style={s.peopleList}>
      {data.map((u) => (
        <UserItem key={u.id} user={u} onPress={onPressUser} />
      ))}
    </View>
  );
});
PeopleList.displayName = 'PeopleList';

export default function UserProfile() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const alert = useContext(AlertContext);
  const { user: authUser } = useAuth();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [user, setUser] = useState<UserTypes | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followPending, setFollowPending] = useState(false);
  const [tab, setTab] = useState(0);

  // Listas LAZY: `null` = ainda não buscadas; `[]` = buscadas e vazias. Assim cada aba
  // só dispara a request na PRIMEIRA abertura e o resultado fica em cache local (voltar
  // é instantâneo). `*Loading` só cobre o primeiro carregamento (data === null).
  const [following, setFollowing] = useState<UserTypes[] | null>(null);
  const [followers, setFollowers] = useState<UserTypes[] | null>(null);
  const [followingLoading, setFollowingLoading] = useState(false);
  const [followersLoading, setFollowersLoading] = useState(false);

  useEffect(() => {
    let alive = true;
    // Novo perfil (nav lateral perfil→perfil usa REPLACE e mantém a tela montada): zera as
    // listas lazy para não vazar seguindo/seguidores do usuário anterior. Como `user?.id`
    // muda em seguida, o efeito de lazy-load rebusca a lista da aba atual para o novo id.
    setFollowing(null);
    setFollowers(null);
    setFollowingLoading(false);
    setFollowersLoading(false);
    (async () => {
      try {
        const u = await getUser<UserTypes>(String(id));
        if (!alive) return;
        setUser(u);
        setIsFollowing(!!u?.is_following);
        setFollowersCount(u?.followers_count ?? 0);
      } catch (e) {
        console.error('Erro ao carregar perfil:', e);
      }
    })();
    return () => { alive = false; };
  }, [id]);

  // Ao REGANHAR foco (ex.: voltar da tela de editar perfil em Ajustes), rebusca os dados —
  // o fetch acima depende só de [id] e não re-rodaria. Pula o 1º foco (já buscou ao montar).
  const didMountRef = useRef(false);
  useFocusEffect(
    useCallback(() => {
      if (!didMountRef.current) { didMountRef.current = true; return; }
      let alive = true;
      getUser<UserTypes>(String(id))
        .then((u) => {
          if (!alive) return;
          setUser(u);
          setIsFollowing(!!u?.is_following);
          setFollowersCount(u?.followers_count ?? 0);
        })
        .catch(() => {});
      return () => { alive = false; };
    }, [id]),
  );

  const name = [user?.first_name, user?.last_name].filter(Boolean).join(' ').trim() || 'Membro';
  const isActive = user?.status === 'active';
  const coverUri = getStorageUrl(user?.cover_image, 'images');
  const bio = user?.description?.trim();
  const isOwnProfile = !!authUser?.id && authUser.id === user?.id;

  // Contexto de setor: nome + liderança (coordenador/líder) + demais membros.
  const { sectorName, coordinator, leader, members, loading: sectorLoading } = useSectorDetail(
    user?.sector,
    user?.id,
  );

  // Follow OTIMISTA: vira o estado + ajusta followers ±1 na hora; sincroniza com a
  // verdade do servidor no sucesso e REVERTE tudo em caso de erro.
  const onToggleFollow = useCallback(async () => {
    if (!user?.id || followPending) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const prevFollowing = isFollowing;
    const nextFollowing = !prevFollowing;
    setIsFollowing(nextFollowing);
    setFollowersCount((c) => c + (nextFollowing ? 1 : -1));
    setFollowPending(true);

    try {
      const serverState = nextFollowing
        ? await followUser(user.id)
        : await unfollowUser(user.id);
      setIsFollowing(serverState);
    } catch {
      setIsFollowing(prevFollowing);
      setFollowersCount((c) => c + (nextFollowing ? -1 : 1));
      alert?.error?.('Não foi possível atualizar. Tente novamente.');
    } finally {
      setFollowPending(false);
    }
  }, [user?.id, followPending, isFollowing, alert]);

  const onSelectTab = useCallback((index: number) => {
    Haptics.selectionAsync();
    setTab(index);
  }, []);

  // Lazy-load da lista da aba aberta. As deps são SÓ [tab, user?.id]: setar loading/dados
  // NÃO re-dispara o efeito. (BUG anterior: `*Loading` e as próprias listas estavam nas
  // deps E eram setados aqui dentro → o efeito re-rodava a cada setState → a cleanup
  // `alive = false` invalidava a request EM VOO → `.then/.catch/.finally` nunca rodavam →
  // `following`/`followers` presos em null e loading preso em true → spinner eterno.)
  // O guard `=== null` mantém o cache (busca só na 1ª abertura da aba); a cleanup só
  // cancela em troca real de aba/perfil ou unmount, e o caso é auto-recuperável (rebusca).
  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;
    if (tab === 2 && following === null) {
      setFollowingLoading(true);
      getFollowing(user.id)
        .then((list) => { if (!cancelled) setFollowing(list); })
        .catch(() => { if (!cancelled) setFollowing([]); })
        .finally(() => { if (!cancelled) setFollowingLoading(false); });
    } else if (tab === 3 && followers === null) {
      setFollowersLoading(true);
      getFollowers(user.id)
        .then((list) => { if (!cancelled) setFollowers(list); })
        .catch(() => { if (!cancelled) setFollowers([]); })
        .finally(() => { if (!cancelled) setFollowersLoading(false); });
    }
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, user?.id]);

  // Navegação LATERAL entre perfis: sempre REPLACE (mantém a pilha rasa) — regra do app.
  const onPressUser = useCallback((u: UserTypes) => {
    router.replace(`/(tabs)/(home)/(profile)/${u.id}` as any);
  }, [router]);

  const loading = !user;

  // Metadados X-style (inline, ícones pequenos, mudos): título · setor · status.
  const metaItems: { key: string; icon: React.ReactNode; text: string }[] = [];
  if (user?.title) {
    metaItems.push({ key: 'title', icon: <Award size={14} color={SHEET.gold} />, text: user.title });
  }
  if (sectorName) {
    metaItems.push({ key: 'sector', icon: <Users size={14} color={SHEET.brand} />, text: sectorName });
  }
  if (user) {
    metaItems.push({
      key: 'status',
      icon: <Activity size={14} color={isActive ? SHEET.success : SHEET.textMuted} />,
      text: isActive ? 'Ativo' : 'Inativo',
    });
  }

  // Redes sociais VISÍVEIS: o get_public_profiles já mascara o que o usuário optou por
  // ocultar (só chegam aqui as permitidas). Monta a URL de saída de cada uma.
  const socialLinks = useMemo(() => {
    type Social = { key: string; label: string; Icon: LucideIcon; color: string; url: string };
    if (!user) return [] as Social[];
    const out: Social[] = [];
    const ig = user.instagram?.trim();
    if (ig) out.push({ key: 'ig', label: 'Instagram', Icon: Instagram, color: '#E1306C', url: /^https?:\/\//i.test(ig) ? ig : `https://instagram.com/${ig.replace(/^@/, '')}` });
    const li = user.linkedin?.trim();
    if (li) {
      // Campo "URL ou usuário": aceita URL completa, domínio sem esquema (prefixa https)
      // ou handle puro (monta /in/). Evita o bug de URL duplicada (linkedin.com/in/foo).
      const liUrl = /^https?:\/\//i.test(li)
        ? li
        : /\/|linkedin\.com/i.test(li)
          ? `https://${li.replace(/^\/+/, '')}`
          : `https://www.linkedin.com/in/${li.replace(/^@/, '')}`;
      out.push({ key: 'li', label: 'LinkedIn', Icon: Linkedin, color: '#0A66C2', url: liUrl });
    }
    const tk = user.tiktok?.trim();
    if (tk) out.push({ key: 'tk', label: 'TikTok', Icon: Music2, color: SHEET.textPrimary, url: /^https?:\/\//i.test(tk) ? tk : `https://www.tiktok.com/@${tk.replace(/^@/, '')}` });
    const wa = user.whatsapp?.trim();
    if (wa) {
      const digits = wa.replace(/\D/g, '');
      const full = digits.length > 0 && digits.length <= 11 ? `55${digits}` : digits; // default BR
      if (full) out.push({ key: 'wa', label: 'WhatsApp', Icon: MessageCircle, color: '#25D366', url: `https://wa.me/${full}` });
    }
    return out;
  }, [user]);

  return (
    <View style={s.screen}>
      <StatusBar style="light" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
      >
        {/* COVER — banner full-width; foto ou gradiente de marca */}
        <View style={[s.cover, { height: COVER_H }]}>
          {coverUri ? (
            <Image source={{ uri: coverUri }} style={StyleSheet.absoluteFill} contentFit="cover" transition={250} />
          ) : (
            <LinearGradient
              colors={[SHEET.brand, SHEET.bgDeep]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
          )}
          {/* Scrim inferior sutil → o anel do avatar e a base do banner se assentam no bg. */}
          <LinearGradient colors={['transparent', SHEET.bg]} locations={[0.55, 1]} style={StyleSheet.absoluteFill} />
        </View>

        {/* LINHA AVATAR + FOLLOW — avatar sobrepõe o banner; botão à direita */}
        <View style={s.headerRow}>
          {loading ? (
            <View style={s.avatarSkeleton} />
          ) : (
            <Animated.View entering={FadeIn.duration(300)} style={s.avatarWrap}>
              <UserAvatar
                userId={user!.id}
                avatar={user!.avatar}
                firstName={user!.first_name}
                lastName={user!.last_name}
                size={AVATAR_SIZE}
                ringColor={SHEET.bg}
                ringWidth={4}
              />
            </Animated.View>
          )}

          {!loading && !isOwnProfile && (
            <Pressable
              onPress={onToggleFollow}
              disabled={followPending}
              accessibilityRole="button"
              accessibilityLabel={isFollowing ? 'Deixar de seguir' : 'Seguir'}
              style={[
                s.followBtn,
                isFollowing ? s.followBtnOutline : s.followBtnSolid,
                followPending && { opacity: 0.6 },
              ]}
            >
              <RNText style={[s.followText, isFollowing ? s.followTextOutline : s.followTextSolid]}>
                {isFollowing ? 'Seguindo' : 'Seguir'}
              </RNText>
            </Pressable>
          )}

          {/* Próprio perfil: em vez de Seguir, atalho para editar (na stack de Ajustes). */}
          {!loading && isOwnProfile && (
            <Pressable
              onPress={() => router.push('/(tabs)/(settings)/profile')}
              accessibilityRole="button"
              accessibilityLabel="Editar perfil"
              style={s.editBtn}
            >
              <Pencil size={15} color={SHEET.textPrimary} />
              <RNText style={s.editBtnText}>Editar perfil</RNText>
            </Pressable>
          )}
        </View>

        {/* IDENTIDADE — nome, bio, metadados, contadores */}
        <View style={s.identity}>
          {loading ? (
            <View style={{ gap: 12 }}>
              <View style={[s.skBar, { width: '55%', height: 22 }]} />
              <View style={[s.skBar, { width: '80%', height: 13 }]} />
              <View style={[s.skBar, { width: '40%', height: 13 }]} />
            </View>
          ) : (
            <>
              <Animated.View entering={FadeInDown.duration(320)} style={s.nameRow}>
                <RNText style={s.name} numberOfLines={2}>{name}</RNText>
                {!!user!.title && <ShieldCheck size={18} color={SHEET.gold} fill={SHEET.gold} />}
              </Animated.View>

              {!!bio && <RNText style={s.bio}>{bio}</RNText>}

              {metaItems.length > 0 && (
                <View style={s.metaRow}>
                  {metaItems.map((it, idx) => (
                    <View key={it.key} style={s.metaItem}>
                      {idx > 0 && <RNText style={s.metaDot}>·</RNText>}
                      {it.icon}
                      <RNText style={s.metaText} numberOfLines={1}>{it.text}</RNText>
                    </View>
                  ))}
                </View>
              )}

              <View style={s.countsRow}>
                <View style={s.countItem}>
                  <RNText style={s.countNum}>{user!.following_count ?? 0}</RNText>
                  <RNText style={s.countLabel}>Seguindo</RNText>
                </View>
                <View style={s.countItem}>
                  <RNText style={s.countNum}>{followersCount}</RNText>
                  <RNText style={s.countLabel}>Seguidores</RNText>
                </View>
              </View>

              {socialLinks.length > 0 && (
                <View style={s.socialRow}>
                  {socialLinks.map(({ key, label, Icon, color, url }) => (
                    <Pressable
                      key={key}
                      onPress={() => Linking.openURL(url).catch(() => alert?.error?.('Não foi possível abrir o link.'))}
                      accessibilityRole="link"
                      accessibilityLabel={`Abrir ${label}`}
                      hitSlop={6}
                      style={s.socialChip}
                    >
                      <Icon size={18} color={color} />
                    </Pressable>
                  ))}
                </View>
              )}
            </>
          )}
        </View>

        {/* TABS internas (X-style) — 4 abas com ícone, barra que rola na horizontal e
            sangra de borda a borda; troca o conteúdo sem navegar (crossfade). */}
        {!loading && !!user?.sector && (
          <>
            <View style={s.tabsBarWrap}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={s.tabsBarContent}
              >
                {TABS.map(({ key, label, Icon }, i) => {
                  const active = tab === i;
                  const tint = active ? SHEET.textPrimary : SHEET.textMuted;
                  return (
                    <Pressable
                      key={key}
                      onPress={() => onSelectTab(i)}
                      accessibilityRole="tab"
                      accessibilityState={{ selected: active }}
                      style={s.tabBtn}
                    >
                      <Icon size={16} color={tint} />
                      <RNText style={[s.tabLabel, active && s.tabLabelActive]}>{label}</RNText>
                      {active && <View style={s.tabUnderline} />}
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>

            <Animated.View key={tab} entering={FadeIn.duration(220)} style={s.tabContent}>
              {tab === 0 && (
                <SectorLeadership coordinator={coordinator} leader={leader} loading={sectorLoading} />
              )}
              {tab === 1 && <SameSectorMembers members={members} loading={sectorLoading} />}
              {tab === 2 && (
                <PeopleList
                  data={following}
                  loading={followingLoading}
                  emptyText="Não está seguindo ninguém"
                  onPressUser={onPressUser}
                />
              )}
              {tab === 3 && (
                <PeopleList
                  data={followers}
                  loading={followersLoading}
                  emptyText="Ninguém ainda"
                  onPressUser={onPressUser}
                />
              )}
            </Animated.View>
          </>
        )}
      </ScrollView>

      {/* Botão voltar flutuante (sempre visível sobre o banner) */}
      <Pressable
        onPress={() => router.back()}
        hitSlop={8}
        style={[s.backBtn, { top: insets.top + 8 }]}
        accessibilityLabel="Voltar"
      >
        <ChevronLeft size={22} color={SHEET.textPrimary} />
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: SHEET.bg },

  cover: { width: '100%', backgroundColor: SHEET.surface },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: -AVATAR_SIZE / 2,
  },
  avatarWrap: {
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  avatarSkeleton: {
    width: AVATAR_SIZE + 8,
    height: AVATAR_SIZE + 8,
    borderRadius: (AVATAR_SIZE + 8) / 2,
    backgroundColor: SHEET.glass,
    borderWidth: 4,
    borderColor: SHEET.bg,
  },

  // Follow: pílula sólida branca ("Seguir") vs. contorno mudo ("Seguindo") — look do X.
  followBtn: {
    height: 36,
    paddingHorizontal: 20,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  followBtnSolid: { backgroundColor: SHEET.textPrimary },
  followBtnOutline: { backgroundColor: 'transparent', borderWidth: 1, borderColor: SHEET.border },
  followText: { fontSize: 15, fontWeight: '700' },
  followTextSolid: { color: SHEET.bgDeep },
  followTextOutline: { color: SHEET.textPrimary },

  // Editar perfil (próprio): contorno mudo + ícone (look do X "Edit profile").
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 36,
    paddingHorizontal: 16,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: SHEET.border,
    marginBottom: 6,
  },
  editBtnText: { color: SHEET.textPrimary, fontSize: 14, fontWeight: '700' },

  // Redes sociais visíveis — chips circulares que abrem o link externo.
  socialRow: { flexDirection: 'row', gap: 10, marginTop: 2 },
  socialChip: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: SHEET.glass,
    borderWidth: 1,
    borderColor: SHEET.border,
  },

  identity: { paddingHorizontal: 16, paddingTop: 12, gap: 10 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  name: { color: SHEET.textPrimary, fontSize: 22, fontWeight: '800', letterSpacing: 0.2 },
  bio: { color: SHEET.textSecondary, fontSize: 14.5, lineHeight: 20 },

  metaRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 5, maxWidth: '100%' },
  metaDot: { color: SHEET.textFaint, fontSize: 14, marginRight: 3 },
  metaText: { color: SHEET.textMuted, fontSize: 13.5, fontWeight: '600' },

  countsRow: { flexDirection: 'row', gap: 20, marginTop: 2 },
  countItem: { flexDirection: 'row', alignItems: 'baseline', gap: 4 },
  countNum: { color: SHEET.textPrimary, fontSize: 15, fontWeight: '800' },
  countLabel: { color: SHEET.textMuted, fontSize: 14 },

  // A borda inferior fica no WRAP (full-width, edge-to-edge) enquanto o ScrollView rola
  // por cima; assim a hairline não encolhe junto com o conteúdo rolável.
  tabsBarWrap: {
    marginTop: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: SHEET.border,
  },
  tabsBarContent: { flexDirection: 'row' },
  tabBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  tabLabel: { color: SHEET.textMuted, fontSize: 14.5, fontWeight: '700' },
  tabLabelActive: { color: SHEET.textPrimary },
  tabUnderline: {
    position: 'absolute',
    bottom: -StyleSheet.hairlineWidth,
    height: 3,
    width: 56,
    borderRadius: 3,
    backgroundColor: SHEET.brand,
  },
  tabContent: { paddingHorizontal: 16, paddingTop: 16, gap: 20, minHeight: 160 },

  // Listas de pessoas: negativa o padding do tabContent → linhas do UserItem (que já têm
  // seu próprio px16) ficam borda-a-borda e alinhadas. Estados de loading/vazio centrados.
  peopleList: { marginHorizontal: -16 },
  listState: { paddingVertical: 28, alignItems: 'center', justifyContent: 'center' },
  emptyText: { color: SHEET.textMuted, fontSize: 14, fontWeight: '600' },

  backBtn: {
    position: 'absolute',
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(14,21,38,0.55)',
    borderWidth: 1,
    borderColor: SHEET.border,
  },

  // skeleton
  skBar: { borderRadius: 8, backgroundColor: SHEET.glass, borderWidth: 1, borderColor: SHEET.border },
});
