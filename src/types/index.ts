// Base Types
export interface BaseEntity {
  id: string
  createdAt: Date
  updatedAt: Date
  createdBy?: string
  updatedBy?: string
}

// User & Authentication Types
export interface User extends BaseEntity {
  email: string
  name: string
  avatar?: string
  role: UserRole
  department: DepartmentType
  position: string
  phone?: string
  isActive: boolean
  lastLogin?: Date
  preferences: UserPreferences
  permissions: Permission[]
}

export type UserRole = 'admin' | 'manager' | 'department_head' | 'employee'

export interface UserPreferences {
  language: 'ar' | 'en'
  theme: 'light' | 'dark' | 'system'
  notifications: NotificationSettings
  dashboard: DashboardSettings
}

export interface NotificationSettings {
  email: boolean
  sms: boolean
  push: boolean
  inApp: boolean
  frequency: 'immediate' | 'hourly' | 'daily' | 'weekly'
}

export interface DashboardSettings {
  layout: 'grid' | 'list'
  widgets: string[]
  refreshInterval: number
}

export interface Permission {
  resource: string
  actions: string[]
  conditions?: Record<string, any>
}

// Department Types
export type DepartmentType = 
  | 'finance'
  | 'operations'
  | 'sales'
  | 'hr'
  | 'projects'
  | 'it'
  | 'support'
  | 'innovation'
  | 'resources'
  | 'quality'

export interface Department extends BaseEntity {
  name: string
  type: DepartmentType
  description: string
  manager: string
  employees: string[]
  budget?: number
  goals: DepartmentGoal[]
  metrics: DepartmentMetric[]
  isActive: boolean
}

export interface DepartmentGoal {
  id: string
  title: string
  description: string
  target: number
  current: number
  unit: string
  deadline: Date
  status: 'pending' | 'in_progress' | 'completed' | 'overdue'
}

export interface DepartmentMetric {
  id: string
  name: string
  value: number
  unit: string
  trend: 'up' | 'down' | 'stable'
  change: number
  period: 'daily' | 'weekly' | 'monthly' | 'yearly'
}

// Task Management Types
export interface Task extends BaseEntity {
  title: string
  description: string
  status: TaskStatus
  priority: TaskPriority
  assignee: string
  assignedBy: string
  department: DepartmentType
  dueDate?: Date
  startDate?: Date
  completedDate?: Date
  estimatedHours?: number
  actualHours?: number
  tags: string[]
  attachments: Attachment[]
  comments: TaskComment[]
  subtasks: SubTask[]
  dependencies: string[]
  workflow: WorkflowStep[]
}

export type TaskStatus = 
  | 'draft'
  | 'pending'
  | 'assigned'
  | 'in_progress'
  | 'review'
  | 'completed'
  | 'cancelled'
  | 'overdue'

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent'

export interface SubTask {
  id: string
  title: string
  status: TaskStatus
  assignee?: string
  dueDate?: Date
  completedDate?: Date
}

export interface TaskComment extends BaseEntity {
  content: string
  author: string
  taskId: string
  parentId?: string
  attachments: Attachment[]
}

export interface WorkflowStep {
  id: string
  name: string
  status: 'pending' | 'in_progress' | 'completed' | 'skipped'
  assignee?: string
  dueDate?: Date
  completedDate?: Date
  notes?: string
}

// File & Attachment Types
export interface Attachment {
  id: string
  name: string
  url: string
  size: number
  type: string
  uploadedBy: string
  uploadedAt: Date
}

// AI Integration Types
export interface AIProvider {
  id: string
  name: string
  type: AIProviderType
  apiKey: string
  endpoint: string
  isActive: boolean
  capabilities: AICapability[]
  usage: AIUsage
}

export type AIProviderType = 
  | 'openai'
  | 'google'
  | 'anthropic'
  | 'xai'
  | 'deepseek'
  | 'mistral'
  | 'kimi'
  | 'qwen'

export type AICapability = 
  | 'text_generation'
  | 'text_analysis'
  | 'sentiment_analysis'
  | 'translation'
  | 'summarization'
  | 'code_generation'
  | 'image_analysis'
  | 'document_analysis'

export interface AIUsage {
  totalRequests: number
  totalTokens: number
  cost: number
  lastUsed: Date
  monthlyLimit: number
  currentMonthUsage: number
}

export interface AIRequest {
  id: string
  provider: AIProviderType
  capability: AICapability
  input: any
  output: any
  tokens: number
  cost: number
  duration: number
  status: 'pending' | 'completed' | 'failed'
  error?: string
  createdAt: Date
  userId: string
}

// Analytics & Reporting Types
export interface Report extends BaseEntity {
  title: string
  description: string
  type: ReportType
  department?: DepartmentType
  parameters: ReportParameters
  data: any
  format: ReportFormat
  schedule?: ReportSchedule
  recipients: string[]
  isPublic: boolean
}

export type ReportType = 
  | 'financial'
  | 'performance'
  | 'analytics'
  | 'custom'

export type ReportFormat = 'pdf' | 'excel' | 'powerbi' | 'json' | 'csv'

export interface ReportParameters {
  dateRange: {
    start: Date
    end: Date
  }
  filters: Record<string, any>
  groupBy?: string[]
  sortBy?: string
  limit?: number
}

export interface ReportSchedule {
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'
  time: string
  timezone: string
  isActive: boolean
}

