# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Running the Application
- `yarn start` - Start Expo dev client
- `yarn android` - Run on Android with dark mode support
- `yarn ios` - Run on iOS with dark mode support 
- `yarn web` - Run on web with dark mode support

### Committing Code
- Use `npx cz` for conventional commits (Commitizen is configured)

## Architecture Overview

### Tech Stack
- **React Native** 0.79.2 with **Expo SDK 53**
- **TypeScript** with path alias `@/*` → `./src/*`
- **NativeWind** (TailwindCSS) for styling
- **Gluestack UI** component library
- **Directus SDK** for API integration
- **React Hook Form** with Yup validation
- **Expo Router** for file-based routing
- **Atomic Design** for component architecture

### Key Architecture Patterns

#### API Layer (`src/services/api.ts`)
- Custom `EnhancedLocalStorage` class manages authentication tokens
- Dual storage strategy using SecureStore (primary) and AsyncStorage (fallback)
- In-memory cache with 5-second TTL for performance
- Event-driven token updates via listeners
- Automatic token expiration checking

#### Context Providers (`src/app/_layout.tsx`)
The app uses nested context providers in this order:
1. **GluestackUIProvider** - UI theming
2. **AlertProvider** - Global alerts
3. **AuthProvider** - Authentication state
4. **ConfigProvider** - App configuration from API
5. **NotificationProvider** - Push notifications
6. **TranslationProvider** - Multi-language support
7. **AudioPlayerProvider** - Audio streaming

#### Core Features
- **Push Notifications** - Expo Notifications with Ably integration
- **Audio Streaming** - Custom audio player with background playback
- **Biometric Auth** - Expo Local Authentication
- **Offline Support** - NetInfo for network state monitoring
- **Auto Updates** - Expo Updates with custom AppUpdateManager

### Project Structure
- `/src/app/` - Expo Router pages and layouts
- `/src/components/` - UI components organized with **Atomic Design**
  - `/atoms/` - Basic building blocks (Button, Input, Text, Icon, etc.)
  - `/molecules/` - Simple component groups (FormField, BiometricButton, etc.)
  - `/organisms/` - Complex component sections (LoginForm, AuthHeader, etc.)
  - `/templates/` - Page layout structures (AuthTemplate, DashboardTemplate, etc.)
- `/src/contexts/` - React Context providers
- `/src/services/` - API and external service integrations
- `/src/hooks/` - Custom React hooks
- `/src/types/` - TypeScript type definitions
- `/src/utils/` - Helper functions

### Important Configuration Files
- `gluestack-ui.config.json` - UI component configuration
- `tailwind.config.js` - TailwindCSS/NativeWind settings
- `eas.json` - Expo build profiles
- `app.json` - Expo app configuration

## Atomic Design Architecture with Gluestack UI

### Component Organization
**ALWAYS follow Atomic Design methodology when creating or refactoring components. All atoms MUST be wrappers around Gluestack UI components from `/components/ui/`:**

#### 1. Atoms (src/components/atoms/)
**The smallest, indivisible components that serve as wrappers around Gluestack UI components:**

**IMPORTANT: ALL atoms MUST be built as wrappers around `/components/ui/` Gluestack UI components. Never create atoms from scratch - always use the corresponding Gluestack UI component as the foundation.**

- **Button** - Wraps `@/components/ui/button` with custom variants (primary, secondary, ghost, outline)
- **Input** - Wraps `@/components/ui/input` with enhanced validation and error display  
- **Text** - Wraps `@/components/ui/text` with custom typography variants
- **Icon** - Wraps `@/components/ui/icon` for centralized icon management
- **Logo** - Custom animated brand logo component (no Gluestack equivalent)
- **Divider** - Wraps `@/components/ui/divider` with variants
- **Checkbox** - Wraps `@/components/ui/checkbox` with haptic feedback
- **Link** - Wraps `@/components/ui/link` for navigation
- **LoadingSpinner** - Wraps `@/components/ui/spinner` with variants
- **GradientBackground** - Custom gradient component (no Gluestack equivalent)

#### 2. Molecules (src/components/molecules/)
Simple combinations of atoms working together:
- **FormField** - Label + Input + Error message + Helper text
- **BiometricButton** - Icon + Text + State indicators
- **RememberMeCheckbox** - Checkbox + Label + State
- **SocialLoginButton** - Icon + Text + Loading state
- **PasswordStrengthIndicator** - Visual strength + Requirements
- **Toast** - Icon + Message + Actions

