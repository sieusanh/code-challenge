# Express CRUD API - Production-Ready Backend

A comprehensive, production-ready Express.js + TypeScript CRUD API with PostgreSQL, implementing enterprise-grade security, clean architecture, and DevOps best practices.

## 🎯 Features

### Core Functionality
- ✅ **Complete CRUD Operations** - Create, Read, Update, Delete resources
- ✅ **Advanced Filtering** - Search, pagination, sorting, date ranges
- ✅ **User Authentication** - Register, login, JWT-based auth
- ✅ **Role-Based Access Control (RBAC)** - Admin/User/Guest roles
- ✅ **RESTful API Design** - Following REST principles

### Security Features
- 🔐 **Password Security** - bcrypt hashing with salt rounds
- 🔑 **JWT Authentication** - Stateless token-based auth
- 🛡️ **Authorization & RBAC** - Role-based access control with ACLs
- 🚦 **Rate Limiting** - Prevent brute force and abuse
- 🧹 **Input Validation** - Zod schema validation
- 💉 **SQL Injection Prevention** - Parameterized queries (Prisma)
- 🧼 **XSS Protection** - Output sanitization
- 🔒 **Security Headers** - Helmet middleware
- 🌐 **CORS Configuration** - Configurable origins
- 🔑 **API Key Support** - Optional API key authentication

### Architecture & Code Quality
- 📐 **Clean Architecture** - Controllers → Services → Repositories
- 🎯 **SOLID Principles** - Single responsibility, dependency injection
- 💎 **KISS Methodology** - Simple, readable, maintainable code
- 📦 **12-Factor App** - Environment config, stateless processes
- 🔄 **Separation of Concerns** - Clear module boundaries
- 📝 **TypeScript** - Full type safety

### Observability & DevOps
- 📊 **Structured Logging** - Winston with multiple transports
- 📈 **Request/Response Logging** - HTTP request tracking
- 🏥 **Health Checks** - Database connectivity monitoring
- 🐳 **Docker Support** - Multi-stage builds, non-root user
- 🔄 **CI/CD Pipeline** - GitHub Actions workflow
- 📚 **API Documentation** - OpenAPI/Swagger integration

---

## 📋 Table of Contents

