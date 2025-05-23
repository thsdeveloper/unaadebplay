# Componentes de Notificação

Esta pasta contém todos os componentes relacionados ao sistema de notificações do app UNAADEB Play.

## Estrutura

```
notifications/
├── components/
│   ├── NotificationItem.tsx      # Item individual de notificação
│   ├── NotificationHeader.tsx    # Cabeçalho da lista de notificações
│   └── EmptyNotifications.tsx    # Estado vazio da lista
├── hooks/
│   ├── useNotificationHandlers.ts # Hook para handlers de notificação
│   └── useNotificationRefresh.ts  # Hook para refresh automático
├── constants.ts                   # Constantes do módulo
├── types.ts                       # Tipos TypeScript
├── utils.ts                       # Funções utilitárias
└── index.ts                       # Barrel export
```

## Componentes

### NotificationItem
Renderiza um item individual de notificação com suporte a swipe gestures.

**Props:**
- `notification`: Dados da notificação
- `onPress`: Função para marcar como lida
- `onDelete`: Função para deletar

**Features:**
- Swipe left para marcar como lida
- Swipe right para deletar
- Animações suaves com Reanimated
- Visual diferenciado para notificações não lidas

### NotificationHeader
Cabeçalho da lista com contador e ação de marcar todas como lidas.

**Props:**
- `notificationCount`: Total de notificações
- `unreadCount`: Número de não lidas
- `onMarkAllAsRead`: Função para marcar todas

### EmptyNotifications
Estado vazio com animação Lottie e ações de refresh.

**Props:**
- `isLoading`: Estado de carregamento
- `onRefresh`: Função de atualização
- `onSendTest`: Enviar notificação de teste (dev)
- `onDebug`: Debug de notificações (dev)

## Hooks

### useNotificationHandlers
Centraliza os handlers de notificação com confirmações.

### useNotificationRefresh
Gerencia o refresh automático baseado no estado do app.

## Uso

```tsx
import { 
    NotificationItem, 
    NotificationHeader, 
    EmptyNotifications 
} from '@/components/notifications';

// Na tela de notificações
<FlatList
    data={notifications}
    renderItem={({ item }) => (
        <NotificationItem
            notification={item}
            onPress={handleRead}
            onDelete={handleDelete}
        />
    )}
    ListHeaderComponent={<NotificationHeader />}
    ListEmptyComponent={<EmptyNotifications />}
/>
```

## Performance

- Todos os componentes são memoizados com `React.memo`
- Callbacks otimizados com `useCallback`
- Constantes extraídas para evitar recriações
- Sub-componentes isolados para granularidade de re-render
- Animações executadas no thread de UI