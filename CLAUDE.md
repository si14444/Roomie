# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Running the Application

```bash
# Start development server
npx expo start

# Platform-specific commands
npx expo start --android
npx expo start --ios
npx expo start --web
```

### Testing

```bash
# Run tests in watch mode
npm test

# Run specific test file
npx jest components/__tests__/StyledText-test.js
```

### Building and Development

- Uses Expo Router 5.1.3 with typed routes enabled
- React Native 0.79.5 with React 19
- TypeScript with strict mode enabled
- Jest testing framework with Expo preset

## Architecture Overview

### Navigation Structure

- **Expo Router** with file-based routing
- **Tab-based navigation** with 5 main screens:
  - Home (`index.tsx`) - Dashboard with quick actions and recent activity
  - Routines (`routines.tsx`) - Task/routine management
  - Bills (`bills.tsx`) - Expense and bill splitting
  - Items (`items.tsx`) - Shared item management
  - Chat (`chat.tsx`) - Communication with polls

### Context Architecture

The app uses React Context for global state management:

1. **AuthContext** (`contexts/AuthContext.tsx`)

   - Manages user authentication state
   - Provides `isAuthenticated` and `user` state

2. **NotificationContext** (`contexts/NotificationContext.tsx`)
   - Centralized notification system using `useNotifications` hook
   - Handles 9 notification types (routine_completed, bill_added, etc.)
   - Provides notification CRUD operations and unread count

### Component Organization

Components are organized by feature domains:

- `components/bills/` - Bill management components
- `components/chat/` - Chat and polling features
- `components/home/` - Dashboard components
- `components/items/` - Shared item management
- `components/routines/` - Task/routine components
- `components/notifications/` - Notification system

### Type System

- Comprehensive TypeScript types in `types/` directory
- `notification.types.ts` defines notification system with 9 distinct types
- Path mapping configured with `@/*` alias for root directory

### Design System

- Centralized colors in `constants/Colors.ts`
- Light theme focused with violet/lavender color scheme
- Consistent component styling patterns
- Custom tab bar with notification indicators

### Key Hooks

- `useNotifications()` - Complete notification management system
- `useBills()`, `useRoutines()` - Domain-specific state management
- `useThemeColor()` - Consistent theming

## Development Patterns

### State Management

- React Context for global state (auth, notifications)
- Custom hooks for feature-specific state
- Local useState for component-specific state

### Navigation

- Expo Router with file-based routing
- Tab navigation with custom header components
- Modal presentations for secondary screens

### Notification System

- Centralized notification context with comprehensive type system
- Real-time unread count tracking
- Navigation integration for notification actions

### Testing

- Jest with Expo preset
- Component snapshot testing
- Test files in `__tests__/` directories

## Key Files to Understand

- `app/_layout.tsx` - Root layout with context providers
- `app/(tabs)/_layout.tsx` - Tab navigation configuration
- `contexts/NotificationContext.tsx` - Global notification system
- `hooks/useNotifications.ts` - Core notification logic (255 lines)
- `types/notification.types.ts` - Type definitions for notifications
- `constants/Colors.ts` - Design system color palette

## Platform Configuration

- **iOS**: Supports tablets, configured in `app.json`
- **Web**: Metro bundler with static output
- **React Native**: New architecture enabled
- **Expo SDK**: Version 53 with typed routes experimental feature

## Database Schema

The app follows a comprehensive ERD design documented in [`docs/ERD.md`](docs/ERD.md). Key database entities include:

### Core Entities
- **User**: Authentication and profile management
- **Team**: Roommate groups with invite-based joining
- **TeamMember**: User-team relationships with roles

### Feature Entities
- **Routine/RoutineCompletion**: Task management with completion tracking
- **Bill/BillPayment**: Expense management with payment tracking
- **Item/PurchaseRequest**: Shared inventory with approval workflow
- **Notification**: Real-time notifications with 9 distinct types
- **Feedback**: Monthly team feedback system

### Design Principles
- UUID-based primary keys for all entities
- Team-based data isolation (Row Level Security)
- Complete audit trails with created_by/updated_by tracking
- Soft delete patterns where appropriate

## Using Gemini CLI for Large Codebase Analysis

When analyzing large codebases that exceed Claude's context limits, use Gemini CLI with `gemini -p` for massive context capacity.

**Basic Usage:**
```bash
gemini -p "@src/ Summarize architecture"
gemini -p "@app/ @components/ Analyze component structure"
gemini --all_files -p "Full project analysis"
```

**Common Queries:**
- Feature verification: `gemini -p "@src/ Is dark mode implemented?"`
- Pattern search: `gemini -p "@hooks/ Show WebSocket usage"`
- Test coverage: `gemini -p "@src/ @tests/ Analyze test coverage"`
