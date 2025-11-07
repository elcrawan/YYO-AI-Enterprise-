# YYO Agent AI - تصميم قاعدة البيانات التفصيلي

## 🗄️ نظرة عامة

يستخدم نظام YYO Agent AI معمارية قواعد بيانات متعددة لتحقيق الأداء الأمثل:

- **PostgreSQL:** البيانات المهيكلة والمعاملات الحرجة
- **MongoDB:** البيانات غير المهيكلة والتحليلات
- **Redis:** التخزين المؤقت والجلسات
- **Elasticsearch:** البحث والفهرسة

## 📊 PostgreSQL Schema

### 1. إدارة المستخدمين والأمان

#### جدول المستخدمين (users)
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    avatar_url TEXT,
    language VARCHAR(5) DEFAULT 'ar' CHECK (language IN ('ar', 'en')),
    theme VARCHAR(10) DEFAULT 'light' CHECK (theme IN ('light', 'dark')),
    timezone VARCHAR(50) DEFAULT 'Asia/Riyadh',
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    email_verification_token VARCHAR(255),
    email_verification_expires TIMESTAMP,
    two_factor_enabled BOOLEAN DEFAULT false,
    two_factor_secret VARCHAR(32),
    two_factor_backup_codes TEXT[],
    password_reset_token VARCHAR(255),
    password_reset_expires TIMESTAMP,
    last_login TIMESTAMP,
    login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_users_email ON users(email) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_active ON users(is_active) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_created_at ON users(created_at);
```

#### جدول الأدوار (roles)
```sql
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) UNIQUE NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    display_name_ar VARCHAR(100) NOT NULL,
    description TEXT,
    description_ar TEXT,
    permissions JSONB NOT NULL DEFAULT '[]',
    is_system BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default roles
INSERT INTO roles (name, display_name, display_name_ar, permissions, is_system) VALUES
('super_admin', 'Super Administrator', 'مدير عام', '["*"]', true),
('department_manager', 'Department Manager', 'مدير إدارة', 
 '["users.read", "departments.manage", "tasks.manage", "finance.read", "analytics.read"]', true),
('team_lead', 'Team Lead', 'رئيس قسم', 
 '["users.read", "tasks.manage", "analytics.read"]', true),
('employee', 'Employee', 'موظف', 
 '["tasks.read", "tasks.update"]', true);
```

#### جدول ربط المستخدمين بالأدوار (user_roles)
```sql
CREATE TABLE user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    department_id UUID REFERENCES departments(id) ON DELETE CASCADE,
    assigned_by UUID NOT NULL REFERENCES users(id),
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    UNIQUE(user_id, role_id, department_id)
);

CREATE INDEX idx_user_roles_user ON user_roles(user_id);
CREATE INDEX idx_user_roles_role ON user_roles(role_id);
CREATE INDEX idx_user_roles_department ON user_roles(department_id);
```

### 2. الهيكل التنظيمي

#### جدول الإدارات (departments)
```sql
CREATE TABLE departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    name_ar VARCHAR(100) NOT NULL,
    description TEXT,
    description_ar TEXT,
    code VARCHAR(10) UNIQUE NOT NULL,
    parent_id UUID REFERENCES departments(id),
    manager_id UUID REFERENCES users(id),
    budget DECIMAL(15,2) DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'USD',
    cost_center VARCHAR(20),
    location VARCHAR(100),
    phone VARCHAR(20),
    email VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Insert default departments
INSERT INTO departments (name, name_ar, code, description, description_ar) VALUES
('Finance', 'المالية', 'FIN', 'Financial management and accounting', 'إدارة الشؤون المالية والمحاسبة'),
('Operations', 'العمليات', 'OPS', 'Operations and process management', 'إدارة العمليات والعمليات'),
('Sales', 'المبيعات', 'SAL', 'Sales and customer relations', 'المبيعات وعلاقات العملاء'),
('Human Resources', 'الموارد البشرية', 'HR', 'Human resources management', 'إدارة الموارد البشرية'),
('Projects', 'المشاريع', 'PRJ', 'Project management', 'إدارة المشاريع'),
('IT', 'تكنولوجيا المعلومات', 'IT', 'Information technology', 'تكنولوجيا المعلومات'),
('Support', 'الدعم الفني', 'SUP', 'Technical support', 'الدعم الفني'),
('Innovation', 'الابتكار', 'INN', 'Innovation and R&D', 'الابتكار والبحث والتطوير'),
('Resources', 'الموارد', 'RES', 'Resource management', 'إدارة الموارد'),
('Quality', 'الجودة', 'QUA', 'Quality assurance', 'ضمان الجودة');

