import { AIProvider, AIProviderType, AICapability, AIRequest } from '@/types'
import { OpenAIService } from './providers/openai'
import { GoogleAIService } from './providers/google'
import { AnthropicService } from './providers/anthropic'
import { XAIService } from './providers/xai'
import { DeepSeekService } from './providers/deepseek'
import { MistralService } from './providers/mistral'
import { KimiService } from './providers/kimi'
import { QwenService } from './providers/qwen'

export interface AIServiceInterface {
  generateText(prompt: string, options?: any): Promise<string>
  analyzeText(text: string, type: 'sentiment' | 'summary' | 'keywords'): Promise<any>
  translateText(text: string, from: string, to: string): Promise<string>
  analyzeDocument(document: any): Promise<any>
  generateCode(description: string, language: string): Promise<string>
  analyzeImage(image: any): Promise<any>
}

export class AIRouter {
  private services: Map<AIProviderType, AIServiceInterface> = new Map()
  private providers: Map<AIProviderType, AIProvider> = new Map()
  private usage: Map<AIProviderType, number> = new Map()
  private costs: Map<AIProviderType, number> = new Map()

  constructor() {
    this.initializeServices()
  }

  private initializeServices() {
    // Initialize all AI services
    this.services.set('openai', new OpenAIService())
    this.services.set('google', new GoogleAIService())
    this.services.set('anthropic', new AnthropicService())
    this.services.set('xai', new XAIService())
    this.services.set('deepseek', new DeepSeekService())
    this.services.set('mistral', new MistralService())
    this.services.set('kimi', new KimiService())
    this.services.set('qwen', new QwenService())
  }

  async loadProviders(): Promise<void> {
    try {
      // Load providers from database
      const { prisma } = await import('@/lib/database/prisma')
      const providers = await prisma.aIProvider.findMany({
        where: { isActive: true }
      })

      providers.forEach(provider => {
        this.providers.set(provider.type as AIProviderType, {
          id: provider.id,
          name: provider.name,
          type: provider.type as AIProviderType,
          apiKey: provider.apiKey,
          endpoint: provider.endpoint,
          isActive: provider.isActive,
          capabilities: provider.capabilities as AICapability[],
          usage: {
            totalRequests: provider.totalRequests || 0,
            totalTokens: provider.totalTokens || 0,
            cost: provider.cost || 0,
            lastUsed: provider.lastUsed || new Date(),
            monthlyLimit: provider.monthlyLimit || 0,
            currentMonthUsage: provider.currentMonthUsage || 0,
          }
        })
      })
    } catch (error) {
      console.error('Error loading AI providers:', error)
    }
  }

  getBestProvider(capability: AICapability, requirements?: {
    speed?: 'fast' | 'medium' | 'slow'
    quality?: 'high' | 'medium' | 'low'
    cost?: 'low' | 'medium' | 'high'
    language?: 'ar' | 'en' | 'both'
  }): AIProviderType | null {
    const availableProviders = Array.from(this.providers.entries())
      .filter(([type, provider]) => {
        return provider.isActive && 
               provider.capabilities.includes(capability) &&
               this.isWithinLimits(type)
      })

    if (availableProviders.length === 0) {
      return null
    }

    // Smart routing based on capability and requirements
    switch (capability) {
      case 'text_generation':
        if (requirements?.language === 'ar') {
          return this.selectProvider(['qwen', 'kimi', 'openai'], availableProviders)
        }
        return this.selectProvider(['openai', 'anthropic', 'google'], availableProviders)

      case 'text_analysis':
      case 'sentiment_analysis':
        return this.selectProvider(['anthropic', 'openai', 'google'], availableProviders)

      case 'translation':
        return this.selectProvider(['google', 'openai', 'qwen'], availableProviders)

      case 'code_generation':
        return this.selectProvider(['deepseek', 'openai', 'anthropic'], availableProviders)

      case 'document_analysis':
        return this.selectProvider(['anthropic', 'google', 'openai'], availableProviders)

      case 'image_analysis':
        return this.selectProvider(['google', 'openai', 'anthropic'], availableProviders)

      case 'summarization':
        return this.selectProvider(['anthropic', 'openai', 'mistral'], availableProviders)

      default:
        return availableProviders[0][0]
    }
  }

  private selectProvider(
    preferredOrder: AIProviderType[],
    availableProviders: [AIProviderType, AIProvider][]
  ): AIProviderType | null {
    for (const preferred of preferredOrder) {
      const found = availableProviders.find(([type]) => type === preferred)
      if (found) {
        return found[0]
      }
    }
    return availableProviders[0]?.[0] || null
  }

  private isWithinLimits(providerType: AIProviderType): boolean {
    const provider = this.providers.get(providerType)
    if (!provider) return false

    const currentUsage = this.usage.get(providerType) || 0
    const currentCost = this.costs.get(providerType) || 0

    return currentUsage < provider.usage.monthlyLimit &&
           currentCost < (provider.usage.monthlyLimit * 0.1) // Assume cost limit is 10% of request limit
  }

