import { Dimensions } from 'react-native';

export const SCREEN_DIMENSIONS = {
  width: Dimensions.get('window').width,
  height: Dimensions.get('window').height,
} as const;

export const CAROUSEL_CONFIG = {
  // Visual settings
  INACTIVE_SLIDE_OPACITY: 0.7,
  INACTIVE_SLIDE_SCALE: 1,
  CONTAINER_HEIGHT_RATIO: 0.7,
  ITEM_HEIGHT_RATIO: 0.76,
  
  // Performance settings
  ENABLE_LOOP: false,
  ENABLE_AUTOPLAY: false,
  LOCK_SCROLL_WHILE_SNAPPING: true,
  USE_SCROLL_VIEW: true,
  ENABLE_SNAP: true,
  
  // Image settings
  IMAGE_QUALITY: 85,
  
  // Animation settings
  ACCELEROMETER_UPDATE_INTERVAL: 100,
  ACCELEROMETER_MULTIPLIER: {
    X: 2,
    Y: 1,
  },
  ACCELEROMETER_TRANSLATION: {
    X: 5,
    Y: 3,
  },
  
  // Spring animation config
  SPRING_CONFIG: {
    damping: 25,
    stiffness: 80,
    overshootClamping: true,
  },
  
  // Fade animation config
  FADE_CONFIG: {
    damping: 20,
    stiffness: 90,
  },
} as const;

export const COLORS = {
  // Gradient colors
  GRADIENT_TOP: ['transparent', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.0)'],
  GRADIENT_BOTTOM: ['transparent', 'rgba(0,0,0,0.7)', 'rgba(0,0,0,0.9)'],
  
  // Overlay colors
  GENERAL_OVERLAY: 'rgba(0,0,0,0.1)',
  IMAGE_LOADER_BG: 'rgba(0,0,0,0.3)',
  ERROR_CONTAINER_BG: 'rgba(0,0,0,0.8)',
  REFRESH_INDICATOR_BG: 'rgba(0,0,0,0.7)',
  
  // Text colors
  TEXT_PRIMARY: 'white',
  TEXT_SECONDARY: 'rgba(255,255,255,0.9)',
  TEXT_MUTED: 'rgba(255,255,255,0.5)',
  
  // Button colors
  BUTTON_PRIMARY_BG: 'white',
  BUTTON_PRIMARY_TEXT: 'black',
  
  // Background
  BACKGROUND: 'black',
} as const;

export const SIZES = {
  // Icon sizes
  ICON_LARGE: 48,
  ICON_MEDIUM: 24,
  ICON_SMALL: 20,
  
  // Text sizes
  TEXT_HEADING: '4xl',
  TEXT_BODY: 14,
  TEXT_SMALL: 12,
  TEXT_ERROR: 16,
  
  // Spacing
  SPACING_XS: 4,
  SPACING_SM: 8,
  SPACING_MD: 16,
  SPACING_LG: 20,
  SPACING_XL: 32,
  
  // Button sizes
  BUTTON_SIDE_WIDTH: 80,
  BUTTON_PADDING_H: 24,
  BUTTON_PADDING_V: 10,
  
  // Misc
  TAG_DOT_SIZE: 4,
  BORDER_RADIUS: 4,
  REFRESH_INDICATOR_PADDING: 10,
  REFRESH_INDICATOR_RADIUS: 20,
} as const;

export const Z_INDEX = {
  OVERLAY: 1,
  IMAGE_LOADER: 10,
  CONTENT: 20,
  REFRESH_INDICATOR: 30,
} as const;