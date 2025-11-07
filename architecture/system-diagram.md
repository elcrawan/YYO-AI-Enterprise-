# YYO Agent AI - مخططات النظام

## 🏗️ المعمارية العامة

```mermaid
graph TB
    subgraph "Client Layer"
        WEB[Web App<br/>React + TypeScript]
        MOBILE[Mobile App<br/>React Native]
        API_CLIENT[API Clients<br/>Third Party]
    end

    subgraph "API Gateway Layer"
        GATEWAY[API Gateway<br/>Express.js + TypeScript]
        AUTH[Authentication<br/>JWT + 2FA]
        RATE_LIMIT[Rate Limiting<br/>Redis]
    end

    subgraph "Application Layer"
        subgraph "Core Services"
            USER_SVC[User Service]
            DEPT_SVC[Department Service]
            TASK_SVC[Task Service]
            WORKFLOW_SVC[Workflow Engine]
        end
        
        subgraph "Business Services"
            FINANCE_SVC[Finance Service]
            HR_SVC[HR Service]
            ANALYTICS_SVC[Analytics Service]
            REPORT_SVC[Report Service]
        end
        
        subgraph "AI Services"
            AI_MANAGER[AI Service Manager]
            OPENAI[OpenAI Provider]
            GEMINI[Gemini Provider]
            CLAUDE[Claude Provider]
            GROK[Grok Provider]
        end
    end

    subgraph "Data Layer"
        POSTGRES[(PostgreSQL<br/>Primary Database)]
        MONGODB[(MongoDB<br/>Analytics & Documents)]
        REDIS[(Redis<br/>Cache & Sessions)]
        ELASTICSEARCH[(Elasticsearch<br/>Search & Logs)]
    end

    subgraph "External Services"
        EMAIL[Email Service<br/>SMTP]
        SMS[SMS Service]
        STORAGE[File Storage<br/>AWS S3]
        MONITORING[Monitoring<br/>Prometheus + Grafana]
    end

    WEB --> GATEWAY
    MOBILE --> GATEWAY
    API_CLIENT --> GATEWAY
    
    GATEWAY --> AUTH
    GATEWAY --> RATE_LIMIT
    
    GATEWAY --> USER_SVC
    GATEWAY --> DEPT_SVC
    GATEWAY --> TASK_SVC
    GATEWAY --> WORKFLOW_SVC
    GATEWAY --> FINANCE_SVC
    GATEWAY --> HR_SVC
    GATEWAY --> ANALYTICS_SVC
    GATEWAY --> REPORT_SVC
    
    ANALYTICS_SVC --> AI_MANAGER
    REPORT_SVC --> AI_MANAGER
    AI_MANAGER --> OPENAI
    AI_MANAGER --> GEMINI
    AI_MANAGER --> CLAUDE
    AI_MANAGER --> GROK
    
    USER_SVC --> POSTGRES
    DEPT_SVC --> POSTGRES
    TASK_SVC --> POSTGRES
    FINANCE_SVC --> POSTGRES
    HR_SVC --> POSTGRES
    
    ANALYTICS_SVC --> MONGODB
    REPORT_SVC --> MONGODB
    
    AUTH --> REDIS
    RATE_LIMIT --> REDIS
    
    ANALYTICS_SVC --> ELASTICSEARCH
    MONITORING --> ELASTICSEARCH
    
    USER_SVC --> EMAIL
    USER_SVC --> SMS
    REPORT_SVC --> STORAGE
```

## 🔄 تدفق البيانات الرئيسي