  async executeRequest(
    capability: AICapability,
    input: any,
    options?: {
      provider?: AIProviderType
      requirements?: any
      userId?: string
    }
  ): Promise<any> {
    const startTime = Date.now()
    let selectedProvider = options?.provider

    if (!selectedProvider) {
      selectedProvider = this.getBestProvider(capability, options?.requirements)
    }

    if (!selectedProvider) {
      throw new Error('لا يوجد مقدم خدمة ذكاء اصطناعي متاح لهذه المهمة')
    }

    const service = this.services.get(selectedProvider)
    if (!service) {
      throw new Error(`خدمة ${selectedProvider} غير متاحة`)
    }

    try {
      let result: any

      switch (capability) {
        case 'text_generation':
          result = await service.generateText(input.prompt, input.options)
          break
        case 'text_analysis':
        case 'sentiment_analysis':
          result = await service.analyzeText(input.text, input.type)
          break
        case 'translation':
          result = await service.translateText(input.text, input.from, input.to)
          break
        case 'document_analysis':
          result = await service.analyzeDocument(input.document)
          break
        case 'code_generation':
          result = await service.generateCode(input.description, input.language)
          break
        case 'image_analysis':
          result = await service.analyzeImage(input.image)
          break
        case 'summarization':
          result = await service.analyzeText(input.text, 'summary')
          break
        default:
          throw new Error(`قدرة غير مدعومة: ${capability}`)
      }

      const duration = Date.now() - startTime
      const tokens = this.estimateTokens(input, result)
      const cost = this.calculateCost(selectedProvider, tokens)

      // Update usage tracking
      this.updateUsage(selectedProvider, tokens, cost)

      // Log the request
      await this.logRequest({
        provider: selectedProvider,
        capability,
        input,
        output: result,
        tokens,
        cost,
        duration,
        status: 'completed',
        userId: options?.userId,
      })

      return result
    } catch (error) {
      const duration = Date.now() - startTime

      // Log the failed request
      await this.logRequest({
        provider: selectedProvider,
        capability,
        input,
        output: null,
        tokens: 0,
        cost: 0,
        duration,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        userId: options?.userId,
      })

      throw error
    }
  }

  private estimateTokens(input: any, output: any): number {
    // Simple token estimation - in production, use actual token counting
    const inputText = JSON.stringify(input)
    const outputText = JSON.stringify(output)
    return Math.ceil((inputText.length + outputText.length) / 4)
  }

  private calculateCost(provider: AIProviderType, tokens: number): number {
    // Cost calculation based on provider pricing
    const costPerToken: Record<AIProviderType, number> = {
      openai: 0.00002,
      google: 0.000015,
      anthropic: 0.000025,
      xai: 0.00001,
      deepseek: 0.000005,
      mistral: 0.00001,
      kimi: 0.000008,
      qwen: 0.000006,
    }

    return tokens * (costPerToken[provider] || 0.00001)
  }

  private updateUsage(provider: AIProviderType, tokens: number, cost: number) {
    const currentUsage = this.usage.get(provider) || 0
    const currentCost = this.costs.get(provider) || 0

    this.usage.set(provider, currentUsage + 1)
    this.costs.set(provider, currentCost + cost)
  }

  private async logRequest(request: Omit<AIRequest, 'id' | 'createdAt'>) {
    try {
      const { prisma } = await import('@/lib/database/prisma')
      await prisma.aIRequest.create({
        data: {
          ...request,
          createdAt: new Date(),
        }
      })
    } catch (error) {
      console.error('Error logging AI request:', error)
    }
  }

  async getUsageStats(provider?: AIProviderType): Promise<any> {
    try {
      const { prisma } = await import('@/lib/database/prisma')
      
      const where = provider ? { provider } : {}
      
      const stats = await prisma.aIRequest.groupBy({
        by: ['provider', 'status'],
        where: {
          ...where,
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
          }
        },
        _count: true,
        _sum: {
          tokens: true,
          cost: true,
        },
        _avg: {
          duration: true,
        }
      })

      return stats
    } catch (error) {
      console.error('Error getting usage stats:', error)
      return []
    }
  }

  async getProviderHealth(): Promise<Record<AIProviderType, 'healthy' | 'degraded' | 'down'>> {
    const health: Record<AIProviderType, 'healthy' | 'degraded' | 'down'> = {} as any

    for (const [providerType, service] of this.services.entries()) {
      try {
        // Simple health check - try a basic request
        await service.generateText('Test', { maxTokens: 10 })
        health[providerType] = 'healthy'
      } catch (error) {
        health[providerType] = 'down'
      }
    }

    return health
  }

  // Convenience methods for common operations
  async generateText(prompt: string, options?: any): Promise<string> {
    return this.executeRequest('text_generation', { prompt, options })
  }

  async analyzeText(text: string, type: 'sentiment' | 'summary' | 'keywords' = 'sentiment'): Promise<any> {
    return this.executeRequest('text_analysis', { text, type })
  }

  async translateText(text: string, from: string = 'auto', to: string = 'ar'): Promise<string> {
    return this.executeRequest('translation', { text, from, to })
  }

  async generateCode(description: string, language: string = 'typescript'): Promise<string> {
    return this.executeRequest('code_generation', { description, language })
  }

  async analyzeDocument(document: any): Promise<any> {
    return this.executeRequest('document_analysis', { document })
  }

  async analyzeImage(image: any): Promise<any> {
    return this.executeRequest('image_analysis', { image })
  }

  async summarizeText(text: string): Promise<string> {
    return this.executeRequest('summarization', { text, type: 'summary' })
  }
}

// Singleton instance
export const aiRouter = new AIRouter()

