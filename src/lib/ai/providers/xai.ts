import { AIServiceInterface } from '../router'

export class XAIService implements AIServiceInterface {
  private apiKey: string
  private baseUrl: string = 'https://api.x.ai/v1'

  constructor() {
    this.apiKey = process.env.XAI_API_KEY || ''
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
          model: options?.model || 'grok-beta',
          messages,
          max_tokens: options?.maxTokens || 1000,
          temperature: options?.temperature || 0.7,
        }),
      })

      if (!response.ok) {
        throw new Error(`xAI API error: ${response.status}`)
      }

      const data = await response.json()
      return data.choices?.[0]?.message?.content || ''
    } catch (error) {
      console.error('xAI generateText error:', error)
      throw new Error('فشل في توليد النص باستخدام xAI Grok')
    }
  }

  async analyzeText(text: string, type: 'sentiment' | 'summary' | 'keywords'): Promise<any> {
    try {
      let prompt = ''
      let systemPrompt = ''

      switch (type) {
        case 'sentiment':
          systemPrompt = 'أنت محلل مشاعر متقدم مع قدرات تحليل سياقية عميقة. قم بتحليل المشاعر بدقة عالية.'
          prompt = `حلل المشاعر في النص التالي مع التركيز على السياق والمعاني الضمنية:

النص: "${text}"

أعطِ النتيجة بصيغة JSON تحتوي على:
- sentiment: (positive/negative/neutral)
- confidence: (0-1)
- emotions: مصفوفة من المشاعر المكتشفة مع درجات الثقة
- context_analysis: تحليل السياق
- implicit_meanings: المعاني الضمنية
- summary: ملخص التحليل`
          break

        case 'summary':
          systemPrompt = 'أنت خبير في التلخيص الذكي مع قدرة على فهم السياق العميق والمعاني المهمة.'
          prompt = `لخص النص التالي بطريقة ذكية تحافظ على المعلومات الأساسية والسياق:

"${text}"

الملخص الذكي:`
          break

        case 'keywords':
          systemPrompt = 'أنت خبير في استخراج الكلمات المفتاحية والمفاهيم مع فهم عميق للسياق والعلاقات.'
          prompt = `استخرج الكلمات المفتاحية والمفاهيم من النص التالي مع تحليل العلاقات:

"${text}"

أعطِ النتيجة بصيغة JSON تحتوي على:
- keywords: مصفوفة من الكلمات المفتاحية مع درجات الأهمية
- topics: المواضيع الرئيسية
- entities: الكيانات المذكورة
- relationships: العلاقات بين المفاهيم
- context_keywords: كلمات مفتاحية سياقية`
          break
      }

      const result = await this.generateText(prompt, {
        systemPrompt,
        temperature: 0.3,
        maxTokens: 800,
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
      console.error('xAI analyzeText error:', error)
      throw new Error('فشل في تحليل النص باستخدام xAI Grok')
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

      const prompt = `ترجم النص التالي من ${fromLang} إلى ${toLang} مع الحفاظ على المعنى والنبرة والسياق الثقافي:

"${text}"

الترجمة الذكية:`

      return await this.generateText(prompt, {
        systemPrompt: 'أنت مترجم ذكي متقدم مع فهم عميق للسياق الثقافي والمعاني الضمنية في اللغات المختلفة.',
        temperature: 0.3,
        maxTokens: Math.max(text.length * 2, 100),
      })
    } catch (error) {
      console.error('xAI translateText error:', error)
      throw new Error('فشل في ترجمة النص باستخدام xAI Grok')
    }
  }

  async analyzeDocument(document: any): Promise<any> {
    try {
      const documentText = document.text || document.content || JSON.stringify(document)
      
      const prompt = `حلل المستند التالي بطريقة ذكية وشاملة مع التركيز على الأنماط والاتجاهات:

المستند:
"${documentText}"

أعطِ التحليل الذكي بصيغة JSON يحتوي على:
- type: نوع المستند
- summary: ملخص ذكي للمحتوى
- key_insights: الرؤى الرئيسية
- patterns: الأنماط المكتشفة
- trends: الاتجاهات
- sentiment: تحليل المشاعر العام
- topics: المواضيع مع درجات الأهمية
- recommendations: توصيات ذكية
- risk_assessment: تقييم المخاطر
- strategic_implications: الآثار الاستراتيجية`

      const result = await this.generateText(prompt, {
        systemPrompt: 'أنت محلل مستندات ذكي متقدم مع قدرات تحليل استراتيجي وفهم عميق للأنماط والاتجاهات.',
        temperature: 0.3,
        maxTokens: 1500,
      })

      try {
        return JSON.parse(result)
      } catch {
        return { analysis: result }
      }
    } catch (error) {
      console.error('xAI analyzeDocument error:', error)
      throw new Error('فشل في تحليل المستند باستخدام xAI Grok')
    }
  }

  async generateCode(description: string, language: string): Promise<string> {
    try {
      const prompt = `اكتب كود ${language} متقدم وذكي للمتطلب التالي:

المتطلب: ${description}

يرجى تضمين:
- كود محسن وفعال
- معالجة شاملة للأخطاء
- تعليقات توضيحية ذكية
- أفضل الممارسات المتقدمة
- تحسينات الأداء

الكود المتقدم:`

      return await this.generateText(prompt, {
        systemPrompt: `أنت مطور برمجيات متقدم وخبير في ${language} مع قدرات تحليل وتحسين الكود. اكتب كود عالي الجودة ومحسن.`,
        temperature: 0.2,
        maxTokens: 2500,
      })
    } catch (error) {
      console.error('xAI generateCode error:', error)
      throw new Error('فشل في توليد الكود باستخدام xAI Grok')
    }
  }

  async analyzeImage(image: any): Promise<any> {
    try {
      // Note: xAI Grok may not have direct image analysis capabilities yet
      // This is a placeholder implementation that could be updated when available
      
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'grok-vision-beta', // Hypothetical model name
          messages: [
            {
              role: 'system',
              content: 'أنت محلل صور ذكي متقدم مع قدرات تحليل بصري عميق.'
            },
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: 'حلل هذه الصورة بطريقة ذكية وشاملة، وأعطِ وصفاً تفصيلياً مع تحليل السياق والمعاني الضمنية.'
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
          max_tokens: 1000,
          temperature: 0.3,
        }),
      })

      if (!response.ok) {
        // Fallback to text-based analysis if image analysis is not available
        return {
          description: 'تحليل الصور غير متاح حالياً في xAI Grok',
          model: 'grok-beta',
          note: 'يتطلب تحديث API لدعم تحليل الصور'
        }
      }

      const data = await response.json()
      
      return {
        description: data.choices?.[0]?.message?.content || '',
        model: 'grok-vision-beta'
      }
    } catch (error) {
      console.error('xAI analyzeImage error:', error)
      return {
        description: 'تحليل الصور غير متاح حالياً في xAI Grok',
        model: 'grok-beta',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }
}

