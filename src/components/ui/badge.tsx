import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        success:
          "border-transparent bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-100",
        warning:
          "border-transparent bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-900 dark:text-yellow-100",
        info:
          "border-transparent bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-100",
        // Department variants
        finance:
          "border-transparent bg-finance/10 text-finance hover:bg-finance/20 dark:bg-finance/20 dark:text-finance",
        operations:
          "border-transparent bg-operations/10 text-operations hover:bg-operations/20 dark:bg-operations/20 dark:text-operations",
        sales:
          "border-transparent bg-sales/10 text-sales hover:bg-sales/20 dark:bg-sales/20 dark:text-sales",
        hr:
          "border-transparent bg-hr/10 text-hr hover:bg-hr/20 dark:bg-hr/20 dark:text-hr",
        projects:
          "border-transparent bg-projects/10 text-projects hover:bg-projects/20 dark:bg-projects/20 dark:text-projects",
        it:
          "border-transparent bg-it/10 text-it hover:bg-it/20 dark:bg-it/20 dark:text-it",
        support:
          "border-transparent bg-support/10 text-support hover:bg-support/20 dark:bg-support/20 dark:text-support",
        innovation:
          "border-transparent bg-innovation/10 text-innovation hover:bg-innovation/20 dark:bg-innovation/20 dark:text-innovation",
        resources:
          "border-transparent bg-resources/10 text-resources hover:bg-resources/20 dark:bg-resources/20 dark:text-resources",
        quality:
          "border-transparent bg-quality/10 text-quality hover:bg-quality/20 dark:bg-quality/20 dark:text-quality",
        // Status variants
        active: "border-transparent bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
        inactive: "border-transparent bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100",
        pending: "border-transparent bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100",
        completed: "border-transparent bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
        cancelled: "border-transparent bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100",
        // Priority variants
        low: "border-transparent bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100",
        medium: "border-transparent bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100",
        high: "border-transparent bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100",
        urgent: "border-transparent bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100",
      },
      size: {
        default: "px-2.5 py-0.5 text-xs",
        sm: "px-2 py-0.5 text-xs",
        lg: "px-3 py-1 text-sm",
        xl: "px-4 py-1.5 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  icon?: React.ReactNode
  removable?: boolean
  onRemove?: () => void
}

function Badge({ className, variant, size, icon, removable, onRemove, children, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size }), className)} {...props}>
      {icon && <span className="mr-1">{icon}</span>}
      {children}
      {removable && (
        <button
          type="button"
          className="ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full hover:bg-black/10 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white dark:hover:bg-white/10"
          onClick={onRemove}
        >
          <span className="sr-only">Remove</span>
          <svg className="h-2 w-2" stroke="currentColor" fill="none" viewBox="0 0 8 8">
            <path strokeLinecap="round" strokeWidth="1.5" d="m1 1 6 6m0-6L1 7" />
          </svg>
        </button>
      )}
    </div>
  )
}

// Status Badge Component
export interface StatusBadgeProps extends Omit<BadgeProps, 'variant'> {
  status: 'active' | 'inactive' | 'pending' | 'completed' | 'cancelled' | 'draft' | 'in_progress' | 'review' | 'overdue'
}

function StatusBadge({ status, ...props }: StatusBadgeProps) {
  const statusConfig = {
    active: { variant: 'active' as const, text: 'نشط' },
    inactive: { variant: 'inactive' as const, text: 'غير نشط' },
    pending: { variant: 'pending' as const, text: 'في الانتظار' },
    completed: { variant: 'completed' as const, text: 'مكتمل' },
    cancelled: { variant: 'cancelled' as const, text: 'ملغي' },
    draft: { variant: 'inactive' as const, text: 'مسودة' },
    in_progress: { variant: 'info' as const, text: 'قيد التنفيذ' },
    review: { variant: 'warning' as const, text: 'قيد المراجعة' },
    overdue: { variant: 'destructive' as const, text: 'متأخر' },
  }

  const config = statusConfig[status]

  return (
    <Badge variant={config.variant} {...props}>
      {config.text}
    </Badge>
  )
}

// Priority Badge Component
export interface PriorityBadgeProps extends Omit<BadgeProps, 'variant'> {
  priority: 'low' | 'medium' | 'high' | 'urgent'
}

function PriorityBadge({ priority, ...props }: PriorityBadgeProps) {
  const priorityConfig = {
    low: { variant: 'low' as const, text: 'منخفض' },
    medium: { variant: 'medium' as const, text: 'متوسط' },
    high: { variant: 'high' as const, text: 'عالي' },
    urgent: { variant: 'urgent' as const, text: 'عاجل' },
  }

  const config = priorityConfig[priority]

  return (
    <Badge variant={config.variant} {...props}>
      {config.text}
    </Badge>
  )
}

// Department Badge Component
export interface DepartmentBadgeProps extends Omit<BadgeProps, 'variant'> {
  department: 'finance' | 'operations' | 'sales' | 'hr' | 'projects' | 'it' | 'support' | 'innovation' | 'resources' | 'quality'
}

function DepartmentBadge({ department, ...props }: DepartmentBadgeProps) {
  const departmentConfig = {
    finance: { variant: 'finance' as const, text: 'المالية' },
    operations: { variant: 'operations' as const, text: 'العمليات' },
    sales: { variant: 'sales' as const, text: 'المبيعات' },
    hr: { variant: 'hr' as const, text: 'الموارد البشرية' },
    projects: { variant: 'projects' as const, text: 'المشاريع' },
    it: { variant: 'it' as const, text: 'تكنولوجيا المعلومات' },
    support: { variant: 'support' as const, text: 'الدعم الفني' },
    innovation: { variant: 'innovation' as const, text: 'الابتكار' },
    resources: { variant: 'resources' as const, text: 'الموارد' },
    quality: { variant: 'quality' as const, text: 'الجودة' },
  }

  const config = departmentConfig[department]

  return (
    <Badge variant={config.variant} {...props}>
      {config.text}
    </Badge>
  )
}

export { Badge, badgeVariants, StatusBadge, PriorityBadge, DepartmentBadge }

