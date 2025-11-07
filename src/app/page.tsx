'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

// Components
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { DashboardStats } from '@/components/dashboard/dashboard-stats'
import { QuickActions } from '@/components/dashboard/quick-actions'
import { RecentActivities } from '@/components/dashboard/recent-activities'
import { AIInsights } from '@/components/dashboard/ai-insights'
import { DepartmentOverview } from '@/components/dashboard/department-overview'

// Icons
import { 
  Brain, 
  BarChart3, 
  Users, 
  Settings, 
  Bell,
  Search,
  Plus,
  TrendingUp,
  Shield,
  Zap,
  Globe,
  Sparkles
} from 'lucide-react'

// Hooks
import { useAuth } from '@/hooks/use-auth'
import { useDashboard } from '@/hooks/use-dashboard'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
}

export default function HomePage() {
  const { t } = useTranslation()
  const { data: session, status } = useSession()
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const { stats, activities, insights, isLoading: dashboardLoading } = useDashboard()
  
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    }
  }, [status, router])

  if (status === 'loading' || authLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!session || !user) {
    return null
  }

  const getGreeting = () => {
    const hour = currentTime.getHours()
    if (hour < 12) return t('dashboard.greeting.morning')
    if (hour < 17) return t('dashboard.greeting.afternoon')
    return t('dashboard.greeting.evening')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Brain className="h-5 w-5 text-primary-foreground" />
              </div>
              <h1 className="text-xl font-bold">YYO Agent AI</h1>
            </div>
            <Separator orientation="vertical" className="h-6" />
            <Badge variant="secondary" className="gap-1">
              <Sparkles className="h-3 w-3" />
              {t('common.ai_powered')}
            </Badge>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm">
              <Search className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Bell className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          {/* Welcome Section */}
          <motion.div variants={itemVariants}>
            <Card className="border-0 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl">
                      {getGreeting()}, {user.name}! 👋
                    </CardTitle>
                    <CardDescription className="text-lg">
                      {t('dashboard.welcome_message')}
                    </CardDescription>
                  </div>
                  <div className="text-end text-sm text-muted-foreground">
                    <div>{currentTime.toLocaleDateString('ar-SA')}</div>
                    <div className="font-mono">{currentTime.toLocaleTimeString('ar-SA')}</div>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </motion.div>

          {/* Dashboard Stats */}
          <motion.div variants={itemVariants}>
            <DashboardStats stats={stats} isLoading={dashboardLoading} />
          </motion.div>

          {/* Quick Actions */}
          <motion.div variants={itemVariants}>
            <QuickActions />
          </motion.div>

          {/* Main Dashboard Grid */}
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Left Column - Department Overview */}
            <motion.div variants={itemVariants} className="lg:col-span-2">
              <DepartmentOverview />
            </motion.div>

            {/* Right Column - AI Insights & Activities */}
            <motion.div variants={itemVariants} className="space-y-6">
              <AIInsights insights={insights} isLoading={dashboardLoading} />
              <RecentActivities activities={activities} isLoading={dashboardLoading} />
            </motion.div>
          </div>

          {/* System Status */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-green-500" />
                  {t('dashboard.system_status')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-4">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                    <span className="text-sm">{t('dashboard.status.api')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                    <span className="text-sm">{t('dashboard.status.database')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                    <span className="text-sm">{t('dashboard.status.ai_services')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-yellow-500" />
                    <span className="text-sm">{t('dashboard.status.maintenance')}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Features Showcase */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  {t('dashboard.features.title')}
                </CardTitle>
                <CardDescription>
                  {t('dashboard.features.description')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <div className="flex items-center gap-3 rounded-lg border p-4">
                    <Brain className="h-8 w-8 text-primary" />
                    <div>
                      <h4 className="font-semibold">{t('dashboard.features.ai_integration')}</h4>
                      <p className="text-sm text-muted-foreground">8 AI Systems</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 rounded-lg border p-4">
                    <Users className="h-8 w-8 text-blue-500" />
                    <div>
                      <h4 className="font-semibold">{t('dashboard.features.departments')}</h4>
                      <p className="text-sm text-muted-foreground">10 Departments</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 rounded-lg border p-4">
                    <BarChart3 className="h-8 w-8 text-green-500" />
                    <div>
                      <h4 className="font-semibold">{t('dashboard.features.analytics')}</h4>
                      <p className="text-sm text-muted-foreground">Real-time</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 rounded-lg border p-4">
                    <Globe className="h-8 w-8 text-purple-500" />
                    <div>
                      <h4 className="font-semibold">{t('dashboard.features.multilingual')}</h4>
                      <p className="text-sm text-muted-foreground">AR/EN</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </main>
    </div>
  )
}

