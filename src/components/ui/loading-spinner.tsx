import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const spinnerVariants = cva(
  "animate-spin rounded-full border-solid border-current border-r-transparent",
  {
    variants: {
      size: {
        sm: "h-4 w-4 border-2",
        default: "h-6 w-6 border-2",
        lg: "h-8 w-8 border-2",
        xl: "h-12 w-12 border-4",
      },
      variant: {
        default: "text-primary",
        secondary: "text-secondary",
        muted: "text-muted-foreground",
        white: "text-white",
        // Department colors
        finance: "text-finance",
        operations: "text-operations",
        sales: "text-sales",
        hr: "text-hr",
        projects: "text-projects",
        it: "text-it",
        support: "text-support",
        innovation: "text-innovation",
        resources: "text-resources",
        quality: "text-quality",
      },
    },
    defaultVariants: {
      size: "default",
      variant: "default",
    },
  }
)

export interface LoadingSpinnerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof spinnerVariants> {
  text?: string
  center?: boolean
}

const LoadingSpinner = React.forwardRef<HTMLDivElement, LoadingSpinnerProps>(
  ({ className, size, variant, text, center = false, ...props }, ref) => {
    const spinner = (
      <div
        ref={ref}
        className={cn(spinnerVariants({ size, variant, className }))}
        {...props}
      />
    )

    if (text) {
      return (
        <div className={cn("flex items-center gap-2", center && "justify-center")}>
          {spinner}
          <span className="text-sm text-muted-foreground">{text}</span>
        </div>
      )
    }

    if (center) {
      return (
        <div className="flex justify-center">
          {spinner}
        </div>
      )
    }

    return spinner
  }
)
LoadingSpinner.displayName = "LoadingSpinner"

// Skeleton component for loading states
export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("animate-pulse rounded-md bg-muted", className)}
        {...props}
      />
    )
  }
)
Skeleton.displayName = "Skeleton"

// Pulse loader for content loading
export interface PulseLoaderProps extends React.HTMLAttributes<HTMLDivElement> {
  count?: number
  size?: "sm" | "default" | "lg"
}

const PulseLoader = React.forwardRef<HTMLDivElement, PulseLoaderProps>(
  ({ className, count = 3, size = "default", ...props }, ref) => {
    const sizeClasses = {
      sm: "h-2 w-2",
      default: "h-3 w-3",
      lg: "h-4 w-4",
    }

    return (
      <div
        ref={ref}
        className={cn("flex items-center gap-1", className)}
        {...props}
      >
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "animate-pulse rounded-full bg-current",
              sizeClasses[size]
            )}
            style={{
              animationDelay: `${i * 0.15}s`,
              animationDuration: "0.6s",
            }}
          />
        ))}
      </div>
    )
  }
)
PulseLoader.displayName = "PulseLoader"

// Progress spinner with percentage
export interface ProgressSpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  progress: number
  size?: "sm" | "default" | "lg" | "xl"
  showPercentage?: boolean
  color?: string
}

const ProgressSpinner = React.forwardRef<HTMLDivElement, ProgressSpinnerProps>(
  ({ className, progress, size = "default", showPercentage = true, color = "currentColor", ...props }, ref) => {
    const sizeClasses = {
      sm: "h-8 w-8",
      default: "h-12 w-12",
      lg: "h-16 w-16",
      xl: "h-20 w-20",
    }

    const strokeWidth = {
      sm: 2,
      default: 3,
      lg: 4,
      xl: 5,
    }

    const radius = {
      sm: 14,
      default: 21,
      lg: 28,
      xl: 35,
    }

    const circumference = 2 * Math.PI * radius[size]
    const strokeDasharray = circumference
    const strokeDashoffset = circumference - (progress / 100) * circumference

    return (
      <div
        ref={ref}
        className={cn("relative inline-flex items-center justify-center", sizeClasses[size], className)}
        {...props}
      >
        <svg
          className="transform -rotate-90"
          width="100%"
          height="100%"
          viewBox={`0 0 ${radius[size] * 2 + strokeWidth[size] * 2} ${radius[size] * 2 + strokeWidth[size] * 2}`}
        >
          {/* Background circle */}
          <circle
            cx={radius[size] + strokeWidth[size]}
            cy={radius[size] + strokeWidth[size]}
            r={radius[size]}
            stroke="currentColor"
            strokeWidth={strokeWidth[size]}
            fill="transparent"
            className="text-muted-foreground/20"
          />
          {/* Progress circle */}
          <circle
            cx={radius[size] + strokeWidth[size]}
            cy={radius[size] + strokeWidth[size]}
            r={radius[size]}
            stroke={color}
            strokeWidth={strokeWidth[size]}
            fill="transparent"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-300 ease-in-out"
          />
        </svg>
        {showPercentage && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-medium">{Math.round(progress)}%</span>
          </div>
        )}
      </div>
    )
  }
)
ProgressSpinner.displayName = "ProgressSpinner"

export { LoadingSpinner, Skeleton, PulseLoader, ProgressSpinner }

