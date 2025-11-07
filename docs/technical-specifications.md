# YYO Agent AI - المواصفات التقنية

## 🏗️ المعمارية العامة

### نمط المعمارية: Hybrid Microservices
- **البداية:** Modular Monolith للتطوير السريع
- **التطوير:** تحويل تدريجي إلى Microservices
- **المرونة:** إمكانية التوسع حسب الحاجة

### المبادئ الأساسية
- **Domain-Driven Design (DDD):** تنظيم الكود حسب المجالات التجارية
- **SOLID Principles:** تصميم كود قابل للصيانة والتوسع
- **API-First Design:** تصميم APIs قبل التطبيق
- **Security by Design:** الأمان مدمج من البداية

## 🛠️ التقنيات الأساسية

### Backend Stack
```
- Runtime: Node.js 20+ LTS
- Framework: Express.js 4.18+
- Language: TypeScript 5.0+
- API: REST + GraphQL + WebSockets
- Authentication: JWT + Passport.js
- Validation: Joi + express-validator
- Documentation: Swagger/OpenAPI 3.0
```

### Frontend Stack
```
- Framework: React 18+ with TypeScript
- State Management: Redux Toolkit + RTK Query
- UI Library: Material-UI (MUI) 5.0+
- Styling: Styled-components + CSS-in-JS
- Build Tool: Vite 4.0+
- Testing: Jest + React Testing Library
- Internationalization: react-i18next
```

### Database Architecture
```
Primary Database:
- PostgreSQL 15+ (ACID compliance, complex queries)
- MongoDB 6.0+ (flexible documents, analytics)

Caching Layer:
- Redis 7.0+ (sessions, real-time data)
- Memcached (query results)

Search Engine:
- Elasticsearch 8.0+ (full-text search, analytics)
```

### DevOps & Infrastructure
```
Containerization:
- Docker 24.0+
- Docker Compose (development)
- Kubernetes (production)

CI/CD:
- GitHub Actions
- Docker Registry
- Automated testing & deployment

Monitoring:
- Prometheus + Grafana
- ELK Stack (Elasticsearch, Logstash, Kibana)
- Sentry (error tracking)
```

## 🗄️ تصميم قاعدة البيانات

### PostgreSQL Schema (Primary)

#### Users & Authentication
```sql
-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    avatar_url TEXT,
    language VARCHAR(5) DEFAULT 'ar',
    theme VARCHAR(10) DEFAULT 'light',
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    two_factor_enabled BOOLEAN DEFAULT false,
    two_factor_secret VARCHAR(32),
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Roles table
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) UNIQUE NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    permissions JSONB NOT NULL DEFAULT '[]',
    is_system BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User roles junction table
CREATE TABLE user_roles (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
    department_id UUID REFERENCES departments(id),
    assigned_by UUID REFERENCES users(id),
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, role_id, department_id)
);
```

#### Departments & Organization
```sql
-- Departments table
CREATE TABLE departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    name_ar VARCHAR(100) NOT NULL,
    description TEXT,
    description_ar TEXT,
    code VARCHAR(10) UNIQUE NOT NULL,
    parent_id UUID REFERENCES departments(id),
    manager_id UUID REFERENCES users(id),
    budget DECIMAL(15,2),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Department hierarchy view
CREATE VIEW department_hierarchy AS
WITH RECURSIVE dept_tree AS (
    SELECT id, name, parent_id, 0 as level, ARRAY[id] as path
    FROM departments WHERE parent_id IS NULL
    UNION ALL
    SELECT d.id, d.name, d.parent_id, dt.level + 1, dt.path || d.id
    FROM departments d
    JOIN dept_tree dt ON d.parent_id = dt.id
)
SELECT * FROM dept_tree;
```

