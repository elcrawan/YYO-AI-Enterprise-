'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { io, Socket } from 'socket.io-client'
import { useSession } from 'next-auth/react'
import toast from 'react-hot-toast'

interface SocketContextType {
  socket: Socket | null
  isConnected: boolean
  emit: (event: string, data?: any) => void
  on: (event: string, callback: (data: any) => void) => void
  off: (event: string, callback?: (data: any) => void) => void
}

const SocketContext = createContext<SocketContextType | undefined>(undefined)

interface SocketProviderProps {
  children: ReactNode
}

export function SocketProvider({ children }: SocketProviderProps) {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const { data: session, status } = useSession()

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      // Initialize socket connection
      const socketInstance = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001', {
        auth: {
          userId: session.user.id,
          token: session.accessToken,
        },
        transports: ['websocket', 'polling'],
        upgrade: true,
        rememberUpgrade: true,
      })

      // Connection event handlers
      socketInstance.on('connect', () => {
        console.log('Socket connected:', socketInstance.id)
        setIsConnected(true)
        toast.success('متصل بالخادم', { id: 'socket-connect' })
      })

      socketInstance.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason)
        setIsConnected(false)
        if (reason === 'io server disconnect') {
          // Server disconnected, try to reconnect
          socketInstance.connect()
        }
        toast.error('انقطع الاتصال بالخادم', { id: 'socket-disconnect' })
      })

      socketInstance.on('connect_error', (error) => {
        console.error('Socket connection error:', error)
        setIsConnected(false)
        toast.error('خطأ في الاتصال بالخادم', { id: 'socket-error' })
      })

      socketInstance.on('reconnect', (attemptNumber) => {
        console.log('Socket reconnected after', attemptNumber, 'attempts')
        setIsConnected(true)
        toast.success('تم إعادة الاتصال بالخادم', { id: 'socket-reconnect' })
      })

      socketInstance.on('reconnect_error', (error) => {
        console.error('Socket reconnection error:', error)
      })

      // Real-time event handlers
      socketInstance.on('notification', (data) => {
        console.log('Received notification:', data)
        toast(data.message, {
          icon: getNotificationIcon(data.type),
          duration: data.priority === 'urgent' ? 8000 : 4000,
        })
      })

      socketInstance.on('task_update', (data) => {
        console.log('Task updated:', data)
        toast.success(`تم تحديث المهمة: ${data.title}`)
      })

      socketInstance.on('task_assigned', (data) => {
        console.log('Task assigned:', data)
        toast(`تم تعيين مهمة جديدة: ${data.title}`, {
          icon: '📋',
          duration: 6000,
        })
      })

      socketInstance.on('task_completed', (data) => {
        console.log('Task completed:', data)
        toast.success(`تم إكمال المهمة: ${data.title}`)
      })

      socketInstance.on('system_alert', (data) => {
        console.log('System alert:', data)
        toast.error(data.message, {
          duration: 8000,
        })
      })

      socketInstance.on('ai_analysis_complete', (data) => {
        console.log('AI analysis complete:', data)
        toast.success('تم إكمال التحليل الذكي', {
          icon: '🤖',
        })
      })

      socketInstance.on('report_generated', (data) => {
        console.log('Report generated:', data)
        toast.success(`تم إنشاء التقرير: ${data.title}`, {
          icon: '📊',
        })
      })

      socketInstance.on('user_online', (data) => {
        console.log('User came online:', data)
        // Don't show toast for user online/offline to avoid spam
      })

      socketInstance.on('user_offline', (data) => {
        console.log('User went offline:', data)
        // Don't show toast for user online/offline to avoid spam
      })

      setSocket(socketInstance)

      // Cleanup on unmount
      return () => {
        console.log('Cleaning up socket connection')
        socketInstance.disconnect()
        setSocket(null)
        setIsConnected(false)
      }
    }
  }, [session, status])

  const emit = (event: string, data?: any) => {
    if (socket && isConnected) {
      socket.emit(event, data)
    } else {
      console.warn('Socket not connected, cannot emit event:', event)
    }
  }

  const on = (event: string, callback: (data: any) => void) => {
    if (socket) {
      socket.on(event, callback)
    }
  }

  const off = (event: string, callback?: (data: any) => void) => {
    if (socket) {
      if (callback) {
        socket.off(event, callback)
      } else {
        socket.off(event)
      }
    }
  }

  const value: SocketContextType = {
    socket,
    isConnected,
    emit,
    on,
    off,
  }

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  )
}

export function useSocket() {
  const context = useContext(SocketContext)
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider')
  }
  return context
}

// Helper function to get notification icons
function getNotificationIcon(type: string): string {
  switch (type) {
    case 'info':
      return 'ℹ️'
    case 'success':
      return '✅'
    case 'warning':
      return '⚠️'
    case 'error':
      return '❌'
    case 'task':
      return '📋'
    case 'system':
      return '⚙️'
    case 'reminder':
      return '⏰'
    default:
      return '🔔'
  }
}

// Custom hooks for specific socket events
export function useTaskUpdates() {
  const { on, off } = useSocket()

  useEffect(() => {
    const handleTaskUpdate = (data: any) => {
      // Handle task update
      console.log('Task update received:', data)
    }

    const handleTaskAssigned = (data: any) => {
      // Handle task assignment
      console.log('Task assigned:', data)
    }

    const handleTaskCompleted = (data: any) => {
      // Handle task completion
      console.log('Task completed:', data)
    }

    on('task_update', handleTaskUpdate)
    on('task_assigned', handleTaskAssigned)
    on('task_completed', handleTaskCompleted)

    return () => {
      off('task_update', handleTaskUpdate)
      off('task_assigned', handleTaskAssigned)
      off('task_completed', handleTaskCompleted)
    }
  }, [on, off])
}

export function useNotifications() {
  const { on, off } = useSocket()

  useEffect(() => {
    const handleNotification = (data: any) => {
      // Handle notification
      console.log('Notification received:', data)
    }

    on('notification', handleNotification)

    return () => {
      off('notification', handleNotification)
    }
  }, [on, off])
}

export function useSystemAlerts() {
  const { on, off } = useSocket()

  useEffect(() => {
    const handleSystemAlert = (data: any) => {
      // Handle system alert
      console.log('System alert received:', data)
    }

    on('system_alert', handleSystemAlert)

    return () => {
      off('system_alert', handleSystemAlert)
    }
  }, [on, off])
}

