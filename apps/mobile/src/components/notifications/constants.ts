export const SWIPE_ACTION_WIDTH = 80;
export const NOTIFICATION_ITEM_MIN_HEIGHT = 60;
export const DELETE_ANIMATION_DURATION = 300;

export const REFRESH_INTERVALS = {
    OFFLINE: 15000,      // 15 segundos quando offline
    WITH_UNREAD: 45000,  // 45 segundos quando há notificações não lidas
    NORMAL: 90000        // 90 segundos em condições normais
} as const;

export const PERFORMANCE_CONFIG = {
    MAX_RENDER_PER_BATCH: 8,
    UPDATE_CELLS_BATCHING_PERIOD: 50,
    INITIAL_NUM_TO_RENDER: 10,
    WINDOW_SIZE: 10
} as const;