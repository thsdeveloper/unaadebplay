# Auditoria de Consumo de Bateria — UNAADEB Play (mobile)

**Data:** 2026-07-08 · **Stack:** Expo SDK 56 · RN 0.85 · React 19.2 · Reanimated 4
**Escopo:** `apps/mobile/src` — timers/polling, subscriptions Realtime, listeners de sistema, animações contínuas, áudio/background, re-renders.
**Método:** varredura estática (5 frentes paralelas) + verificação manual dos achados de maior impacto. Sem profiling em device ainda (ver seção "Como validar").

---

## 1. Sumário executivo

**A base é saudável.** Não há os grandes vilões clássicos de bateria:

- ❌ **Sem** localização em background / geofencing (`expo-location` não usado)
- ❌ **Sem** `expo-keep-awake` (tela nunca é forçada a ficar ligada)
- ❌ **Sem** `BackgroundFetch` / `TaskManager` (nenhuma tarefa periódica em background)
- ❌ **Sem** WebView/YouTube ativos (`react-native-webview` e `react-native-youtube-iframe` estão instalados mas **não são usados** — dá pra remover)
- ✅ Auto-refresh de token do Supabase pausa em background (padrão correto)
- ✅ `expo-updates` só checa ao voltar do foreground (1×/sessão)
- ✅ Presença (Realtime) desconecta em background
- ✅ O player de áudio já separa contexts (progresso não re-renderiza as listas)

**O problema real não é um dreno catastrófico — é um conjunto de "trabalho que nunca deixa a CPU/GPU dormir", que se torna grave num cenário específico: tocar áudio em background.** Explico em §2.

**Onde focar (ordem de impacto/custo):**

| # | Área | Impacto | Esforço | Onde |
|---|------|---------|---------|------|
| P0 | Animações infinitas na Home sem pausar em blur/background | Alto (contínuo) | Baixo-Médio | `ActionTile`, `AppWordmark`, `AvatarGroup`, `HomeHero` |
| P0 | `console.log` por render no `DirectusImage` (todos os cards de lista) | Médio-Alto | Trivial | `DirectusImage.tsx` |
| P1 | Realtime de traduções não desconecta em background | Médio | Trivial | `TranslationContext.tsx:236` |
| P1 | `updateInterval: 500` do player (2 ticks/s) | Médio (só tocando) | Trivial | `AudioPlayerContext.tsx:120` |
| P1 | Providers com `value` não memoizado (Alert, Translation) | Médio | Baixo | `AlertContext`, `TranslationContext` |
| P2 | `EventCountdownHero` — `setInterval` de 1s | Baixo-Médio | Baixo | `EventCountdownHero.tsx:59` |
| P2 | `NotificationBell` polling não pausa em background | Baixo* | Baixo | `NotificationBell.tsx:93` |
| P2 | Skeletons com N loops independentes | Baixo (transitório) | Baixo | `users.tsx`, `skeleton/index.tsx` |

\* Baixo na maioria do tempo — **exceto durante áudio em background** (§2).

---

## 2. Contexto crítico: o amplificador do áudio em background

Isto é o mais importante do relatório e reenquadra vários achados dos varredores.

No **iOS**, quando o app vai para background ele é **suspenso** em poucos segundos: a thread JS congela. Enquanto suspenso, **`setInterval`/`setTimeout` NÃO disparam, heartbeats de WebSocket NÃO rodam e animações NÃO consomem CPU**. Ou seja — vários alertas de "isso drena 24/7 em background" dos varredores estão **superestimados para o app suspenso**. O Android tem Doze/App-Standby que também estrangula timers.

**A exceção que muda tudo:** o app declara `UIBackgroundModes: ["audio"]` (`app.json`) + `shouldPlayInBackground: true`. Quando o usuário está **ouvindo um repertório com o app em background**, o iOS **mantém o app vivo** — e aí **TODO** o resto continua rodando com a tela apagada:

- os `setInterval` (countdown de 1s, polling do sino, agendador de 30 min)
- os heartbeats dos canais Realtime (notificações + traduções)
- e — se a tela da Home ainda estiver montada — as animações infinitas (wordmark, shine, 6 action tiles, hero)

