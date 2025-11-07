-- YYO Agent AI PostgreSQL Initialization Script

-- Create database if not exists
SELECT 'CREATE DATABASE yyo_ai_enterprise'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'yyo_ai_enterprise')\gexec

-- Connect to the database
\c yyo_ai_enterprise;

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";

-- Create custom types
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('ADMIN', 'MANAGER', 'DEPARTMENT_HEAD', 'EMPLOYEE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE department_type AS ENUM (
        'FINANCE', 'OPERATIONS', 'SALES', 'HR', 'PROJECTS', 
        'IT', 'SUPPORT', 'INNOVATION', 'RESOURCES', 'QUALITY'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE task_status AS ENUM (
        'DRAFT', 'PENDING', 'ASSIGNED', 'IN_PROGRESS', 
        'REVIEW', 'COMPLETED', 'CANCELLED', 'OVERDUE'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE task_priority AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE notification_type AS ENUM (
        'INFO', 'SUCCESS', 'WARNING', 'ERROR', 'TASK', 'SYSTEM', 'REMINDER'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE report_type AS ENUM ('FINANCIAL', 'PERFORMANCE', 'ANALYTICS', 'CUSTOM');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_department ON users(department_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
CREATE INDEX IF NOT EXISTS idx_tasks_assignee ON tasks(assignee_id);
CREATE INDEX IF NOT EXISTS idx_tasks_department ON tasks(department_id);
CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON notifications(recipient_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_ai_requests_provider ON ai_requests(provider);
CREATE INDEX IF NOT EXISTS idx_ai_requests_user ON ai_requests(user_id);

-- Create full-text search indexes
CREATE INDEX IF NOT EXISTS idx_tasks_search ON tasks USING gin(to_tsvector('arabic', title || ' ' || description));
CREATE INDEX IF NOT EXISTS idx_users_search ON users USING gin(to_tsvector('arabic', name || ' ' || COALESCE(email, '')));

-- Create functions for common operations
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
DO $$ 
DECLARE
    t text;
BEGIN
    FOR t IN 
        SELECT table_name 
        FROM information_schema.columns 
        WHERE column_name = 'updated_at' 
        AND table_schema = 'public'
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS update_%I_updated_at ON %I', t, t);
        EXECUTE format('CREATE TRIGGER update_%I_updated_at 
                       BEFORE UPDATE ON %I 
                       FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()', t, t);
    END LOOP;
END $$;

-- Insert default system settings
INSERT INTO system_settings (key, value, category, is_public) VALUES
('app_name', '"YYO Agent AI"', 'general', true),
('app_version', '"1.0.0"', 'general', true),
('default_language', '"ar"', 'general', true),
('default_theme', '"system"', 'general', true),
('max_file_size', '52428800', 'uploads', false),
('allowed_file_types', '["pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx", "jpg", "jpeg", "png", "gif"]', 'uploads', false),
('ai_enabled', 'true', 'ai', false),
('notifications_enabled', 'true', 'notifications', false),
('real_time_enabled', 'true', 'real_time', false)
ON CONFLICT (key) DO NOTHING;

-- Insert default departments
INSERT INTO departments (id, name, type, description, is_active) VALUES
('dept_finance', 'الإدارة المالية', 'FINANCE', 'إدارة الأمور المالية والميزانيات والتدفق النقدي', true),
('dept_operations', 'إدارة العمليات', 'OPERATIONS', 'تحسين العمليات التشغيلية ومراقبة الكفاءة', true),
('dept_sales', 'إدارة المبيعات', 'SALES', 'إدارة المبيعات وعلاقات العملاء والتنبؤات', true),
('dept_hr', 'الموارد البشرية', 'HR', 'إدارة الموظفين والأداء والتدريب', true),
('dept_projects', 'إدارة المشاريع', 'PROJECTS', 'تخطيط وتنفيذ المشاريع وتخصيص الموارد', true),
('dept_it', 'تكنولوجيا المعلومات', 'IT', 'إدارة البنية التحتية التقنية والأمان', true),
('dept_support', 'الدعم الفني', 'SUPPORT', 'تقديم الدعم الفني وإدارة التذاكر', true),
('dept_innovation', 'إدارة الابتكار', 'INNOVATION', 'تطوير الأفكار الإبداعية وتقييم الجدوى', true),
('dept_resources', 'إدارة الموارد', 'RESOURCES', 'إدارة الأصول والمخزون والموارد', true),
('dept_quality', 'إدارة الجودة', 'QUALITY', 'ضمان جودة المنتجات والخدمات والامتثال', true)
ON CONFLICT (id) DO NOTHING;

-- Insert default AI providers
INSERT INTO ai_providers (id, name, type, api_key, endpoint, is_active, capabilities) VALUES
('openai', 'OpenAI', 'openai', '', 'https://api.openai.com/v1', true, ARRAY['text_generation', 'text_analysis', 'translation', 'code_generation', 'image_analysis']),
('google', 'Google AI', 'google', '', 'https://generativelanguage.googleapis.com/v1beta', true, ARRAY['text_generation', 'text_analysis', 'translation', 'image_analysis']),
('anthropic', 'Anthropic Claude', 'anthropic', '', 'https://api.anthropic.com/v1', true, ARRAY['text_generation', 'text_analysis', 'translation', 'document_analysis']),
('xai', 'xAI Grok', 'xai', '', 'https://api.x.ai/v1', true, ARRAY['text_generation', 'text_analysis', 'translation']),
('deepseek', 'DeepSeek', 'deepseek', '', 'https://api.deepseek.com/v1', true, ARRAY['text_generation', 'code_generation', 'text_analysis']),
('mistral', 'Mistral AI', 'mistral', '', 'https://api.mistral.ai/v1', true, ARRAY['text_generation', 'text_analysis', 'translation']),
('kimi', 'Kimi', 'kimi', '', 'https://api.moonshot.cn/v1', true, ARRAY['text_generation', 'text_analysis', 'translation']),
('qwen', 'Qwen', 'qwen', '', 'https://dashscope.aliyuncs.com/api/v1', true, ARRAY['text_generation', 'text_analysis', 'translation'])
ON CONFLICT (id) DO NOTHING;

-- Create admin user (password: admin123)
INSERT INTO users (id, email, name, password, role, position, is_active, email_verified, preferences) VALUES
('admin_user', 'admin@yyo-ai.com', 'مدير النظام', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3bp.Vp/PpO', 'ADMIN', 'مدير النظام', true, NOW(), 
'{"language": "ar", "theme": "system", "notifications": {"email": true, "sms": false, "push": true, "inApp": true, "frequency": "immediate"}, "dashboard": {"layout": "grid", "widgets": ["stats", "tasks", "notifications"], "refreshInterval": 30000}}')
ON CONFLICT (id) DO NOTHING;

-- Grant admin permissions
INSERT INTO permissions (id, resource, actions, user_id) VALUES
('admin_all', '*', ARRAY['create', 'read', 'update', 'delete', 'manage'], 'admin_user')
ON CONFLICT (id) DO NOTHING;

-- Create sample tasks
INSERT INTO tasks (id, title, description, status, priority, assignee_id, assigned_by_id, department_id, due_date) VALUES
('task_1', 'مراجعة الميزانية الشهرية', 'مراجعة وتحليل الميزانية الشهرية لشهر نوفمبر', 'PENDING', 'HIGH', 'admin_user', 'admin_user', 'dept_finance', NOW() + INTERVAL '7 days'),
('task_2', 'تحديث نظام إدارة العملاء', 'تحديث وتطوير نظام CRM لتحسين تجربة العملاء', 'IN_PROGRESS', 'MEDIUM', 'admin_user', 'admin_user', 'dept_it', NOW() + INTERVAL '14 days'),
('task_3', 'تدريب الموظفين الجدد', 'إعداد برنامج تدريبي للموظفين الجدد في الشركة', 'ASSIGNED', 'MEDIUM', 'admin_user', 'admin_user', 'dept_hr', NOW() + INTERVAL '10 days')
ON CONFLICT (id) DO NOTHING;

-- Create sample notifications
INSERT INTO notifications (id, title, message, type, priority, recipient_id, is_read) VALUES
('notif_1', 'مرحباً بك في YYO Agent AI', 'مرحباً بك في نظام YYO Agent AI الإداري الذكي. نتمنى لك تجربة ممتعة ومفيدة.', 'INFO', 'medium', 'admin_user', false),
('notif_2', 'تم تفعيل جميع خدمات الذكاء الاصطناعي', 'تم تفعيل جميع أنظمة الذكاء الاصطناعي الثمانية بنجاح وهي جاهزة للاستخدام.', 'SUCCESS', 'medium', 'admin_user', false)
ON CONFLICT (id) DO NOTHING;

-- Create audit log entry
INSERT INTO audit_logs (id, action, resource, resource_id, user_id, ip_address, user_agent, metadata) VALUES
('audit_1', 'SYSTEM_INIT', 'SYSTEM', 'system', 'admin_user', '127.0.0.1', 'Docker Init', '{"message": "System initialized successfully", "version": "1.0.0"}')
ON CONFLICT (id) DO NOTHING;

-- Analyze tables for better performance
ANALYZE;

-- Print success message
DO $$
BEGIN
    RAISE NOTICE 'YYO Agent AI database initialized successfully!';
    RAISE NOTICE 'Default admin user: admin@yyo-ai.com / admin123';
    RAISE NOTICE 'Database is ready for use.';
END $$;