#### Tasks & Workflow
```sql
-- Tasks table
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    department_id UUID REFERENCES departments(id) NOT NULL,
    created_by UUID REFERENCES users(id) NOT NULL,
    assigned_to UUID REFERENCES users(id),
    parent_task_id UUID REFERENCES tasks(id),
    priority INTEGER DEFAULT 3 CHECK (priority BETWEEN 1 AND 5),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'review', 'completed', 'cancelled')),
    due_date TIMESTAMP,
    estimated_hours INTEGER,
    actual_hours INTEGER,
    completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage BETWEEN 0 AND 100),
    tags TEXT[],
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

-- Task workflow states
CREATE TABLE task_workflow_states (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    from_status VARCHAR(20),
    to_status VARCHAR(20) NOT NULL,
    changed_by UUID REFERENCES users(id) NOT NULL,
    comment TEXT,
    attachments JSONB DEFAULT '[]',
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Task assignments history
CREATE TABLE task_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    from_user_id UUID REFERENCES users(id),
    to_user_id UUID REFERENCES users(id) NOT NULL,
    assigned_by UUID REFERENCES users(id) NOT NULL,
    reason TEXT,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Financial Management
```sql
-- Transactions table
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    department_id UUID REFERENCES departments(id) NOT NULL,
    category_id UUID REFERENCES transaction_categories(id) NOT NULL,
    type VARCHAR(10) NOT NULL CHECK (type IN ('income', 'expense')),
    amount DECIMAL(15,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    description TEXT NOT NULL,
    reference_number VARCHAR(50),
    invoice_number VARCHAR(50),
    vendor_supplier VARCHAR(255),
    payment_method VARCHAR(50),
    payment_date DATE,
    due_date DATE,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid', 'cancelled')),
    approved_by UUID REFERENCES users(id),
    created_by UUID REFERENCES users(id) NOT NULL,
    tags TEXT[],
    attachments JSONB DEFAULT '[]',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Budget planning
CREATE TABLE budgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    department_id UUID REFERENCES departments(id) NOT NULL,
    fiscal_year INTEGER NOT NULL,
    quarter INTEGER CHECK (quarter BETWEEN 1 AND 4),
    month INTEGER CHECK (month BETWEEN 1 AND 12),
    category_id UUID REFERENCES transaction_categories(id) NOT NULL,
    planned_amount DECIMAL(15,2) NOT NULL,
    actual_amount DECIMAL(15,2) DEFAULT 0,
    variance_amount DECIMAL(15,2) GENERATED ALWAYS AS (actual_amount - planned_amount) STORED,
    variance_percentage DECIMAL(5,2) GENERATED ALWAYS AS (
        CASE WHEN planned_amount != 0 
        THEN ((actual_amount - planned_amount) / planned_amount) * 100 
        ELSE 0 END
    ) STORED,
    notes TEXT,
    created_by UUID REFERENCES users(id) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(department_id, fiscal_year, quarter, month, category_id)
);
```

### MongoDB Collections (Analytics & Flexible Data)

#### Analytics Data
```javascript
// analytics_events collection
{
  _id: ObjectId,
  event_type: String, // 'user_action', 'system_event', 'performance_metric'
  department: String,
  user_id: String,
  session_id: String,
  timestamp: Date,
  data: {
    action: String,
    target: String,
    duration: Number,
    metadata: Object
  },
  ip_address: String,
  user_agent: String,
  created_at: Date
}

// performance_metrics collection
{
  _id: ObjectId,
  metric_type: String, // 'api_response', 'page_load', 'query_time'
  service: String,
  endpoint: String,
  response_time: Number,
  status_code: Number,
  error_message: String,
  timestamp: Date,
  metadata: Object
}

// ai_interactions collection
{
  _id: ObjectId,
  user_id: String,
  department: String,
  ai_provider: String, // 'openai', 'gemini', 'claude', etc.
  request_type: String,
  prompt: String,
  response: String,
  tokens_used: Number,
  cost: Number,
  processing_time: Number,
  satisfaction_rating: Number,
  timestamp: Date
}
```

#### Document Storage
```javascript
// documents collection
{
  _id: ObjectId,
  title: String,
  description: String,
  file_path: String,
  file_size: Number,
  mime_type: String,
  department_id: String,
  uploaded_by: String,
  tags: [String],
  version: Number,
  is_current_version: Boolean,
  access_permissions: {
    public: Boolean,
    departments: [String],
    users: [String]
  },
  ai_analysis: {
    summary: String,
    keywords: [String],
    sentiment: String,
    language: String,
    confidence: Number
  },
  created_at: Date,
  updated_at: Date
}
```

## 🔌 API Design

### REST API Structure
```
Base URL: https://api.yyo-ai.com/v1

Authentication:
- POST /auth/login
- POST /auth/logout  
- POST /auth/refresh
- POST /auth/forgot-password
- POST /auth/reset-password
- POST /auth/verify-email
- POST /auth/enable-2fa
- POST /auth/verify-2fa

Users:
- GET /users
- GET /users/:id
- POST /users
- PUT /users/:id
- DELETE /users/:id
- GET /users/:id/permissions

Departments:
- GET /departments
- GET /departments/:id
- POST /departments
- PUT /departments/:id
- DELETE /departments/:id
- GET /departments/:id/users
- GET /departments/:id/tasks
- GET /departments/:id/analytics

