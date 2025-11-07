import { AIServiceInterface } from '../router'

export class MistralService implements AIServiceInterface {
  private apiKey: string
  private baseUrl: string = 'https://api.mistral.ai/v1'

  constructor() {
    this.apiKey = process.env.MISTRAL_API_KEY || ''
  }

  async generateText(prompt: string, options?: {
    model?: string
    maxTokens?: number
    temperature?: number
    systemPrompt?: string
  }): Promise<string> {
    try {
      const messages: any[] = []
      
      if (options?.systemPrompt) {
        messages.push({
          role: 'system',
          content: options.systemPrompt
        })
      }
      
      messages.push({
        role: 'user',
        content: prompt
      })

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: options?.model || 'mistral-large-latest',
          messages,
          max_tokens: options?.maxTokens || 1000,
          temperature: options?.temperature || 0.7,
        }),
      })

      if (!response.ok) {
        throw new Error(`Mistral API error: ${response.status}`)
      }

      const data = await response.json()
      return data.choices?.[0]?.message?.content || ''
    } catch (error) {
      console.error('Mistral generateText error:', error)
      throw new Error('فشل في توليد النص باستخدام Mistral')
    }
  }

  async analyzeText(text: string, type: 'sentiment' | 'summary' | 'keywords'): Promise<any> {
    try {
      let prompt = ''
      let systemPrompt = ''

      switch (type) {
        case 'sentiment':
          systemPrompt = 'أنت محلل مشاعر سريع ودقيق مع قدرة على التحليل الفوري للنصوص.'
          prompt = `حلل المشاعر في النص التالي بسرعة ودقة:

النص: "${text}"

أعطِ النتيجة بصيغة JSON تحتوي على:
- sentiment: (positive/negative/neutral)
- confidence: (0-1)
- emotions: مصفوفة من المشاعر الأساسية
- intensity: شدة المشاعر (low/medium/high)
- summary: ملخص سريع للتحليل`
          break

        case 'summary':
          systemPrompt = 'أنت خبير في التلخيص السريع والفعال مع الحفاظ على المعلومات الأساسية.'
          prompt = `لخص النص التالي بطريقة سريعة وفعالة:

"${text}"

الملخص السريع:`
          break

        case 'keywords':
          systemPrompt = 'أنت خبير في الاستخراج السريع للكلمات المفتاحية والمفاهيم الأساسية.'
          prompt = `استخرج الكلمات المفتاحية الأساسية من النص التالي:

"${text}"

أعطِ النتيجة بصيغة JSON تحتوي على:
- keywords: مصفوفة من الكلمات المفتاحية الأساسية
- main_topics: المواضيع الرئيسية
- entities: الكيانات المهمة
- categories: التصنيفات`
          break
      }

      const result = await this.generateText(prompt, {
        systemPrompt,
        temperature: 0.3,
        maxTokens: 600,
      })

      // Try to parse as JSON for structured responses
      if (type === 'sentiment' || type === 'keywords') {
        try {
          return JSON.parse(result)
        } catch {
          return { raw: result }
        }
      }

      return result
    } catch (error) {
      console.error('Mistral analyzeText error:', error)
      throw new Error('فشل في تحليل النص باستخدام Mistral')
    }
  }

  async translateText(text: string, from: string, to: string): Promise<string> {
    try {
      const languageNames: Record<string, string> = {
        'ar': 'العربية',
        'en': 'الإنجليزية',
        'fr': 'الفرنسية',
        'es': 'الإسبانية',
        'de': 'الألمانية',
        'auto': 'تلقائي'
      }

      const fromLang = languageNames[from] || from
      const toLang = languageNames[to] || to

      const prompt = `ترجم النص التالي من ${fromLang} إلى ${toLang} بسرعة ودقة:

"${text}"

الترجمة:`

      return await this.generateText(prompt, {
        systemPrompt: 'أنت مترجم سريع ودقيق متخصص في الترجمة الفورية بين اللغات المختلفة.',
        temperature: 0.3,
        maxTokens: Math.max(text.length * 2, 100),
      })
    } catch (error) {
      console.error('Mistral translateText error:', error)
      throw new Error('فشل في ترجمة النص باستخدام Mistral')
    }
  }

  async analyzeDocument(document: any): Promise<any> {
    try {
      const documentText = document.text || document.content || JSON.stringify(document)
      
      const prompt = `حلل المستند التالي بطريقة سريعة وشاملة:

المستند:
"${documentText}"

أعطِ التحليل السريع بصيغة JSON يحتوي على:
- type: نوع المستند
- summary: ملخص سريع
- key_points: النقاط الرئيسية (أهم 5 نقاط)
- sentiment: المشاعر العامة
- main_topics: المواضيع الأساسية
- quick_recommendations: توصيات سريعة
- urgency_level: مستوى الأولوية (low/medium/high)`

      const result = await this.generateText(prompt, {
        systemPrompt: 'أنت محلل مستندات سريع متخصص في التحليل الفوري والفعال للوثائق.',
        temperature: 0.3,
        maxTokens: 1000,
      })

      try {
        return JSON.parse(result)
      } catch {
        return { analysis: result }
      }
    } catch (error) {
      console.error('Mistral analyzeDocument error:', error)
      throw new Error('فشل في تحليل المستند باستخدام Mistral')
    }
  }

  async generateCode(description: string, language: string): Promise<string> {
    try {
      const prompt = `اكتب كود ${language} سريع وفعال للمتطلب التالي:

المتطلب: ${description}

يرجى تضمين:
- كود بسيط وفعال
- تعليقات أساسية
- معالجة أخطاء أساسية
- حل مباشر وسريع

الكود:`

      return await this.generateText(prompt, {
        systemPrompt: `أنت مطور برمجيات سريع ومتخصص في ${language}. ركز على الحلول البسيطة والفعالة.`,
        temperature: 0.2,
        maxTokens: 2000,
      })
    } catch (error) {
      console.error('Mistral generateCode error:', error)
      throw new Error('فشل في توليد الكود باستخدام Mistral')
    }
  }

  async analyzeImage(image: any): Promise<any> {
    try {
      // Mistral may have vision capabilities in newer models
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'pixtral-12b-2409', // Mistral's vision model
          messages: [
            {
              role: 'system',
              content: 'أنت محلل صور سريع وفعال. قدم تحليلاً مباشراً وواضحاً للصور.'
            },
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: 'حلل هذه الصورة بسرعة وأعطِ وصفاً واضحاً ومباشراً لمحتواها.'
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: image.url || `data:${image.mimeType || 'image/jpeg'};base64,${image.data}`
                  }
                }
              ]
            }
          ],
          max_tokens: 800,
          temperature: 0.3,
        }),
      })

      if (!response.ok) {
        // Fallback if vision model is not available
        return {
          description: 'تحليل الصور غير متاح حالياً في Mistral',
          model: 'mistral-large-latest',
          note: 'يتطلب تحديث API لدعم تحليل الصور'
        }
      }

      const data = await response.json()
      
      return {
        description: data.choices?.[0]?.message?.content || '',
        model: 'pixtral-12b-2409'
      }
    } catch (error) {
      console.error('Mistral analyzeImage error:', error)
      return {
        description: 'تحليل الصور غير متاح حالياً في Mistral',
        model: 'mistral-large-latest',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }
}

