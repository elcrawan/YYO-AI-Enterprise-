import { AIServiceInterface } from '../router'

export class AnthropicService implements AIServiceInterface {
  private apiKey: string
  private baseUrl: string = 'https://api.anthropic.com/v1'

  constructor() {
    this.apiKey = process.env.ANTHROPIC_API_KEY || ''
  }

  async generateText(prompt: string, options?: {
    model?: string
    maxTokens?: number
    temperature?: number
    systemPrompt?: string
  }): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: options?.model || 'claude-3-sonnet-20240229',
          max_tokens: options?.maxTokens || 1000,
          temperature: options?.temperature || 0.7,
          system: options?.systemPrompt || 'أنت مساعد ذكي ومفيد يتحدث العربية بطلاقة.',
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ]
        }),
      })

      if (!response.ok) {
        throw new Error(`Anthropic API error: ${response.status}`)
      }

      const data = await response.json()
      return data.content?.[0]?.text || ''
    } catch (error) {
      console.error('Anthropic generateText error:', error)
      throw new Error('فشل في توليد النص باستخدام Anthropic')
    }
  }

  async analyzeText(text: string, type: 'sentiment' | 'summary' | 'keywords'): Promise<any> {
    try {
      let prompt = ''
      let systemPrompt = ''

      switch (type) {
        case 'sentiment':
          systemPrompt = 'أنت محلل مشاعر خبير. قم بتحليل المشاعر في النص المعطى وأعطِ النتيجة بصيغة JSON دقيقة.'
          prompt = `حلل المشاعر في النص التالي وأعطِ النتيجة بالتفصيل:

النص: "${text}"

أعطِ النتيجة بصيغة JSON تحتوي على:
- sentiment: (positive/negative/neutral)
- confidence: (0-1)
- emotions: مصفوفة من المشاعر المكتشفة مع درجات الثقة
- summary: ملخص قصير للتحليل
- reasoning: التبرير وراء التحليل`
          break

        case 'summary':
          systemPrompt = 'أنت خبير في تلخيص النصوص بطريقة دقيقة ومفيدة. احرص على الحفاظ على المعلومات المهمة.'
          prompt = `لخص النص التالي بشكل مفيد ومختصر مع الحفاظ على النقاط الرئيسية:

"${text}"

الملخص:`
          break

        case 'keywords':
          systemPrompt = 'أنت خبير في استخراج الكلمات المفتاحية والمفاهيم المهمة من النصوص.'
          prompt = `استخرج الكلمات المفتاحية الأكثر أهمية من النص التالي:

"${text}"

أعطِ النتيجة بصيغة JSON تحتوي على:
- keywords: مصفوفة من الكلمات المفتاحية مع درجات الأهمية
- topics: المواضيع الرئيسية
- entities: الكيانات المذكورة (أشخاص، أماكن، منظمات)
- concepts: المفاهيم الأساسية`
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
      console.error('Anthropic analyzeText error:', error)
      throw new Error('فشل في تحليل النص باستخدام Anthropic')
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

      const prompt = `ترجم النص التالي من ${fromLang} إلى ${toLang} مع الحفاظ على المعنى والسياق:

"${text}"

الترجمة:`

      return await this.generateText(prompt, {
        systemPrompt: 'أنت مترجم محترف متخصص في الترجمة الدقيقة بين اللغات مع الحفاظ على المعنى والسياق الثقافي.',
        temperature: 0.3,
        maxTokens: Math.max(text.length * 2, 100),
      })
    } catch (error) {
      console.error('Anthropic translateText error:', error)
      throw new Error('فشل في ترجمة النص باستخدام Anthropic')
    }
  }

  async analyzeDocument(document: any): Promise<any> {
    try {
      const documentText = document.text || document.content || JSON.stringify(document)
      
      const prompt = `حلل المستند التالي وأعطِ تحليلاً شاملاً ومفصلاً:

المستند:
"${documentText}"

أعطِ التحليل بصيغة JSON يحتوي على:
- type: نوع المستند
- summary: ملخص شامل للمحتوى
- key_points: النقاط الرئيسية مرتبة حسب الأهمية
- sentiment: تحليل المشاعر العام مع التبرير
- topics: المواضيع المطروحة مع التفاصيل
- recommendations: توصيات أو إجراءات مقترحة
- risks: المخاطر المحتملة إن وجدت
- opportunities: الفرص المتاحة إن وجدت`

      const result = await this.generateText(prompt, {
        systemPrompt: 'أنت محلل مستندات خبير متخصص في تقديم تحليلات شاملة ودقيقة للمستندات المختلفة.',
        temperature: 0.3,
        maxTokens: 1500,
      })

      try {
        return JSON.parse(result)
      } catch {
        return { analysis: result }
      }
    } catch (error) {
      console.error('Anthropic analyzeDocument error:', error)
      throw new Error('فشل في تحليل المستند باستخدام Anthropic')
    }
  }

  async generateCode(description: string, language: string): Promise<string> {
    try {
      const prompt = `اكتب كود ${language} للمتطلب التالي مع التوثيق والتعليقات:

المتطلب: ${description}

يرجى تضمين:
- الكود الكامل والوظيفي
- التعليقات التوضيحية
- معالجة الأخطاء إذا لزم الأمر
- أفضل الممارسات في البرمجة

الكود:`

      return await this.generateText(prompt, {
        systemPrompt: `أنت مطور برمجيات خبير متخصص في ${language}. اكتب كود نظيف وموثق وقابل للصيانة مع اتباع أفضل الممارسات.`,
        temperature: 0.2,
        maxTokens: 2500,
      })
    } catch (error) {
      console.error('Anthropic generateCode error:', error)
      throw new Error('فشل في توليد الكود باستخدام Anthropic')
    }
  }

  async analyzeImage(image: any): Promise<any> {
    try {
      // Anthropic Claude 3 Vision capabilities
      const response = await fetch(`${this.baseUrl}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-3-sonnet-20240229',
          max_tokens: 1000,
          temperature: 0.3,
          system: 'أنت محلل صور خبير. قم بتحليل الصور وتقديم وصف تفصيلي ودقيق.',
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: 'حلل هذه الصورة وأعطِ وصفاً تفصيلياً شاملاً لمحتواها، بما في ذلك العناصر المرئية والنص إن وجد، والسياق العام.'
                },
                {
                  type: 'image',
                  source: {
                    type: 'base64',
                    media_type: image.mimeType || 'image/jpeg',
                    data: image.data
                  }
                }
              ]
            }
          ]
        }),
      })

      if (!response.ok) {
        throw new Error(`Anthropic Vision API error: ${response.status}`)
      }

      const data = await response.json()
      
      return {
        description: data.content?.[0]?.text || '',
        model: 'claude-3-sonnet-20240229'
      }
    } catch (error) {
      console.error('Anthropic analyzeImage error:', error)
      throw new Error('فشل في تحليل الصورة باستخدام Anthropic')
    }
  }
}

