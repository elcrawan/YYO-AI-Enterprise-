# 🚀 YYO Agent AI - النظام الإداري المؤسسي الذكي

<div align="center">

![YYO Agent AI](https://img.shields.io/badge/YYO%20Agent%20AI-v1.0.0-blue?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.2-blue?style=for-the-badge&logo=typescript)
![AI Powered](https://img.shields.io/badge/AI%20Powered-8%20Providers-green?style=for-the-badge)

**نظام إداري مؤسسي ذكي شامل مع تكامل 8 أنظمة ذكاء اصطناعي**

[العربية](#العربية) | [English](#english)

</div>

---

## العربية

### 🎯 نظرة عامة

YYO Agent AI هو نظام إداري مؤسسي ذكي شامل يعمل كمساعد متكامل لجميع إدارات المؤسسة. يهدف النظام إلى أن يكون العقل الإداري والتحليلي المركزي الذي يدير العمليات، يتفاعل مع الموظفين، ويحلل البيانات لتوجيه القرارات في الوقت الحقيقي.

### ✨ المميزات الرئيسية

#### 🏢 الإدارات المدعومة (10 إدارات)
- 💰 **الإدارة المالية** - تحليل الإيرادات والميزانيات والتدفق النقدي
- ⚙️ **إدارة العمليات** - مراقبة الكفاءة التشغيلية واكتشاف الاختناقات
- 📈 **إدارة المبيعات** - CRM متكامل وتحليل العملاء والتنبؤات
- 👥 **الموارد البشرية** - إدارة الموظفين والأداء والتدريب
- 📊 **إدارة المشاريع** - تتبع المشاريع والمهام وتخصيص الموارد
- 💻 **تكنولوجيا المعلومات** - إدارة البنية التحتية والأمان
- 🛠️ **الدعم الفني** - نظام التذاكر الذكي وقاعدة المعرفة
- 💡 **إدارة الابتكار** - جمع وتقييم الأفكار الإبداعية
- 📦 **إدارة الموارد** - تتبع الأصول والمخزون
- ✅ **إدارة الجودة** - مراقبة معايير الجودة والامتثال

#### 🤖 تكامل الذكاء الاصطناعي (8 أنظمة)
- **OpenAI GPT** - المحادثة والتحليل النصي
- **Google Gemini** - التحليل المتعدد الوسائط
- **Anthropic Claude** - التحليل المعقد والدقيق
- **xAI Grok** - التحليل السياقي المتقدم
- **DeepSeek** - التحليل التقني المتخصص
- **Mistral** - المعالجة السريعة والفعالة
- **Kimi** - الدعم متعدد الثقافات
- **Qwen** - التخصص في العربية والآسيوية

#### 🎨 واجهة المستخدم المتقدمة
- 🌙 الوضع الفاتح والداكن مع تبديل تلقائي
- 🌍 دعم ثنائي اللغة (العربية والإنجليزية) مع RTL
- 📱 تصميم متجاوب لجميع الأجهزة
- ✨ تأثيرات بصرية متقدمة مع Framer Motion
- 🎨 ألوان مخصصة لكل إدارة

### 🛠️ التقنيات المستخدمة

#### Frontend
- **Next.js 14** - إطار العمل الأساسي مع App Router
- **TypeScript** - للأمان والنوع الصارم
- **Tailwind CSS** - للتصميم المتجاوب
- **Framer Motion** - للتأثيرات البصرية
- **React Query** - لإدارة البيانات
- **Zustand** - لإدارة الحالة
- **Radix UI** - للمكونات الأساسية

#### Backend & Database
- **Prisma ORM** - لإدارة قواعد البيانات
- **PostgreSQL** - للبيانات المهيكلة
- **MongoDB** - للبيانات غير المهيكلة
- **Redis** - للتخزين المؤقت
- **NextAuth.js** - للمصادقة والأمان

#### AI & Real-time
- **8 AI Providers** - تكامل متعدد مع أنظمة الذكاء الاصطناعي
- **Socket.io** - للتحديثات الفورية
- **WebSockets** - للإشعارات المباشرة

### 🚀 التثبيت والتشغيل

#### المتطلبات الأساسية
- Node.js 18.0.0 أو أحدث
- npm 8.0.0 أو أحدث
- PostgreSQL 13 أو أحدث
- Redis 6 أو أحدث
- MongoDB 5 أو أحدث (اختياري)

#### خطوات التثبيت

1. **استنساخ المشروع**
```bash
git clone https://github.com/elcrawan/YYO-AI-Enterprise-.git
cd YYO-AI-Enterprise-
```

2. **تثبيت التبعيات**
```bash
npm install
```

3. **إعداد متغيرات البيئة**
```bash
cp .env.example .env.local
```

4. **تحديث ملف البيئة**
```env
# قواعد البيانات
DATABASE_URL="postgresql://username:password@localhost:5432/yyo_ai_enterprise"
MONGODB_URI="mongodb://localhost:27017/yyo_ai_enterprise"
REDIS_URL="redis://localhost:6379"

# المصادقة
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# خدمات الذكاء الاصطناعي
OPENAI_API_KEY="your-openai-api-key"
GOOGLE_AI_API_KEY="your-google-ai-api-key"
ANTHROPIC_API_KEY="your-anthropic-api-key"
# ... باقي المفاتيح
```

5. **إعداد قاعدة البيانات**
```bash
npx prisma generate
npx prisma db push
```

6. **تشغيل النظام**
```bash
npm run dev
```

7. **فتح المتصفح**
```
http://localhost:3000
```

### 📊 الأوامر المتاحة

```bash
# التطوير
npm run dev          # تشغيل الخادم المحلي
npm run build        # بناء المشروع للإنتاج
npm run start        # تشغيل الإنتاج
npm run lint         # فحص الكود

# قاعدة البيانات
npm run db:generate  # توليد Prisma Client
npm run db:push      # دفع التغييرات لقاعدة البيانات
npm run db:migrate   # تشغيل الهجرات
npm run db:studio    # فتح Prisma Studio

# الاختبارات
npm run test         # تشغيل الاختبارات
npm run test:watch   # تشغيل الاختبارات مع المراقبة
npm run test:coverage # تقرير التغطية
```

### 🔧 الإعداد المتقدم

#### إعداد خدمات الذكاء الاصطناعي
1. احصل على مفاتيح API من المقدمين المطلوبين
2. أضف المفاتيح إلى ملف `.env.local`
3. قم بتفعيل الخدمات المطلوبة في الإعدادات

#### إعداد قواعد البيانات المتعددة
```bash
# PostgreSQL (مطلوب)
createdb yyo_ai_enterprise

# MongoDB (اختياري)
# تأكد من تشغيل MongoDB على المنفذ الافتراضي

# Redis (مطلوب للتخزين المؤقت)
# تأكد من تشغيل Redis على المنفذ الافتراضي
```

### 📁 هيكل المشروع

```
src/
├── app/                 # Next.js App Router
│   ├── page.tsx        # الصفحة الرئيسية
│   ├── layout.tsx      # التخطيط الأساسي
│   └── globals.css     # الأنماط العامة
├── components/          # مكونات React
│   ├── ui/             # مكونات UI الأساسية
│   ├── dashboard/      # مكونات لوحة التحكم
│   ├── departments/    # مكونات الإدارات
│   └── providers/      # Context Providers
├── lib/                # المكتبات والأدوات
│   ├── auth/          # نظام المصادقة
│   ├── ai/            # تكامل الذكاء الاصطناعي
│   ├── database/      # إدارة قواعد البيانات
│   ├── i18n/          # نظام اللغات
│   └── utils.ts       # الأدوات المساعدة
├── types/             # تعريفات TypeScript
├── hooks/             # React Hooks مخصصة
└── services/          # خدمات خارجية
```

### 🔒 الأمان

- **مصادقة ثنائية (2FA)** مع TOTP
- **تشفير البيانات** AES-256 للتخزين و TLS للنقل
- **سجل الأنشطة** الشامل لجميع العمليات
- **إدارة الأدوار والصلاحيات** المتقدمة
- **مراقبة الوصول** غير المصرح به

### 📈 الأداء

- **زمن التحميل:** أقل من 3 ثوانٍ
- **استجابة API:** أقل من 500ms
- **معالجة التقارير:** أقل من 10 ثوانٍ
- **التحديثات الفورية:** أقل من 1 ثانية
- **دعم:** 10,000 مستخدم متزامن

### 🤝 المساهمة

نرحب بالمساهمات! يرجى قراءة دليل المساهمة قبل البدء.

### 📄 الترخيص

هذا المشروع مرخص تحت رخصة MIT - انظر ملف [LICENSE](LICENSE) للتفاصيل.

### 📞 الدعم

- **البريد الإلكتروني:** support@yyo-ai.com
- **الوثائق:** [docs.yyo-ai.com](https://docs.yyo-ai.com)
- **المجتمع:** [community.yyo-ai.com](https://community.yyo-ai.com)

---

## English

### 🎯 Overview

YYO Agent AI is a comprehensive intelligent enterprise management system that serves as an integrated assistant for all organizational departments. The system aims to be the central administrative and analytical brain that manages operations, interacts with employees, and analyzes data to guide real-time decision-making.

### ✨ Key Features

#### 🏢 Supported Departments (10 Departments)
- 💰 **Finance Department** - Revenue analysis, budgets, and cash flow
- ⚙️ **Operations Management** - Operational efficiency monitoring and bottleneck detection
- 📈 **Sales Management** - Integrated CRM, customer analysis, and forecasting
- 👥 **Human Resources** - Employee management, performance, and training
- 📊 **Project Management** - Project tracking, tasks, and resource allocation
- 💻 **Information Technology** - Infrastructure management and security
- 🛠️ **Technical Support** - Smart ticketing system and knowledge base
- 💡 **Innovation Management** - Idea collection and evaluation
- 📦 **Resource Management** - Asset and inventory tracking
- ✅ **Quality Management** - Quality standards monitoring and compliance

#### 🤖 AI Integration (8 Systems)
- **OpenAI GPT** - Conversation and text analysis
- **Google Gemini** - Multi-modal analysis
- **Anthropic Claude** - Complex and precise analysis
- **xAI Grok** - Advanced contextual analysis
- **DeepSeek** - Specialized technical analysis
- **Mistral** - Fast and efficient processing
- **Kimi** - Multi-cultural support
- **Qwen** - Arabic and Asian specialization

### 🚀 Installation & Setup

#### Prerequisites
- Node.js 18.0.0 or higher
- npm 8.0.0 or higher
- PostgreSQL 13 or higher
- Redis 6 or higher
- MongoDB 5 or higher (optional)

#### Installation Steps

1. **Clone the repository**
```bash
git clone https://github.com/elcrawan/YYO-AI-Enterprise-.git
cd YYO-AI-Enterprise-
```

2. **Install dependencies**
```bash
npm install
```

3. **Setup environment variables**
```bash
cp .env.example .env.local
```

4. **Configure environment file**
```env
# Databases
DATABASE_URL="postgresql://username:password@localhost:5432/yyo_ai_enterprise"
MONGODB_URI="mongodb://localhost:27017/yyo_ai_enterprise"
REDIS_URL="redis://localhost:6379"

# Authentication
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# AI Services
OPENAI_API_KEY="your-openai-api-key"
GOOGLE_AI_API_KEY="your-google-ai-api-key"
ANTHROPIC_API_KEY="your-anthropic-api-key"
# ... other keys
```

5. **Setup database**
```bash
npx prisma generate
npx prisma db push
```

6. **Run the system**
```bash
npm run dev
```

7. **Open browser**
```
http://localhost:3000
```

### 📊 Available Commands

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Lint code

# Database
npm run db:generate  # Generate Prisma Client
npm run db:push      # Push changes to database
npm run db:migrate   # Run migrations
npm run db:studio    # Open Prisma Studio

# Testing
npm run test         # Run tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Coverage report
```

### 🤝 Contributing

We welcome contributions! Please read our contributing guide before getting started.

### 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

### 📞 Support

- **Email:** support@yyo-ai.com
- **Documentation:** [docs.yyo-ai.com](https://docs.yyo-ai.com)
- **Community:** [community.yyo-ai.com](https://community.yyo-ai.com)

---

<div align="center">

**Made with ❤️ by the YYO Agent AI Team**

[![GitHub stars](https://img.shields.io/github/stars/elcrawan/YYO-AI-Enterprise-?style=social)](https://github.com/elcrawan/YYO-AI-Enterprise-)
[![GitHub forks](https://img.shields.io/github/forks/elcrawan/YYO-AI-Enterprise-?style=social)](https://github.com/elcrawan/YYO-AI-Enterprise-)

</div>

