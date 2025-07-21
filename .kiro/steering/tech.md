# Technology Stack

## Core Technologies
- **Frontend**: React 19 with TypeScript
- **Build Tool**: Vite 7.0
- **Styling**: Tailwind CSS 4.1 with custom animations
- **Routing**: TanStack Router with file-based routing
- **State Management**: Zustand for global state
- **Data Fetching**: TanStack Query (React Query) with infinite queries
- **Forms**: TanStack React Form with Zod validation
- **Tables**: TanStack React Table with virtualization
- **UI Components**: Radix UI primitives with custom styling
- **Maps**: HERE Maps API for JavaScript
- **Date Handling**: date-fns and dayjs
- **Theming**: next-themes for dark/light mode

## Development Tools
- **Linting**: ESLint 9 with TypeScript support
- **Formatting**: Prettier with Tailwind plugin
- **Type Checking**: TypeScript 5.8
- **Package Manager**: pnpm

## Common Commands

### Development
```bash
pnpm dev              # Start development server (staging mode)
pnpm dev:prod         # Start development server (production mode)
pnpm watch-routes     # Watch for route changes
```

### Building
```bash
pnpm build            # Production build
pnpm build:staging    # Staging build
pnpm start            # Preview production build
pnpm start:staging    # Preview staging build
```

### Code Quality
```bash
pnpm lint             # Run ESLint
pnpm format           # Format code with Prettier
```

### Route Generation
```bash
pnpm generate-routes  # Generate route types
```

## Key Libraries
- **@here/maps-api-for-javascript**: Maps integration
- **@tanstack/react-***: Router, Query, Table, Form, Virtual
- **@radix-ui/react-***: Accessible UI primitives
- **class-variance-authority**: Component variant management
- **clsx**: Conditional className utility
- **lucide-react**: Icon library
- **vaul**: Drawer component
- **usehooks-ts**: React hooks utilities