```mermaid
sequenceDiagram
    participant User as المستخدم
    participant Web as واجهة الويب
    participant Gateway as API Gateway
    participant Auth as خدمة المصادقة
    participant TaskSvc as خدمة المهام
    participant AI as خدمة الذكاء الاصطناعي
    participant DB as قاعدة البيانات
    participant Cache as التخزين المؤقت

    User->>Web: تسجيل الدخول
    Web->>Gateway: طلب المصادقة
    Gateway->>Auth: التحقق من البيانات
    Auth->>DB: استعلام المستخدم
    DB-->>Auth: بيانات المستخدم
    Auth-->>Gateway: JWT Token
    Gateway-->>Web: نجح تسجيل الدخول
    Web-->>User: لوحة التحكم

    User->>Web: إنشاء مهمة جديدة
    Web->>Gateway: طلب إنشاء مهمة
    Gateway->>Auth: التحقق من الصلاحيات
    Auth-->>Gateway: صلاحيات مؤكدة
    Gateway->>TaskSvc: إنشاء المهمة
    TaskSvc->>DB: حفظ المهمة
    TaskSvc->>AI: تحليل المهمة
    AI-->>TaskSvc: توصيات ذكية
    TaskSvc->>Cache: تحديث التخزين المؤقت
    TaskSvc-->>Gateway: مهمة مُنشأة
    Gateway-->>Web: تأكيد الإنشاء
    Web-->>User: إشعار النجاح
```

## 🗄️ هيكل قاعدة البيانات

```mermaid
erDiagram
    USERS {
        uuid id PK
        string email UK
        string password_hash
        string first_name
        string last_name
        string phone
        string avatar_url
        string language
        string theme
        boolean is_active
        boolean email_verified
        boolean two_factor_enabled
        timestamp created_at
        timestamp updated_at
    }

    ROLES {
        uuid id PK
        string name UK
        string display_name
        text description
        jsonb permissions
        boolean is_system
        timestamp created_at
    }

    DEPARTMENTS {
        uuid id PK
        string name
        string name_ar
        text description
        string code UK
        uuid parent_id FK
        uuid manager_id FK
        decimal budget
        boolean is_active
        timestamp created_at
        timestamp updated_at
    }

    TASKS {
        uuid id PK
        string title
        text description
        uuid department_id FK
        uuid created_by FK
        uuid assigned_to FK
        uuid parent_task_id FK
        integer priority
        string status
        timestamp due_date
        integer estimated_hours
        integer actual_hours
        integer completion_percentage
        text[] tags
        jsonb metadata
        timestamp created_at
        timestamp updated_at
        timestamp completed_at
    }

    TRANSACTIONS {
        uuid id PK
        uuid department_id FK
        uuid category_id FK
        string type
        decimal amount
        string currency
        text description
        string reference_number
        string status
        uuid approved_by FK
        uuid created_by FK
        timestamp created_at
        timestamp updated_at
    }

    USER_ROLES {
        uuid user_id FK
        uuid role_id FK
        uuid department_id FK
        uuid assigned_by FK
        timestamp assigned_at
    }

    USERS ||--o{ USER_ROLES : has
    ROLES ||--o{ USER_ROLES : assigned
    DEPARTMENTS ||--o{ USER_ROLES : scoped
    DEPARTMENTS ||--o{ DEPARTMENTS : parent
    USERS ||--o{ DEPARTMENTS : manages
    DEPARTMENTS ||--o{ TASKS : contains
    USERS ||--o{ TASKS : creates
    USERS ||--o{ TASKS : assigned
    TASKS ||--o{ TASKS : parent
    DEPARTMENTS ||--o{ TRANSACTIONS : owns
    USERS ||--o{ TRANSACTIONS : creates
    USERS ||--o{ TRANSACTIONS : approves
```

## 🤖 معمارية الذكاء الاصطناعي

