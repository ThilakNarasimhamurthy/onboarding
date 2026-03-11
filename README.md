# User Onboarding Application

A Next.js application with a multi-step user onboarding flow, admin configuration panel, and data viewing table.

## Architecture

**Stack**: Next.js 14 · Supabase (Postgres) · Vercel

```
Browser → Next.js API Routes (Vercel serverless) → Supabase (Postgres)
```

One repo. One Vercel project. API routes deploy automatically alongside the frontend.

### Why No Separate Backend?

This application uses **Next.js API Routes** instead of a separate backend service for several strategic reasons:

#### 1. **Simplified Deployment & Infrastructure**
- **Single deployment**: Frontend and API deploy together to Vercel
- **No server management**: Vercel handles scaling, monitoring, and infrastructure
- **Automatic HTTPS**: SSL certificates and CDN included
- **Zero configuration**: No Docker, load balancers, or server setup needed

#### 2. **Development Efficiency**
- **Shared codebase**: Types, utilities, and business logic shared between frontend and API
- **Hot reloading**: API changes reflect immediately during development
- **Single repository**: Easier version control, code reviews, and collaboration
- **Unified tooling**: Same build process, linting, and testing for entire application

#### 3. **Cost Effectiveness**
- **Serverless pricing**: Pay only for actual API usage, not idle server time
- **Free tier friendly**: Vercel's generous free tier covers development and small production workloads
- **No database hosting costs**: Supabase free tier provides 500MB PostgreSQL database
- **Reduced complexity**: Fewer moving parts = lower operational costs

#### 4. **Performance Benefits**
- **Edge deployment**: API routes run on Vercel's global edge network
- **Automatic caching**: Static assets and API responses cached globally
- **Cold start optimization**: Next.js optimizes serverless function performance
- **Co-location**: Frontend and API served from same infrastructure reduces latency

#### 5. **Scalability**
- **Automatic scaling**: Vercel handles traffic spikes without configuration
- **Stateless functions**: Each API route is an independent serverless function
- **Database scaling**: Supabase handles connection pooling and database scaling
- **Global distribution**: Content delivered from nearest edge location

#### When You Might Need a Separate Backend

Consider a dedicated backend service when you have:
- Complex business logic requiring long-running processes
- Need for WebSocket connections or real-time features beyond what Supabase provides
- Integration with legacy systems or specific enterprise requirements
- Microservices architecture with multiple teams
- Heavy computational workloads that exceed serverless function limits

For this onboarding application, Next.js API Routes provide the perfect balance of simplicity, performance, and scalability.

## Features

- **Multi-step Onboarding Wizard**: 3-step flow with progress indicator
- **Resume Capability**: Users can return and continue from where they left off
- **Admin Configuration**: Customize which components appear on pages 2 and 3
- **Data Table**: View all user submissions in real-time
- **Supabase Database**: Persistent data storage with PostgreSQL

## Project Structure

```
/
├── app/
│   ├── page.tsx                   # Onboarding wizard
│   ├── admin/page.tsx             # Admin config
│   ├── data/page.tsx              # Data table
│   └── api/
│       ├── users/route.ts         # POST create, GET by email
│       ├── profiles/route.ts      # POST/PUT step data
│       └── page-config/route.ts   # GET config, PUT admin saves
├── components/
│   ├── wizard/
│   │   ├── StepIndicator.tsx
│   │   ├── Step1Auth.tsx
│   │   ├── Step2Dynamic.tsx
│   │   └── Step3Dynamic.tsx
│   └── form-components/
│       ├── AboutMe.tsx
│       ├── AddressFields.tsx
│       └── BirthdatePicker.tsx
└── lib/
    └── supabase.ts
```

## Setup Instructions

### Prerequisites

- Node.js 18+ installed
- Supabase account (free tier works)

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the database to be provisioned
3. Go to SQL Editor and run the contents of `supabase-schema.sql`

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Update `.env.local` with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
```

Find these in your Supabase project settings under API.

### 4. Run Development Server

```bash
npm run dev
```

Visit:
- Main onboarding: `http://localhost:3000`
- Admin panel: `http://localhost:3000/admin`
- Data table: `http://localhost:3000/data`

## Deployment to Vercel

### Quick Deploy

1. Push code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_SERVICE_KEY`
4. Deploy

### Manual Deploy

```bash
npm run build
vercel --prod
```

## Database Schema

### users
- `id` (uuid, primary key)
- `email` (text, unique)
- `password_hash` (text)
- `current_step` (int, default 1)
- `created_at` (timestamp)

### user_profiles
- `id` (uuid, primary key)
- `user_id` (uuid, foreign key)
- `about_me` (text)
- `street`, `city`, `state`, `zip` (text)
- `birthdate` (date)
- `updated_at` (timestamp)

### page_config
- `component` (text, primary key)
- `page_number` (int, 2 or 3)

## API Routes

| Method | Route | Purpose |
|--------|-------|---------|
| POST | `/api/users` | Create user, hash password |
| GET | `/api/users?email=` | Lookup by email → return id + current_step |
| POST | `/api/profiles` | Save/update profile fields |
| GET | `/api/profiles` | Get all users with profiles (for data table) |
| GET | `/api/page-config` | Fetch component → page assignments |
| PUT | `/api/page-config` | Admin saves new assignments |

## Key Features

### Resume Capability
When a user re-enters their email on Step 1, the app checks if they exist and jumps to their `current_step`.

### Smart Resume Logic
The application implements intelligent resume functionality that analyzes both user progress and current configuration:
- **Data-driven resume**: Checks what data user has already provided
- **Config-aware**: Considers current admin configuration when determining resume point
- **Graceful handling**: Adapts to configuration changes between user sessions

### Dynamic Form Components
Pages 2 and 3 render components based on the `page_config` table. Admins can reassign components between pages.

### Real-time Configuration Updates
- **Live polling**: Configuration changes reflect immediately for active users
- **Visibility API**: Optimized polling that pauses when tab is inactive
- **Graceful fallbacks**: Default configuration if API fails

### Available Components
- **About Me**: Large text area for user bio
- **Address**: Street, city, state, and ZIP fields
- **Birthdate**: Date picker

### Admin Validation
The admin panel prevents saving if either page would have zero components.

## Application Patterns

### API Route Design
- **RESTful endpoints**: Clear HTTP methods and resource-based URLs
- **Error handling**: Consistent error responses with appropriate status codes
- **Type safety**: TypeScript interfaces shared between client and server
- **Validation**: Input validation on both client and server sides

### Component Architecture
- **Composition over inheritance**: Small, focused components that compose together
- **Props drilling avoided**: State lifted to appropriate parent components
- **Reusable form components**: Shared components for common form fields
- **Separation of concerns**: UI components separate from business logic

### Data Flow
```
User Input → Form State → API Route → Supabase → Database
                ↓
         Real-time Updates ← Polling ← Configuration Changes
