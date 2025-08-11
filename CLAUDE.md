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

# Using Gemini CLI for Large Codebase Analysis

When analyzing large codebases or multiple files that might exceed context limits, use the Gemini CLI with its massive
context window. Use `gemini -p` to leverage Google Gemini's large context capacity.

## File and Directory Inclusion Syntax

Use the `@` syntax to include files and directories in your Gemini prompts. The paths should be relative to WHERE you run the
gemini command:

### Examples:

**Single file analysis:**

````bash
gemini -p "@src/main.py Explain this file's purpose and structure"

Multiple files:
gemini -p "@package.json @src/index.js Analyze the dependencies used in the code"

Entire directory:
gemini -p "@src/ Summarize the architecture of this codebase"

Multiple directories:
gemini -p "@src/ @tests/ Analyze test coverage for the source code"

Current directory and subdirectories:
gemini -p "@./ Give me an overview of this entire project"

#
Or use --all_files flag:
gemini --all_files -p "Analyze the project structure and dependencies"

Implementation Verification Examples

Check if a feature is implemented:
gemini -p "@src/ @lib/ Has dark mode been implemented in this codebase? Show me the relevant files and functions"

Verify authentication implementation:
gemini -p "@src/ @middleware/ Is JWT authentication implemented? List all auth-related endpoints and middleware"

Check for specific patterns:
gemini -p "@src/ Are there any React hooks that handle WebSocket connections? List them with file paths"

Verify error handling:
gemini -p "@src/ @api/ Is proper error handling implemented for all API endpoints? Show examples of try-catch blocks"

Check for rate limiting:
gemini -p "@backend/ @middleware/ Is rate limiting implemented for the API? Show the implementation details"

Verify caching strategy:
gemini -p "@src/ @lib/ @services/ Is Redis caching implemented? List all cache-related functions and their usage"

Check for specific security measures:
gemini -p "@src/ @api/ Are SQL injection protections implemented? Show how user inputs are sanitized"

Verify test coverage for features:
gemini -p "@src/payment/ @tests/ Is the payment processing module fully tested? List all test cases"

When to Use Gemini CLI

Use gemini -p when:
- Analyzing entire codebases or large directories
- Comparing multiple large files
- Need to understand project-wide patterns or architecture
- Current context window is insufficient for the task
- Working with files totaling more than 100KB
- Verifying if specific features, patterns, or security measures are implemented
- Checking for the presence of certain coding patterns across the entire codebase

Important Notes

- Paths in @ syntax are relative to your current working directory when invoking gemini
- The CLI will include file contents directly in the context
- No need for --yolo flag for read-only analysis
- Gemini's context window can handle entire codebases that would overflow Claude's context
- When checking implementations, be specific about what you're looking for to get accurate results # Using Gemini CLI for Large Codebase Analysis


When analyzing large codebases or multiple files that might exceed context limits, use the Gemini CLI with its massive
context window. Use `gemini -p` to leverage Google Gemini's large context capacity.


## File and Directory Inclusion Syntax


Use the `@` syntax to include files and directories in your Gemini prompts. The paths should be relative to WHERE you run the
 gemini command:


### Examples:


**Single file analysis:**
```bash
gemini -p "@src/main.py Explain this file's purpose and structure"


Multiple files:
gemini -p "@package.json @src/index.js Analyze the dependencies used in the code"


Entire directory:
gemini -p "@src/ Summarize the architecture of this codebase"


Multiple directories:
gemini -p "@src/ @tests/ Analyze test coverage for the source code"


Current directory and subdirectories:
gemini -p "@./ Give me an overview of this entire project"
# Or use --all_files flag:
gemini --all_files -p "Analyze the project structure and dependencies"


Implementation Verification Examples


Check if a feature is implemented:
gemini -p "@src/ @lib/ Has dark mode been implemented in this codebase? Show me the relevant files and functions"


Verify authentication implementation:
gemini -p "@src/ @middleware/ Is JWT authentication implemented? List all auth-related endpoints and middleware"


Check for specific patterns:
gemini -p "@src/ Are there any React hooks that handle WebSocket connections? List them with file paths"


Verify error handling:
gemini -p "@src/ @api/ Is proper error handling implemented for all API endpoints? Show examples of try-catch blocks"


Check for rate limiting:
gemini -p "@backend/ @middleware/ Is rate limiting implemented for the API? Show the implementation details"


Verify caching strategy:
gemini -p "@src/ @lib/ @services/ Is Redis caching implemented? List all cache-related functions and their usage"


Check for specific security measures:
gemini -p "@src/ @api/ Are SQL injection protections implemented? Show how user inputs are sanitized"


Verify test coverage for features:
gemini -p "@src/payment/ @tests/ Is the payment processing module fully tested? List all test cases"


When to Use Gemini CLI


Use gemini -p when:
- Analyzing entire codebases or large directories
- Comparing multiple large files
- Need to understand project-wide patterns or architecture
- Current context window is insufficient for the task
- Working with files totaling more than 100KB
- Verifying if specific features, patterns, or security measures are implemented
- Checking for the presence of certain coding patterns across the entire codebase


Important Notes


- Paths in @ syntax are relative to your current working directory when invoking gemini
- The CLI will include file contents directly in the context
- No need for --yolo flag for read-only analysis
- Gemini's context window can handle entire codebases that would overflow Claude's context
- When checking implementations, be specific about what you're looking for to get accurate results
````
