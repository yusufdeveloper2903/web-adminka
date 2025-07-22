# Project Structure

## Root Directory

- **src/**: Main application source code
- **public/**: Static assets
- **node_modules/**: Dependencies
- **.tanstack/**: TanStack Router generated files
- **vite.config.ts**: Vite configuration with path aliases (@/ -> src/)
- **tsconfig.json**: TypeScript configuration with path mapping

## Source Structure (`src/`)

### Core Application

- **main.tsx**: Application entry point with router registration
- **App.tsx**: Root component with providers (Theme, Query, Sidebar)
- **index.css**: Global styles and Tailwind imports
- **vite-env.d.ts**: Vite environment types

### Components (`src/components/`)

- **ui/**: Reusable UI components (Radix-based)
- **shared/**: Complex shared components (Layout, DataTable, MapComponent, etc.)
- **shared/index.ts**: Barrel exports for shared components

### Pages (`src/pages/`)

Each page follows a consistent structure:

- **PageName/**: Page directory
  - **PageNamePage.tsx**: Main page component
  - **index.ts**: Barrel export
  - **components/**: Page-specific components
  - **hooks/**: Page-specific custom hooks
  - **api/**: Page-specific API functions
  - **data/**: Mock data or constants

### Routing (`src/routes/`)

- **router.ts**: Main router configuration
- **\_\_root.tsx**: Root route component
- File-based routing with TanStack Router

### State Management (`src/store/`)

- Individual Zustand stores for different concerns:
  - **sidebar-store.ts**: Sidebar state
  - **header-store.ts**: Header configuration
  - **drawer-store.ts**: Drawer/modal state
  - **trips-view-store.ts**: Trip view switching
  - **route-store.ts**: Route visualization state
- **index.ts**: Barrel exports for all stores

### Hooks (`src/hooks/`)

- **queries/**: TanStack Query hooks for data fetching
- **use-mobile.ts**: Mobile detection hook
- Custom hooks for specific functionality

### Types (`src/types/`)

- **index.ts**: Central type exports
- **trip.ts**: Trip-related types and DTOs
- **here-maps.ts**: HERE Maps integration types
- **here-maps.d.ts**: HERE Maps type declarations

### Utilities (`src/lib/`)

- **utils.ts**: Common utility functions (cn, clsx helpers)

### Constants (`src/constants/`)

- **queryClient.ts**: TanStack Query client configuration
- **index.ts**: Barrel exports

## Naming Conventions

- **Components**: PascalCase (e.g., `TripsPage.tsx`)
- **Hooks**: camelCase with `use` prefix (e.g., `useTripsHeader.tsx`)
- **Stores**: kebab-case with `-store` suffix (e.g., `trips-view-store.ts`)
- **Types**: PascalCase for interfaces, camelCase for enums
- **Files**: Match component/function name, use index.ts for barrel exports

## Import Patterns

- Use `@/` alias for src imports
- Barrel exports from index.ts files
- Group imports: external libraries, internal modules, relative imports
- Prefer named exports over default exports for utilities

## Architecture Patterns

- **Page Structure**: Each page is self-contained with its own components, hooks, and API
- **State Management**: Global state with Zustand, local state with React hooks
- **Data Fetching**: TanStack Query with infinite queries for tables
- **Component Composition**: Radix UI primitives with custom styling
- **Type Safety**: Strict TypeScript with Zod validation for forms
