# YYO Agent AI - تصميم APIs الشامل

## 🌐 نظرة عامة

يوفر نظام YYO Agent AI مجموعة شاملة من APIs لدعم جميع العمليات:

- **REST APIs:** للعمليات الأساسية CRUD
- **GraphQL:** للاستعلامات المعقدة والمرنة
- **WebSocket:** للتحديثات الفورية
- **Webhooks:** للتكامل مع الأنظمة الخارجية

## 🔗 REST API Structure

### Base Configuration
```
Base URL: https://api.yyo-ai.com/v1
Content-Type: application/json
Authorization: Bearer {jwt_token}
Accept-Language: ar, en
```

### Response Format
```json
{
  "success": true,
  "data": {},
  "message": "Operation completed successfully",
  "message_ar": "تمت العملية بنجاح",
  "timestamp": "2024-11-07T16:53:55Z",
  "request_id": "req_123456789"
}
```

### Error Response Format
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "message_ar": "بيانات إدخال غير صحيحة",
    "details": [
      {
        "field": "email",
        "message": "Email is required",
        "message_ar": "البريد الإلكتروني مطلوب"
      }
    ]
  },
  "timestamp": "2024-11-07T16:53:55Z",
  "request_id": "req_123456789"
}
```

## 🔐 Authentication APIs

### POST /auth/login
تسجيل الدخول للنظام

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "remember_me": false
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "first_name": "أحمد",
      "last_name": "محمد",
      "language": "ar",
      "theme": "light"
    },
    "tokens": {
      "access_token": "jwt_access_token",
      "refresh_token": "jwt_refresh_token",
      "expires_in": 900
    },
    "two_factor_required": false
  }
}
```

### POST /auth/verify-2fa
التحقق من المصادقة الثنائية

**Request Body:**
```json
{
  "email": "user@example.com",
  "code": "123456",
  "temp_token": "temporary_token"
}
```

### POST /auth/refresh
تجديد رمز الوصول

**Request Body:**
```json
{
  "refresh_token": "jwt_refresh_token"
}
```

### POST /auth/logout
تسجيل الخروج

**Request Body:**
```json
{
  "refresh_token": "jwt_refresh_token"
}
```

### POST /auth/forgot-password
طلب إعادة تعيين كلمة المرور

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

### POST /auth/reset-password
إعادة تعيين كلمة المرور

**Request Body:**
```json
{
  "token": "reset_token",
  "password": "newSecurePassword123",
  "password_confirmation": "newSecurePassword123"
}
```

## 👥 User Management APIs

### GET /users
الحصول على قائمة المستخدمين

**Query Parameters:**
- `page`: رقم الصفحة (افتراضي: 1)
- `limit`: عدد العناصر في الصفحة (افتراضي: 20)
- `search`: البحث في الاسم أو البريد الإلكتروني
- `department_id`: تصفية حسب الإدارة
- `role`: تصفية حسب الدور
- `is_active`: تصفية حسب الحالة