-- Hierarchical view for departments
CREATE VIEW department_hierarchy AS
WITH RECURSIVE dept_tree AS (
    SELECT 
        id, name, name_ar, code, parent_id, manager_id,
        0 as level, 
        ARRAY[id] as path,
        name as full_path
    FROM departments 
    WHERE parent_id IS NULL AND deleted_at IS NULL
    
    UNION ALL
    
    SELECT 
        d.id, d.name, d.name_ar, d.code, d.parent_id, d.manager_id,
        dt.level + 1,
        dt.path || d.id,
        dt.full_path || ' > ' || d.name
    FROM departments d
    JOIN dept_tree dt ON d.parent_id = dt.id
    WHERE d.deleted_at IS NULL
)
SELECT * FROM dept_tree ORDER BY path;
```

### 3. إدارة المهام والسير

#### جدول المهام (tasks)
```sql
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    department_id UUID NOT NULL REFERENCES departments(id),
    created_by UUID NOT NULL REFERENCES users(id),
    assigned_to UUID REFERENCES users(id),
    parent_task_id UUID REFERENCES tasks(id),
    priority INTEGER DEFAULT 3 CHECK (priority BETWEEN 1 AND 5),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN (
        'pending', 'assigned', 'in_progress', 'review', 
        'approved', 'completed', 'cancelled', 'on_hold'
    )),
    type VARCHAR(20) DEFAULT 'task' CHECK (type IN (
        'task', 'project', 'milestone', 'bug', 'feature'
    )),
    due_date TIMESTAMP,
    start_date TIMESTAMP,
    estimated_hours INTEGER,
    actual_hours INTEGER DEFAULT 0,
    completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage BETWEEN 0 AND 100),
    tags TEXT[] DEFAULT '{}',
    labels JSONB DEFAULT '[]',
    attachments JSONB DEFAULT '[]',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_tasks_department ON tasks(department_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to) WHERE deleted_at IS NULL;