#### 3. Organisms (src/components/organisms/)
Complex, self-contained sections with business logic:
- **LoginForm** - Complete form with validation and submission
- **SignUpForm** - Multi-step registration with validation
- **AuthHeader** - Logo + Title + Subtitle animations
- **AuthFooter** - Links + Copyright + Social options
- **BiometricLogin** - Complete biometric authentication flow

#### 4. Templates (src/components/templates/)
Page-level layout structures without specific content:
- **AuthTemplate** - Layout for authentication pages
- **DashboardTemplate** - Layout for main app pages
- **ProfileTemplate** - Layout for profile/settings pages
- **ListTemplate** - Layout for list-based pages

### Implementation Guidelines

#### Creating New Components

1. **Identify the correct atomic level**
   ```typescript
   // Ask yourself:
   // - Can this be broken down further? → If no, it's an Atom
   // - Is it a simple group of atoms? → Molecule
   // - Does it have complex logic/state? → Organism
   // - Is it a page layout? → Template
   ```

2. **Check for existing components**
   ```typescript
   // Before creating new:
   import { Button } from '@/components/atoms';
   // Not: import Button from './CustomButton';
   ```

3. **Follow the file structure**
   ```
   components/
   └── atoms/
       └── Button/
           ├── index.tsx      // Main component
           ├── types.ts       // TypeScript types
           ├── styles.ts      // Style utilities
           ├── variants.ts    // Component variants
           └── Button.test.tsx // Tests
   ```

#### Component Structure (Gluestack UI Wrapper Pattern)
```typescript
// atoms/Button/index.tsx
import React from 'react';
import {
  Button as GluestackButton,
  ButtonText,
  ButtonSpinner,
  ButtonIcon
} from '@/components/ui/button';
import * as Haptics from 'expo-haptics';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline';
export type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps extends Omit<PressableProps, 'children'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  children: React.ReactNode;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  className?: string;
}

// Map our custom variants to Gluestack UI variants
const mapVariantToGluestack = (variant: ButtonVariant) => {
  switch (variant) {
    case 'primary':
      return { variant: 'solid' as const, action: 'primary' as const };
    case 'secondary':
      return { variant: 'solid' as const, action: 'secondary' as const };
    case 'ghost':
      return { variant: 'link' as const, action: 'primary' as const };
    case 'outline':
      return { variant: 'outline' as const, action: 'primary' as const };
    default:
      return { variant: 'solid' as const, action: 'primary' as const };
  }
};

export const Button = React.memo<ButtonProps>(({
  variant = 'primary',
  size = 'medium',
  loading = false,
  children,
  leftIcon,
  rightIcon,
  fullWidth = false,
  disabled,
  onPress,
  className,
  ...props
}) => {
  const handlePress = (event: any) => {
    if (onPress && !loading && !disabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress(event);
    }
  };

  const gluestackVariant = mapVariantToGluestack(variant);
  const gluestackSize = mapSizeToGluestack(size);

  return (
    <GluestackButton
      {...props}
      variant={gluestackVariant.variant}
      action={gluestackVariant.action}
      size={gluestackSize}
      disabled={disabled || loading}
      onPress={handlePress}
      className={`${fullWidth ? 'w-full' : ''} ${className || ''}`}
    >
      {leftIcon && <ButtonIcon>{leftIcon}</ButtonIcon>}
      {loading ? <ButtonSpinner /> : <ButtonText>{children}</ButtonText>}
      {rightIcon && <ButtonIcon>{rightIcon}</ButtonIcon>}
    </GluestackButton>
  );
});

Button.displayName = 'Button';
```

**Key Principles for Gluestack UI Wrappers:**
1. **Always import from `/components/ui/`** - Never from `@gluestack-ui` packages directly
2. **Map custom variants** - Convert your design system variants to Gluestack equivalents
3. **Preserve existing APIs** - Keep the same props interface for backward compatibility
4. **Add custom functionality** - Layer your enhancements (haptics, analytics, etc.) on top
5. **Use compound components** - Leverage ButtonText, ButtonIcon, ButtonSpinner sub-components

