# Overview

This is a Product Database Management System designed for industrial product data management. The application provides comprehensive CRUD operations for product information including technical specifications, certifications, and packaging details. It features advanced search capabilities, PDF datasheet generation, and a professional industrial design interface optimized for data-heavy workflows.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript and Vite for fast development and building
- **Routing**: Wouter for lightweight client-side routing
- **UI Framework**: shadcn/ui components built on Radix UI primitives with Tailwind CSS
- **Design System**: Material Design with industrial aesthetics, using professional blue (#0066CC) as primary color
- **State Management**: TanStack Query for server state management and caching
- **Form Handling**: React Hook Form with Zod validation for type-safe form management

## Backend Architecture
- **Runtime**: Node.js with Express.js REST API
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Validation**: Zod schemas shared between frontend and backend
- **PDF Generation**: React PDF renderer for technical datasheet generation

## Data Architecture
- **Database**: PostgreSQL with Drizzle ORM migrations
- **Schema**: Single products table with JSON fields for complex data (dimensions, certifications, packaging)
- **Validation**: Centralized Zod schemas in shared directory for consistent validation
- **Search**: SQL-based filtering with support for partial matches and date ranges

## Component Architecture
- **Layout**: Sidebar navigation with collapsible design for mobile responsiveness
- **Views**: Dashboard with multiple view modes (list, search, detail, form, create)
- **Forms**: Multi-step forms with dynamic field arrays for dimensions and certifications
- **Data Display**: Table views with pagination, card layouts, and detailed specification views

## Key Features

### Product Clone/Duplicate
- Click "Duplicar" button on any existing product to create a copy
- All fields are copied except unique identifiers (id, productCode, barcode)
- Form switches to create mode with title "Criar Novo Produto"
- Referência (productCode) field has two modes:
  - **Auto mode**: Field auto-generates from dropdown selections (bg-muted background)
  - **Manual mode**: Once user types, auto-generation stops (white background)
- Uses React keys to force component remount when switching between edit/clone/create modes

### Shareable Links
- Generate unique secure tokens (nanoid 32 chars) for external viewing
- Public route `/share/{token}` bypasses authentication
- Configurable expiration dates with validation
- Access controls managed in "Partilhar" tab

# External Dependencies

## UI Libraries
- **Radix UI**: Headless UI primitives for accessibility and keyboard navigation
- **Tailwind CSS**: Utility-first CSS framework with custom design tokens
- **Lucide React**: Icon library for consistent iconography
- **Class Variance Authority**: Type-safe variant styling system

## Database & Storage
- **Neon Database**: Serverless PostgreSQL hosting via @neondatabase/serverless
- **Drizzle ORM**: Type-safe database toolkit with migration support
- **Connect PG Simple**: PostgreSQL session storage for Express sessions

## Development Tools
- **Vite**: Fast build tool with HMR and TypeScript support
- **ESBuild**: Fast JavaScript bundler for production builds
- **TSX**: TypeScript execution engine for development server
- **Replit Integration**: Development environment integration with cartographer and error overlay plugins

## Utility Libraries
- **Date-fns**: Date manipulation and formatting
- **React PDF**: PDF generation for technical datasheets
- **Nanoid**: Unique ID generation for entities
- **CLSX/Tailwind Merge**: Conditional className utilities