- [Quick Start](#quick-start)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Database Management](#database-management)
- [Testing](#testing)
- [Deployment](#deployment)
- [Architecture](#architecture)
- [Security](#security)
- [Contributing](#contributing)

---

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18.0.0
- PostgreSQL >= 13
- npm >= 9.0.0

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd problem5

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Configure your .env file with database credentials
nano .env

# Generate Prisma Client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# Seed the database (optional)
npm run prisma:seed

# Start development server
npm run dev
```

The API will be available at `http://localhost:3000`

---

## 📦 Installation

### Local Development

1. **Install Dependencies**
```bash
npm install
```

2. **Set Up Database**
```bash
# Start PostgreSQL (if using Docker)
docker-compose up -d postgres

# Or use your local PostgreSQL instance
```

3. **Environment Configuration**
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
JWT_SECRET="your-super-secret-jwt-key"
PORT=3000
```

4. **Database Setup**
```bash
# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Seed database with demo data
npm run prisma:seed
```

### Docker Installation

```bash
# Start all services (PostgreSQL + API)
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop services
docker-compose down
```

---

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Application
NODE_ENV=development
PORT=3000

# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/express_api?schema=public"

# JWT Authentication
JWT_SECRET="change-this-to-a-secure-random-string-in-production"
JWT_EXPIRES_IN="24h"

# CORS
CORS_ORIGIN="http://localhost:3000,http://localhost:3001"

# API Key (optional)
API_KEY="your-optional-api-key"

# PostgreSQL (for Docker)
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=express_api
POSTGRES_PORT=5432
```

### Security Considerations

⚠️ **IMPORTANT**: Never commit `.env` files to version control!

- Use strong `JWT_SECRET` in production (32+ random characters)
- Change default database credentials
- Configure `CORS_ORIGIN` to match your frontend domains
- Enable HTTPS in production
- Use environment-specific `.env` files

---

## 🏃 Running the Application

### Development Mode
```bash
# With hot-reload
npm run dev
```

### Production Build
```bash
# Build TypeScript
npm run build

# Run production server
npm start
```

### Docker
```bash
# Development
docker-compose up

# Production
docker-compose -f docker-compose.prod.yml up -d
```

### Available Scripts

```bash
npm run dev              # Start development server with hot-reload
npm run build            # Build TypeScript to JavaScript
npm start                # Run production server
npm run lint             # Run ESLint
npm run lint:fix         # Fix linting issues
npm run format           # Format code with Prettier
npm run format:check     # Check code formatting
npm run prisma:generate  # Generate Prisma Client
npm run prisma:migrate   # Run database migrations
npm run prisma:seed      # Seed database with demo data
npm run prisma:studio    # Open Prisma Studio (database GUI)
```

---

## 📚 API Documentation

### Swagger UI

Interactive API documentation is available at:
```
http://localhost:3000/api-docs
```

### API Endpoints

#### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login user | No |
| GET | `/api/auth/me` | Get current user | Yes |
| POST | `/api/auth/change-password` | Change password | Yes |

#### Resources

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/resources` | Create resource | Yes |
| GET | `/api/resources` | List resources (with filters) | Yes |
| GET | `/api/resources/:id` | Get resource by ID | Yes |
| PUT | `/api/resources/:id` | Update resource | Yes |
| DELETE | `/api/resources/:id` | Delete resource | Yes |
| GET | `/api/resources/stats` | Get user statistics | Yes |

#### Health & Info

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/` | API information |

### Example Requests

#### Register User
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "Password123!",
    "name": "John Doe"
  }'
```

#### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "Password123!"
  }'
```

#### Create Resource
```bash
curl -X POST http://localhost:3000/api/resources \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "My Resource",
    "description": "Resource description",
    "category": "General",
    "tags": ["tag1", "tag2"]
  }'
```

#### List Resources with Filters
```bash
curl "http://localhost:3000/api/resources?page=1&limit=10&status=ACTIVE&category=General&search=resource" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 🗄️ Database Management

### Prisma Commands

```bash
# Generate Prisma Client (after schema changes)
npm run prisma:generate

# Create a new migration
npx prisma migrate dev --name migration_name

# Apply migrations to production
npx prisma migrate deploy

# Reset database (WARNING: Deletes all data)
npx prisma migrate reset

# Open Prisma Studio (GUI)
npm run prisma:studio
```

### Database Schema

The application uses the following models:

- **User** - User accounts with authentication
- **Session** - JWT session management
- **Resource** - Main CRUD entity with filtering

See `prisma/schema.prisma` for the complete schema.

### Seeding

Demo data is available via seeding:

```bash
npm run prisma:seed
```

Demo accounts:
- **Admin**: `admin@example.com` / `Password123!`
- **User**: `user@example.com` / `Password123!`

---

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

---

## 🚀 Deployment

### Docker Deployment

```bash
# Build image
docker build -t express-api:latest .

# Run container
docker run -p 3000:3000 --env-file .env express-api:latest
```

### Manual Deployment

1. **Build the application**
```bash
npm run build
```

2. **Set environment variables** on your server

3. **Run migrations**
```bash
npx prisma migrate deploy
```

4. **Start the server**
```bash
npm start
```

### Platform-Specific Guides

#### Heroku
```bash
heroku create your-app-name
heroku addons:create heroku-postgresql:hobby-dev
git push heroku main
heroku run npx prisma migrate deploy
```

#### DigitalOcean App Platform
1. Connect your repository
2. Set environment variables
3. Add build command: `npm run build`
4. Add run command: `npm start`

#### AWS/DigitalOcean/VPS
1. Install Node.js and PostgreSQL
2. Clone repository
3. Install dependencies: `npm ci --only=production`
4. Set environment variables
5. Run migrations: `npx prisma migrate deploy`
6. Use PM2 for process management:
```bash
npm install -g pm2
pm2 start dist/server.js --name express-api
pm2 startup
pm2 save
```

---

## 🏗️ Architecture

### Project Structure

```
problem5/
├── src/
│   ├── config/          # Configuration files (database, logger, swagger)
│   ├── controllers/     # Request handlers (thin layer)
│   ├── services/        # Business logic layer
│   ├── repositories/    # Data access layer
│   ├── middleware/      # Express middleware (auth, validation, etc.)
│   ├── models/          # TypeScript types/interfaces
│   ├── routes/          # API route definitions
│   ├── validators/      # Zod validation schemas
│   ├── utils/           # Helper functions and utilities
│   ├── app.ts           # Express app configuration
│   └── server.ts        # Server entry point
├── prisma/              # Database schema and migrations
├── .github/workflows/   # CI/CD pipelines
└── tests/               # Test files
```

### Design Patterns

#### Clean Architecture (Layered)
```
Request → Controller → Service → Repository → Database
                ↓
            Response
```

- **Controllers**: HTTP request/response handling
- **Services**: Business logic and authorization
- **Repositories**: Database queries (using Prisma)

#### SOLID Principles

1. **Single Responsibility**: Each class has one job
2. **Open/Closed**: Extend behavior without modifying existing code
3. **Liskov Substitution**: Services can be swapped
4. **Interface Segregation**: Focused interfaces
5. **Dependency Inversion**: Depend on abstractions

#### 12-Factor App Compliance

- ✅ Codebase in version control
- ✅ Dependencies declared in package.json
- ✅ Config in environment variables
- ✅ Backing services via URLs
- ✅ Separate build and run stages
- ✅ Stateless processes
- ✅ Port binding via environment
- ✅ Concurrency via process model
- ✅ Fast startup and graceful shutdown
- ✅ Dev/prod parity
- ✅ Logs as event streams
- ✅ Admin processes (migrations, seeds)

---

## 🔒 Security

### Implemented Security Measures

#### Authentication & Authorization
- ✅ **Password Hashing**: bcrypt with salt rounds
- ✅ **JWT Tokens**: Stateless authentication
- ✅ **Token Expiration**: Configurable expiry times
- ✅ **RBAC**: Role-based access control (Admin/User/Guest)
- ✅ **ACLs**: Access control lists for resources
- ✅ **Session Management**: Secure session handling

#### Input Validation & Sanitization
- ✅ **Zod Validation**: Type-safe schema validation
- ✅ **XSS Prevention**: Output encoding and sanitization
- ✅ **SQL Injection Prevention**: Parameterized queries (Prisma ORM)
- ✅ **NoSQL Injection Prevention**: Input sanitization

#### API Security
- ✅ **Rate Limiting**: Prevent brute force attacks
- ✅ **CORS Configuration**: Restrict origins
- ✅ **Security Headers**: Helmet middleware
- ✅ **Request Validation**: Validate all inputs
- ✅ **Error Handling**: Safe error messages (no stack traces in production)

#### Logging & Monitoring
- ✅ **Structured Logging**: Winston with multiple log levels
- ✅ **Request Logging**: Track all API calls
- ✅ **Security Event Logging**: Log auth failures, rate limits
- ✅ **Sensitive Data Masking**: Hide passwords/tokens in logs

#### Infrastructure Security
- ✅ **Docker Security**: Non-root user, minimal base image
- ✅ **Environment Variables**: Secrets not in code
- ✅ **HTTPS Ready**: Support for TLS/SSL
- ✅ **Health Checks**: Monitor application status

### Security Best Practices

1. **Use strong JWT secrets** (32+ characters)
2. **Enable HTTPS** in production
3. **Keep dependencies updated** (`npm audit`)
4. **Use environment variables** for all secrets
5. **Implement proper CORS** for your domains
6. **Monitor logs** for suspicious activity
7. **Regular security audits**
8. **Database backups**
9. **Principle of least privilege** for database users
10. **Regular password rotation** for admin accounts

---

## 📊 Performance & Scalability

### Optimizations
- Database connection pooling (Prisma)
- Response compression (gzip)
- Efficient database queries with indexes
- Pagination for large datasets
- Stateless architecture (horizontal scaling)

### Scaling Recommendations
- Use Redis for session storage
- Implement caching layer
- Database read replicas
- Load balancing
- CDN for static assets

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

### Code Standards
- Follow ESLint rules
- Use Prettier for formatting
- Write tests for new features
- Update documentation

---

## 📄 License

This project is licensed under the MIT License.

---

## 📞 Support

For issues and questions:
- Open an issue on GitHub
- Check API documentation at `/api-docs`
- Review logs in `logs/` directory

---

## 🙏 Acknowledgments

Built with:
- Express.js
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT
- bcrypt
- Helmet
- Winston
- Zod
- Swagger/OpenAPI

---

**Made with ❤️ following SOLID, KISS, and 12-Factor App principles**
