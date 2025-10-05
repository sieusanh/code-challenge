# Architecture Documentation

## Executive Summary

This document explains the architectural decisions, trade-offs, and design patterns used in this production-ready Express.js + TypeScript CRUD API.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Design Principles](#design-principles)
3. [Layer Architecture](#layer-architecture)
4. [Security Architecture](#security-architecture)
5. [Data Flow](#data-flow)
6. [Technology Choices](#technology-choices)
7. [Trade-offs & Decisions](#trade-offs--decisions)
8. [Scalability Considerations](#scalability-considerations)
9. [Future Improvements](#future-improvements)

---

## Architecture Overview

### High-Level Architecture

```
┌──────────────────────────────────────────────────────────┐
│                     Client/Frontend                       │
└────────────────────────┬─────────────────────────────────┘
                         │ HTTP/REST
                         ↓
┌──────────────────────────────────────────────────────────┐
│                   Express.js Server                       │
│  ┌────────────────────────────────────────────────────┐  │
│  │  Middleware Layer                                  │  │
│  │  - Security (Helmet, CORS)                        │  │
│  │  - Authentication (JWT)                           │  │
│  │  - Rate Limiting                                  │  │
│  │  - Validation (Zod)                               │  │
│  │  - Logging (Winston)                              │  │
│  └────────────────────────────────────────────────────┘  │
│                         ↓                                 │
│  ┌────────────────────────────────────────────────────┐  │
│  │  Controllers (HTTP Layer)                         │  │
│  │  - auth.controller.ts                             │  │
│  │  - resource.controller.ts                         │  │
│  └────────────────────────────────────────────────────┘  │
│                         ↓                                 │
│  ┌────────────────────────────────────────────────────┐  │
│  │  Services (Business Logic)                        │  │
│  │  - auth.service.ts                                │  │
│  │  - resource.service.ts                            │  │
│  └────────────────────────────────────────────────────┘  │
│                         ↓                                 │
│  ┌────────────────────────────────────────────────────┐  │
│  │  Repositories (Data Access)                       │  │
│  │  - user.repository.ts                             │  │
│  │  - resource.repository.ts                         │  │
│  └────────────────────────────────────────────────────┘  │
└────────────────────────┬─────────────────────────────────┘
                         │ Prisma ORM
                         ↓
┌──────────────────────────────────────────────────────────┐
│                  PostgreSQL Database                      │
└──────────────────────────────────────────────────────────┘
```

---

## Design Principles

### SOLID Principles

#### 1. Single Responsibility Principle (SRP)
Each module has one clear purpose:
- **Controllers**: Handle HTTP requests/responses only
- **Services**: Contain business logic and authorization
- **Repositories**: Manage database operations
- **Validators**: Define input validation schemas
- **Middleware**: Cross-cutting concerns (auth, logging, etc.)

#### 2. Open/Closed Principle (OCP)
- Services can be extended without modifying existing code
- New validators can be added without changing existing ones
- Middleware is composable and stackable

#### 3. Liskov Substitution Principle (LSP)
- Repository implementations can be swapped (e.g., Prisma → TypeORM)
- Service interfaces remain consistent

#### 4. Interface Segregation Principle (ISP)
- Focused TypeScript interfaces in `models/types.ts`
- Each interface serves a specific purpose

#### 5. Dependency Inversion Principle (DIP)
- High-level modules (services) don't depend on low-level modules (repositories)
- Both depend on abstractions (TypeScript interfaces)

### KISS (Keep It Simple, Stupid)

- **Simple file structure**: Clear, shallow hierarchy
- **Readable code**: Descriptive names, clear logic flow
- **Minimal abstractions**: Only abstract when necessary
- **Direct patterns**: Straightforward controller → service → repository flow

### 12-Factor App Methodology

1. **Codebase**: Single repository, version controlled
2. **Dependencies**: Explicit in `package.json`
3. **Config**: Environment variables via `.env`
4. **Backing Services**: Database via URL, attachable/detachable
5. **Build/Release/Run**: Separate stages (TypeScript build → Docker image → container)
6. **Processes**: Stateless (JWT tokens, no server-side sessions)
7. **Port Binding**: Self-contained, exports HTTP via PORT env var
8. **Concurrency**: Horizontal scaling via process replication
9. **Disposability**: Fast startup, graceful shutdown
10. **Dev/Prod Parity**: Docker ensures consistency
11. **Logs**: Stream to stdout, Winston handles multiple transports
12. **Admin Processes**: Prisma migrations, database seeding

---

## Layer Architecture

### 1. Middleware Layer
**Purpose**: Cross-cutting concerns that apply to all or many routes

**Components**:
- `auth.middleware.ts`: JWT verification, user attachment to request
- `rbac.middleware.ts`: Role-based access control
- `validate.middleware.ts`: Request validation using Zod schemas
- `rateLimiter.middleware.ts`: Prevent abuse and brute force
- `errorHandler.middleware.ts`: Global error handling
- `requestLogger.middleware.ts`: HTTP request/response logging

**Why**: Separation of concerns, DRY principle, reusability

### 2. Controller Layer
**Purpose**: Handle HTTP requests and responses

**Responsibilities**:
- Parse request parameters
- Call appropriate service methods
- Format responses
- Handle HTTP status codes

**Why**: Thin controllers keep HTTP logic separate from business logic

### 3. Service Layer
**Purpose**: Business logic and orchestration

**Responsibilities**:
- Implement business rules
- Authorization checks (ownership, permissions)
- Data transformation
- Call multiple repositories if needed
- Input sanitization (XSS prevention)

**Why**: Centralized business logic, testable, reusable

### 4. Repository Layer
**Purpose**: Database operations

**Responsibilities**:
- CRUD operations via Prisma ORM
- Query building
- Data filtering
- Parameterized queries (SQL injection prevention)

**Why**: Abstraction over database, easier to test, swappable ORM

### 5. Validation Layer
**Purpose**: Input validation schemas

**Responsibilities**:
- Define validation rules using Zod
- Type-safe schemas
- Custom validation logic

**Why**: Centralized validation, type safety, reusability

---

## Security Architecture

### Defense in Depth

Multiple security layers protect the application:

```
┌─────────────────────────────────────────────┐
│  1. Network Layer (HTTPS, CORS, Helmet)    │
├─────────────────────────────────────────────┤
│  2. Rate Limiting (Prevent Brute Force)    │
├─────────────────────────────────────────────┤
│  3. Authentication (JWT Verification)      │
├─────────────────────────────────────────────┤
│  4. Authorization (RBAC, ACLs)             │
├─────────────────────────────────────────────┤
│  5. Input Validation (Zod Schemas)         │
├─────────────────────────────────────────────┤
│  6. Input Sanitization (XSS Prevention)    │
├─────────────────────────────────────────────┤
│  7. Parameterized Queries (SQL Injection)  │
├─────────────────────────────────────────────┤
│  8. Error Handling (Safe Messages)         │
├─────────────────────────────────────────────┤
│  9. Logging & Monitoring                   │
└─────────────────────────────────────────────┘
```

### Authentication Flow

```
1. User provides credentials (email + password)
2. System validates input format (Zod)
3. System finds user in database
4. System verifies password with bcrypt
5. System generates JWT token
6. Token includes: userId, email, role, expiration
7. Client stores token
8. Client sends token in Authorization header
9. Middleware verifies token signature
10. Middleware attaches user to request
11. Controller accesses authenticated user
```

### Authorization Flow

```
1. User is authenticated (JWT verified)
2. Middleware checks user role (RBAC)
3. Service layer checks resource ownership (ACL)
4. Service grants or denies access
5. Error thrown if unauthorized
6. Error handler returns 403 Forbidden
```

---

## Data Flow

### Example: Create Resource

```
1. Client sends POST /api/resources
   ↓
2. Rate Limiter checks request count
   ↓
3. Auth Middleware verifies JWT
   ↓
4. Validator checks request body
   ↓
5. Controller calls resourceService.create()
   ↓
6. Service sanitizes input (XSS prevention)
   ↓
7. Service calls resourceRepository.create()
   ↓
8. Repository executes Prisma query (parameterized)
   ↓
9. Database stores resource
   ↓
10. Repository returns resource
   ↓
11. Service returns resource
   ↓
12. Controller formats response
   ↓
13. Response sent to client (201 Created)
```

---

## Technology Choices

### Core Stack

| Technology | Reason |
|------------|--------|
| **Express.js** | Industry standard, mature ecosystem, lightweight |
| **TypeScript** | Type safety, better developer experience, catch errors at compile time |
| **Prisma ORM** | Type-safe database queries, automatic migrations, excellent DX |
| **PostgreSQL** | ACID compliance, robust, scalable, open source |
| **bcrypt** | Industry standard for password hashing, battle-tested |
| **jsonwebtoken** | Stateless authentication, widely adopted |
| **Zod** | Runtime validation with TypeScript inference |
| **Winston** | Flexible logging, multiple transports, production-ready |
| **Helmet** | Security headers, OWASP recommended |
| **express-rate-limit** | Simple rate limiting, in-memory or Redis-backed |

### Why These Choices?

#### Prisma vs. TypeORM vs. Sequelize
- **Chosen**: Prisma
- **Reasons**:
  - Type-safe query builder
  - Excellent developer experience
  - Automatic migrations
  - Built-in connection pooling
  - Better performance than traditional ORMs

#### JWT vs. Session-based Auth
- **Chosen**: JWT
- **Reasons**:
  - Stateless (12-Factor compliant)
  - Horizontal scaling without shared session storage
  - Cross-domain authentication
  - Mobile-friendly

#### PostgreSQL vs. MongoDB vs. MySQL
- **Chosen**: PostgreSQL
- **Reasons**:
  - ACID compliance
  - Strong consistency
  - Excellent for relational data
  - JSON support for flexibility
  - Battle-tested at scale

#### Winston vs. Pino vs. Bunyan
- **Chosen**: Winston
- **Reasons**:
  - Most popular Node.js logger
  - Multiple transport support
  - Configurable log levels
  - Large ecosystem

---

## Trade-offs & Decisions

### 1. Stateless vs. Stateful Architecture
**Decision**: Stateless (JWT)

**Trade-offs**:
- ✅ Easier to scale horizontally
- ✅ No shared session storage needed
- ❌ Can't revoke tokens before expiration
- ❌ Larger request size (token in every request)

**Mitigation**: Short token expiration, token refresh flow, session table for tracking

### 2. ORM vs. Raw SQL
**Decision**: ORM (Prisma)

**Trade-offs**:
- ✅ Type safety
- ✅ Faster development
- ✅ Automatic migrations
- ❌ Slight performance overhead
- ❌ Complex queries can be harder

**Mitigation**: Use raw queries for complex operations if needed

### 3. Monolithic vs. Microservices
**Decision**: Monolithic (for now)

**Trade-offs**:
- ✅ Simpler deployment
- ✅ Easier to develop and debug
- ✅ Single codebase
- ❌ Harder to scale individual components
- ❌ All-or-nothing deployments

**Future**: Can split into microservices as complexity grows

### 4. Synchronous vs. Asynchronous Processing
**Decision**: Synchronous (with async/await)

**Trade-offs**:
- ✅ Simpler code flow
- ✅ Easier error handling
- ❌ Slower for I/O-heavy operations

**Future**: Add message queue (RabbitMQ, Redis) for async tasks

### 5. In-Memory vs. Redis Rate Limiting
**Decision**: In-memory (express-rate-limit default)

**Trade-offs**:
- ✅ No external dependency
- ✅ Simpler setup
- ❌ Doesn't work across multiple instances

**Future**: Add Redis for distributed rate limiting

---

## Scalability Considerations

### Current Limitations

1. **In-memory rate limiting**: Won't work with multiple instances
2. **No caching layer**: Every request hits database
3. **No CDN**: Static assets served by Node.js
4. **Single database**: No read replicas

### Scaling Roadmap

#### Phase 1: Horizontal Scaling (Easy)
- Deploy multiple instances behind load balancer
- Add Redis for distributed rate limiting
- Use managed database service

#### Phase 2: Caching (Medium)
- Add Redis for caching frequent queries
- Implement cache invalidation strategy
- Cache user sessions

#### Phase 3: Database Optimization (Medium)
- Add database indexes (already have some)
- Implement read replicas
- Connection pooling optimization

#### Phase 4: Advanced Scaling (Hard)
- Split into microservices
- Event-driven architecture
- Message queues for async processing
- CDN for static assets
- Full-text search with Elasticsearch

### Performance Optimizations Implemented

- ✅ Prisma connection pooling
- ✅ Response compression (gzip)
- ✅ Efficient database queries
- ✅ Pagination for large datasets
- ✅ Database indexes on foreign keys
- ✅ Lean JSON responses

---

## Future Improvements

### Short-term (Next Sprint)

1. **Testing**
   - Unit tests for services
   - Integration tests for API endpoints
   - E2E tests with Supertest

2. **Monitoring**
   - Prometheus metrics
   - Grafana dashboards
   - Error tracking (Sentry)

3. **Features**
   - Refresh token flow
   - Email verification
   - Password reset
   - File upload support

### Medium-term (Next Quarter)

1. **Caching**
   - Redis integration
   - Cache invalidation
   - Session management

2. **Search**
   - Full-text search
   - Advanced filtering
   - Elasticsearch integration

3. **Performance**
   - Database query optimization
   - N+1 query prevention
   - Response caching

### Long-term (Next Year)

1. **Microservices**
   - Split auth service
   - Split resource service
   - API gateway

2. **Real-time**
   - WebSocket support
   - Server-sent events
   - Live updates

3. **Multi-tenancy**
   - Tenant isolation
   - Subdomain routing
   - Tenant-specific databases

---

## Assumptions & Constraints

### Assumptions

1. **Load**: < 1000 requests/second (can scale beyond with infrastructure changes)
2. **Data Size**: < 1TB (single database is sufficient)
3. **Users**: < 100,000 active users
4. **Availability**: 99.9% uptime target (can achieve with proper deployment)
5. **Latency**: < 200ms average response time

### Constraints

1. **Budget**: Open-source stack, minimal external services
2. **Team Size**: Small team, need simple architecture
3. **Deployment**: Cloud-agnostic, should run anywhere
4. **Compliance**: No specific regulatory requirements (GDPR/HIPAA)

---

## Lessons Learned

### What Worked Well

1. **Clean Architecture**: Easy to find and modify code
2. **TypeScript**: Caught many bugs at compile time
3. **Prisma**: Excellent developer experience
4. **Middleware Pattern**: Reusable, composable security

### What Could Be Improved

1. **Testing**: Should have been written alongside code
2. **Caching**: Would improve performance significantly
3. **Async Processing**: Some operations should be asynchronous
4. **Documentation**: Could use more inline code comments

---

## Conclusion

This architecture prioritizes:
- **Security**: Multiple layers of defense
- **Maintainability**: Clean, simple, well-organized code
- **Scalability**: Can grow with proper infrastructure
- **Developer Experience**: TypeScript, Prisma, clear patterns
- **Production Readiness**: Logging, error handling, health checks

The architecture follows industry best practices (SOLID, 12-Factor, KISS) while remaining pragmatic and focused on delivering value.

---

**Document Version**: 1.0
**Last Updated**: 2025-10-05
**Author**: Backend Architecture Team
