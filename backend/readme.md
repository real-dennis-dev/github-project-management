# Project Management System - API Documentation

## 📋 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Modules](#modules)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Middleware](#middleware)
- [Utilities](#utilities)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

A comprehensive project management system designed for software development teams. This system provides robust tools for managing projects, features, bugs, decisions, risks, documentation, and more. Built with Node.js, Express, and Supabase, it offers a complete backend solution with AI-powered assistance.

### Key Features

- 📊 **Project Management** - Complete CRUD operations with status tracking
- 🎯 **Feature Tracking** - Manage features with subtasks and progress
- 🐛 **Bug Tracking** - Comprehensive bug lifecycle management
- 📈 **Progress Monitoring** - Timeline tracking and analytics
- 🤖 **AI Assistant** - AI-powered insights, analysis, and recommendations
- 📝 **Decision & Risk Management** - Track decisions and assess risks
- 💰 **Expense Tracking** - Monitor project expenses
- 📚 **Documentation** - Manage project documentation
- 🔄 **GitHub Integration** - Connect and sync with GitHub repositories
- 📅 **Daily Journal** - Track daily progress and mood
- 🎯 **Milestones & Releases** - Track project milestones and releases

---

## Tech Stack

### Backend

- **Runtime**: Node.js (v18+)
- **Framework**: Express.js 4.x
- **Database**: Supabase (PostgreSQL)
- **Authentication**: JWT with Supabase Auth
- **AI Integration**: OpenAI / Anthropic Claude
- **Documentation**: Swagger/OpenAPI
- **Logging**: Winston
- **Caching**: Redis
- **Validation**: Joi

### Database Features

- PostgreSQL with RLS (Row Level Security)
- Native JSON support
- Full-text search capabilities
- Rich enum types
- UUID primary keys

---

## Project Structure

```
project-management-system/
├── common/
│   ├── config/
│   │   ├── supabase.js          # Supabase client configuration
│   │   ├── database.js           # Database connection manager
│   │   ├── redis.js              # Redis client configuration
│   │   └── logger.js             # Winston logger configuration
│   ├── middleware/
│   │   ├── auth.middleware.js    # Authentication & authorization
│   │   ├── validation.middleware.js # Request validation
│   │   ├── error.middleware.js   # Global error handling
│   │   ├── logging.middleware.js # Request logging
│   │   ├── security.middleware.js # Security middleware
│   │   └── data.middleware.js    # Data processing middleware
│   └── utils/
│       ├── database.utils.js     # Database utilities
│       ├── date.utils.js         # Date manipulation
│       ├── string.utils.js       # String utilities
│       ├── validation.utils.js   # Validation helpers
│       ├── response.utils.js     # Response formatting
│       ├── file.utils.js         # File operations
│       ├── cache.utils.js        # Caching utilities
│       ├── export.utils.js       # Export utilities
│       ├── notification.utils.js # Notification helpers
│       └── integration.utils.js  # External integrations
├── modules/
│   ├── project-management/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── middleware/
│   │   ├── utils/
│   │   ├── validations/
│   │   ├── routes/
│   │   └── swagger/
│   ├── github-integration/
│   │   └── ...
│   ├── progress-timeline/
│   │   └── ...
│   ├── documentation/
│   │   └── ...
│   ├── decisions-risks/
│   │   └── ...
│   ├── tech-debt/
│   │   └── ...
│   ├── releases-milestones/
│   │   └── ...
│   ├── expenses/
│   │   └── ...
│   ├── daily-journal/
│   │   └── ...
│   ├── ai-assistant/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── middleware/
│   │   ├── utils/
│   │   ├── validations/
│   │   ├── routes/
│   │   ├── swagger/
│   │   └── config/
│   └── vision-board/
│       └── ...
├── tests/
│   ├── unit/
│   └── integration/
├── swagger/
│   └── swagger.json
├── .env.example
├── .gitignore
├── package.json
├── server.js
├── docker-compose.yml
├── Dockerfile
└── README.md
```

---

## Installation

### Prerequisites

- Node.js v18 or higher
- npm or yarn
- Supabase account
- Redis (optional, for caching)
- OpenAI API key (optional, for AI features)

### Step-by-Step Setup

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/project-management-system.git
cd project-management-system
```

2. **Install dependencies**

```bash
npm install
# or
yarn install
```

3. **Setup environment variables**

```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Setup Supabase**

```bash
# Run the database migration
npm run migrate
# or
yarn migrate
```

5. **Start the server**

```bash
# Development
npm run dev

# Production
npm start
```

---

## Environment Variables

### Core Configuration

```env
# Server
NODE_ENV=development
PORT=3000

# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d

# Redis (optional)
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=your_redis_password

# AI Provider (optional)
AI_PROVIDER=openai  # or 'anthropic' or 'mock'

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-4
OPENAI_TEMPERATURE=0.7
OPENAI_MAX_TOKENS=2000

# Anthropic Configuration
ANTHROPIC_API_KEY=your_anthropic_api_key
ANTHROPIC_MODEL=claude-3-opus-20240229

# Email (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# GitHub Integration
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# Rate Limiting
RATE_LIMIT_WINDOW=900000  # 15 minutes
RATE_LIMIT_MAX=100

# Logging
LOG_LEVEL=info
LOG_FORMAT=json
```

---

## Modules

### 1. Project Management Module

**Routes:**

- `GET /api/projects` - Get all projects
- `GET /api/projects/:id` - Get project by ID
- `POST /api/projects` - Create project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project
- `GET /api/projects/:id/features` - Get project features
- `POST /api/projects/:id/features` - Create feature
- `GET /api/projects/:id/bugs` - Get project bugs
- `POST /api/projects/:id/bugs` - Create bug

**Features:**

- Complete CRUD operations
- Status and priority management
- Feature subtasks
- Bug lifecycle tracking
- Project analytics

### 2. GitHub Integration Module

**Routes:**

- `POST /api/projects/:id/github/connect` - Connect GitHub repository
- `GET /api/projects/:id/github/repositories` - Get connected repos
- `POST /api/repositories/:id/sync` - Sync repository data
- `GET /api/repositories/:id/commits` - Get commits
- `GET /api/repositories/:id/branches` - Get branches
- `GET /api/repositories/:id/pull-requests` - Get PRs
- `GET /api/repositories/:id/issues` - Get issues

**Features:**

- Repository connection
- Automatic sync of commits, branches, PRs
- Webhook support
- Real-time updates

### 3. Decisions & Risks Module

**Routes:**

- `GET /api/projects/:id/decisions` - Get decisions
- `POST /api/projects/:id/decisions` - Create decision
- `GET /api/decisions/:id` - Get decision by ID
- `PUT /api/decisions/:id` - Update decision
- `DELETE /api/decisions/:id` - Delete decision
- `GET /api/projects/:id/risks` - Get risks
- `POST /api/projects/:id/risks` - Create risk
- `PATCH /api/risks/:id/status` - Update risk status

**Features:**

- Decision impact assessment
- Risk matrix generation
- Risk scoring
- Mitigation strategies
- Report generation

### 4. AI Assistant Module

**Routes:**

- `POST /api/projects/:id/ai/ask` - Ask AI question
- `POST /api/projects/:id/ai/analyze` - Analyze project
- `GET /api/projects/:id/ai/conversations` - Get conversations
- `POST /api/ai/summarize` - Summarize text
- `POST /api/projects/:id/ai/report` - Generate report
- `GET /api/projects/:id/ai/actions` - Get next actions
- `GET /api/projects/:id/ai/trends` - Analyze trends

**Features:**

- Natural language queries
- Project analysis and insights
- Trend detection
- Report generation
- Action recommendations
- Text summarization

### 5. Other Modules

- **Progress Timeline**: Track progress over time
- **Documentation**: Manage project docs with versioning
- **Tech Debt**: Track technical debt items
- **Releases & Milestones**: Version management
- **Expenses**: Track project costs
- **Daily Journal**: Daily progress logging
- **Vision Board**: Strategic planning

---

## API Documentation

### Base URL

```
https://api.yourdomain.com/api/v1
```

### Authentication

All API endpoints (except public) require JWT authentication:

```http
Authorization: Bearer <your_jwt_token>
```

### Response Format

```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... },
  "meta": {
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100
    }
  }
}
```

### Error Format

```json
{
  "success": false,
  "message": "Error description",
  "error": {
    "code": "VALIDATION_ERROR",
    "details": [ ... ]
  }
}
```

### Swagger Documentation

Access the interactive API documentation at:

```
http://localhost:3000/api-docs
```

### Example Requests

#### Create Project

```http
POST /api/projects
Content-Type: application/json
Authorization: Bearer <token>

{
  "name": "My Awesome Project",
  "description": "Project description here",
  "priority": "high",
  "tech_stack": ["Node.js", "React", "PostgreSQL"],
  "start_date": "2024-01-01",
  "target_completion_date": "2024-06-30"
}
```

#### Ask AI Question

```http
POST /api/projects/123/ai/ask
Content-Type: application/json
Authorization: Bearer <token>

{
  "question": "What are the main risks in this project?",
  "context": {
    "includeFeatures": true,
    "includeBugs": true,
    "includeRisks": true
  }
}
```

#### Create Risk

```http
POST /api/projects/123/risks
Content-Type: application/json
Authorization: Bearer <token>

{
  "title": "Database performance issue",
  "description": "Database may not scale for high traffic",
  "risk_level": "high",
  "mitigation": "Implement connection pooling and read replicas"
}
```

---

## Database Schema

The database schema is designed for flexibility and performance, featuring:

### Core Tables

1. **projects** - Main project information
2. **features** - Project features and requirements
3. **bugs** - Bug tracking
4. **decisions** - Important decisions
5. **risks** - Risk assessment
6. **milestones** - Project milestones
7. **releases** - Release management

### Extended Tables

8. **github_repositories** - GitHub integration
9. **github_commits** - Commit history
10. **documentation** - Project documentation
11. **expenses** - Cost tracking
12. **daily_journal** - Daily logging
13. **ai_conversations** - AI interactions
14. **vision_board** - Strategic planning

### Key Relationships

```sql
-- Example Relationships
projects (1) ---< features (many)
projects (1) ---< bugs (many)
projects (1) ---< decisions (many)
projects (1) ---< risks (many)
projects (1) ---< milestones (many)
features (1) ---< feature_subtasks (many)
releases (1) ---< release_features (many)
projects (1) ---< github_repositories (many)
```

---

## Middleware

### Core Middleware

1. **Authentication Middleware**

   - JWT validation
   - Token refresh
   - Role-based authorization

2. **Validation Middleware**

   - Request body validation
   - Query parameter validation
   - URL parameter validation

3. **Security Middleware**

   - Rate limiting
   - CORS configuration
   - Helmet security headers
   - Input sanitization

4. **Data Middleware**

   - Pagination
   - Filter parsing
   - Sort parsing
   - Field selection

5. **Logging Middleware**
   - Request logging
   - Performance logging
   - Audit logging
   - Error logging

### Usage Example

```javascript
// Apply middleware to route
router.post(
  "/projects",
  authenticate, // Authentication
  rateLimiter(), // Rate limiting
  validateRequest(schema), // Validation
  sanitizeInput, // Security
  logRequest, // Logging
  ProjectController.create
);
```

---

## Utilities

### Database Utilities

- Query building
- Transaction management
- Batch operations
- Raw SQL execution

### Date Utilities

- Date formatting
- Date range generation
- Duration calculation
- Timezone handling

### String Utilities

- Slug generation
- String truncation
- HTML extraction
- Sanitization

### Validation Utilities

- Email validation
- URL validation
- UUID validation
- Enum validation
- Password strength

### Response Utilities

- Standardized responses
- Pagination formatting
- Error formatting
- Success formatting

### File Utilities

- File uploads
- File deletion
- File validation
- Unique filename generation

### Cache Utilities

- Redis integration
- Cache management
- TTL support
- Pattern-based clearing

---

## Deployment

### Docker Deployment

1. **Build Docker image**

```bash
docker build -t project-management-system .
```

2. **Run container**

```bash
docker run -p 3000:3000 --env-file .env project-management-system
```

### Docker Compose

```yaml
version: "3.8"
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
    env_file:
      - .env
    depends_on:
      - redis
  redis:
    image: redis:alpine
    ports:
      - "6379:6379"
```

### Production Checklist

- [ ] Set NODE_ENV=production
- [ ] Use environment variables
- [ ] Enable SSL/HTTPS
- [ ] Configure proper CORS
- [ ] Set up monitoring
- [ ] Implement backup strategy
- [ ] Enable logging
- [ ] Set up CI/CD pipeline

---

## Testing

### Running Tests

```bash
# Unit tests
npm run test:unit

# Integration tests
npm run test:integration

# All tests
npm test

# Coverage report
npm run test:coverage
```

### Test Structure

```
tests/
├── unit/
│   ├── utils/
│   ├── services/
│   └── controllers/
├── integration/
│   ├── api/
│   └── database/
└── fixtures/
```

---

## Contributing

### Development Workflow

1. **Fork the repository**
2. **Create a feature branch**

```bash
git checkout -b feature/amazing-feature
```

3. **Commit changes**

```bash
git commit -m 'Add amazing feature'
```

4. **Push to branch**

```bash
git push origin feature/amazing-feature
```

5. **Open a Pull Request**

### Code Style

- Use ESLint configuration
- Follow Airbnb style guide
- Write comprehensive comments
- Include JSDoc for all functions

### Commit Convention

```
feat: Add new feature
fix: Fix bug
docs: Update documentation
style: Code style changes
refactor: Code refactoring
test: Add/update tests
chore: Maintenance tasks
```

---

## Performance Optimization

### Caching Strategy

- Redis for frequently accessed data
- Query result caching (TTL: 5-15 minutes)
- API response caching
- AI response caching

### Database Optimization

- Indexes on frequently queried columns
- Optimized JOIN queries
- Pagination for large datasets
- Connection pooling

### API Optimization

- Compression (gzip)
- Pagination (default: 20 items)
- Field selection
- Batch operations

---

## Security

### Authentication & Authorization

- JWT-based authentication
- Role-based access control
- Session management
- Token refresh mechanism

### Data Protection

- SQL injection prevention
- XSS protection
- CSRF protection
- Input sanitization
- Rate limiting

### Best Practices

- Use HTTPS in production
- Secure environment variables
- Regular security audits
- Dependency scanning
- Access logging

---

## Monitoring & Logging

### Logging Levels

- **Error**: Critical errors
- **Warn**: Warning messages
- **Info**: General information
- **Debug**: Detailed debugging

### Monitoring

- System metrics (CPU, Memory)
- API performance
- Error rates
- Response times

---

## Troubleshooting

### Common Issues

1. **Database Connection Error**

```bash
# Check Supabase configuration
# Verify network connectivity
# Check environment variables
```

2. **Authentication Issues**

```bash
# Verify JWT secret
# Check token expiration
# Validate user permissions
```

3. **AI Service Unavailable**

```bash
# Verify API keys
# Check provider status
# Ensure correct model names
```

### Support Resources

- 📖 [Documentation](https://docs.yourproject.com)
- 🐛 [Issue Tracker](https://github.com/yourusername/project/issues)
- 💬 [Discord Community](https://discord.gg/yourproject)
- 📧 [Support Email](mailto:support@yourproject.com)

---

## Roadmap

### Phase 1 - Core Features ✅

- [x] Project management
- [x] Feature tracking
- [x] Bug tracking
- [x] User authentication

### Phase 2 - Advanced Features 🚧

- [x] GitHub integration
- [x] AI assistant
- [x] Decision & Risk management
- [x] Documentation

### Phase 3 - Enhancements 📅

- [ ] Team collaboration
- [ ] Real-time notifications
- [ ] Mobile app
- [ ] Advanced analytics
- [ ] Custom workflows

### Phase 4 - Enterprise 📅

- [ ] Multi-tenancy
- [ ] SSO integration
- [ ] Advanced permissions
- [ ] Compliance tools
- [ ] SLA monitoring

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Acknowledgments

- [Express.js](https://expressjs.com/) - Web framework
- [Supabase](https://supabase.io/) - Database platform
- [OpenAI](https://openai.com/) - AI capabilities
- [Swagger](https://swagger.io/) - API documentation

---

## API Reference

### Quick Reference Table

| Method | Endpoint                       | Description          |
| ------ | ------------------------------ | -------------------- |
| GET    | `/api/projects`                | Get all projects     |
| POST   | `/api/projects`                | Create project       |
| GET    | `/api/projects/:id`            | Get project by ID    |
| PUT    | `/api/projects/:id`            | Update project       |
| DELETE | `/api/projects/:id`            | Delete project       |
| GET    | `/api/projects/:id/features`   | Get project features |
| POST   | `/api/projects/:id/features`   | Create feature       |
| GET    | `/api/projects/:id/bugs`       | Get project bugs     |
| POST   | `/api/projects/:id/bugs`       | Create bug           |
| POST   | `/api/projects/:id/ai/ask`     | Ask AI question      |
| POST   | `/api/projects/:id/ai/analyze` | Analyze project      |
| POST   | `/api/projects/:id/ai/report`  | Generate report      |
| GET    | `/api/projects/:id/decisions`  | Get decisions        |
| POST   | `/api/projects/:id/decisions`  | Create decision      |
| GET    | `/api/projects/:id/risks`      | Get risks            |
| POST   | `/api/projects/:id/risks`      | Create risk          |
| PATCH  | `/api/risks/:id/status`        | Update risk status   |

---

## Contact & Support

- **Project Maintainer**: [Your Name](mailto:your.email@example.com)
- **GitHub Repository**: [https://github.com/yourusername/project-management-system](https://github.com/yourusername/project-management-system)
- **Issue Tracker**: [https://github.com/yourusername/project-management-system/issues](https://github.com/yourusername/project-management-system/issues)

---

## Changelog

### v1.0.0 (2024-01-01)

- Initial release
- Core project management features
- GitHub integration
- AI assistant
- Decision and risk management

### v1.1.0 (2024-02-01)

- Added expense tracking
- Enhanced AI capabilities
- Improved performance
- Bug fixes

### v1.2.0 (2024-03-01)

- Added daily journal
- Vision board integration
- Milestone tracking
- Documentation module

---

**Thank you for using Project Management System! 🚀**