#### Styling with NativeWind
```typescript
// atoms/Button/styles.ts
export const getButtonStyles = ({ variant, size, disabled }) => {
  const base = "flex-row items-center justify-center rounded-xl";
  
  const variants = {
    primary: "bg-blue-500 active:bg-blue-600",
    secondary: "bg-gray-200 active:bg-gray-300",
    ghost: "bg-transparent border border-gray-300"
  };
  
  const sizes = {
    sm: "px-4 py-2",
    md: "px-6 py-3",
    lg: "px-8 py-4"
  };
  
  const disabledStyles = disabled ? "opacity-50" : "";
  
  return {
    container: `${base} ${variants[variant]} ${sizes[size]} ${disabledStyles}`,
    text: variant === 'primary' ? 'text-white' : 'text-gray-900',
    loaderColor: variant === 'primary' ? '#fff' : '#000'
  };
};
```

### Performance Best Practices

1. **Memoization Strategy**
   ```typescript
   // Atoms: Always memo
   export const Icon = memo<IconProps>(({ name, size = 24 }) => {
     // Atom implementation
   });
   
   // Molecules: Memo with comparison
   export const FormField = memo<FormFieldProps>(
     ({ label, value, onChange }) => {
       // Molecule implementation
     },
     (prev, next) => {
       return prev.value === next.value && 
              prev.label === next.label;
     }
   );
   
   // Organisms: Selective memo
   export const LoginForm = ({ onSubmit }) => {
     // Complex logic that benefits from re-renders
   };
   ```

2. **Lazy Loading**
   ```typescript
   // templates/AuthTemplate/index.tsx
   const HeavyFooter = lazy(() => import('@/components/organisms/AuthFooter'));
   ```

3. **Style Optimization**
   ```typescript
   // Pre-calculate styles outside render
   const staticStyles = StyleSheet.create({
     container: { flex: 1 }
   });
   ```

### Component Usage Examples

#### Building a Login Page
```typescript
// app/(auth)/sign-in.tsx
import { AuthTemplate } from '@/components/templates';
import { LoginForm, BiometricLogin } from '@/components/organisms';
import { Link, Divider } from '@/components/atoms';

export default function SignIn() {
  return (
    <AuthTemplate title="Welcome Back">
      <LoginForm onSubmit={handleLogin} />
      
      <Divider text="or" className="my-6" />
      
      <BiometricLogin onAuthenticate={handleBiometric} />
      
      <Link href="/sign-up" className="mt-4">
        Don't have an account? Sign up
      </Link>
    </AuthTemplate>
  );
}
```

#### Creating Custom Molecules
```typescript
// molecules/SearchBar/index.tsx
import { Input, Icon, Button } from '@/components/atoms';

export const SearchBar = ({ onSearch }) => {
  const [query, setQuery] = useState('');
  
  return (
    <View className="flex-row items-center">
      <Icon name="search" className="mr-2" />
      <Input
        value={query}
        onChangeText={setQuery}
        placeholder="Search..."
        className="flex-1"
      />
      <Button
        variant="ghost"
        size="sm"
        onPress={() => onSearch(query)}
      >
        Search
      </Button>
    </View>
  );
};
```

### Testing Strategy

1. **Atoms**: Unit tests for all variants
2. **Molecules**: Integration tests for interactions
3. **Organisms**: Feature tests with mocked data
4. **Templates**: Snapshot tests for layout

```typescript
// atoms/Button/Button.test.tsx
describe('Button Atom', () => {
  it('renders all variants correctly', () => {
    // Test each variant
  });
  
  it('handles press events', () => {
    // Test interactions
  });
});
```

### Benefits of Atomic Design

1. **Reusability** - Build once, use everywhere
2. **Consistency** - Uniform UI across the app
3. **Maintainability** - Easy to locate and update
4. **Scalability** - New features leverage existing components
5. **Testing** - Isolated components are easier to test
6. **Collaboration** - Clear structure for team development
7. **Performance** - Optimized components used throughout

## Development Philosophy