CREATE INDEX idx_tasks_status ON tasks(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_tasks_due_date ON tasks(due_date) WHERE deleted_at IS NULL;
CREATE INDEX idx_tasks_created_at ON tasks(created_at);
CREATE INDEX idx_tasks_parent ON tasks(parent_task_id) WHERE deleted_at IS NULL;
```

#### جدول تاريخ المهام (task_history)
```sql
CREATE TABLE task_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    changed_by UUID NOT NULL REFERENCES users(id),
    change_type VARCHAR(20) NOT NULL CHECK (change_type IN (
        'created', 'updated', 'assigned', 'status_changed', 
        'commented', 'attachment_added', 'deleted'
    )),
    field_name VARCHAR(50),
    old_value TEXT,
    new_value TEXT,
    comment TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_task_history_task ON task_history(task_id);
CREATE INDEX idx_task_history_created_at ON task_history(created_at);
```

#### جدول تعليقات المهام (task_comments)
```sql
CREATE TABLE task_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    parent_comment_id UUID REFERENCES task_comments(id),
    content TEXT NOT NULL,
    attachments JSONB DEFAULT '[]',
    is_internal BOOLEAN DEFAULT false,
    is_edited BOOLEAN DEFAULT false,
    edited_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

CREATE INDEX idx_task_comments_task ON task_comments(task_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_task_comments_user ON task_comments(user_id);
```

### 4. الإدارة المالية

#### جدول فئات المعاملات (transaction_categories)
```sql
CREATE TABLE transaction_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    name_ar VARCHAR(100) NOT NULL,
    description TEXT,
    code VARCHAR(20) UNIQUE NOT NULL,
    parent_id UUID REFERENCES transaction_categories(id),
    type VARCHAR(10) NOT NULL CHECK (type IN ('income', 'expense', 'both')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default categories
INSERT INTO transaction_categories (name, name_ar, code, type) VALUES
('Revenue', 'الإيرادات', 'REV', 'income'),
('Sales', 'المبيعات', 'SAL', 'income'),
('Services', 'الخدمات', 'SRV', 'income'),
('Operating Expenses', 'المصروفات التشغيلية', 'OPEX', 'expense'),
('Salaries', 'الرواتب', 'SAL_EXP', 'expense'),
('Marketing', 'التسويق', 'MKT', 'expense'),
('Technology', 'التكنولوجيا', 'TECH', 'expense'),
('Office Supplies', 'مستلزمات المكتب', 'OFF_SUP', 'expense');
```

#### جدول المعاملات المالية (transactions)
```sql
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_number VARCHAR(50) UNIQUE NOT NULL,
    department_id UUID NOT NULL REFERENCES departments(id),
    category_id UUID NOT NULL REFERENCES transaction_categories(id),
    type VARCHAR(10) NOT NULL CHECK (type IN ('income', 'expense')),
    amount DECIMAL(15,2) NOT NULL CHECK (amount > 0),
    currency VARCHAR(3) DEFAULT 'USD',
    exchange_rate DECIMAL(10,4) DEFAULT 1.0,
    amount_base_currency DECIMAL(15,2) GENERATED ALWAYS AS (amount * exchange_rate) STORED,
    description TEXT NOT NULL,
    reference_number VARCHAR(50),
    invoice_number VARCHAR(50),
    vendor_supplier VARCHAR(255),
    customer VARCHAR(255),
    payment_method VARCHAR(50),
    payment_date DATE,
    due_date DATE,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN (
        'pending', 'approved', 'paid', 'cancelled', 'refunded'
    )),
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP,
    created_by UUID NOT NULL REFERENCES users(id),
    tags TEXT[] DEFAULT '{}',
    attachments JSONB DEFAULT '[]',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Generate transaction number trigger
CREATE OR REPLACE FUNCTION generate_transaction_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.transaction_number IS NULL THEN
        NEW.transaction_number := 'TXN-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || 
                                 LPAD(nextval('transaction_seq')::TEXT, 6, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE SEQUENCE transaction_seq START 1;
CREATE TRIGGER trg_generate_transaction_number
    BEFORE INSERT ON transactions
    FOR EACH ROW EXECUTE FUNCTION generate_transaction_number();
```

#### جدول الميزانيات (budgets)
```sql
CREATE TABLE budgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    department_id UUID NOT NULL REFERENCES departments(id),
    fiscal_year INTEGER NOT NULL,
    quarter INTEGER CHECK (quarter BETWEEN 1 AND 4),
    month INTEGER CHECK (month BETWEEN 1 AND 12),
    category_id UUID NOT NULL REFERENCES transaction_categories(id),
    planned_amount DECIMAL(15,2) NOT NULL CHECK (planned_amount >= 0),
    actual_amount DECIMAL(15,2) DEFAULT 0,
    committed_amount DECIMAL(15,2) DEFAULT 0,
    available_amount DECIMAL(15,2) GENERATED ALWAYS AS (
        planned_amount - actual_amount - committed_amount
    ) STORED,
    variance_amount DECIMAL(15,2) GENERATED ALWAYS AS (
        actual_amount - planned_amount
    ) STORED,
    variance_percentage DECIMAL(5,2) GENERATED ALWAYS AS (
        CASE WHEN planned_amount != 0 
        THEN ((actual_amount - planned_amount) / planned_amount) * 100 
        ELSE 0 END
    ) STORED,
    notes TEXT,
    is_approved BOOLEAN DEFAULT false,
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(department_id, fiscal_year, quarter, month, category_id)
);
```

### 5. إدارة الإشعارات

#### جدول الإشعارات (notifications)
```sql
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    title_ar VARCHAR(255),
    message TEXT NOT NULL,
    message_ar TEXT,
    type VARCHAR(20) NOT NULL CHECK (type IN (
        'info', 'success', 'warning', 'error', 'task', 'system'
    )),
    priority VARCHAR(10) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    category VARCHAR(50),
    related_entity_type VARCHAR(50),
    related_entity_id UUID,
    action_url TEXT,
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP,
    is_sent BOOLEAN DEFAULT false,
    sent_at TIMESTAMP,
    send_email BOOLEAN DEFAULT false,
    send_sms BOOLEAN DEFAULT false,
    metadata JSONB DEFAULT '{}',
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read) WHERE NOT is_read;
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);
```

### 6. إدارة الملفات والمرفقات

#### جدول الملفات (files)
```sql
CREATE TABLE files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    filename VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    file_hash VARCHAR(64) NOT NULL,
    storage_provider VARCHAR(20) DEFAULT 'local' CHECK (storage_provider IN ('local', 's3', 'gcs')),
    department_id UUID REFERENCES departments(id),
    uploaded_by UUID NOT NULL REFERENCES users(id),
    is_public BOOLEAN DEFAULT false,
    download_count INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