```mermaid
graph TB
    subgraph "AI Service Layer"
        AI_MANAGER[AI Service Manager<br/>Provider Selection & Load Balancing]
        
        subgraph "AI Providers"
            OPENAI[OpenAI GPT<br/>Text Analysis & Generation]
            GEMINI[Google Gemini<br/>Multimodal Analysis]
            CLAUDE[Anthropic Claude<br/>Complex Reasoning]
            GROK[xAI Grok<br/>Contextual Analysis]
            DEEPSEEK[DeepSeek<br/>Technical Analysis]
            MISTRAL[Mistral<br/>Fast Processing]
            KIMI[Kimi<br/>Multilingual Support]
            QWEN[Qwen<br/>Chinese Language]
        end
        
        subgraph "AI Processing Pipeline"
            PREPROCESSOR[Data Preprocessor]
            ANALYZER[Content Analyzer]
            PREDICTOR[Predictive Engine]
            GENERATOR[Report Generator]
            VALIDATOR[Quality Validator]
        end
    end

    subgraph "Application Services"
        ANALYTICS[Analytics Service]
        REPORTS[Report Service]
        TASKS[Task Service]
        FINANCE[Finance Service]
    end

    subgraph "Data Sources"
        STRUCTURED[(Structured Data<br/>PostgreSQL)]
        UNSTRUCTURED[(Unstructured Data<br/>MongoDB)]
        REALTIME[(Real-time Data<br/>Redis)]
        DOCUMENTS[(Documents<br/>File Storage)]
    end

    ANALYTICS --> AI_MANAGER
    REPORTS --> AI_MANAGER
    TASKS --> AI_MANAGER
    FINANCE --> AI_MANAGER

    AI_MANAGER --> OPENAI
    AI_MANAGER --> GEMINI
    AI_MANAGER --> CLAUDE
    AI_MANAGER --> GROK
    AI_MANAGER --> DEEPSEEK
    AI_MANAGER --> MISTRAL
    AI_MANAGER --> KIMI
    AI_MANAGER --> QWEN

    AI_MANAGER --> PREPROCESSOR
    PREPROCESSOR --> ANALYZER
    ANALYZER --> PREDICTOR
    PREDICTOR --> GENERATOR
    GENERATOR --> VALIDATOR

    PREPROCESSOR --> STRUCTURED
    PREPROCESSOR --> UNSTRUCTURED
    PREPROCESSOR --> REALTIME
    PREPROCESSOR --> DOCUMENTS
```

## 🔒 معمارية الأمان

```mermaid
graph TB
    subgraph "Security Layers"
        subgraph "Network Security"
            WAF[Web Application Firewall]
            DDOS[DDoS Protection]
            SSL[SSL/TLS Termination]
        end
        
        subgraph "Application Security"
            AUTH[Authentication Service]
            AUTHZ[Authorization Service]
            RATE_LIMIT[Rate Limiting]
            INPUT_VAL[Input Validation]
        end
        
        subgraph "Data Security"
            ENCRYPTION[Data Encryption]
            KEY_MGMT[Key Management]
            AUDIT[Audit Logging]
            BACKUP[Secure Backup]
        end
    end

    subgraph "Authentication Flow"
        LOGIN[Login Request]
        CREDS[Credential Validation]
        MFA[Multi-Factor Auth]
        JWT[JWT Token Generation]
        SESSION[Session Management]
    end

    subgraph "Authorization Model"
        RBAC[Role-Based Access Control]
        PERMISSIONS[Permission Matrix]
        CONTEXT[Context-Aware Access]
        POLICIES[Security Policies]
    end

    WAF --> DDOS
    DDOS --> SSL
    SSL --> AUTH
    
    AUTH --> AUTHZ
    AUTHZ --> RATE_LIMIT
    RATE_LIMIT --> INPUT_VAL
    
    INPUT_VAL --> ENCRYPTION
    ENCRYPTION --> KEY_MGMT
    KEY_MGMT --> AUDIT
    AUDIT --> BACKUP

    LOGIN --> CREDS
    CREDS --> MFA
    MFA --> JWT
    JWT --> SESSION

    AUTHZ --> RBAC
    RBAC --> PERMISSIONS
    PERMISSIONS --> CONTEXT
    CONTEXT --> POLICIES
```

## 📊 معمارية التحليلات والمراقبة

```mermaid
graph TB
    subgraph "Data Collection"
        APP_METRICS[Application Metrics]
        USER_EVENTS[User Events]
        SYSTEM_LOGS[System Logs]
        BUSINESS_DATA[Business Data]
    end

    subgraph "Processing Layer"
        STREAM_PROCESSOR[Stream Processor<br/>Real-time Analytics]
        BATCH_PROCESSOR[Batch Processor<br/>Historical Analysis]
        ML_PIPELINE[ML Pipeline<br/>Predictive Analytics]
    end

    subgraph "Storage Layer"
        TIME_SERIES[(Time Series DB<br/>Metrics Storage)]
        ANALYTICS_DB[(Analytics DB<br/>Processed Data)]
        DATA_LAKE[(Data Lake<br/>Raw Data Archive)]
    end

    subgraph "Visualization Layer"
        DASHBOARDS[Real-time Dashboards]
        REPORTS[Automated Reports]
        ALERTS[Alert System]
        INSIGHTS[AI Insights]
    end

    APP_METRICS --> STREAM_PROCESSOR
    USER_EVENTS --> STREAM_PROCESSOR
    SYSTEM_LOGS --> BATCH_PROCESSOR
    BUSINESS_DATA --> BATCH_PROCESSOR

    STREAM_PROCESSOR --> TIME_SERIES
    BATCH_PROCESSOR --> ANALYTICS_DB
    STREAM_PROCESSOR --> DATA_LAKE
    BATCH_PROCESSOR --> DATA_LAKE

    STREAM_PROCESSOR --> ML_PIPELINE
    BATCH_PROCESSOR --> ML_PIPELINE
    ML_PIPELINE --> ANALYTICS_DB

    TIME_SERIES --> DASHBOARDS
    ANALYTICS_DB --> REPORTS
    TIME_SERIES --> ALERTS
    ML_PIPELINE --> INSIGHTS
```

