# YYO Agent AI - Enterprise Management System

<div align="center">

![YYO Agent AI Logo](https://via.placeholder.com/200x100/2196F3/FFFFFF?text=YYO+AI)

**نظام إداري مؤسسي ذكي شامل يعمل كمساعد متكامل لجميع إدارات المؤسسة**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2+-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.2+-61DAFB)](https://reactjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-336791)](https://www.postgresql.org/)

[العربية](#العربية) | [English](#english)

</div>

---

## العربية

### 📌 نظرة عامة

YYO Agent AI هو نظام إداري مؤسسي ذكي شامل يعمل كمساعد متكامل لجميع إدارات المؤسسة. يهدف النظام إلى أن يكون العقل الإداري والتحليلي المركزي الذي يدير العمليات، يتفاعل مع الموظفين، ويحلل البيانات لتوجيه القرارات في الوقت الحقيقي.

### 🎯 الميزات الرئيسية

#### 🏢 إدارة شاملة لـ 10 إدارات
- **المالية** - تحليل الإيرادات والمصروفات والميزانيات التنبؤية
- **العمليات** - تتبع مراحل التنفيذ وتحليل الكفاءة التشغيلية
- **المبيعات** - تحليل العملاء والمبيعات التنبؤية
- **الموارد البشرية** - تتبع الأداء وإدارة الموظفين
- **المشاريع** - إدارة المشاريع وتحليل التكاليف
- **تكنولوجيا المعلومات** - إدارة البنية التحتية والأمان
- **الدعم الفني** - نظام تذاكر ذكي وقاعدة معرفة
- **الابتكار** - جمع الأفكار وتحليل الجدوى
- **الموارد** - تتبع الأصول والمخزون
- **الجودة** - تحليل مؤشرات الجودة ومعايير ISO

#### 🤖 الذكاء الاصطناعي المتقدم
- **تكامل متعدد المصادر**: OpenAI GPT, Google Gemini, Anthropic Claude, xAI Grok, DeepSeek, Mistral, Kimi, Qwen
- **تحليل النصوص والمستندات** باللغتين العربية والإنجليزية
- **التنبؤات المستقبلية** للمبيعات والإيرادات والاتجاهات
- **تحليل المشاعر** لبيئة العمل ورضا الموظفين
- **إنشاء التقارير التلقائية** مع التحليلات والتوصيات

#### 📋 نظام المهام الذكي
- **تسلسل هرمي**: المدير → رئيس القسم → الموظف
- **توزيع تلقائي** للمهام حسب التخصص والحمولة
- **تتبع في الوقت الفعلي** لحالة المهام والتقدم
- **أرشفة شاملة** لجميع المراحل مع الوقت والمرفقات

#### 📊 التحليلات والتقارير
- **لوحات تحكم تفاعلية** في الوقت الفعلي
- **تقارير مخصصة** بصيغ متعددة (PDF, Excel, Power BI)
- **تحليلات تنبؤية** باستخدام الذكاء الاصطناعي
- **مؤشرات الأداء الرئيسية** (KPIs) لجميع الإدارات

### 🛠️ التقنيات المستخدمة

#### Backend
- **Node.js 20+** مع TypeScript
- **Express.js** للـ APIs
- **PostgreSQL 15+** للبيانات المهيكلة
- **MongoDB 6+** للتحليلات والمستندات
- **Redis 7+** للتخزين المؤقت والجلسات
- **Elasticsearch 8+** للبحث والفهرسة

#### Frontend
- **React 18+** مع TypeScript
- **Material-UI (MUI)** للواجهة
- **Redux Toolkit** لإدارة الحالة
- **Vite** لبناء التطبيق
- **Socket.IO** للتحديثات الفورية

#### DevOps & Infrastructure
- **Docker & Docker Compose** للحاويات
- **Kubernetes** للإنتاج
- **Prometheus & Grafana** للمراقبة
- **ELK Stack** للسجلات والتحليل

### 🚀 البدء السريع

#### المتطلبات الأساسية
- Node.js 20.0.0 أو أحدث
- Docker & Docker Compose
- Git

#### التثبيت

```bash
# استنساخ المستودع
git clone https://github.com/elcrawan/YYO-AI-Enterprise-.git
cd YYO-AI-Enterprise-

# نسخ ملف البيئة
cp .env.example .env

# تحديث متغيرات البيئة في .env
# أضف مفاتيح API للذكاء الاصطناعي وإعدادات قواعد البيانات

# تشغيل النظام باستخدام Docker
docker-compose up -d

# أو التطوير المحلي
cd backend && npm install && npm run dev
cd ../frontend && npm install && npm run dev
```

#### الوصول للنظام
- **Frontend**: http://localhost:3001
- **Backend API**: http://localhost:3000
- **Kibana**: http://localhost:5601
- **Grafana**: http://localhost:3002

### 📖 الوثائق

- [📋 متطلبات النظام](docs/requirements.md)
- [🔧 المواصفات التقنية](docs/technical-specifications.md)
- [🎯 حالات الاستخدام](docs/use-cases.md)
- [🗄️ تصميم قاعدة البيانات](docs/database-design.md)
- [🔌 تصميم APIs](docs/api-design.md)
- [🏗️ مخططات النظام](architecture/system-diagram.md)

### 🔒 الأمان

- **مصادقة ثنائية (2FA)** مع دعم TOTP
- **تشفير شامل** للبيانات (AES-256)
- **نظام أدوار وصلاحيات** متقدم (RBAC)
- **سجل أنشطة شامل** (Audit Trail)
- **حماية من الهجمات** الشائعة (XSS, CSRF, SQL Injection)

### 🌍 الدعم متعدد اللغات

- **العربية** (RTL) - اللغة الافتراضية
- **الإنجليزية** (LTR)
- تبديل فوري بين اللغات
- تنسيق التواريخ والأرقام المحلي

### 📱 التوافق

- **المتصفحات**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **الأجهزة**: سطح المكتب، الأجهزة اللوحية، الهواتف الذكية
- **أنظمة التشغيل**: Windows, macOS, Linux, iOS, Android

### 🤝 المساهمة

نرحب بالمساهمات! يرجى قراءة [دليل المساهمة](CONTRIBUTING.md) قبل البدء.

### 📄 الترخيص

هذا المشروع مرخص تحت رخصة MIT - انظر ملف [LICENSE](LICENSE) للتفاصيل.

### 📞 الدعم

- **البريد الإلكتروني**: support@yyo-ai.com
- **الوثائق**: [docs.yyo-ai.com](https://docs.yyo-ai.com)
- **المجتمع**: [community.yyo-ai.com](https://community.yyo-ai.com)

---

## English

### 📌 Overview

YYO Agent AI is a comprehensive intelligent enterprise management system that serves as an integrated assistant for all organizational departments. The system aims to be the central administrative and analytical brain that manages operations, interacts with employees, and analyzes data to guide real-time decision-making.

### 🎯 Key Features

#### 🏢 Comprehensive Management for 10 Departments
- **Finance** - Revenue, expense analysis, and predictive budgeting
- **Operations** - Execution tracking and operational efficiency analysis
- **Sales** - Customer analysis and predictive sales
- **Human Resources** - Performance tracking and employee management
- **Projects** - Project management and cost analysis
- **IT** - Infrastructure management and security
- **Support** - Smart ticketing system and knowledge base
- **Innovation** - Idea collection and feasibility analysis
- **Resources** - Asset and inventory tracking
- **Quality** - Quality metrics analysis and ISO standards

#### 🤖 Advanced AI Integration
- **Multi-source Integration**: OpenAI GPT, Google Gemini, Anthropic Claude, xAI Grok, DeepSeek, Mistral, Kimi, Qwen
- **Text and Document Analysis** in Arabic and English
- **Future Predictions** for sales, revenue, and trends
- **Sentiment Analysis** for work environment and employee satisfaction
- **Automated Report Generation** with analytics and recommendations

#### 📋 Smart Task Management System
- **Hierarchical Flow**: Manager → Department Head → Employee
- **Automatic Distribution** based on specialization and workload
- **Real-time Tracking** of task status and progress
- **Comprehensive Archiving** of all stages with time and attachments

#### 📊 Analytics and Reporting
- **Interactive Real-time Dashboards**
- **Custom Reports** in multiple formats (PDF, Excel, Power BI)
- **Predictive Analytics** using AI
- **Key Performance Indicators** (KPIs) for all departments

### 🛠️ Technology Stack

#### Backend
- **Node.js 20+** with TypeScript
- **Express.js** for APIs
- **PostgreSQL 15+** for structured data
- **MongoDB 6+** for analytics and documents
- **Redis 7+** for caching and sessions
- **Elasticsearch 8+** for search and indexing

#### Frontend
- **React 18+** with TypeScript
- **Material-UI (MUI)** for interface
- **Redux Toolkit** for state management
- **Vite** for building
- **Socket.IO** for real-time updates

#### DevOps & Infrastructure
- **Docker & Docker Compose** for containers
- **Kubernetes** for production
- **Prometheus & Grafana** for monitoring
- **ELK Stack** for logging and analysis

### 🚀 Quick Start

#### Prerequisites
- Node.js 20.0.0 or newer
- Docker & Docker Compose
- Git

#### Installation

```bash
# Clone the repository
git clone https://github.com/elcrawan/YYO-AI-Enterprise-.git
cd YYO-AI-Enterprise-

# Copy environment file
cp .env.example .env

# Update environment variables in .env
# Add AI API keys and database settings

# Run system using Docker
docker-compose up -d

# Or local development
cd backend && npm install && npm run dev
cd ../frontend && npm install && npm run dev
```

#### System Access
- **Frontend**: http://localhost:3001
- **Backend API**: http://localhost:3000
- **Kibana**: http://localhost:5601
- **Grafana**: http://localhost:3002

### 📖 Documentation

- [📋 System Requirements](docs/requirements.md)
- [🔧 Technical Specifications](docs/technical-specifications.md)
- [🎯 Use Cases](docs/use-cases.md)
- [🗄️ Database Design](docs/database-design.md)
- [🔌 API Design](docs/api-design.md)
- [🏗️ System Diagrams](architecture/system-diagram.md)

### 🔒 Security

- **Two-Factor Authentication (2FA)** with TOTP support
- **Comprehensive Encryption** (AES-256)
- **Advanced Role-Based Access Control** (RBAC)
- **Comprehensive Audit Trail**
- **Protection Against Common Attacks** (XSS, CSRF, SQL Injection)

### 🌍 Multi-language Support

- **Arabic** (RTL) - Default language
- **English** (LTR)
- Instant language switching
- Localized date and number formatting

### 📱 Compatibility

- **Browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Devices**: Desktop, tablets, smartphones
- **Operating Systems**: Windows, macOS, Linux, iOS, Android

### 🤝 Contributing

We welcome contributions! Please read the [Contributing Guide](CONTRIBUTING.md) before getting started.

### 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

### 📞 Support

- **Email**: support@yyo-ai.com
- **Documentation**: [docs.yyo-ai.com](https://docs.yyo-ai.com)
- **Community**: [community.yyo-ai.com](https://community.yyo-ai.com)

---

<div align="center">

**Made with ❤️ by the YYO AI Team**

</div>
