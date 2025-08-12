# RetailPulse IQ - Smart Retail Analytics Platform

## Overview

RetailPulse IQ is a comprehensive retail analytics platform designed specifically for SMEs in the retail and wholesale industry. Built by LeanTechnovations, this application helps small to medium enterprises comprehend their data volume and make operational decisions in a fast-moving industry where they often lack time, structure, and skills to extract meaningful insights.

The platform enables users to capture sales and inventory data, track key performance indicators (KPIs), and receive AI-powered insights through Power BI style dashboards. It includes features for retail mathematics calculations, learning modules through "Retail University," and real-time business intelligence to help SMEs make informed decisions quickly.

## Recent Changes (August 12, 2025)

✓ **Application Startup Issues Resolved**: Fixed critical bugs preventing app from loading
✓ **Authentication System**: Corrected useAuth hook to properly handle unauthenticated users
✓ **CSS Compatibility**: Fixed Tailwind CSS syntax issues with hover states
✓ **Code Quality**: Resolved duplicate object keys and function name mismatches
✓ **User Registration/Login**: Fully functional authentication system confirmed working
✓ **API Endpoints**: All core endpoints (analytics, sales, inventory, AI insights) operational

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Library**: Radix UI components with shadcn/ui for a professional, Figma-style interface
- **Styling**: Tailwind CSS with custom color scheme (dark blue, black, red) and Helvetica/Inter fonts
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Charts**: Recharts for data visualization with Power BI style dashboards

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Authentication**: JWT-based authentication with bcrypt for password hashing
- **API Design**: RESTful API architecture with structured error handling
- **Development**: Hot module reloading with Vite integration for development

### Database Design
- **ORM**: Drizzle ORM for type-safe database operations
- **Schema**: PostgreSQL with the following core entities:
  - Users (authentication and profile)
  - Products (SKU, name, description)
  - Sales (transaction records with "data sold" field as specified)
  - Inventory Entries (purchase tracking with GRN numbers)
  - Lessons (learning content for Retail University)
  - User Progress (learning tracking)
  - Metrics Cache (performance optimization)

### Authentication & Authorization
- **Strategy**: JWT tokens stored in localStorage with automatic refresh
- **Security**: Bcrypt password hashing with secure session management
- **Middleware**: Express middleware for route protection
- **Error Handling**: Proper 401/403 responses with automatic logout on token expiry

### Key Features Implementation
- **Dashboard Analytics**: Real-time KPI tracking with sales and inventory metrics
- **AI Insights**: Automated business intelligence with stock level alerts and trend analysis
- **Retail Mathematics**: Interactive calculator for profit margins, pricing strategies, and cost analysis
- **Learning Management**: Microlearning platform with progress tracking and course management
- **Data Entry**: Structured forms for sales and inventory with product management

### Development Workflow
- **Build Process**: Vite for frontend bundling, esbuild for backend compilation
- **Database Management**: Drizzle Kit for migrations and schema management
- **Type Safety**: Shared TypeScript types between frontend and backend
- **Development Server**: Integrated development experience with hot reloading

## External Dependencies

### Database Services
- **Neon Database**: Serverless PostgreSQL hosting with connection pooling
- **Connection Management**: @neondatabase/serverless with WebSocket support

### UI Framework & Components
- **Radix UI**: Comprehensive primitive components for accessibility
- **Tailwind CSS**: Utility-first CSS framework with custom design system
- **Lucide React**: Icon library for consistent iconography

### Data Visualization
- **Recharts**: React charting library for dashboard visualizations
- **Chart Components**: Line charts, bar charts, and metrics displays

### Development Tools
- **Vite**: Frontend build tool with plugin ecosystem
- **Drizzle Kit**: Database schema management and migrations
- **TypeScript**: Type safety across the entire application stack

### Authentication & Security
- **JWT**: JSON Web Tokens for stateless authentication
- **bcryptjs**: Password hashing and verification
- **Validation**: Zod for runtime type checking and form validation

### State Management
- **TanStack Query**: Server state management with caching and synchronization
- **React Hook Form**: Form state management with validation

The application follows a modern full-stack architecture with emphasis on type safety, developer experience, and business intelligence capabilities tailored for retail industry requirements.