## 🚀 معمارية النشر

```mermaid
graph TB
    subgraph "Development Environment"
        DEV_CODE[Source Code<br/>GitHub]
        DEV_BUILD[Build Process<br/>GitHub Actions]
        DEV_TEST[Automated Tests<br/>Jest + Cypress]
    end

    subgraph "Staging Environment"
        STAGING_DEPLOY[Staging Deployment<br/>Docker Containers]
        STAGING_TEST[Integration Tests]
        STAGING_REVIEW[Code Review]
    end

    subgraph "Production Environment"
        subgraph "Container Orchestration"
            K8S[Kubernetes Cluster]
            INGRESS[Ingress Controller]
            SERVICES[Microservices]
        end
        
        subgraph "Data Tier"
            PROD_DB[(Production Databases)]
            CACHE_CLUSTER[(Redis Cluster)]
            SEARCH_CLUSTER[(Elasticsearch Cluster)]
        end
        
        subgraph "Monitoring & Logging"
            PROMETHEUS[Prometheus<br/>Metrics Collection]
            GRAFANA[Grafana<br/>Visualization]
            ELK[ELK Stack<br/>Log Analysis]
        end
    end

    DEV_CODE --> DEV_BUILD
    DEV_BUILD --> DEV_TEST
    DEV_TEST --> STAGING_DEPLOY
    
    STAGING_DEPLOY --> STAGING_TEST
    STAGING_TEST --> STAGING_REVIEW
    STAGING_REVIEW --> K8S
    
    K8S --> INGRESS
    INGRESS --> SERVICES
    SERVICES --> PROD_DB
    SERVICES --> CACHE_CLUSTER
    SERVICES --> SEARCH_CLUSTER
    
    SERVICES --> PROMETHEUS
    PROMETHEUS --> GRAFANA
    SERVICES --> ELK
```

## 🔄 تدفق المهام الذكي

```mermaid
stateDiagram-v2
    [*] --> Created: إنشاء المهمة
    Created --> Assigned: تعيين المسؤول
    Assigned --> InProgress: بدء العمل
    InProgress --> Review: طلب المراجعة
    Review --> InProgress: إعادة العمل
    Review --> Approved: موافقة
    Approved --> Completed: إنجاز
    
    InProgress --> OnHold: إيقاف مؤقت
    OnHold --> InProgress: استئناف
    
    Created --> Cancelled: إلغاء
    Assigned --> Cancelled: إلغاء
    InProgress --> Cancelled: إلغاء
    
    Completed --> [*]
    Cancelled --> [*]
    
    note right of Created
        - تحديد التفاصيل
        - تقدير الوقت
        - تحديد الأولوية
    end note
    
    note right of InProgress
        - تحديث التقدم
        - إضافة تعليقات
        - رفع مرفقات
    end note
    
    note right of Review
        - مراجعة الجودة
        - تقييم الإنجاز
        - طلب تعديلات
    end note
```

---

## 📝 ملاحظات التصميم

هذا المستند يحتوي على المخططات الأساسية لمعمارية النظام. المخططات قابلة للتحديث مع تطور المشروع وإضافة مكونات جديدة.

**تاريخ الإنشاء:** نوفمبر 2024  
**الإصدار:** 1.0  
**المراجعة التالية:** ديسمبر 2024