Tasks:
- GET /tasks
- GET /tasks/:id
- POST /tasks
- PUT /tasks/:id
- DELETE /tasks/:id
- POST /tasks/:id/assign
- POST /tasks/:id/comments
- GET /tasks/:id/history

Finance:
- GET /finance/transactions
- POST /finance/transactions
- GET /finance/budgets
- POST /finance/budgets
- GET /finance/reports/:type
- GET /finance/analytics

AI Services:
- POST /ai/analyze-text
- POST /ai/analyze-document
- POST /ai/generate-report
- POST /ai/predict
- GET /ai/providers
```

### GraphQL Schema
```graphql
type User {
  id: ID!
  email: String!
  firstName: String!
  lastName: String!
  phone: String
  avatar: String
  language: String!
  theme: String!
  isActive: Boolean!
  roles: [UserRole!]!
  departments: [Department!]!
  createdAt: DateTime!
  updatedAt: DateTime!
}

type Department {
  id: ID!
  name: String!
  nameAr: String!
  description: String
  code: String!
  parent: Department
  children: [Department!]!
  manager: User
  budget: Float
  isActive: Boolean!
  users: [User!]!
  tasks: [Task!]!
  analytics: DepartmentAnalytics!
}

type Task {
  id: ID!
  title: String!
  description: String
  department: Department!
  createdBy: User!
  assignedTo: User
  parent: Task
  children: [Task!]!
  priority: Int!
  status: TaskStatus!
  dueDate: DateTime
  estimatedHours: Int
  actualHours: Int
  completionPercentage: Int!
  tags: [String!]!
  attachments: [Attachment!]!
  comments: [TaskComment!]!
  history: [TaskHistory!]!
  createdAt: DateTime!
  updatedAt: DateTime!
}

enum TaskStatus {
  PENDING
  IN_PROGRESS
  REVIEW
  COMPLETED
  CANCELLED
}

type Query {
  users(filter: UserFilter, pagination: Pagination): UserConnection!
  departments(filter: DepartmentFilter): [Department!]!
  tasks(filter: TaskFilter, pagination: Pagination): TaskConnection!
  analytics(department: ID, dateRange: DateRange): Analytics!
}

type Mutation {
  createUser(input: CreateUserInput!): User!
  updateUser(id: ID!, input: UpdateUserInput!): User!
  createTask(input: CreateTaskInput!): Task!
  assignTask(taskId: ID!, userId: ID!): Task!
  updateTaskStatus(taskId: ID!, status: TaskStatus!): Task!
}

type Subscription {
  taskUpdated(departmentId: ID): Task!
  notificationReceived(userId: ID!): Notification!
  analyticsUpdated(departmentId: ID): Analytics!
}
```

### WebSocket Events
```javascript
// Real-time events
const socketEvents = {
  // Task management
  'task:created': (data) => { /* handle new task */ },
  'task:updated': (data) => { /* handle task update */ },
  'task:assigned': (data) => { /* handle task assignment */ },
  'task:completed': (data) => { /* handle task completion */ },
  
  // Notifications
  'notification:new': (data) => { /* handle new notification */ },
  'notification:read': (data) => { /* handle read notification */ },
  
  // Analytics updates
  'analytics:updated': (data) => { /* handle analytics update */ },
  'dashboard:refresh': (data) => { /* refresh dashboard data */ },
  
  // User presence
  'user:online': (data) => { /* user came online */ },
  'user:offline': (data) => { /* user went offline */ },
  
  // System events
  'system:maintenance': (data) => { /* system maintenance alert */ },
  'system:update': (data) => { /* system update notification */ }
};
```

## 🔒 Security Architecture

### Authentication Flow
```mermaid
sequenceDiagram
    participant Client
    participant API Gateway
    participant Auth Service
    participant Database
    participant 2FA Service

    Client->>API Gateway: Login Request
    API Gateway->>Auth Service: Validate Credentials
    Auth Service->>Database: Check User
    Database-->>Auth Service: User Data
    Auth Service->>2FA Service: Generate 2FA Code
    2FA Service-->>Auth Service: Code Sent
    Auth Service-->>API Gateway: 2FA Required
    API Gateway-->>Client: 2FA Challenge
    Client->>API Gateway: 2FA Code
    API Gateway->>Auth Service: Verify 2FA
    Auth Service->>2FA Service: Validate Code
    2FA Service-->>Auth Service: Valid
    Auth Service-->>API Gateway: JWT Tokens
    API Gateway-->>Client: Access + Refresh Tokens