// Dashboard Types
export interface DashboardWidget {
  id: string
  type: WidgetType
  title: string
  position: { x: number; y: number; w: number; h: number }
  config: WidgetConfig
  data?: any
  isVisible: boolean
}

export type WidgetType = 
  | 'stats'
  | 'chart'
  | 'table'
  | 'list'
  | 'calendar'
  | 'progress'
  | 'metric'
  | 'ai_insight'

export interface WidgetConfig {
  dataSource: string
  refreshInterval: number
  filters?: Record<string, any>
  chartType?: 'line' | 'bar' | 'pie' | 'area' | 'scatter'
  colors?: string[]
  showLegend?: boolean
  showGrid?: boolean
}

// Notification Types
export interface Notification extends BaseEntity {
  title: string
  message: string
  type: NotificationType
  priority: 'low' | 'medium' | 'high' | 'urgent'
  recipient: string
  sender?: string
  isRead: boolean
  readAt?: Date
  data?: any
  expiresAt?: Date
}

export type NotificationType = 
  | 'info'
  | 'success'
  | 'warning'
  | 'error'
  | 'task'
  | 'system'
  | 'reminder'

// System Types
export interface SystemSettings {
  general: GeneralSettings
  security: SecuritySettings
  integrations: IntegrationSettings
  ai: AISettings
  notifications: SystemNotificationSettings
}

export interface GeneralSettings {
  siteName: string
  siteUrl: string
  defaultLanguage: 'ar' | 'en'
  defaultTimezone: string
  dateFormat: string
  timeFormat: string
  currency: string
  maintenanceMode: boolean
}

export interface SecuritySettings {
  passwordPolicy: PasswordPolicy
  sessionTimeout: number
  maxLoginAttempts: number
  twoFactorRequired: boolean
  ipWhitelist: string[]
  auditLogging: boolean
}

export interface PasswordPolicy {
  minLength: number
  requireUppercase: boolean
  requireLowercase: boolean
  requireNumbers: boolean
  requireSymbols: boolean
  expiryDays: number
}

export interface IntegrationSettings {
  email: EmailSettings
  sms: SMSSettings
  storage: StorageSettings
  payment: PaymentSettings
}

export interface EmailSettings {
  provider: string
  host: string
  port: number
  username: string
  password: string
  encryption: 'tls' | 'ssl' | 'none'
  fromAddress: string
  fromName: string
}

export interface SMSSettings {
  provider: string
  apiKey: string
  apiSecret: string
  fromNumber: string
}

export interface StorageSettings {
  provider: 'local' | 'aws' | 'azure' | 'gcp'
  bucket: string
  region: string
  accessKey: string
  secretKey: string
  maxFileSize: number
  allowedTypes: string[]
}

export interface PaymentSettings {
  provider: string
  publicKey: string
  secretKey: string
  webhookSecret: string
  currency: string
  testMode: boolean
}

export interface AISettings {
  providers: AIProvider[]
  defaultProvider: AIProviderType
  rateLimits: Record<AIProviderType, number>
  costLimits: Record<AIProviderType, number>
  enabledCapabilities: AICapability[]
}

export interface SystemNotificationSettings {
  channels: NotificationChannel[]
  templates: NotificationTemplate[]
  rules: NotificationRule[]
}

export interface NotificationChannel {
  id: string
  name: string
  type: 'email' | 'sms' | 'push' | 'webhook'
  config: any
  isActive: boolean
}

export interface NotificationTemplate {
  id: string
  name: string
  type: NotificationType
  subject: string
  body: string
  variables: string[]
  language: 'ar' | 'en'
}

export interface NotificationRule {
  id: string
  name: string
  trigger: string
  conditions: any[]
  actions: any[]
  isActive: boolean
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
  errors?: Record<string, string[]>
  meta?: {
    total?: number
    page?: number
    limit?: number
    hasNext?: boolean
    hasPrev?: boolean
  }
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  meta: {
    total: number
    page: number
    limit: number
    hasNext: boolean
    hasPrev: boolean
    totalPages: number
  }
}

// Form Types
export interface FormField {
  name: string
  label: string
  type: 'text' | 'email' | 'password' | 'number' | 'select' | 'textarea' | 'checkbox' | 'radio' | 'date' | 'file'
  required?: boolean
  placeholder?: string
  options?: { label: string; value: any }[]
  validation?: any
  defaultValue?: any
  disabled?: boolean
  hidden?: boolean
}

export interface FormSchema {
  fields: FormField[]
  validation?: any
  layout?: 'vertical' | 'horizontal' | 'inline'
}

// Search & Filter Types
export interface SearchParams {
  query?: string
  filters?: Record<string, any>
  sort?: string
  order?: 'asc' | 'desc'
  page?: number
  limit?: number
}

export interface FilterOption {
  label: string
  value: any
  count?: number
}

export interface SearchResult<T> {
  items: T[]
  total: number
  facets?: Record<string, FilterOption[]>
  suggestions?: string[]
}

// Event Types
export interface SystemEvent {
  id: string
  type: string
  source: string
  data: any
  timestamp: Date
  userId?: string
  sessionId?: string
  ipAddress?: string
  userAgent?: string
}

// Audit Types
export interface AuditLog extends BaseEntity {
  action: string
  resource: string
  resourceId: string
  userId: string
  ipAddress: string
  userAgent: string
  changes?: {
    before: any
    after: any
  }
  metadata?: any
}

// Export all types
export * from './auth'
export * from './departments'
export * from './ai'

