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
- `/src/components/` - Reusable UI components
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

## Development Notes

### Authentication Flow
- JWT tokens stored in SecureStore/AsyncStorage
- Automatic token refresh before expiration
- Global API error handler for 401 responses

### State Management
- Context API for global state
- React Hook Form for form state
- No Redux/MobX - keep state management simple

### Styling Approach
- Use NativeWind (TailwindCSS) classes
- Gluestack UI components for consistency
- Dark mode support via DARK_MODE environment variable