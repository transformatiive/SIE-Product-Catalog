# Overview

This is a Product Database Management System designed for industrial product data management. The application provides comprehensive CRUD operations for product information including technical specifications, certifications, and packaging details. It features advanced search capabilities, PDF datasheet generation, and a professional industrial design interface optimized for data-heavy workflows.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript and Vite for fast development and building
- **Routing**: Wouter for lightweight client-side routing
- **UI Framework**: shadcn/ui components built on Radix UI primitives with Tailwind CSS
- **Design System**: SIE branding with red (#E31E24) as primary color, narrow sidebar (14rem), dark charcoal sidebar
- **State Management**: TanStack Query for server state management and caching
- **Form Handling**: React Hook Form with Zod validation for type-safe form management

## Backend Architecture
- **Runtime**: Node.js with Express.js REST API
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Validation**: Zod schemas shared between frontend and backend
- **PDF Generation**: React PDF renderer + server-side HTML-to-PDF for technical datasheet generation
- **Authentication**: Custom session-based auth with 60-day sessions, user management

## Data Architecture
- **Database**: PostgreSQL with Drizzle ORM migrations
- **Schema**: Products table with JSON fields for complex data (dimensions, certifications, packaging), plus admin support tables and version history
- **Validation**: Centralized Zod schemas in shared directory for consistent validation
- **Search**: SQL-based filtering with support for partial matches and date ranges

## Component Architecture
- **Layout**: Sidebar navigation with collapsible design for mobile responsiveness
- **Views**: Dashboard with multiple view modes (list, search, detail, form, create)
- **Forms**: Multi-tab forms (Informação Básica, Detalhes Técnicos, Especificações, Embalagem e Notas, Versões, Partilhar) with dynamic field arrays
- **Data Display**: Table views with pagination, column sorting, clickable product codes

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
- Optional version locking (versionId on share links)
- Access controls managed in "Partilhar" tab

### Version History
- Every product update creates a new version snapshot
- Version timeline shows all changes with timestamps and change notes
- Version annulment (soft delete) with restore capability
- Annulled versions shown with strikethrough text and "Anulada" badge
- Version-specific PDF export and share links supported

### Auto-Generated Fields
- Three fields auto-generate based on support table selections:
  - **Código de Barras** (Barcode)
  - **Referência** (Product Code) - with manual override capability
  - **Designação** (Designation) - technical description from selected fields
- Product creation handles placeholder codes by generating TEMP-{nanoid} when needed

### Admin Support Tables
- Families, Product Types, Raw Materials, Closing Systems, Models, Specifications, Capacities, Colors, Cap Sizes, Certification Types, Packaging Types, Dimension Types, Shapes
- All managed from admin section with searchable dropdowns
- Each table: id, code, description, isActive, createdAt

### Product Fields (Key)
- **Classification**: Model, Family, Type, Shape (Forma), Product name
- **Capacity**: Nominal Capacity + unit (ml/L), Total Capacity + unit (ml/L)
- **Weight**: Weight + unit (g/kg), Weight Tolerance (editable %), Weight with Accessories + unit (g/kg)
- **Accessories**: Free text for product accessories
- **Certifications**: ADR toggle + code, Food Contact toggle, custom certification entries
- **Markings**: Datador, Símbolo SIE, Símbolo MP, Gravação Cliente (with conditional details field), Visor, Bica, COEX, Adaptação, Autocolante Cliente
- **Stacking**: Mandatory radio choice (Empilhável / Não Empilhável), conditional stacking capacity
- **Packaging**: Total units split into Quantity + Type (palete/caixa/saco/unidade)
- **Approval**: Approved by + Approval date
- **Images**: 3 upload slots (main product, technical drawing, palletization)

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