```

## Tech Stack

- **Next.js 14** (App Router) - React framework with built-in API routes
- **TypeScript** - Type safety and better developer experience
- **Tailwind CSS** - Utility-first CSS framework for rapid UI development
- **Supabase** - PostgreSQL database with real-time capabilities and auth
- **bcryptjs** - Secure password hashing
- **Vercel** - Deployment platform optimized for Next.js

### Architecture Decisions

#### Database Choice: Supabase vs Traditional Options
- **PostgreSQL**: Robust, ACID-compliant relational database
- **Real-time subscriptions**: Built-in WebSocket support for live updates
- **Row Level Security**: Database-level security policies
- **Auto-generated APIs**: REST and GraphQL endpoints
- **Built-in Auth**: User management and authentication (not used in this demo)
- **Free tier**: 500MB database, 50MB file storage, 2GB bandwidth

#### State Management: React State vs External Libraries
- **Local component state**: Sufficient for wizard flow and form data
- **No Redux/Zustand needed**: Application state is simple and localized
- **Server state**: API calls handle data persistence and retrieval
- **Form state**: Controlled components with React useState

#### Styling: Tailwind CSS vs CSS Modules
- **Utility-first**: Rapid prototyping and consistent design system
- **No CSS files**: Styles co-located with components
- **Responsive design**: Built-in breakpoint utilities
- **Production optimization**: Automatic purging of unused styles

## Security Notes

- Passwords are hashed with bcrypt before storage
- Service role key is used server-side only (never exposed to client)
- Admin section has no authentication (as per requirements)
- Input validation on both client and server sides
- SQL injection protection through Supabase client library
- HTTPS enforced in production via Vercel

## Performance Optimizations

### Frontend Optimizations
- **Next.js App Router**: Automatic code splitting and route-based optimization
- **Static generation**: Build-time optimization for static content
- **Image optimization**: Next.js automatic image optimization (when images are added)
- **Bundle analysis**: Webpack bundle analyzer for size optimization

### API Optimizations
- **Serverless functions**: Automatic scaling and cold start optimization
- **Database indexing**: Proper indexes on frequently queried columns
- **Connection pooling**: Supabase handles database connection management
- **Caching headers**: Appropriate cache headers for static and dynamic content

### Database Design
- **Normalized schema**: Efficient data structure with proper relationships
- **Minimal queries**: Optimized queries that fetch only necessary data
- **Batch operations**: Efficient bulk operations for configuration updates
- **Foreign key constraints**: Data integrity enforced at database level

## Monitoring and Debugging

### Development Tools
- **TypeScript**: Compile-time error detection
- **Next.js DevTools**: Built-in development server with hot reloading
- **Browser DevTools**: Network tab for API debugging
- **Supabase Dashboard**: Real-time database monitoring

### Production Monitoring
- **Vercel Analytics**: Built-in performance and usage analytics
- **Supabase Logs**: Database query performance and error logging
- **Error boundaries**: React error boundaries for graceful error handling
- **Console logging**: Structured logging for debugging API issues

## Future Considerations

### Scaling Strategies
As the application grows, consider these enhancements:

#### Authentication & Authorization
- **Supabase Auth**: Implement proper user authentication
- **Role-based access**: Admin roles and permissions
- **Session management**: Secure session handling
- **OAuth integration**: Social login options

#### Advanced Features
- **Email notifications**: Welcome emails and progress reminders
- **File uploads**: Profile pictures and document uploads
- **Multi-tenancy**: Support for multiple organizations
- **Audit logging**: Track all user and admin actions

#### Performance Enhancements
- **Redis caching**: Cache frequently accessed configuration
- **CDN optimization**: Static asset optimization
- **Database read replicas**: Separate read/write database instances
- **Background jobs**: Async processing for heavy operations

#### Monitoring & Analytics
- **Application monitoring**: Error tracking with Sentry or similar
- **User analytics**: Conversion funnel analysis
- **Performance monitoring**: Core Web Vitals tracking
- **A/B testing**: Feature flag management

### Migration Paths

#### To Microservices (if needed)
```
Current: Next.js API Routes
    ↓
Intermediate: Next.js + Separate API Service
    ↓
Advanced: Microservices Architecture
```

#### To Enterprise Features
- **SSO integration**: SAML/OIDC support
- **Compliance**: GDPR, HIPAA, SOC2 requirements
- **Multi-region**: Global deployment strategy
- **High availability**: 99.9%+ uptime requirements

The current architecture provides a solid foundation that can evolve with your needs while maintaining simplicity and developer productivity.