### Clean Code Principles
**ALWAYS apply Clean Code principles in every implementation:**
- **Meaningful Names**: Use descriptive, intention-revealing names for variables, functions, and classes
- **Small Functions**: Each function should do one thing well (Single Responsibility)
- **DRY (Don't Repeat Yourself)**: Extract common logic into reusable functions/components
- **Early Returns**: Use guard clauses to reduce nesting
- **Self-Documenting Code**: Code should be readable without comments
- **Consistent Formatting**: Follow existing code style patterns

### SOLID Principles
**ALWAYS consider SOLID principles when designing components and services:**

1. **Single Responsibility Principle (SRP)**
   - Each component/service should have only one reason to change
   - Separate business logic from UI components
   - Use custom hooks to extract complex logic

2. **Open/Closed Principle (OCP)**
   - Components should be open for extension but closed for modification
   - Use props and composition over hardcoded behavior
   - Prefer configuration over modification

3. **Liskov Substitution Principle (LSP)**
   - Components should be replaceable with their subtypes
   - Maintain consistent interfaces and behaviors

4. **Interface Segregation Principle (ISP)**
   - Don't force components to depend on interfaces they don't use
   - Create specific, focused interfaces/props

5. **Dependency Inversion Principle (DIP)**
   - Depend on abstractions, not concrete implementations
   - Use dependency injection via props and context
   - Services should be loosely coupled

### Component Architecture
```typescript
// ❌ Bad: Mixed concerns
const EventList = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const loadEvents = async () => {
    setLoading(true);
    const response = await fetch('/api/events');
    const data = await response.json();
    setEvents(data);
    setLoading(false);
  };
  
  return (
    <View>
      {/* UI logic mixed with business logic */}
    </View>
  );
};

// ✅ Good: Separated concerns
// Hook for business logic (SRP)
const useEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const loadEvents = async () => {
    setLoading(true);
    const data = await eventsService.getEvents();
    setEvents(data);
    setLoading(false);
  };
  
  return { events, loading, loadEvents };
};

// Component for UI only
const EventList = () => {
  const { events, loading } = useEvents();
  
  return (
    <View>
      {/* Pure UI logic */}
    </View>
  );
};
```

### Service Architecture
```typescript
// ✅ Good: Service with single responsibility
class EventsService {
  private static instance: EventsService;
  
  // Singleton pattern
  public static getInstance(): EventsService {
    if (!EventsService.instance) {
      EventsService.instance = new EventsService();
    }
    return EventsService.instance;
  }
  
  // Clear, focused methods
  async getEvents(filters?: EventFilters): Promise<Event[]> { }
  async getEventById(id: string): Promise<Event> { }
  async subscribeToEvent(eventId: string, userId: string): Promise<void> { }
}
```

### Performance Optimization
- **Always use React.memo** for components that receive props
- **Always use useCallback** for event handlers and functions passed as props
- **Always use useMemo** for expensive computations
- **Implement proper list virtualization** for large datasets
- **Use lazy loading** for images and heavy components

### Code Review Checklist
Before implementing any feature, ensure:
- [ ] Components follow Single Responsibility Principle
- [ ] Business logic is separated from UI components
- [ ] Services are singleton when appropriate
- [ ] Props interfaces are well-defined and minimal
- [ ] Error handling is comprehensive
- [ ] Performance optimizations are applied
- [ ] Code is self-documenting and readable
- [ ] DRY principle is followed
- [ ] **Atomic Design hierarchy is respected**
- [ ] **ALL atoms are wrappers around Gluestack UI components**
- [ ] **Imports use `/components/ui/` not direct Gluestack packages**
- [ ] **Existing atoms/molecules are reused before creating new ones**
- [ ] **Components are in the correct atomic level**
- [ ] **Proper memoization is implemented**
- [ ] **Consistent styling approach is used**
- [ ] **Custom variants are mapped to Gluestack equivalents**

## Development Notes

### Authentication Flow
- JWT tokens stored in SecureStore/AsyncStorage
- Automatic token refresh before expiration
- Global API error handler for 401 responses
- Biometric authentication with encrypted vault
- Session management with rotation

### State Management
- Context API for global state
- React Hook Form for form state
- No Redux/MobX - keep state management simple
- Local component state for UI interactions

### Styling Approach
- Use NativeWind (TailwindCSS) classes
- Gluestack UI components for consistency
- Dark mode support via DARK_MODE environment variable
- Consistent spacing scale: 2, 4, 6, 8, 12, 16, 20, 24, 32
- Consistent color palette from config

### Component Development Workflow
1. Check if component exists in atoms/molecules/organisms
2. If not, identify the correct atomic level
3. Create component following the structure
4. Add proper TypeScript types
5. Implement memoization if needed
6. Create style utilities using NativeWind
7. Write tests for the component
8. Update exports in index files
9. Use the component in pages/templates