**Conclusão:** priorizar as correções que reduzem trabalho contínuo enquanto o áudio toca. Cada `setInterval` a menos e cada animação pausada = CPU dormindo por mais tempo com a tela apagada = bateria poupada exatamente no cenário de uso mais longo do app (ouvir louvores).

---

## 3. Achados priorizados

### 🔴 P0-A — Animações infinitas na Home nunca pausam (blur/background)

Cinco fontes de animação **em loop infinito** (`withRepeat(..., -1)`) coexistem na Home e **nenhuma** usa `useFocusEffect`/`useIsFocused` ou reage ao `AppState` — só param no unmount, que no tab navigator raramente acontece:

| Componente | Arquivo:linha | Loop | Instâncias | Cancela? |
|-----------|---------------|------|-----------|----------|
| Action tiles (degradê fluindo) | `components/molecules/ActionTile/index.tsx:61-66` | 5200ms | **6 simultâneos** | ❌ sem `cancelAnimation` |
| Wordmark "UNAADEB Play" (glow) | `components/atoms/AppWordmark/index.tsx:117` | 1600ms | 1 | só no unmount |
| Avatar shine (card Comunidade) | `components/AvatarGroup.tsx:46` | 2200ms | 1 | só no unmount |
| Hero sweep (skeleton do carrossel) | `components/organisms/HomeHero/index.tsx:181` | 1300ms | 1 (durante load) | ✅ tem cancel |
| Carrossel autoPlay | `components/organisms/HomeHero/index.tsx:298` | 6000ms | 1 | respeita `reduceMotion` |

**Por que importa:** animações Reanimated rodam na **UI thread** (não bloqueiam JS — por isso não é "crítico" como um varredor classificou), mas mantêm a **GPU ativa e impedem o downclock de frame-rate**. Seis+ animações perpétuas fazem a Home nunca ficar ociosa. E, no cenário do §2 (áudio em background com a Home montada), seguem rodando com a tela apagada.

**Correção (padrão reutilizável):** pausar quando a tela perde foco ou o app vai a background.

```tsx
import { useIsFocused } from '@react-navigation/native';
import { cancelAnimation } from 'react-native-reanimated';

const isFocused = useIsFocused();
useEffect(() => {
  if (!isFocused) { cancelAnimation(flow); return; }
  flow.value = withDelay(phase * 1600,
    withRepeat(withTiming(1, { duration: 5200, easing: Easing.inOut(Easing.ease) }), -1, true));
  return () => cancelAnimation(flow);
}, [isFocused, flow, phase]);
```

Para cobrir o background junto, combinar com um `AppState` gate (ou um hook compartilhado `useActiveAnimation(sharedValue, builder)`).

---

### 🔴 P0-B — `console.log` em caminho de render no `DirectusImage`

`components/DirectusImage.tsx` tem **3 `console.log`** em efeitos/render, e o componente é usado em **praticamente todos os cards de lista** (verificado: `NewsListCard`, `EventListCard`, `EventCard`, `HomeHero`, `HomeBanner`, `NewsCard`, `EventCountdownHero`, detalhes de post/evento/congresso…).

```tsx
// DirectusImage.tsx:181
useEffect(() => {
  console.log('[DirectusImage] Component mounted/updated:', { assetId, loadingState, width, height, imageUrl });
  // ...
}, [assetId, loadingState, width, height]);
```

**Por que importa:** num feed rolando com dezenas de imagens, isso são dezenas/centenas de `console.log` por segundo. Em device, `console.log` serializa e cruza a ponte nativa; com Metro/DevTools conectado fica **muito** caro. É desperdício puro de JS thread.

**Correção (trivial):** remover, ou proteger com `if (__DEV__ && DEBUG_IMAGES)`. Idealmente zero logs no caminho de render de qualquer componente de lista. Vale um `grep -rn "console.log" src` e limpar os que estão em render/efeitos de componentes de lista.

> Observação: o app migrou de Directus → Supabase, mas `DirectusImage` continua sendo o componente de imagem base (resolve URL + estados de load). Não é código morto.

---

### 🟠 P1-A — Realtime de traduções fica assinado em background

`TranslationContext.tsx:231-236` — o handler de `AppState` para background existe, mas o desligamento está **comentado**:

