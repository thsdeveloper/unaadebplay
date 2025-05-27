# InfoCongressCarousel Component

A high-performance, animated carousel component for displaying congress information with React Native.

## Features

- 🎨 **Beautiful UI** - Netflix-style carousel with smooth animations
- 🚀 **Performance Optimized** - Lazy loading, image caching, and efficient rendering
- 📱 **Accelerometer Support** - Parallax effect based on device movement
- 🎯 **Clean Architecture** - Well-organized code following SOLID principles
- 📦 **TypeScript** - Full type safety
- ♻️ **Reusable** - Modular components that can be used independently

## Architecture

```
InfoCongressCarousel/
├── components/          # UI components
├── hooks/              # Custom React hooks
├── types/              # TypeScript interfaces
├── constants/          # Configuration and constants
├── utils/              # Helper functions
└── styles/             # Consolidated styles
```

### Key Components

- **InfoCongressCarousel** - Main container component
- **CongressItem** - Individual carousel item with overlay and buttons
- **OptimizedImage** - Smart image component with loading states
- **CarouselSkeleton** - Loading skeleton UI
- **EmptyState** - Empty data state

### Custom Hooks

- **useCongressData** - Manages data fetching and state
- **useAccelerometer** - Handles device motion animations
- **useCarouselNavigation** - Controls carousel navigation

## Usage

```tsx
import InfoCongressCarousel from '@/components/InfoCongressCarousel';

function MyScreen() {
  const [refreshing, setRefreshing] = useState(false);
  
  const handleRefresh = () => {
    setRefreshing(false);
  };
  
  return (
    <InfoCongressCarousel
      refreshing={refreshing}
      onRefresh={handleRefresh}
    />
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| refreshing | boolean | false | Controls refresh state |
| onRefresh | () => void | undefined | Callback when refresh completes |

## Configuration

All configuration values are centralized in `constants/index.ts`:

- **Visual Settings** - Opacity, scale, dimensions
- **Performance** - Loop, autoplay, scroll settings
- **Animation** - Spring configs, accelerometer sensitivity
- **Colors** - All color values
- **Sizes** - Spacing, text sizes, dimensions

## Performance Considerations

1. **Image Optimization**
   - Images are loaded with reduced quality (85%)
   - Sized to screen width to avoid oversized downloads
   - Implements lazy loading with fade-in animation

2. **Rendering Optimization**
   - Uses `React.memo` for all components
   - Implements `useCallback` for event handlers
   - Removes clipped subviews on Android

3. **Animation Performance**
   - Accelerometer updates throttled to 100ms
   - Spring animations use optimal damping/stiffness
   - Animations disabled during loading

## Customization

### Changing Colors
Edit `constants/index.ts`:
```ts
export const COLORS = {
  GRADIENT_TOP: ['transparent', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.0)'],
  // ... other colors
};
```

### Adjusting Animation
Edit `constants/index.ts`:
```ts
export const CAROUSEL_CONFIG = {
  ACCELEROMETER_MULTIPLIER: { X: 2, Y: 1 },
  // ... other settings
};
```

### Modifying Styles
All styles are in `styles/index.ts` using the constants for consistency.

## Dependencies

- react-native-snap-carousel
- react-native-reanimated
- expo-linear-gradient
- expo-sensors
- @expo/vector-icons

## Future Improvements

- [ ] Add pagination dots
- [ ] Implement auto-play with pause on interaction
- [ ] Add swipe gesture feedback
- [ ] Implement image preloading for adjacent items
- [ ] Add accessibility features
- [ ] Create tests