```

### Authorization Model (RBAC)
```javascript
const permissions = {
  // User management
  'users.read': 'View users',
  'users.create': 'Create users',
  'users.update': 'Update users',
  'users.delete': 'Delete users',
  
  // Department management
  'departments.read': 'View departments',
  'departments.manage': 'Manage departments',
  
  // Task management
  'tasks.read': 'View tasks',
  'tasks.create': 'Create tasks',
  'tasks.assign': 'Assign tasks',
  'tasks.update': 'Update tasks',
  'tasks.delete': 'Delete tasks',
  
  // Financial data
  'finance.read': 'View financial data',
  'finance.create': 'Create transactions',
  'finance.approve': 'Approve transactions',
  'finance.reports': 'Generate financial reports',
  
  // Analytics
  'analytics.read': 'View analytics',
  'analytics.export': 'Export analytics data',
  
  // System administration
  'system.admin': 'System administration',
  'system.audit': 'View audit logs'
};

const roles = {
  'super_admin': {
    name: 'Super Administrator',
    permissions: Object.keys(permissions)
  },
  'department_manager': {
    name: 'Department Manager',
    permissions: [
      'users.read', 'departments.read', 'departments.manage',
      'tasks.read', 'tasks.create', 'tasks.assign', 'tasks.update',
      'finance.read', 'finance.create', 'finance.reports',
      'analytics.read', 'analytics.export'
    ]
  },
  'team_lead': {
    name: 'Team Lead',
    permissions: [
      'users.read', 'departments.read',
      'tasks.read', 'tasks.create', 'tasks.assign', 'tasks.update',
      'analytics.read'
    ]
  },
  'employee': {
    name: 'Employee',
    permissions: [
      'users.read', 'departments.read',
      'tasks.read', 'tasks.update'
    ]
  }
};
```

### Data Encryption
```javascript
// Encryption configuration
const encryptionConfig = {
  // Data at rest
  database: {
    algorithm: 'AES-256-GCM',
    keyRotation: '90 days',
    fields: ['password_hash', 'two_factor_secret', 'sensitive_data']
  },
  
  // Data in transit
  transport: {
    protocol: 'TLS 1.3',
    cipherSuites: [
      'TLS_AES_256_GCM_SHA384',
      'TLS_CHACHA20_POLY1305_SHA256'
    ]
  },
  
  // JWT tokens
  jwt: {
    algorithm: 'RS256',
    accessTokenExpiry: '15m',
    refreshTokenExpiry: '7d',
    keyRotation: '30 days'
  }
};
```

## 🤖 AI Integration Architecture

### AI Service Abstraction Layer
```javascript
class AIServiceManager {
  constructor() {
    this.providers = {
      openai: new OpenAIProvider(),
      gemini: new GeminiProvider(),
      claude: new ClaudeProvider(),
      grok: new GrokProvider(),
      deepseek: new DeepSeekProvider(),
      mistral: new MistralProvider(),
      kimi: new KimiProvider(),
      qwen: new QwenProvider()
    };
  }

  async analyzeText(text, options = {}) {
    const provider = this.selectProvider('text_analysis', options);
    return await provider.analyzeText(text, options);
  }

  async generateReport(data, template, options = {}) {
    const provider = this.selectProvider('report_generation', options);
    return await provider.generateReport(data, template, options);
  }

  async predictTrends(historicalData, options = {}) {
    const provider = this.selectProvider('prediction', options);
    return await provider.predictTrends(historicalData, options);
  }