```tsx
} else if (nextAppState === 'background') {
  isAppActive.current = false;
  // Opcional: desconectar do Realtime em segundo plano para economizar bateria
  // disconnectRealtime();   // ⟵ comentado
}
```

**Por que importa:** traduções quase nunca mudam — manter um canal WebSocket dedicado só pra isso é o pior custo-benefício entre os Realtimes. No app suspenso o socket congela (§2), mas durante áudio-em-background ele mantém heartbeats à toa. `PresenceContext` já faz o certo (desconecta em background) — basta espelhar.

**Correção:** descomentar `disconnectRealtime()` no ramo `background` (o `active` já reconecta na linha 214-216). Alternativa mais enxuta: **abandonar Realtime para traduções** e só refazer o fetch ao voltar ao foreground (já existe essa lógica em 219-229).

---

### 🟠 P1-B — Player emite 2 ticks/s (`updateInterval: 500`)

`AudioPlayerContext.tsx:120` — `createAudioPlayer({ uri }, { updateInterval: 500 })`.

**O que JÁ está bom:** o context é dividido em `controls` (muda pouco) e `progress` (position/duration). As **listas de repertório não re-renderizam** nos ticks — só a barra de progresso do mini/full player. Design correto.

**O que dá pra melhorar:**
1. `updateInterval: 1000` (1×/s) já é suave pra uma barra de progresso — corta os re-renders do `ProgressContext` pela metade.
2. `useAudioPlayer.ts:34` cria player **sem** `updateInterval` explícito → usa o default do expo-audio (potencialmente mais frequente). Padronizar em 1000ms.
3. (Opcional, maior esforço) dirigir a barra por `useSharedValue` + Reanimated em vez de `setState`, eliminando re-render de JS por tick — como o projeto já usa Reanimated, encaixa bem.

---

### 🟠 P1-C — `value` de Provider não memoizado (Alert + Translation)

Objeto `value` recriado a cada render → todos os consumidores re-renderizam quando o provider renderiza.

- **`AlertContext.tsx:38`** — objeto literal com 4 funções inline, sem `useMemo`/`useCallback`. Mitigação: o provider só re-renderiza quando um alerta é exibido (estado muda pouco) → impacto **baixo-médio**, mas o fix é barato.
- **`TranslationContext.tsx:293`** — `value` inline não memoizado (o `t` interno já é `useCallback`, mas o objeto externo não). Como **quase toda tela** consome `t()`, cada mudança de `isLoading`/`lastUpdated`/`realtimeConnected` re-renderiza a árvore inteira. Impacto **médio**.

**Correção:**
```tsx
const value = useMemo(() => ({ t, refreshTranslations, isLoading, lastUpdated, realtimeConnected }),
  [t, refreshTranslations, isLoading, lastUpdated, realtimeConnected]);
return <TranslationContext.Provider value={value}>{children}</TranslationContext.Provider>;
```
No `AlertContext`, memoizar as funções com `useCallback` e o objeto com `useMemo`.

> `NotificationContext` (linha 418) **já usa `useMemo`** no value — não precisa de ação (um varredor apontou erroneamente).

---

### 🟡 P2-A — `EventCountdownHero`: `setInterval` de 1s

`components/events/EventCountdownHero.tsx:59` — `setInterval(() => setNow(Date.now()), 1000)`. Tem cleanup ✅, mas re-renderiza 1×/s enquanto visível e **múltiplas instâncias** podem coexistir num feed.

**Correção:** se a UI mostra minutos/horas (não segundos), subir para 5–10s. Se mostra segundos, considerar um único "relógio" global (context) que todos os countdowns consomem, em vez de N intervalos paralelos. Mesmo raciocínio para `CountdownTimer.tsx:14`.

---

### 🟡 P2-B — `NotificationBell`: polling não pausa em background

`NotificationBell.tsx:93` — `setInterval` de 15s/45s/90s (offline / com-não-lidas / normal). Tem cleanup ✅ e já faz **backoff pra 90s quando o Realtime está conectado** (o polling é fallback). No app suspenso não dispara (§2); o custo aparece só durante áudio-em-background.

