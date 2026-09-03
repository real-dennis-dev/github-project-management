# ProjMate - Project Management Platform

## Overview

ProjMate is a comprehensive project management platform designed to help teams streamline their workflow, track expenses, manage technical debt, and collaborate effectively. Built with modern React architecture and a modular design pattern, it provides a unified workspace for all project-related activities.

## Architecture

### Technology Stack

- **Frontend Framework**: React 18 with React Router v6
- **State Management**: Zustand with persistence
- **Data Fetching**: TanStack Query (React Query)
- **Styling**: Tailwind CSS with dark mode support
- **Form Validation**: Yup
- **HTTP Client**: Axios with interceptors
- **Icons**: Lucide React & Font Awesome
- **Build Tool**: Vite

### Module Structure

Each module follows a consistent architectural pattern:

```
src/
├── components/
│   └── {module}/
│       ├── ComponentName.jsx
│       └── index.js
├── hooks/
│   └── use{Module}.js
├── services/
│   └── {module}Service.js
├── store/
│   └── {module}Store.js
├── utils/
│   └── {module}Validation.js
└── routes/
    └── {module}Routes.jsx
```

## Modules

### 1. Authentication Module (`/auth`)

**Purpose**: User authentication and session management

**Features**:

- Login with email/password
- User registration
- Password reset flow
- Social login (Google, GitHub)
- Session management with device tracking
- Protected routes and auth guards
- Persistent authentication state

**Routes**:

- `/login` - User login
- `/register` - New user registration
- `/reset-password` - Password reset request
- `/update-password` - Password update
- `/sessions` - Session management

**Key Components**:

- `LoginForm` - Email/password login
- `RegisterForm` - New user registration
- `ResetPasswordForm` - Password reset
- `SessionList` - Manage active sessions
- `SessionStats` - Session statistics
- `ProtectedRoute` - Route protection wrapper
- `AuthGuard` - Authentication guard

**State Management**:

```javascript
{
  user: null,
  session: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  sessions: [],
  sessionsMeta: null,
  sessionStats: null
}
```

---

### 2. Subscription Module (`/subscription`)

**Purpose**: Plan management and subscription handling

**Features**:

- Multiple plan types (Free, Basic, Pro, Enterprise, Custom)
- Billing cycles (Monthly, Yearly, Quarterly)
- Feature access control
- Usage tracking with limits
- Payment history
- Webhook event handling
- Stripe integration ready

**Routes**:

- `/subscriptions` - View all subscriptions
- `/subscriptions/new` - Create new subscription
- `/subscriptions/:id/edit` - Edit subscription
- `/plans` - View all plans
- `/plans/new` - Create new plan
- `/plans/:id/edit` - Edit plan
- `/plans/select` - Plan selection
- `/features` - Feature usage tracking
- `/subscriptions/stats` - Subscription statistics

**Key Components**:

- `SubscriptionList` - List all subscriptions
- `SubscriptionCard` - Individual subscription card
- `SubscriptionForm` - Create/Edit subscription
- `PlanList` - List all plans
- `PlanCard` - Individual plan card
- `PlanForm` - Create/Edit plan
- `PlanSelector` - Interactive plan selection
- `FeatureUsageList` - Feature usage tracking
- `BillingCycleBadge` - Visual billing indicator

**State Management**:

```javascript
{
  subscriptions: [],
  currentSubscription: null,
  plans: [],
  currentPlan: null,
  payments: [],
  featureUsage: [],
  webhookEvents: [],
  subscriptionStats: null,
  planOptions: null,
  pagination: { page: 1, limit: 20, total: 0, pages: 0 },
  filters: { status: null, planType: null }
}
```

---

### 3. AI Assistant Module (`/ai`)

**Purpose**: AI-powered project analysis and insights

**Features**:

- Natural language Q&A about projects
- Project analysis with focus areas
- Report generation (Executive, Technical, Risk, Progress)
- Next actions suggestions
- Trend analysis with predictions
- Text summarization
- Conversation history
- Multiple AI providers with fallback

**Routes**:

- `/ai/assistant/:projectId` - AI assistant
- `/ai/analysis/:projectId` - Project analysis
- `/ai/report/:projectId` - Report generation
- `/ai/actions/:projectId` - Next actions
- `/ai/trends/:projectId` - Trend analysis
- `/ai/summarize` - Text summarization

**Key Components**:

- `AIAssistant` - Main AI interface
- `AIQuestionForm` - Question input with context
- `AIResponseDisplay` - Display AI responses
- `ProjectAnalysis` - Project insights
- `ReportGenerator` - Generate reports
- `NextActions` - Action suggestions
- `TrendAnalysis` - Trend visualization
- `TextSummarizer` - Text summarization tool
- `ConversationHistory` - Historical Q&A
- `AIStatusIndicator` - Service status

**State Management**:

```javascript
{
  conversations: [],
  currentConversation: null,
  currentAnalysis: null,
  currentReport: null,
  currentActions: null,
  currentTrends: null,
  currentSummary: null,
  aiStatus: null,
  isLoading: false,
  error: null,
  pagination: { page: 1, limit: 20, total: 0, pages: 0 },
  filters: { questionContains: '', fromDate: null, toDate: null }
}
```

---

### 4. Dashboard Module (`/dashboard`)

