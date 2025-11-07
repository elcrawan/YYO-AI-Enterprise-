import { AIServiceInterface } from '../router'

export class KimiService implements AIServiceInterface {
  private apiKey: string
  private baseUrl: string = 'https://api.moonshot.cn/v1'

  constructor() {
    this.apiKey = process.env.KIMI_API_KEY || ''
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
          model: options?.model || 'moonshot-v1-8k',
          messages,
          max_tokens: options?.maxTokens || 1000,
          temperature: options?.temperature || 0.7,
        }),
      })

      if (!response.ok) {
        throw new Error(`Kimi API error: ${response.status}`)
      }

      const data = await response.json()
      return data.choices?.[0]?.message?.content || ''
    } catch (error) {
      console.error('Kimi generateText error:', error)
      throw new Error('فشل في توليد النص باستخدام Kimi')
    }
  }

  async analyzeText(text: string, type: 'sentiment' | 'summary' | 'keywords'): Promise<any> {
    try {
      let prompt = ''
      let systemPrompt = ''

      switch (type) {
        case 'sentiment':
          systemPrompt = 'أنت محلل مشاعر متخصص في فهم النصوص العربية والصينية والإنجليزية مع حساسية ثقافية عالية.'
          prompt = `حلل المشاعر في النص التالي مع مراعاة السياق الثقافي:

النص: "${text}"

أعطِ النتيجة بصيغة JSON تحتوي على:
- sentiment: (positive/negative/neutral)
- confidence: (0-1)
- cultural_context: السياق الثقافي
- emotions: مصفوفة من المشاعر مع الاعتبارات الثقافية
- language_nuances: الفروق اللغوية الدقيقة
- summary: ملخص التحليل`
          break

        case 'summary':
          systemPrompt = 'أنت خبير في التلخيص متعدد اللغات مع فهم عميق للسياق الثقافي والمعاني الضمنية.'
          prompt = `لخص النص التالي مع مراعاة السياق الثقافي والمعاني الضمنية:

"${text}"

الملخص الثقافي:`
          break

        case 'keywords':
          systemPrompt = 'أنت خبير في استخراج الكلمات المفتاحية متعدد اللغات مع فهم للمصطلحات الثقافية.'
          prompt = `استخرج الكلمات المفتاحية والمصطلحات الثقافية من النص التالي:

"${text}"

أعطِ النتيجة بصيغة JSON تحتوي على:
- keywords: كلمات مفتاحية مع الترجمات إذا لزم الأمر
- cultural_terms: المصطلحات الثقافية
- topics: المواضيع الرئيسية
- entities: الكيانات مع السياق الثقافي
- cross_cultural_concepts: المفاهيم متعددة الثقافات`
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
      console.error('Kimi analyzeText error:', error)
      throw new Error('فشل في تحليل النص باستخدام Kimi')
    }
  }

  async translateText(text: string, from: string, to: string): Promise<string> {
    try {
      const languageNames: Record<string, string> = {
        'ar': 'العربية',
        'en': 'الإنجليزية',
        'zh': 'الصينية',
        'ja': 'اليابانية',
        'ko': 'الكورية',
        'fr': 'الفرنسية',
        'es': 'الإسبانية',
        'de': 'الألمانية',
        'auto': 'تلقائي'
      }

      const fromLang = languageNames[from] || from
      const toLang = languageNames[to] || to

      const prompt = `ترجم النص التالي من ${fromLang} إلى ${toLang} مع مراعاة السياق الثقافي والمعاني الضمنية:

"${text}"

الترجمة الثقافية:`

      return await this.generateText(prompt, {
        systemPrompt: 'أنت مترجم متخصص في الترجمة متعددة اللغات مع خبرة خاصة في اللغات الآسيوية والعربية. احرص على نقل المعنى الثقافي بدقة.',
        temperature: 0.3,
        maxTokens: Math.max(text.length * 2, 100),
      })
    } catch (error) {
      console.error('Kimi translateText error:', error)
      throw new Error('فشل في ترجمة النص باستخدام Kimi')
    }
  }

  async analyzeDocument(document: any): Promise<any> {
    try {
      const documentText = document.text || document.content || JSON.stringify(document)
      
      const prompt = `حلل المستند التالي مع مراعاة السياق الثقافي والمعاني متعددة اللغات:

المستند:
"${documentText}"

أعطِ التحليل الثقافي بصيغة JSON يحتوي على:
- type: نوع المستند
- summary: ملخص مع السياق الثقافي
- key_points: النقاط الرئيسية
- cultural_context: السياق الثقافي
- language_analysis: تحليل اللغة المستخدمة
- cross_cultural_insights: رؤى متعددة الثقافات
- topics: المواضيع مع الاعتبارات الثقافية
- recommendations: توصيات مع مراعاة الثقافة
- sensitivity_notes: ملاحظات الحساسية الثقافية`

      const result = await this.generateText(prompt, {
        systemPrompt: 'أنت محلل مستندات متخصص في التحليل متعدد الثقافات مع فهم عميق للسياقات الثقافية المختلفة.',
        temperature: 0.3,
        maxTokens: 1500,
      })

      try {
        return JSON.parse(result)
      } catch {
        return { analysis: result }
      }
    } catch (error) {
      console.error('Kimi analyzeDocument error:', error)
      throw new Error('فشل في تحليل المستند باستخدام Kimi')
    }
  }

  async generateCode(description: string, language: string): Promise<string> {
    try {
      const prompt = `اكتب كود ${language} للمتطلب التالي مع تعليقات متعددة اللغات:

المتطلب: ${description}

يرجى تضمين:
- كود واضح ومنظم
- تعليقات بالعربية والإنجليزية
- معالجة أخطاء شاملة
- أفضل الممارسات الدولية
- دعم Unicode والنصوص متعددة اللغات

الكود متعدد اللغات:`

      return await this.generateText(prompt, {
        systemPrompt: `أنت مطور برمجيات متخصص في ${language} مع خبرة في التطبيقات متعددة اللغات والثقافات. ركز على الدعم الدولي.`,
        temperature: 0.2,
        maxTokens: 2500,
      })
    } catch (error) {
      console.error('Kimi generateCode error:', error)
      throw new Error('فشل في توليد الكود باستخدام Kimi')
    }
  }

  async analyzeImage(image: any): Promise<any> {
    try {
      // Kimi may have vision capabilities
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'moonshot-v1-vision', // Hypothetical vision model
          messages: [
            {
              role: 'system',
              content: 'أنت محلل صور متخصص في فهم الصور من مختلف الثقافات مع حساسية للسياق الثقافي.'
            },
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: 'حلل هذه الصورة مع مراعاة السياق الثقافي والمعاني الضمنية، وأعطِ وصفاً شاملاً.'
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
        // Fallback if vision model is not available
        return {
          description: 'تحليل الصور غير متاح حالياً في Kimi',
          model: 'moonshot-v1-8k',
          note: 'يتطلب تحديث API لدعم تحليل الصور'
        }
      }

      const data = await response.json()
      
      return {
        description: data.choices?.[0]?.message?.content || '',
        model: 'moonshot-v1-vision'
      }
    } catch (error) {
      console.error('Kimi analyzeImage error:', error)
      return {
        description: 'تحليل الصور غير متاح حالياً في Kimi',
        model: 'moonshot-v1-8k',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }
}

