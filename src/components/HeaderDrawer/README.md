# HeaderDrawer Component

## Overview
Modern, performant drawer component following SOLID principles with animations and enhanced UX.

## Features
- 🎨 Modern glassmorphism design with blur effects
- 🔍 Real-time search functionality
- 🎯 Badge notifications support
- ⚡ Optimized performance with React.memo
- 🌈 Smooth animations with Reanimated 2
- 📱 Haptic feedback on interactions
- 🔐 Premium user indicators
- 🌐 Online/offline status
- ♿ Full accessibility support

## Architecture
```
HeaderDrawer/
├── index.tsx              # Main component
├── components/
│   ├── UserProfile.tsx    # User profile section
│   ├── SearchBar.tsx      # Search functionality
│   ├── MenuItem.tsx       # Menu item component
│   └── QuickActions.tsx   # Logout/delete actions
├── hooks/
│   └── useHeaderDrawer.ts # Business logic hook
├── types.ts              # TypeScript definitions
└── constants.ts          # Configuration constants
```

## Usage
```tsx
import { HeaderDrawer } from '@/components/HeaderDrawer';

// In your modal or drawer
<HeaderDrawer />
```

## Customization
Menu items can be configured in `constants.ts`:
```tsx
export const MENU_ITEMS: MenuItem[] = [
  { id: 'home', name: 'Início', icon: 'home', route: '/(tabs)/(home)', badge: 2 },
  // Add more items...
];
```

## Performance Optimizations
- Memoized search filtering
- Lazy loading of animations
- Optimized re-renders with React.memo
- Debounced search input
- Virtual scrolling ready

## Accessibility
- Full keyboard navigation support
- Screen reader compatible
- High contrast mode support
- Touch target sizing (44x44 minimum)