**Purpose**: Central hub for project overview and activity

**Features**:

- Welcome banner with user greeting
- Key metrics cards (Projects, Expenses, Commits, Issues)
- Quick action shortcuts
- Recent activity feed
- Project health indicators
- Team member avatars
- Progress bars for key metrics

**Routes**:

- `/dashboard` - Main dashboard

**Key Components**:

- `DashboardHome` - Main dashboard view
- `DashboardLayout` - Layout wrapper with sidebar
- `Navbar` - Top navigation
- `Footer` - Application footer
- `LandingPage` - Public landing page

**Dashboard Metrics**:

- Total Projects
- Total Expenses (with formatted currency)
- Total Commits (GitHub integration)
- Open Issues
- Project Health (Overall Progress, Budget Used, Tech Debt, Team Velocity)

---

### 5. Additional Modules

The platform includes several other specialized modules that follow the same architectural patterns:

- **GitHub Module** - Repository integration, commits, issues
- **Expenses Module** - Expense tracking and reporting
- **Journal Module** - Project documentation and knowledge sharing
- **Technical Debt Module** - Debt tracking and management
- **Projects Module** - Project CRUD and management
- **Releases Module** - Release and milestone tracking
- **Progress Module** - Timeline and progress tracking
- **Vision Module** - Project vision and goals
- **Decisions & Risks Module** - Decision tracking and risk management
- **Documentation Knowledge Module** - Documentation management

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/projmate.git

# Navigate to project directory
cd projmate

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Start development server
npm run dev
```

### Environment Variables

```env
VITE_API_URL=http://localhost:3000/api
VITE_GITHUB_CLIENT_ID=your_github_client_id
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

### Development

```bash
# Start development server
npm run dev

# Run tests
npm run test

# Lint code
npm run lint

# Build for production
npm run build

# Preview production build
npm run preview
```

## Architecture Patterns

### State Management

Each module uses Zustand with persistence for its state:

- `persist` middleware for localStorage
- `partialize` to control what gets persisted
- Clean separation of state and actions

### Data Fetching

TanStack Query handles all data fetching:

- `useQuery` for read operations with caching
- `useMutation` for write operations
- Automatic cache invalidation
- Optimistic updates
- Error handling with retry logic

### Validation

Yup schemas provide consistent validation:

- Schema definitions per module
- `validateForm` utility for validation
- Validation errors handled at component level

### Service Layer

Each module has a dedicated service:

- HTTP calls via axios instance
- Request/response interceptors
- Error handling with token refresh
- Consistent response formatting

### Component Architecture

- **Container Components**: Handle data fetching and state
- **Presentational Components**: Pure UI with props
- **Hooks**: Encapsulate logic and state
- **Routes**: Lazy-loaded with Suspense

## Authentication Flow

1. User submits login credentials
2. `useAuth` hook processes login mutation
3. `authService` makes API call
4. Response processed and stored in `authStore`
5. User redirected to dashboard
6. Session maintained via HttpOnly cookies
7. Token refresh on 401 responses

## Subscription Flow

1. User selects a plan via `PlanSelector`
2. `useSubscription` handles plan selection
3. `SubscriptionForm` collects payment details
4. `subscriptionService` creates subscription
5. Store updates with new subscription
6. Feature access validated via `checkFeatureAccess`

## AI Integration Flow

1. User asks question via `AIQuestionForm`
2. `useAI` prepares request with context
3. `aiService` sends request to backend
4. AI processes with context data
5. Response displayed in `AIResponseDisplay`
6. Conversation saved to history

## Contributing

### Code Style

- ESLint with Prettier for formatting
- Consistent naming conventions
- Component-based architecture
- JSDoc comments for functions

### Pull Request Process

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## Testing

### Unit Tests

```bash
npm run test
```

### E2E Tests

```bash
npm run test:e2e
```

## Deployment

### Build for Production

```bash
npm run build
```

### Deploy to Vercel

```bash
vercel --prod
```

### Deploy to Netlify

```bash
netlify deploy --prod
```

## API Integration

The application integrates with the following API endpoints:

### Authentication

- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `POST /auth/refresh-token` - Token refresh
- `POST /auth/logout` - User logout
- `GET /auth/me` - Current user

### Subscriptions

- `GET /api/v1/subscriptions` - List subscriptions
- `POST /api/v1/subscriptions` - Create subscription
- `PUT /api/v1/subscriptions/:id` - Update subscription
- `GET /api/v1/plans` - List plans
- `POST /api/v1/plans` - Create plan
- `PUT /api/v1/plans/:id` - Update plan

### AI Assistant

- `POST /api/projects/:projectId/ai/ask` - Ask question
- `POST /api/projects/:projectId/ai/analyze` - Analyze project
- `POST /api/projects/:projectId/ai/report` - Generate report
- `POST /api/ai/summarize` - Summarize text

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

- Documentation: [docs.projmate.com](https://docs.projmate.com)
- Issues: [github.com/your-org/projmate/issues](https://github.com/your-org/projmate/issues)
- Discord: [discord.gg/projmate](https://discord.gg/projmate)

## Acknowledgments

- React team for the amazing framework
- TanStack for React Query
- Zustand team for state management
- Tailwind CSS team for the utility-first CSS framework
- All contributors and open-source libraries used in this project