CREATE INDEX idx_files_uploaded_by ON files(uploaded_by) WHERE deleted_at IS NULL;
CREATE INDEX idx_files_department ON files(department_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_files_hash ON files(file_hash);
```

## 🍃 MongoDB Collections

### 1. Analytics Events
```javascript
// Collection: analytics_events
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
  geolocation: {
    country: String,
    city: String,
    coordinates: [Number, Number]
  },
  created_at: Date
}

// Indexes
db.analytics_events.createIndex({ "timestamp": 1 })
db.analytics_events.createIndex({ "user_id": 1, "timestamp": 1 })
db.analytics_events.createIndex({ "department": 1, "timestamp": 1 })
db.analytics_events.createIndex({ "event_type": 1, "timestamp": 1 })
```

### 2. AI Interactions
```javascript
// Collection: ai_interactions
{
  _id: ObjectId,
  user_id: String,
  department: String,
  ai_provider: String, // 'openai', 'gemini', 'claude', etc.
  request_type: String, // 'text_analysis', 'report_generation', 'prediction'
  prompt: String,
  response: String,
  tokens_used: Number,
  cost: Number,
  processing_time: Number,
  satisfaction_rating: Number, // 1-5
  feedback: String,
  metadata: {
    model: String,
    temperature: Number,
    max_tokens: Number,
    custom_parameters: Object
  },
  timestamp: Date,
  created_at: Date
}

// Indexes
db.ai_interactions.createIndex({ "user_id": 1, "timestamp": 1 })
db.ai_interactions.createIndex({ "ai_provider": 1, "timestamp": 1 })
db.ai_interactions.createIndex({ "request_type": 1, "timestamp": 1 })
db.ai_interactions.createIndex({ "cost": 1, "timestamp": 1 })
```

### 3. Document Analysis
```javascript
// Collection: document_analysis
{
  _id: ObjectId,
  file_id: String, // Reference to PostgreSQL files table
  title: String,
  content: String,
  file_type: String,
  file_size: Number,
  department_id: String,
  uploaded_by: String,
  analysis: {
    summary: String,
    keywords: [String],
    entities: [{
      text: String,
      type: String, // 'PERSON', 'ORGANIZATION', 'LOCATION', etc.
      confidence: Number
    }],
    sentiment: {
      score: Number, // -1 to 1
      magnitude: Number,
      label: String // 'positive', 'negative', 'neutral'
    },
    language: String,
    topics: [{
      name: String,
      confidence: Number
    }],
    readability: {
      score: Number,
      level: String
    }
  },
  ai_provider: String,
  processing_time: Number,
  confidence_score: Number,
  created_at: Date,
  updated_at: Date
}

// Indexes
db.document_analysis.createIndex({ "file_id": 1 })
db.document_analysis.createIndex({ "department_id": 1, "created_at": 1 })
db.document_analysis.createIndex({ "analysis.keywords": 1 })
db.document_analysis.createIndex({ "analysis.sentiment.label": 1 })
```

### 4. Performance Metrics
```javascript
// Collection: performance_metrics
{
  _id: ObjectId,
  metric_type: String, // 'api_response', 'page_load', 'query_time', 'user_action'
  service: String,
  endpoint: String,
  method: String,
  response_time: Number,
  status_code: Number,
  error_message: String,
  user_id: String,
  session_id: String,
  request_size: Number,
  response_size: Number,
  database_queries: Number,
  cache_hits: Number,
  cache_misses: Number,
  timestamp: Date,
  metadata: {
    user_agent: String,
    ip_address: String,
    referer: String,
    custom_data: Object
  }
}