  selectProvider(task, options) {
    // Smart provider selection based on task type, cost, performance
    const providerScores = this.calculateProviderScores(task, options);
    return this.providers[providerScores[0].name];
  }
}
```

### AI Processing Pipeline
```javascript
const aiPipeline = {
  // Document analysis pipeline
  documentAnalysis: [
    'extract_text',
    'detect_language',
    'analyze_sentiment',
    'extract_entities',
    'summarize_content',
    'generate_keywords',
    'classify_document'
  ],
  
  // Predictive analytics pipeline
  predictiveAnalytics: [
    'data_preprocessing',
    'feature_engineering',
    'model_selection',
    'training',
    'validation',
    'prediction',
    'confidence_scoring'
  ],
  
  // Report generation pipeline
  reportGeneration: [
    'data_aggregation',
    'trend_analysis',
    'insight_extraction',
    'template_selection',
    'content_generation',
    'formatting',
    'quality_check'
  ]
};
```

## 📊 Analytics & Monitoring

### Performance Monitoring
```javascript
const monitoringConfig = {
  metrics: {
    // Application metrics
    'app.response_time': 'histogram',
    'app.request_count': 'counter',
    'app.error_rate': 'gauge',
    'app.active_users': 'gauge',
    
    // Database metrics
    'db.query_time': 'histogram',
    'db.connection_pool': 'gauge',
    'db.slow_queries': 'counter',
    
    // AI service metrics
    'ai.request_count': 'counter',
    'ai.response_time': 'histogram',
    'ai.token_usage': 'counter',
    'ai.cost': 'counter',
    
    // Business metrics
    'business.tasks_completed': 'counter',
    'business.user_satisfaction': 'gauge',
    'business.department_efficiency': 'gauge'
  },
  
  alerts: {
    'high_response_time': {
      condition: 'app.response_time > 2s',
      severity: 'warning'
    },
    'error_rate_spike': {
      condition: 'app.error_rate > 5%',
      severity: 'critical'
    },
    'ai_cost_threshold': {
      condition: 'ai.cost > $1000/day',
      severity: 'warning'
    }
  }
};
```

### Logging Strategy
```javascript
const loggingConfig = {
  levels: ['error', 'warn', 'info', 'debug'],
  
  transports: {
    console: {
      level: 'debug',
      format: 'colorized'
    },
    file: {
      level: 'info',
      filename: 'app.log',
      maxSize: '100MB',
      maxFiles: 10
    },
    elasticsearch: {
      level: 'warn',
      index: 'yyo-logs',
      type: 'application'
    }
  },
  
  structured: {
    timestamp: true,
    requestId: true,
    userId: true,
    department: true,
    action: true,
    metadata: true
  }
};
```

## 🚀 Deployment Architecture

### Container Configuration
```dockerfile
# Backend Dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:20-alpine AS runtime
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

```yaml
# docker-compose.yml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
    depends_on:
      - postgres
      - redis
      - mongodb

  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: yyo_ai
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data

  mongodb:
    image: mongo:6
    environment:
      MONGO_INITDB_ROOT_USERNAME: ${MONGO_USER}
      MONGO_INITDB_ROOT_PASSWORD: ${MONGO_PASSWORD}
    volumes:
      - mongodb_data:/data/db

volumes:
  postgres_data:
  redis_data:
  mongodb_data:
```

### Kubernetes Deployment
```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: yyo-ai-backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: yyo-ai-backend
  template:
    metadata:
      labels:
        app: yyo-ai-backend
    spec:
      containers:
      - name: backend
        image: yyo-ai/backend:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: yyo-ai-secrets
              key: database-url
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
```

## 🔧 Development Environment

### Environment Variables
```bash
# .env.example
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/yyo_ai
MONGODB_URL=mongodb://localhost:27017/yyo_ai
REDIS_URL=redis://localhost:6379

# Authentication
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-refresh-token-secret
ENCRYPTION_KEY=your-32-character-encryption-key

# AI Services
OPENAI_API_KEY=your-openai-api-key
GEMINI_API_KEY=your-gemini-api-key
CLAUDE_API_KEY=your-claude-api-key
GROK_API_KEY=your-grok-api-key

# Email Service
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# File Storage
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_S3_BUCKET=yyo-ai-files
AWS_REGION=us-east-1

# Monitoring
SENTRY_DSN=your-sentry-dsn
PROMETHEUS_PORT=9090
```

### Development Scripts
```json
{
  "scripts": {
    "dev": "nodemon src/app.ts",
    "build": "tsc && npm run build:frontend",
    "build:frontend": "cd frontend && npm run build",
    "start": "node dist/app.js",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "lint": "eslint src/**/*.ts",
    "lint:fix": "eslint src/**/*.ts --fix",
    "db:migrate": "knex migrate:latest",
    "db:seed": "knex seed:run",
    "db:reset": "knex migrate:rollback --all && npm run db:migrate && npm run db:seed",
    "docker:build": "docker build -t yyo-ai .",
    "docker:run": "docker-compose up -d",
    "docker:stop": "docker-compose down"
  }
}
```

---

## 📝 ملاحظات التطوير

هذا المستند يحدد المواصفات التقنية الأساسية للنظام. سيتم تحديثه مع تطور المشروع وإضافة تفاصيل تقنية جديدة.

**تاريخ الإنشاء:** نوفمبر 2024  
**الإصدار:** 1.0  
**المراجعة التالية:** ديسمبر 2024
