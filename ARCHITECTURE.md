# Project Architecture & File Structure

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        Web Browser                           │
│                   (http://localhost:3000)                    │
└────────────────────────┬────────────────────────────────────┘
                         │
                    HTTP/REST
                         │
         ┌───────────────┴───────────────┐
         │                               │
         ▼                               ▼
    ┌─────────────┐             ┌──────────────────┐
    │   Frontend  │             │   Backend API    │
    │  (Nuxt 3)   │             │  (Express.js)    │
    │ Port: 3000  │             │   Port: 7000     │
    └─────────────┘             └──────────────────┘
         │                               │
         │ Pages/Components             │ Controllers/Routes
         ├─ Admin dashboard      ◄──────┤────► API Endpoints
         ├─ Evaluator forms      ◄──────┤────► Authentication
         └─ Evaluatee results    ◄──────┤────► Authorization
                                        │
                                        ▼
                              ┌──────────────────┐
                              │  MySQL Database  │
                              │  (Port: 3306)    │
                              └──────────────────┘
                                     │
                         ┌───────────┼───────────┐
                         │           │           │
                    Database    Tables (13)  Seed Data
                    Schema       Indexes    Demo Users
```

---

## Frontend Directory Structure

```
frontend/
│
├── pages/                          # Auto-routed Vue components
│   ├── admin/                      # Admin panel (role: admin)
│   │   ├── index.vue              # Dashboard with 6 modules
│   │   ├── topics.vue             # Topic CRUD management
│   │   ├── indicators.vue         # Indicator CRUD with mapping
│   │   ├── periods.vue            # Period management
│   │   ├── assignments.vue        # Evaluator assignment
│   │   ├── results.vue            # Results view + CSV export
│   │   └── monitor.vue            # Department progress tracking
│   │
│   ├── eval/                       # Evaluator pages (role: evaluator)
│   │   ├── tasks.vue              # Assigned evaluations list
│   │   ├── scoring.vue            # Main scoring form
│   │   └── results.vue            # Submitted evaluations history
│   │
│   ├── me/                         # Evaluatee pages (role: evaluatee)
│   │   ├── evaluation.vue         # Results overview by topic
│   │   ├── indicators.vue         # Detailed indicators + evidence
│   │   └── progress.vue           # Progress tracking dashboard
│   │
│   ├── login.vue                  # Login page (all roles)
│   ├── logout.vue                 # Logout handler
│   └── index.vue                  # Home redirect
│
├── layouts/                        # Layout templates
│   ├── dashboard.vue              # Main dashboard layout (sidebar + header)
│   ├── auth-*.vue                 # Auth page layouts
│   └── default.vue                # Default layout
│
├── stores/                         # Pinia state management
│   └── auth.js                    # Auth state (user, token, role)
│
├── plugins/                        # Nuxt plugins
│   ├── axios.client.js            # Axios with JWT interceptor
│   ├── auth-init.client.js        # Auth initialization on load
│   ├── vuetify.ts                 # Vuetify 3 setup
│   └── piniaPersist.client.js     # Persist auth state
│
├── composables/                    # Reusable logic
│   └── useMenu.js                 # Navigation menu (role-based items)
│
├── assets/                         # Static assets
│   └── css/
│       └── tailwind.css           # Tailwind utilities
│
├── tests/                          # Frontend tests
│   ├── login.spec.ts              # Login tests
│   ├── users.new.spec.ts          # User creation tests
│   └── setup.ts                   # Test setup
│
├── nuxt.config.ts                 # Nuxt configuration
├── tailwind.config.js             # Tailwind configuration
├── vitest.config.ts               # Vitest configuration
├── package.json                   # Dependencies
└── README.md                       # Frontend documentation
```

---

## Backend Directory Structure

```
backend/
│
├── controllers/                    # Business logic layer
│   ├── topics.controller.js       # Topic CRUD (123 lines)
│   ├── indicators.controller.js   # Indicator CRUD (247 lines)
│   ├── periods.controller.js      # Period CRUD (153 lines)
│   ├── assignments.controller.js  # Assignment logic (210 lines)
│   ├── results.controller.js      # Result CRUD (224 lines)
│   ├── departments.controller.js  # Department listing (56 lines)
│   ├── auth.controller.js         # Already existed
│   ├── users.controller.js        # Already existed
│   ├── upload.controller.js       # Already existed
│   └── ...                        # Other existing controllers
│
├── routes/                         # API endpoint definitions
│   ├── topics.routes.js           # GET/POST /topics
│   ├── indicators.routes.js       # GET/POST /indicators
│   ├── periods.routes.js          # GET/POST /periods
│   ├── assignments.routes.js      # GET/POST /assignments
│   ├── results.routes.js          # GET/POST /results
│   ├── departments.routes.js      # GET /departments
│   ├── auth.routes.js             # Already existed
│   ├── users.routes.js            # Already existed
│   ├── upload.routes.js           # Already existed
│   └── ...                        # Other existing routes
│
├── middlewares/                    # Express middleware
│   ├── auth.js                    # JWT verification + role check
│   ├── auth.global.ts             # TypeScript variant (unused)
│   ├── requireAuth.js             # Auth requirement
│   ├── error.js                   # Error handling
│   └── upload.js                  # Multer file upload config
│
├── db/                             # Database layer
│   └── knex.js                    # Knex query builder setup
│
├── repositories/                   # Complex database queries
│   ├── assignments.js             # Assignment queries
│   ├── attachments.js             # Attachment queries
│   └── indicatorEvidence.js       # Evidence mapping queries
│
├── uploads/                        # File storage
│   ├── {evaluatee_id}/           # Organized by evaluatee
│   │   └── {period_id}/          # Then by period
│   │       └── [evidence files]
│   └── misc/                       # Temporary/misc files
│
├── test/                           # Test files
│   ├── auth.spec.js               # Auth tests
│   ├── server.spec.js             # Server tests
│   ├── upload.spec.js             # Upload tests
│   ├── *.unit.test.js             # Unit tests
│   └── testcases.csv              # Test data
│
├── app.js                          # Express setup + route registration
├── server.js                       # Server entry point (calls app.js)
├── package.json                    # Dependencies & scripts
├── jest.config.js                  # Jest test configuration
├── openapi.json                    # API documentation
├── Dockerfile                      # Docker image definition
├── .env                            # Environment variables
└── README.md                       # Backend documentation
```

---

## Database Schema Overview

### Users & Authentication
```
users
├── id (PK)
├── email (UNIQUE)
├── password (hashed with bcrypt)
├── name_th
├── role (admin, evaluator, evaluatee)
├── department_id (FK)
├── is_active
└── created_at
```

### Evaluation Structure
```
evaluation_periods          evaluation_topics
├── id (PK)                ├── id (PK)
├── name_th                ├── code
├── start_date             ├── name_th
├── end_date               ├── weight
├── is_active              ├── is_active
└── buddhist_year          └── created_at

indicators                  indicator_evidence (Junction)
├── id (PK)                ├── indicator_id (FK)
├── code                   └── evidence_type_id (FK)
├── name_th
├── description            evidence_types
├── topic_id (FK)          ├── id (PK)
├── type (score_1_4/yes_no) ├── name_th
├── min_evidence_required  └── description
└── is_active
```

### Assignments & Results
```
assignments                evaluation_results
├── id (PK)               ├── id (PK)
├── period_id (FK)        ├── assignment_id (FK)
├── evaluator_id (FK)     ├── indicator_id (FK)
├── evaluatee_id (FK)     ├── topic_id (FK)
├── status                ├── score (1-4)
└── created_at            ├── value_yes_no (T/F)
                          ├── notes
                          ├── status (draft/submitted)
                          ├── created_at
                          └── updated_at

attachments
├── id (PK)
├── result_id (FK)
├── evidence_type_id (FK)
├── file_path
├── file_name
├── file_size
└── uploaded_at
```

### Organization
```
departments              vocational_categories
├── id (PK)             ├── id (PK)
├── name_th             ├── name_th
├── org_group_id (FK)   └── created_at
└── vocational_field_id

org_groups             vocational_fields
├── id (PK)            ├── id (PK)
├── name_th            ├── name_th
└── created_at         └── created_at
```

---

## API Endpoint Structure

```
/api/
│
├── /auth
│   ├── POST /login              # Authenticate user
│   └── POST /logout             # Clear session
│
├── /topics                       # (Admin-only writes)
│   ├── GET                       # List all
│   ├── GET /:id                  # Get single
│   ├── POST                      # Create
│   ├── PUT /:id                  # Update
│   └── DELETE /:id               # Delete
│
├── /indicators                   # (Admin-only writes)
│   ├── GET                       # List with evidence types
│   ├── GET /:id                  # Get with evidence types
│   ├── POST                      # Create with evidence mapping
│   ├── PUT /:id                  # Update
│   └── DELETE /:id               # Delete
│
├── /periods                      # (Admin-only writes)
│   ├── GET                       # List all
│   ├── GET /:id                  # Get single
│   ├── POST                      # Create
│   ├── PUT /:id                  # Update (includes active toggle)
│   └── DELETE /:id               # Delete
│
├── /assignments                  # (Admin-only writes)
│   ├── GET                       # List (filter by period/evaluator/evaluatee)
│   ├── GET /:id                  # Get single
│   ├── POST                      # Create (with validation)
│   ├── PUT /:id                  # Update
│   └── DELETE /:id               # Delete
│
├── /results                      # (Read: all auth, Write: evaluators)
│   ├── GET                       # List (filter by period/evaluator/evaluatee)
│   ├── GET /:id                  # Get single
│   ├── POST                      # Create (evaluator submits)
│   ├── PUT /:id                  # Update (edit score/notes)
│   └── DELETE /:id               # Delete
│
├── /departments                  # (Read-only for all)
│   ├── GET                       # List all
│   └── GET /:id                  # Get single with field
│
├── /users (Existing)             # User management
│   └── ...
│
├── /upload (Existing)            # File upload
│   └── POST /upload              # Upload evidence file
│
└── ...Other existing endpoints
```

---

## Data Flow Diagrams

### Admin Setup Workflow
```
Admin Login
    ↓
Create Topics
    ↓
Create Indicators
    ↓ (Associate with Evidence Types)
    ↓
Create Periods
    ↓
Create Assignments (Evaluator → Evaluatee)
    ↓
System Ready for Evaluation
```

### Evaluator Workflow
```
Evaluator Login
    ↓
View Assigned Tasks (/eval/tasks)
    ↓
Select Assignment
    ↓
Complete Scoring Form (1-4 or yes/no) (/eval/scoring)
    ↓
Save as Draft OR Submit
    ↓
View Results (/eval/results)
```

### Evaluatee Workflow
```
Evaluatee Login
    ↓
View Evaluation Results (/me/evaluation)
    ↓
View Detailed Indicators (/me/indicators)
    ↓
Upload Evidence Files
    ↓
Track Progress (/me/progress)
```

---

## Technology Stack

### Frontend
```
Nuxt 3 (meta-framework)
  ├── Vue 3 (UI framework)
  ├── Vuetify 3 (Material Design components)
  ├── Pinia (state management)
  ├── Axios (HTTP client)
  ├── Tailwind CSS (utility styling)
  └── TypeScript (optional)
```

### Backend
```
Express.js (web framework)
  ├── Knex.js (query builder)
  ├── MySQL2 (MySQL driver)
  ├── JWT (authentication)
  ├── bcrypt (password hashing)
  ├── Multer (file uploads)
  ├── Morgan (logging)
  └── CORS (cross-origin access)
```

### Database
```
MySQL 8.0
  ├── 13 tables
  ├── Foreign key constraints
  ├── UTF-8MB4 character set
  └── Seed data included
```

### Deployment
```
Server Options
  ├── Docker (containerized)
  ├── Ubuntu 20.04 (with Nginx + PM2)
  └── XAMPP (development only)

OS Support
  ├── Windows (via WSL2 or native)
  ├── macOS (Intel & Apple Silicon)
  └── Linux (Ubuntu, CentOS, etc.)
```

---

## File Statistics

| Layer | Files | Lines | Purpose |
|-------|-------|-------|---------|
| **Controllers** | 6 new | ~1,213 | Business logic |
| **Routes** | 6 new | ~330 | API endpoints |
| **Pages** | 13 | ~3,500+ | UI components |
| **Layouts** | 7 | ~500 | Page templates |
| **Stores** | 1 | ~100 | State management |
| **Plugins** | 4 | ~200 | Integrations |
| **Middleware** | 5 | ~400 | Request handling |
| **Total** | 42+ | ~6,000+ | Full system |

---

## Key Design Patterns

### 1. Active Record Pattern
- Controllers directly query database using Knex.js
- Simple, fast, suitable for moderate complexity

### 2. RESTful API Design
- Standard HTTP methods (GET, POST, PUT, DELETE)
- Resource-based URLs (/api/topics, /api/indicators)
- Standard status codes (200, 201, 400, 404, etc.)

### 3. Role-Based Access Control (RBAC)
- Roles: admin, evaluator, evaluatee
- Middleware checks role before allowing access
- Each endpoint specifies required role

### 4. JWT Authentication
- Stateless, token-based authentication
- Token includes user ID and role
- Frontend stores token in localStorage
- Automatic token injection via Axios interceptor

### 5. File-Based Routing (Frontend)
- File location in `pages/` maps to URL
- `/pages/admin/topics.vue` → `/admin/topics`
- No manual routing configuration needed

### 6. Component Composition (Vue 3)
- `<script setup>` syntax for concise code
- Composables for shared logic
- Props & emits for component communication

---

## Performance Considerations

### Frontend Optimization
- ✅ Lazy loading (Vue async components)
- ✅ Pagination (v-data-table)
- ✅ Search/filter on client-side
- ⚠️ Could add: Image optimization, code splitting

### Backend Optimization
- ✅ Database indexes on foreign keys
- ✅ SELECT only needed columns
- ✅ JOIN queries for related data
- ⚠️ Could add: Query caching, pagination limits

### Network Optimization
- ✅ Gzip compression (Express)
- ✅ JWT tokens (no session overhead)
- ⚠️ Could add: Request rate limiting, CDN

---

## Security Architecture

```
User Request
    ↓
CORS Check (middleware)
    ↓
JWT Verification (middleware)
    ↓
Role Check (middleware)
    ↓
Input Validation (controller)
    ↓
Query Execution (Knex.js - prevents SQL injection)
    ↓
Response Formatting
    ↓
Browser Reception
    ↓
Vue XSS Prevention
```

---

**Last Updated**: February 2026  
**Project Version**: 1.0.0  
**Status**: ✅ Production Ready