// Indexes
db.performance_metrics.createIndex({ "timestamp": 1 })
db.performance_metrics.createIndex({ "service": 1, "timestamp": 1 })
db.performance_metrics.createIndex({ "endpoint": 1, "timestamp": 1 })
db.performance_metrics.createIndex({ "response_time": 1, "timestamp": 1 })
```

## 🔴 Redis Data Structures

### 1. Session Management
```redis
# User sessions
SET session:${sessionId} "${userSessionData}" EX 86400

# User active sessions
SADD user:${userId}:sessions ${sessionId}

# Session metadata
HSET session:${sessionId}:meta 
  user_id ${userId}
  created_at ${timestamp}
  last_activity ${timestamp}
  ip_address ${ipAddress}
```

### 2. Caching
```redis
# User data cache
SET user:${userId} "${userData}" EX 3600

# Department data cache
SET department:${deptId} "${deptData}" EX 7200

# Task lists cache
SET tasks:department:${deptId} "${tasksList}" EX 1800

# Analytics cache
SET analytics:${key}:${date} "${analyticsData}" EX 86400
```

### 3. Real-time Features
```redis
# Online users
SADD online_users ${userId}
EXPIRE online_users 300

# Task notifications queue
LPUSH notifications:${userId} "${notificationData}"

# Real-time counters
INCR counter:tasks:completed:${date}
INCR counter:users:active:${date}
```

### 4. Rate Limiting
```redis
# API rate limiting
INCR rate_limit:${userId}:${endpoint}:${window}
EXPIRE rate_limit:${userId}:${endpoint}:${window} ${windowSize}

# Login attempts
INCR login_attempts:${email}:${window}
EXPIRE login_attempts:${email}:${window} 900
```

## 🔍 Elasticsearch Mappings

### 1. Search Index
```json
{
  "mappings": {
    "properties": {
      "id": { "type": "keyword" },
      "type": { "type": "keyword" },
      "title": {
        "type": "text",
        "analyzer": "arabic_english_analyzer",
        "fields": {
          "keyword": { "type": "keyword" }
        }
      },
      "content": {
        "type": "text",
        "analyzer": "arabic_english_analyzer"
      },
      "department": { "type": "keyword" },
      "tags": { "type": "keyword" },
      "created_by": { "type": "keyword" },
      "created_at": { "type": "date" },
      "updated_at": { "type": "date" }
    }
  },
  "settings": {
    "analysis": {
      "analyzer": {
        "arabic_english_analyzer": {
          "tokenizer": "standard",
          "filter": ["lowercase", "arabic_normalization", "english_stemmer"]
        }
      }
    }
  }
}
```

### 2. Logs Index
```json
{
  "mappings": {
    "properties": {
      "timestamp": { "type": "date" },
      "level": { "type": "keyword" },
      "message": { "type": "text" },
      "service": { "type": "keyword" },
      "user_id": { "type": "keyword" },
      "request_id": { "type": "keyword" },
      "metadata": { "type": "object" },
      "stack_trace": { "type": "text" }
    }
  }
}
```

## 🔧 Database Functions and Triggers

### 1. Audit Trail Function
```sql
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO audit_log (table_name, operation, new_data, user_id, timestamp)
        VALUES (TG_TABLE_NAME, 'INSERT', row_to_json(NEW), current_setting('app.current_user_id', true)::UUID, NOW());
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit_log (table_name, operation, old_data, new_data, user_id, timestamp)
        VALUES (TG_TABLE_NAME, 'UPDATE', row_to_json(OLD), row_to_json(NEW), current_setting('app.current_user_id', true)::UUID, NOW());
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO audit_log (table_name, operation, old_data, user_id, timestamp)
        VALUES (TG_TABLE_NAME, 'DELETE', row_to_json(OLD), current_setting('app.current_user_id', true)::UUID, NOW());
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;
```

### 2. Update Timestamp Function
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at column
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

---

## 📝 ملاحظات التطوير

هذا التصميم يوفر:
- **الأداء العالي** من خلال الفهرسة المناسبة
- **المرونة** في التوسع المستقبلي
- **الأمان** من خلال القيود والتحقق
- **التدقيق** الشامل لجميع العمليات
- **البحث المتقدم** باللغتين العربية والإنجليزية

**تاريخ الإنشاء:** نوفمبر 2024  
**الإصدار:** 1.0  
**المراجعة التالية:** ديسمبر 2024
