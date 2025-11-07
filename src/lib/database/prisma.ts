import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// MongoDB connection
import { MongoClient, Db } from 'mongodb'

let mongoClient: MongoClient | null = null
let mongoDb: Db | null = null

export async function connectMongoDB(): Promise<Db> {
  if (mongoDb) {
    return mongoDb
  }

  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined')
    }

    mongoClient = new MongoClient(process.env.MONGODB_URI)
    await mongoClient.connect()
    mongoDb = mongoClient.db('yyo_ai_enterprise')
    
    console.log('Connected to MongoDB')
    return mongoDb
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error)
    throw error
  }
}

export async function disconnectMongoDB(): Promise<void> {
  if (mongoClient) {
    await mongoClient.close()
    mongoClient = null
    mongoDb = null
    console.log('Disconnected from MongoDB')
  }
}

// Redis connection
import { createClient, RedisClientType } from 'redis'

let redisClient: RedisClientType | null = null

export async function connectRedis(): Promise<RedisClientType> {
  if (redisClient && redisClient.isOpen) {
    return redisClient
  }

  try {
    redisClient = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379'
    })

    redisClient.on('error', (err) => {
      console.error('Redis Client Error:', err)
    })

    redisClient.on('connect', () => {
      console.log('Connected to Redis')
    })

    redisClient.on('disconnect', () => {
      console.log('Disconnected from Redis')
    })

    await redisClient.connect()
    return redisClient
  } catch (error) {
    console.error('Failed to connect to Redis:', error)
    throw error
  }
}

export async function disconnectRedis(): Promise<void> {
  if (redisClient && redisClient.isOpen) {
    await redisClient.disconnect()
    redisClient = null
    console.log('Disconnected from Redis')
  }
}

// Database utilities
export class DatabaseManager {
  static async healthCheck(): Promise<{
    postgres: boolean
    mongodb: boolean
    redis: boolean
  }> {
    const health = {
      postgres: false,
      mongodb: false,
      redis: false
    }

    // Check PostgreSQL
    try {
      await prisma.$queryRaw`SELECT 1`
      health.postgres = true
    } catch (error) {
      console.error('PostgreSQL health check failed:', error)
    }

    // Check MongoDB
    try {
      const db = await connectMongoDB()
      await db.admin().ping()
      health.mongodb = true
    } catch (error) {
      console.error('MongoDB health check failed:', error)
    }

    // Check Redis
    try {
      const redis = await connectRedis()
      await redis.ping()
      health.redis = true
    } catch (error) {
      console.error('Redis health check failed:', error)
    }

    return health
  }

  static async closeConnections(): Promise<void> {
    await Promise.all([
      prisma.$disconnect(),
      disconnectMongoDB(),
      disconnectRedis()
    ])
  }
}

// Cache utilities
export class CacheManager {
  private static redis: RedisClientType | null = null

  static async getRedis(): Promise<RedisClientType> {
    if (!this.redis) {
      this.redis = await connectRedis()
    }
    return this.redis
  }

  static async get<T>(key: string): Promise<T | null> {
    try {
      const redis = await this.getRedis()
      const value = await redis.get(key)
      return value ? JSON.parse(value) : null
    } catch (error) {
      console.error('Cache get error:', error)
      return null
    }
  }

  static async set(key: string, value: any, ttl?: number): Promise<boolean> {
    try {
      const redis = await this.getRedis()
      const serialized = JSON.stringify(value)
      
      if (ttl) {
        await redis.setEx(key, ttl, serialized)
      } else {
        await redis.set(key, serialized)
      }
      
      return true
    } catch (error) {
      console.error('Cache set error:', error)
      return false
    }
  }

  static async del(key: string): Promise<boolean> {
    try {
      const redis = await this.getRedis()
      await redis.del(key)
      return true
    } catch (error) {
      console.error('Cache delete error:', error)
      return false
    }
  }

  static async exists(key: string): Promise<boolean> {
    try {
      const redis = await this.getRedis()
      const result = await redis.exists(key)
      return result === 1
    } catch (error) {
      console.error('Cache exists error:', error)
      return false
    }
  }

  static async flush(): Promise<boolean> {
    try {
      const redis = await this.getRedis()
      await redis.flushAll()
      return true
    } catch (error) {
      console.error('Cache flush error:', error)
      return false
    }
  }

  static async keys(pattern: string): Promise<string[]> {
    try {
      const redis = await this.getRedis()
      return await redis.keys(pattern)
    } catch (error) {
      console.error('Cache keys error:', error)
      return []
    }
  }
}

// MongoDB utilities
export class MongoManager {
  private static db: Db | null = null

  static async getDb(): Promise<Db> {
    if (!this.db) {
      this.db = await connectMongoDB()
    }
    return this.db
  }

  static async insertOne(collection: string, document: any): Promise<any> {
    try {
      const db = await this.getDb()
      const result = await db.collection(collection).insertOne({
        ...document,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      return result
    } catch (error) {
      console.error('MongoDB insertOne error:', error)
      throw error
    }
  }

  static async findOne(collection: string, filter: any): Promise<any> {
    try {
      const db = await this.getDb()
      return await db.collection(collection).findOne(filter)
    } catch (error) {
      console.error('MongoDB findOne error:', error)
      throw error
    }
  }

  static async find(collection: string, filter: any = {}, options: any = {}): Promise<any[]> {
    try {
      const db = await this.getDb()
      return await db.collection(collection).find(filter, options).toArray()
    } catch (error) {
      console.error('MongoDB find error:', error)
      throw error
    }
  }

  static async updateOne(collection: string, filter: any, update: any): Promise<any> {
    try {
      const db = await this.getDb()
      const result = await db.collection(collection).updateOne(filter, {
        $set: {
          ...update,
          updatedAt: new Date()
        }
      })
      return result
    } catch (error) {
      console.error('MongoDB updateOne error:', error)
      throw error
    }
  }

  static async deleteOne(collection: string, filter: any): Promise<any> {
    try {
      const db = await this.getDb()
      return await db.collection(collection).deleteOne(filter)
    } catch (error) {
      console.error('MongoDB deleteOne error:', error)
      throw error
    }
  }

  static async aggregate(collection: string, pipeline: any[]): Promise<any[]> {
    try {
      const db = await this.getDb()
      return await db.collection(collection).aggregate(pipeline).toArray()
    } catch (error) {
      console.error('MongoDB aggregate error:', error)
      throw error
    }
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Received SIGINT, closing database connections...')
  await DatabaseManager.closeConnections()
  process.exit(0)
})

process.on('SIGTERM', async () => {
  console.log('Received SIGTERM, closing database connections...')
  await DatabaseManager.closeConnections()
  process.exit(0)
})

