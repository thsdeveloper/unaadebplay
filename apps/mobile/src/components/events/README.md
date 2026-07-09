# Componentes de Eventos

## Visão Geral

Esta pasta contém componentes específicos para a funcionalidade de eventos da aplicação UNAADEB. Todos os componentes seguem os princípios SOLID e clean code.

## Componentes

### EventCard

Componente de cartão de evento com suporte a dois modos: normal e compacto.

**Props:**
- `event: EventsTypes` - Dados do evento
- `onFavoriteToggle?: (eventId: string) => void` - Callback para favoritar/desfavoritar
- `isFavorite?: boolean` - Estado de favorito
- `isCompact?: boolean` - Modo compacto para listas menores

**Features:**
- Animações de pressão e favorito
- Suporte a gradientes baseados no tipo de evento
- Modo compacto para exibição em listas relacionadas
- Integração com DirectusImage para imagens otimizadas

### EventFilters

Sistema completo de filtros para eventos com modal dedicado.

**Props:**
- `onApplyFilters: (filters: EventFilters) => void` - Callback ao aplicar filtros
- `activeFilters: EventFilters` - Filtros atualmente ativos
- `onClearFilters: () => void` - Callback para limpar filtros

**Filtros disponíveis:**
- Tipo de evento (congresso, ensaio, palestras, etc.)
- Status (ativo, pendente, cancelado)
- Período (data inicial e final)
- Local
- Organizador

### EventSearchBar

Barra de pesquisa animada específica para eventos.

**Props:**
- `onSearch: (query: string) => void` - Callback de pesquisa
- `placeholder?: string` - Placeholder customizado
- `value?: string` - Valor inicial

**Features:**
- Animação de foco
- Botão de limpar pesquisa
- Debounce integrado no hook useEvents

## Serviços

### eventsService

Serviço singleton para gerenciamento de eventos seguindo o padrão SOLID.

**Métodos principais:**
- `getEvents(filters?, forceRefresh?)` - Busca eventos com cache
- `getEventById(id)` - Busca evento específico
- `subscribeToEvent(eventId, userId)` - Inscreve usuário em evento
- `addToFavorites(eventId)` / `removeFromFavorites(eventId)` - Gerencia favoritos
- `getFavoriteEvents()` - Lista eventos favoritos

**Features:**
- Cache automático de 5 minutos
- Filtros avançados
- Armazenamento local de favoritos
- Tratamento de erros offline

### eventNotificationService

Serviço para notificações de eventos próximos.

**Métodos:**
- `requestPermissions()` - Solicita permissões
- `scheduleEventNotifications(userId?)` - Agenda notificações
- `updateSettings(settings)` - Atualiza configurações
- `cancelEventNotification(eventId)` - Cancela notificação específica

## Hooks

### useEvents

Hook principal para listagem de eventos.

```typescript
const {
  events,
  loading,
  refreshing,
  refresh,
  searchEvents,
  applyFilters,
  clearFilters,
  activeFilters,
} = useEvents(options);
```

### useEventDetails

Hook para detalhes de evento específico.

```typescript
const {
  event,
  loading,
  isSubscribed,
  isFavorite,
  subscribe,
  toggleFavorite,
  subscribing,
} = useEventDetails({ eventId });
```

### useEventFilters

Hook para opções de filtros disponíveis.

```typescript
const {
  eventTypes,
  locations,
  organizers,
  loading,
} = useEventFilters();
```

## Princípios aplicados

1. **Single Responsibility**: Cada componente tem uma responsabilidade única
2. **Open/Closed**: Componentes extensíveis via props sem modificação
3. **Liskov Substitution**: EventCard funciona em ambos os modos sem quebrar
4. **Interface Segregation**: Props específicas para cada necessidade
5. **Dependency Inversion**: Hooks e serviços desacoplados dos componentes

## Performance

- Uso de `React.memo` em todos os componentes
- Callbacks memoizados com `useCallback`
- Valores computados com `useMemo`
- Cache de dados no serviço
- Lazy loading de imagens
- Animações otimizadas com `useNativeDriver`