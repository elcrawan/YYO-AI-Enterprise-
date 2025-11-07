import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { prisma } from '@/lib/database/prisma'
import { compare } from 'bcryptjs'
import { JWT } from 'next-auth/jwt'
import { Session } from 'next-auth'
import { User } from '@/types'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/auth/login',
    signUp: '/auth/register',
    error: '/auth/error',
    verifyRequest: '/auth/verify-request',
    newUser: '/auth/welcome',
  },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        twoFactorCode: { label: '2FA Code', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('البريد الإلكتروني وكلمة المرور مطلوبان')
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: {
            department: true,
            permissions: true,
            twoFactorAuth: true,
          },
        })

        if (!user) {
          throw new Error('المستخدم غير موجود')
        }

        if (!user.isActive) {
          throw new Error('الحساب غير مفعل')
        }

        const isPasswordValid = await compare(credentials.password, user.password)
        if (!isPasswordValid) {
          throw new Error('كلمة المرور غير صحيحة')
        }

        // Check 2FA if enabled
        if (user.twoFactorAuth?.isEnabled) {
          if (!credentials.twoFactorCode) {
            throw new Error('رمز التحقق الثنائي مطلوب')
          }

          const isValidCode = await verifyTwoFactorCode(
            user.id,
            credentials.twoFactorCode
          )

          if (!isValidCode) {
            throw new Error('رمز التحقق الثنائي غير صحيح')
          }
        }

        // Update last login
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLogin: new Date() },
        })

        // Log successful login
        await prisma.auditLog.create({
          data: {
            action: 'LOGIN',
            resource: 'USER',
            resourceId: user.id,
            userId: user.id,
            ipAddress: '', // Will be filled by middleware
            userAgent: '', // Will be filled by middleware
            metadata: {
              success: true,
              method: 'credentials',
            },
          },
        })

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          avatar: user.avatar,
          role: user.role,
          department: user.department?.type,
          position: user.position,
          permissions: user.permissions.map(p => ({
            resource: p.resource,
            actions: p.actions,
            conditions: p.conditions,
          })),
        }
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }: { token: JWT; user?: any; account?: any }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.department = user.department
        token.position = user.position
        token.permissions = user.permissions
      }

      // Refresh user data periodically
      if (token.id && Date.now() - (token.lastRefresh as number || 0) > 60 * 60 * 1000) {
        try {
          const refreshedUser = await prisma.user.findUnique({
            where: { id: token.id as string },
            include: {
              department: true,
              permissions: true,
            },
          })

          if (refreshedUser && refreshedUser.isActive) {
            token.role = refreshedUser.role
            token.department = refreshedUser.department?.type
            token.position = refreshedUser.position
            token.permissions = refreshedUser.permissions.map(p => ({
              resource: p.resource,
              actions: p.actions,
              conditions: p.conditions,
            }))
            token.lastRefresh = Date.now()
          } else {
            // User is no longer active, invalidate token
            return null
          }
        } catch (error) {
          console.error('Error refreshing user data:', error)
        }
      }

      return token
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (token) {
        session.user = {
          ...session.user,
          id: token.id as string,
          role: token.role as string,
          department: token.department as string,
          position: token.position as string,
          permissions: token.permissions as any[],
        }
      }
      return session
    },
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google') {
        try {
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email! },
          })

          if (!existingUser) {
            // Create new user from Google OAuth
            await prisma.user.create({
              data: {
                email: user.email!,
                name: user.name!,
                avatar: user.image,
                role: 'employee', // Default role
                position: 'موظف',
                isActive: true,
                emailVerified: new Date(),
                preferences: {
                  language: 'ar',
                  theme: 'system',
                  notifications: {
                    email: true,
                    sms: false,
                    push: true,
                    inApp: true,
                    frequency: 'immediate',
                  },
                  dashboard: {
                    layout: 'grid',
                    widgets: ['stats', 'tasks', 'notifications'],
                    refreshInterval: 30000,
                  },
                },
              },
            })
          }

          return true
        } catch (error) {
          console.error('Error creating user from Google OAuth:', error)
          return false
        }
      }

      return true
    },
  },
  events: {
    async signIn({ user, account, profile, isNewUser }) {
      // Log sign in event
      await prisma.auditLog.create({
        data: {
          action: 'SIGNIN',
          resource: 'USER',
          resourceId: user.id!,
          userId: user.id!,
          ipAddress: '',
          userAgent: '',
          metadata: {
            provider: account?.provider,
            isNewUser,
          },
        },
      })
    },
    async signOut({ token }) {
      if (token?.id) {
        // Log sign out event
        await prisma.auditLog.create({
          data: {
            action: 'SIGNOUT',
            resource: 'USER',
            resourceId: token.id as string,
            userId: token.id as string,
            ipAddress: '',
            userAgent: '',
            metadata: {},
          },
        })
      }
    },
  },
  debug: process.env.NODE_ENV === 'development',
}

async function verifyTwoFactorCode(userId: string, code: string): Promise<boolean> {
  try {
    const twoFactorAuth = await prisma.twoFactorAuth.findUnique({
      where: { userId },
    })

    if (!twoFactorAuth || !twoFactorAuth.isEnabled) {
      return false
    }

    // Verify TOTP code
    const { authenticator } = await import('otplib')
    authenticator.options = {
      window: 2, // Allow 2 time steps before/after current
    }

    return authenticator.verify({
      token: code,
      secret: twoFactorAuth.secret,
    })
  } catch (error) {
    console.error('Error verifying 2FA code:', error)
    return false
  }
}

