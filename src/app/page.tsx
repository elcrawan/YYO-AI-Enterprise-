'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useSession } from 'next-auth/react'
import { useLanguage } from '@/components/providers/language-provider'
import { useSocket } from '@/components/providers/socket-provider'

// UI Components
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge, StatusBadge, DepartmentBadge } from '@/components/ui/badge'
import { LoadingSpinner, Skeleton } from '@/components/ui/loading-spinner'
import { LanguageSwitcher } from '@/components/providers/language-provider'

// Icons
import { 
  BarChart3, 
  Users, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  TrendingUp,
  Brain,
  Zap,
  Globe,
  Shield,
  Sparkles,
  ArrowRight,
  Play,
  Settings,
  Bell,
  User
} from 'lucide-react'

export default function HomePage() {
  const { data: session, status } = useSession()
  const { t, language, isLoading: langLoading } = useLanguage()
  const { isConnected } = useSocket()
  const [mounted, setMounted] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    setMounted(true)
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // Mock data for demonstration
  const stats = {
    totalTasks: 156,
    completedTasks: 89,
    pendingTasks: 45,
    overdueTasks: 22,
    activeProjects: 12,
    totalEmployees: 48,
    departments: 10,
    aiRequests: 1247
  }

  const recentActivities = [
    {
      id: 1,
      type: 'task_completed',
      title: 'تم إكمال تحليل الميزانية الشهرية',
      department: 'finance',
      time: '5 دقائق مضت',
      user: 'أحمد محمد'
    },
    {
      id: 2,
      type: 'task_assigned',
      title: 'تم تعيين مهمة مراجعة العقود',
      department: 'operations',
      time: '15 دقيقة مضت',
      user: 'فاطمة علي'
    },
    {
      id: 3,
      type: 'ai_analysis',
      title: 'تم إكمال تحليل أداء المبيعات',
      department: 'sales',
      time: '30 دقيقة مضت',
      user: 'نظام الذكاء الاصطناعي'
    }
  ]

  const aiInsights = [
    {
      title: 'اتجاه الإنتاجية',
      value: '+15%',
      description: 'زيادة في الإنتاجية هذا الشهر',
      trend: 'up'
    },
    {
      title: 'رضا العملاء',
      value: '94%',
      description: 'معدل رضا العملاء الحالي',
      trend: 'up'
    },
    {
      title: 'كفاءة العمليات',
      value: '87%',
      description: 'معدل كفاءة العمليات',
      trend: 'stable'
    }
  ]

  const systemStatus = {
    api: 'healthy',
    database: 'healthy',
    ai_services: 'healthy',
    maintenance: 'scheduled'
  }

  const getGreeting = () => {
    const hour = currentTime.getHours()
    if (hour < 12) return t('dashboard.greeting.morning')
    if (hour < 18) return t('dashboard.greeting.afternoon')
    return t('dashboard.greeting.evening')
  }

  if (!mounted || langLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner size="xl" text="جاري التحميل..." />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-primary text-white">
                  <Brain className="h-6 w-6" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">YYO Agent AI</h1>
                  <p className="text-sm text-muted-foreground">النظام الإداري الذكي</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <LanguageSwitcher />
              
              {/* Connection Status */}
              <div className="flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="text-sm text-muted-foreground">
                  {isConnected ? 'متصل' : 'غير متصل'}
                </span>
              </div>

              {/* User Menu */}
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm">
                  <Bell className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Settings className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <User className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold">
                {getGreeting()}
                {session?.user?.name && `, ${session.user.name}`}
              </h2>
              <p className="text-muted-foreground mt-2">
                {t('dashboard.welcome_message')}
              </p>
            </div>
            <div className="text-left">
              <p className="text-sm text-muted-foreground">
                {currentTime.toLocaleDateString('ar-SA', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
              <p className="text-lg font-semibold">
                {currentTime.toLocaleTimeString('ar-SA', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('dashboard.stats.total_tasks')}
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalTasks}</div>
              <p className="text-xs text-muted-foreground">
                +12% من الشهر الماضي
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('dashboard.stats.completed_tasks')}
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.completedTasks}</div>
              <p className="text-xs text-muted-foreground">
                {Math.round((stats.completedTasks / stats.totalTasks) * 100)}% معدل الإنجاز
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('dashboard.stats.pending_tasks')}
              </CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.pendingTasks}</div>
              <p className="text-xs text-muted-foreground">
                في انتظار المراجعة
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t('dashboard.stats.ai_requests')}
              </CardTitle>
              <Brain className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{stats.aiRequests}</div>
              <p className="text-xs text-muted-foreground">
                طلبات الذكاء الاصطناعي
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  {t('dashboard.quick_actions.title')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start" variant="outline">
                  <Play className="h-4 w-4 ml-2" />
                  {t('dashboard.quick_actions.create_task')}
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <BarChart3 className="h-4 w-4 ml-2" />
                  {t('dashboard.quick_actions.generate_report')}
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Brain className="h-4 w-4 ml-2" />
                  {t('dashboard.quick_actions.ai_analysis')}
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Users className="h-4 w-4 ml-2" />
                  {t('dashboard.quick_actions.schedule_meeting')}
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Activities */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    {t('dashboard.recent_activities.title')}
                  </span>
                  <Button variant="ghost" size="sm">
                    {t('dashboard.recent_activities.view_all')}
                    <ArrowRight className="h-4 w-4 mr-2" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <DepartmentBadge department={activity.department as any} size="sm" />
                        <span className="text-xs text-muted-foreground">{activity.time}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{activity.user}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          {/* AI Insights */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  {t('dashboard.ai_insights.title')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {aiInsights.map((insight, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div>
                      <p className="text-sm font-medium">{insight.title}</p>
                      <p className="text-xs text-muted-foreground">{insight.description}</p>
                    </div>
                    <div className="text-left">
                      <p className={`text-lg font-bold ${
                        insight.trend === 'up' ? 'text-green-600' : 
                        insight.trend === 'down' ? 'text-red-600' : 'text-blue-600'
                      }`}>
                        {insight.value}
                      </p>
                      <TrendingUp className={`h-4 w-4 ${
                        insight.trend === 'up' ? 'text-green-600' : 
                        insight.trend === 'down' ? 'text-red-600 rotate-180' : 'text-blue-600'
                      }`} />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* System Status & Features */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          {/* System Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  {t('dashboard.system_status')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">{t('dashboard.status.api')}</span>
                  <StatusBadge status="active" size="sm" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">{t('dashboard.status.database')}</span>
                  <StatusBadge status="active" size="sm" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">{t('dashboard.status.ai_services')}</span>
                  <StatusBadge status="active" size="sm" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">{t('dashboard.status.maintenance')}</span>
                  <StatusBadge status="pending" size="sm" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Key Features */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  {t('dashboard.features.title')}
                </CardTitle>
                <CardDescription>
                  {t('dashboard.features.description')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <Brain className="h-5 w-5 text-purple-600" />
                  <span className="text-sm">{t('dashboard.features.ai_integration')}</span>
                  <Badge variant="success" size="sm">8 أنظمة</Badge>
                </div>
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-blue-600" />
                  <span className="text-sm">{t('dashboard.features.departments')}</span>
                  <Badge variant="info" size="sm">10 إدارات</Badge>
                </div>
                <div className="flex items-center gap-3">
                  <BarChart3 className="h-5 w-5 text-green-600" />
                  <span className="text-sm">{t('dashboard.features.analytics')}</span>
                  <Badge variant="success" size="sm">متقدم</Badge>
                </div>
                <div className="flex items-center gap-3">
                  <Globe className="h-5 w-5 text-orange-600" />
                  <span className="text-sm">{t('dashboard.features.multilingual')}</span>
                  <Badge variant="warning" size="sm">عربي/إنجليزي</Badge>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  )
}