**Correção (opcional):** gate por `AppState` — pausar o intervalo em `background`, um refresh único ao voltar (o `NotificationContext` já faz o refresh-on-foreground, então dá até pra confiar nele e afrouxar aqui). Baixa prioridade.

---

### 🟡 P2-C — Skeletons com N loops independentes (transitório)

- `app/(tabs)/(home)/users.tsx:17` — 8× `SkeletonRow`, cada um com seu `withRepeat` próprio.
- `components/ui/skeleton/index.tsx:61` — `Animated.loop` (core RN) sem limite.

**Realidade:** só rodam **durante o carregamento** e desmontam quando os dados chegam — logo o rótulo "CRÍTICA" de um varredor está superestimado. Ainda assim, 8 shared values independentes é desperdício. **Correção barata:** compartilhar um único `pulse` entre as linhas (como `EventListSkeletons` já faz).

---

## 4. Falsos-positivos / já bem implementado

Registrado para não gerar retrabalho:

- **`supabase.ts:98` (AppState → start/stopAutoRefresh):** um varredor marcou "crítico, nunca removido". **É o padrão oficial do Supabase** — listener singleton de módulo, vive de propósito por toda a vida do app, e **pausa** o refresh em background. Correto. Não mexer.
- **`DirectusImageService` NetInfo listener (singleton):** é **um** listener criado uma vez pro app todo — custo desprezível. O problema no `DirectusImage` é o `console.log`, não o NetInfo.
- **`NotificationContext` value:** já memoizado (§P1-C).
- **`AudioPlayerContext` split controls/progress:** já feito — listas não re-renderizam nos ticks.
- **`PresenceContext`:** desconecta em background, cleanup correto — modelo a seguir.
- **`AppUpdateManager` / `useEventNotifications` / `NetworkContext` / `useDeviceTilt`:** cleanup correto.
- **`EventSearchBar` / `EmailValidator` / `useUserList`:** debounces corretos (250–500ms com cleanup).

---

## 5. Plano de correção sugerido (por onda)

**Onda 1 — quick wins (minutos, alto retorno):**
1. Remover/guardar os `console.log` do `DirectusImage` (e varrer `console.log` em render de componentes de lista). *(P0-B)*
2. Descomentar `disconnectRealtime()` no background do `TranslationContext`. *(P1-A)*
3. `updateInterval: 1000` no player + padronizar `useAudioPlayer`. *(P1-B)*
4. Memoizar `value` de `TranslationContext` e `AlertContext`. *(P1-C)*
5. Remover deps não usadas: `react-native-webview`, `react-native-youtube-iframe` (e conferir `@directus/sdk`, `axios`, `moment`).

**Onda 2 — animações (médio, maior retorno contínuo):**
6. Hook `useFocusedRepeat(sharedValue, builder)` que pausa em blur + background, e aplicar em `ActionTile`, `AppWordmark`, `AvatarGroup`. *(P0-A)*

**Onda 3 — timers (baixo):**
7. `EventCountdownHero`/`CountdownTimer`: relógio global ou intervalo maior. *(P2-A)*
8. `NotificationBell`: gate de `AppState` (ou confiar no refresh-on-foreground do context). *(P2-B)*
9. Skeletons: compartilhar um `pulse`. *(P2-C)*

---

## 6. Como validar (device real)

Números de "% de bateria" citados pelos varredores são **estimativas grosseiras** — não tratar como medição. Para medir de verdade:

- **iOS:** Xcode → *Debug Navigator → Energy Impact* com o app em uso; e **Instruments → Time Profiler / Animation Hitches**. Rodar 3 cenários por 5 min: (a) parado na Home, (b) rolando um feed, (c) **áudio tocando com o app em background** (o cenário-chave do §2).
- **Android:** `adb shell dumpsys batterystats` + Battery Historian; Android Studio Energy Profiler.
- **JS/re-render:** React DevTools Profiler (destaque de re-renders) e `<Profiler>` em torno da Home; confirmar que a barra de progresso do áudio não re-renderiza as listas.
- **Baseline vs. depois:** medir Energy Impact na Home antes/depois da Onda 2 (animações) — é onde a diferença deve ser mais visível.

---

*Gerado por auditoria estática com verificação manual. Nenhum arquivo foi modificado — este é um relatório.*