**Response:**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "uuid",
        "email": "user@example.com",
        "first_name": "أحمد",
        "last_name": "محمد",
        "phone": "+966501234567",
        "avatar_url": "https://...",
        "language": "ar",
        "theme": "light",
        "is_active": true,
        "roles": [
          {
            "id": "uuid",
            "name": "department_manager",
            "display_name_ar": "مدير إدارة",
            "department": {
              "id": "uuid",
              "name_ar": "المالية"
            }
          }
        ],
        "created_at": "2024-01-01T00:00:00Z",
        "last_login": "2024-11-07T16:00:00Z"
      }
    ],
    "pagination": {
      "current_page": 1,
      "per_page": 20,
      "total": 150,
      "total_pages": 8
    }
  }
}
```

### GET /users/:id
الحصول على تفاصيل مستخدم محدد

### POST /users
إنشاء مستخدم جديد

**Request Body:**
```json
{
  "email": "newuser@example.com",
  "password": "securePassword123",
  "first_name": "سارة",
  "last_name": "أحمد",
  "phone": "+966501234567",
  "language": "ar",
  "department_id": "uuid",
  "role_ids": ["uuid1", "uuid2"]
}
```

### PUT /users/:id
تحديث بيانات مستخدم

### DELETE /users/:id
حذف مستخدم (soft delete)

### GET /users/:id/permissions
الحصول على صلاحيات مستخدم

## 🏢 Department Management APIs

### GET /departments
الحصول على قائمة الإدارات

**Response:**
```json
{
  "success": true,
  "data": {
    "departments": [
      {
        "id": "uuid",
        "name": "Finance",
        "name_ar": "المالية",
        "code": "FIN",
        "description_ar": "إدارة الشؤون المالية والمحاسبة",
        "parent_id": null,
        "manager": {
          "id": "uuid",
          "first_name": "أحمد",
          "last_name": "محمد"
        },
        "budget": 1000000.00,
        "currency": "USD",
        "is_active": true,
        "children": [
          {
            "id": "uuid",
            "name_ar": "المحاسبة",
            "code": "ACC"
          }
        ],
        "stats": {
          "total_users": 15,
          "active_tasks": 25,
          "completed_tasks": 150
        }
      }
    ]
  }
}
```

### GET /departments/:id
تفاصيل إدارة محددة

### POST /departments
إنشاء إدارة جديدة

### PUT /departments/:id
تحديث بيانات إدارة

### DELETE /departments/:id
حذف إدارة

### GET /departments/:id/users
المستخدمين في إدارة محددة

### GET /departments/:id/tasks
المهام في إدارة محددة

### GET /departments/:id/analytics
تحليلات إدارة محددة

## 📋 Task Management APIs

### GET /tasks
الحصول على قائمة المهام

**Query Parameters:**
- `page`, `limit`: للصفحات
- `status`: تصفية حسب الحالة
- `priority`: تصفية حسب الأولوية
- `assigned_to`: تصفية حسب المسؤول
- `department_id`: تصفية حسب الإدارة
- `due_date_from`, `due_date_to`: تصفية حسب الموعد النهائي
- `search`: البحث في العنوان والوصف

**Response:**
```json
{
  "success": true,
  "data": {
    "tasks": [
      {
        "id": "uuid",
        "title": "إعداد التقرير المالي الشهري",
        "description": "إعداد وتحليل التقرير المالي لشهر أكتوبر",
        "status": "in_progress",
        "priority": 4,
        "type": "task",
        "due_date": "2024-11-15T23:59:59Z",
        "estimated_hours": 8,
        "actual_hours": 5,
        "completion_percentage": 60,
        "department": {
          "id": "uuid",
          "name_ar": "المالية",
          "code": "FIN"
        },
        "created_by": {
          "id": "uuid",
          "first_name": "أحمد",
          "last_name": "محمد"
        },
        "assigned_to": {
          "id": "uuid",
          "first_name": "سارة",
          "last_name": "أحمد"
        },
        "tags": ["تقرير", "مالي", "شهري"],
        "attachments": [
          {
            "id": "uuid",
            "filename": "template.xlsx",
            "file_size": 1024000,
            "uploaded_at": "2024-11-01T10:00:00Z"
          }
        ],
        "created_at": "2024-11-01T09:00:00Z",
        "updated_at": "2024-11-07T14:30:00Z"
      }
    ],
    "pagination": {
      "current_page": 1,
      "per_page": 20,
      "total": 85,
      "total_pages": 5
    }
  }
}
```

### GET /tasks/:id
تفاصيل مهمة محددة

### POST /tasks
إنشاء مهمة جديدة

**Request Body:**
```json
{
  "title": "إعداد التقرير المالي الشهري",
  "description": "إعداد وتحليل التقرير المالي لشهر نوفمبر",
  "department_id": "uuid",
  "assigned_to": "uuid",
  "priority": 4,
  "due_date": "2024-12-15T23:59:59Z",
  "estimated_hours": 8,
  "tags": ["تقرير", "مالي", "شهري"],
  "attachments": ["file_uuid1", "file_uuid2"]
}
```

### PUT /tasks/:id
تحديث مهمة

### DELETE /tasks/:id
حذف مهمة

### POST /tasks/:id/assign
تعيين مهمة لمستخدم

**Request Body:**
```json
{
  "assigned_to": "uuid",
  "reason": "تخصص في التقارير المالية"
}
```

### PUT /tasks/:id/status
تحديث حالة مهمة

**Request Body:**
```json
{
  "status": "completed",
  "completion_percentage": 100,
  "actual_hours": 7,
  "comment": "تم إنجاز المهمة بنجاح"
}
```

### GET /tasks/:id/history
تاريخ تغييرات المهمة

### POST /tasks/:id/comments
إضافة تعليق على مهمة

**Request Body:**
```json
{
  "content": "تم مراجعة التقرير وهو جاهز للموافقة",
  "is_internal": false,
  "attachments": ["file_uuid"]
}
```

### GET /tasks/:id/comments
الحصول على تعليقات المهمة

## 💰 Finance Management APIs

### GET /finance/transactions
الحصول على قائمة المعاملات المالية

**Query Parameters:**
- `page`, `limit`: للصفحات
- `type`: income أو expense
- `status`: حالة المعاملة
- `department_id`: تصفية حسب الإدارة
- `category_id`: تصفية حسب الفئة
- `date_from`, `date_to`: تصفية حسب التاريخ
- `amount_min`, `amount_max`: تصفية حسب المبلغ

**Response:**
```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "id": "uuid",
        "transaction_number": "TXN-20241107-000001",
        "type": "expense",
        "amount": 15000.00,
        "currency": "USD",
        "description": "شراء أجهزة كمبيوتر جديدة",
        "category": {
          "id": "uuid",
          "name_ar": "التكنولوجيا",
          "code": "TECH"
        },
        "department": {
          "id": "uuid",
          "name_ar": "تكنولوجيا المعلومات"
        },
        "vendor_supplier": "شركة التقنية المتقدمة",
        "invoice_number": "INV-2024-001",
        "payment_method": "bank_transfer",
        "status": "approved",
        "approved_by": {
          "id": "uuid",
          "first_name": "أحمد",
          "last_name": "محمد"
        },
        "created_by": {
          "id": "uuid",
          "first_name": "سارة",
          "last_name": "أحمد"
        },
        "created_at": "2024-11-07T10:00:00Z",
        "approved_at": "2024-11-07T14:00:00Z"
      }
    ],
    "summary": {
      "total_income": 250000.00,
      "total_expense": 180000.00,
      "net_amount": 70000.00,
      "currency": "USD"
    },
    "pagination": {
      "current_page": 1,
      "per_page": 20,
      "total": 342,
      "total_pages": 18
    }
  }
}
```

### POST /finance/transactions
إنشاء معاملة مالية جديدة

### PUT /finance/transactions/:id
تحديث معاملة مالية

### DELETE /finance/transactions/:id
حذف معاملة مالية

### POST /finance/transactions/:id/approve
الموافقة على معاملة مالية

### GET /finance/budgets
الحصول على الميزانيات

### POST /finance/budgets
إنشاء ميزانية جديدة

### GET /finance/reports/:type
إنشاء تقرير مالي

**Types:**
- `profit_loss`: تقرير الربح والخسارة
- `cash_flow`: تقرير التدفق النقدي
- `budget_variance`: تقرير انحراف الميزانية
- `department_summary`: ملخص الإدارات

**Query Parameters:**
- `date_from`, `date_to`: الفترة الزمنية
- `department_id`: إدارة محددة
- `format`: pdf, excel, json

### GET /finance/analytics
تحليلات مالية

## 🤖 AI Services APIs

### POST /ai/analyze-text
تحليل النصوص باستخدام الذكاء الاصطناعي

**Request Body:**
```json
{
  "text": "النص المراد تحليله",
  "analysis_type": "sentiment", // sentiment, entities, keywords, summary
  "language": "ar",
  "provider": "openai" // optional, auto-select if not provided
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "analysis": {
      "sentiment": {
        "score": 0.8,
        "label": "positive",
        "confidence": 0.95
      },
      "entities": [
        {
          "text": "الشركة",
          "type": "ORGANIZATION",
          "confidence": 0.9
        }
      ],
      "keywords": ["تطوير", "نجاح", "مشروع"],
      "summary": "ملخص النص المحلل"
    },
    "provider_used": "openai",
    "processing_time": 1.2,
    "tokens_used": 150,
    "cost": 0.003
  }
}
```

### POST /ai/analyze-document
تحليل المستندات

**Request Body:**
```json
{
  "file_id": "uuid",
  "analysis_types": ["summary", "keywords", "sentiment"],
  "language": "ar"
}
```

### POST /ai/generate-report
إنشاء تقرير باستخدام الذكاء الاصطناعي

**Request Body:**
```json
{
  "report_type": "department_performance",
  "department_id": "uuid",
  "date_range": {
    "from": "2024-10-01",
    "to": "2024-10-31"
  },
  "include_charts": true,
  "language": "ar"
}
```

### POST /ai/predict
التنبؤات باستخدام الذكاء الاصطناعي

**Request Body:**
```json
{
  "prediction_type": "sales_forecast", // sales_forecast, budget_variance, task_completion
  "data_source": "historical_sales",
  "time_horizon": "3_months",
  "department_id": "uuid"
}
```

### GET /ai/providers
الحصول على قائمة مقدمي خدمات الذكاء الاصطناعي

## 📊 Analytics APIs

### GET /analytics/dashboard
بيانات لوحة التحكم

**Query Parameters:**
- `department_id`: إدارة محددة
- `date_range`: فترة زمنية (today, week, month, quarter, year)

**Response:**
```json
{
  "success": true,
  "data": {
    "overview": {
      "total_tasks": 150,
      "completed_tasks": 120,
      "overdue_tasks": 5,
      "active_users": 45,
      "completion_rate": 80.0
    },
    "charts": {
      "tasks_by_status": [
        {"status": "completed", "count": 120, "percentage": 80.0},
        {"status": "in_progress", "count": 25, "percentage": 16.7},
        {"status": "pending", "count": 5, "percentage": 3.3}
      ],
      "tasks_by_department": [
        {"department": "المالية", "count": 45},
        {"department": "العمليات", "count": 35}
      ],
      "performance_trend": [
        {"date": "2024-11-01", "completed": 15, "created": 18},
        {"date": "2024-11-02", "completed": 12, "created": 14}
      ]
    },
    "recent_activities": [
      {
        "id": "uuid",
        "type": "task_completed",
        "description": "تم إنجاز مهمة إعداد التقرير المالي",
        "user": "أحمد محمد",
        "timestamp": "2024-11-07T16:30:00Z"
      }
    ]
  }
}
```

### GET /analytics/performance
تحليلات الأداء

### GET /analytics/users
تحليلات المستخدمين

### GET /analytics/departments
تحليلات الإدارات

### GET /analytics/export
تصدير التحليلات

## 🔔 Notifications APIs

### GET /notifications
الحصول على الإشعارات

**Query Parameters:**
- `page`, `limit`: للصفحات
- `is_read`: تصفية حسب حالة القراءة
- `type`: نوع الإشعار
- `priority`: أولوية الإشعار

### PUT /notifications/:id/read
تحديد إشعار كمقروء

### PUT /notifications/mark-all-read
تحديد جميع الإشعارات كمقروءة

### DELETE /notifications/:id
حذف إشعار

## 📁 File Management APIs

### POST /files/upload
رفع ملف

**Request:** multipart/form-data
- `file`: الملف
- `department_id`: الإدارة (اختياري)
- `is_public`: عام أم خاص (افتراضي: false)

### GET /files/:id
تحميل ملف

### DELETE /files/:id
حذف ملف

### GET /files
قائمة الملفات

## 🔍 Search APIs

### GET /search
البحث العام

**Query Parameters:**
- `q`: نص البحث
- `type`: نوع المحتوى (tasks, users, documents, all)
- `department_id`: تصفية حسب الإدارة
- `page`, `limit`: للصفحات

**Response:**
```json
{
  "success": true,
  "data": {
    "results": [
      {
        "type": "task",
        "id": "uuid",
        "title": "إعداد التقرير المالي",
        "description": "تقرير مالي شهري...",
        "department": "المالية",
        "relevance_score": 0.95,
        "highlight": "إعداد <mark>التقرير</mark> المالي"
      }
    ],
    "facets": {
      "types": [
        {"type": "tasks", "count": 15},
        {"type": "documents", "count": 8}
      ],
      "departments": [
        {"department": "المالية", "count": 12},
        {"department": "العمليات", "count": 6}
      ]
    },
    "total": 23,
    "took": 45
  }
}
```

## 📈 Reports APIs

### GET /reports
قائمة التقارير المتاحة

### POST /reports/generate
إنشاء تقرير جديد

**Request Body:**
```json
{
  "report_type": "department_performance",
  "parameters": {
    "department_id": "uuid",
    "date_range": {
      "from": "2024-10-01",
      "to": "2024-10-31"
    },
    "include_charts": true,
    "format": "pdf"
  },
  "schedule": {
    "frequency": "monthly", // once, daily, weekly, monthly
    "day_of_month": 1,
    "time": "09:00"
  }
}
```

### GET /reports/:id
الحصول على تقرير

### GET /reports/:id/download
تحميل تقرير

## 🔧 System APIs

### GET /health
فحص صحة النظام

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-11-07T16:53:55Z",
  "services": {
    "database": "healthy",
    "redis": "healthy",
    "elasticsearch": "healthy",
    "ai_services": "healthy"
  },
  "version": "1.0.0"
}
```

### GET /version
إصدار النظام

### GET /metrics
مقاييس الأداء (للمراقبة)

---

## 📝 ملاحظات التطوير

### Rate Limiting
- **المستخدمين العاديين:** 1000 طلب/ساعة
- **المدراء:** 5000 طلب/ساعة
- **النظام:** 10000 طلب/ساعة

### Caching Strategy
- **بيانات المستخدمين:** 1 ساعة
- **بيانات الإدارات:** 2 ساعة
- **قوائم المهام:** 30 دقيقة
- **التحليلات:** 24 ساعة

### Security Headers
```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000
Content-Security-Policy: default-src 'self'
```

**تاريخ الإنشاء:** نوفمبر 2024  
**الإصدار:** 1.0  
**المراجعة التالية:** ديسمبر 2024
