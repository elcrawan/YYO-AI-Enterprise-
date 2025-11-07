import { AIServiceInterface } from '../router'

export class QwenService implements AIServiceInterface {
  private apiKey: string
  private baseUrl: string = 'https://dashscope.aliyuncs.com/api/v1'

  constructor() {
    this.apiKey = process.env.QWEN_API_KEY || ''
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

      const response = await fetch(`${this.baseUrl}/services/aigc/text-generation/generation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: options?.model || 'qwen-turbo',
          input: {
            messages,
          },
          parameters: {
            max_tokens: options?.maxTokens || 1000,
            temperature: options?.temperature || 0.7,
          }
        }),
      })

      if (!response.ok) {
        throw new Error(`Qwen API error: ${response.status}`)
      }

      const data = await response.json()
      return data.output?.choices?.[0]?.message?.content || ''
    } catch (error) {
      console.error('Qwen generateText error:', error)
      throw new Error('فشل في توليد النص باستخدام Qwen')
    }
  }

  async analyzeText(text: string, type: 'sentiment' | 'summary' | 'keywords'): Promise<any> {
    try {
      let prompt = ''
      let systemPrompt = ''

      switch (type) {
        case 'sentiment':
          systemPrompt = 'أنت محلل مشاعر متقدم متخصص في اللغة العربية والصينية مع فهم عميق للتعبيرات الثقافية.'
          prompt = `حلل المشاعر في النص التالي مع التركيز على التعبيرات الثقافية العربية والآسيوية:

النص: "${text}"

أعطِ النتيجة بصيغة JSON تحتوي على:
- sentiment: (positive/negative/neutral)
- confidence: (0-1)
- cultural_sentiment: تحليل المشاعر الثقافية
- emotions: مصفوفة من المشاعر مع السياق الثقافي
- linguistic_features: الخصائص اللغوية
- cultural_expressions: التعبيرات الثقافية
- summary: ملخص التحليل`
          break

        case 'summary':
          systemPrompt = 'أنت خبير في التلخيص الذكي مع قدرة خاصة على فهم النصوص العربية والآسيوية.'
          prompt = `لخص النص التالي مع الحفاظ على المعاني الثقافية والسياق:

"${text}"

الملخص الذكي:`
          break

        case 'keywords':
          systemPrompt = 'أنت خبير في استخراج الكلمات المفتاحية مع تخصص في المصطلحات العربية والآسيوية.'
          prompt = `استخرج الكلمات المفتاحية والمصطلحات من النص التالي:

"${text}"

أعطِ النتيجة بصيغة JSON تحتوي على:
- keywords: كلمات مفتاحية مع الأهمية
- arabic_terms: المصطلحات العربية
- cultural_keywords: كلمات مفتاحية ثقافية
- topics: المواضيع الرئيسية
- entities: الكيانات مع السياق
- semantic_concepts: المفاهيم الدلالية`
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
      console.error('Qwen analyzeText error:', error)
      throw new Error('فشل في تحليل النص باستخدام Qwen')
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
        'ru': 'الروسية',
        'auto': 'تلقائي'
      }

      const fromLang = languageNames[from] || from
      const toLang = languageNames[to] || to

      const prompt = `ترجم النص التالي من ${fromLang} إلى ${toLang} مع الحفاظ على المعنى الثقافي والأسلوب:

"${text}"

الترجمة المتقنة:`

      return await this.generateText(prompt, {
        systemPrompt: 'أنت مترجم خبير متخصص في الترجمة بين العربية والصينية واللغات الآسيوية مع فهم عميق للثقافات.',
        temperature: 0.3,
        maxTokens: Math.max(text.length * 2, 100),
      })
    } catch (error) {
      console.error('Qwen translateText error:', error)
      throw new Error('فشل في ترجمة النص باستخدام Qwen')
    }
  }

  async analyzeDocument(document: any): Promise<any> {
    try {
      const documentText = document.text || document.content || JSON.stringify(document)
      
      const prompt = `حلل المستند التالي تحليلاً شاملاً مع التركيز على المحتوى العربي والآسيوي:

المستند:
"${documentText}"

أعطِ التحليل الشامل بصيغة JSON يحتوي على:
- type: نوع المستند
- summary: ملخص شامل
- key_insights: الرؤى الرئيسية
- cultural_analysis: التحليل الثقافي
- language_characteristics: خصائص اللغة
- semantic_structure: البنية الدلالية
- topics: المواضيع مع التحليل الثقافي
- recommendations: توصيات مع مراعاة السياق الثقافي
- cross_cultural_notes: ملاحظات متعددة الثقافات
- linguistic_patterns: الأنماط اللغوية`

      const result = await this.generateText(prompt, {
        systemPrompt: 'أنت محلل مستندات خبير متخصص في تحليل النصوص العربية والآسيوية مع فهم عميق للسياقات الثقافية.',
        temperature: 0.3,
        maxTokens: 1500,
      })

      try {
        return JSON.parse(result)
      } catch {
        return { analysis: result }
      }
    } catch (error) {
      console.error('Qwen analyzeDocument error:', error)
      throw new Error('فشل في تحليل المستند باستخدام Qwen')
    }
  }

  async generateCode(description: string, language: string): Promise<string> {
    try {
      const prompt = `اكتب كود ${language} متقن للمتطلب التالي مع دعم Unicode والنصوص العربية:

المتطلب: ${description}

يرجى تضمين:
- كود عالي الجودة ومحسن
- دعم كامل للنصوص العربية والآسيوية
- تعليقات بالعربية والإنجليزية
- معالجة أخطاء شاملة
- أفضل الممارسات الدولية
- تحسينات للأداء مع النصوص متعددة البايت

الكود المتقن:`

      return await this.generateText(prompt, {
        systemPrompt: `أنت مطور برمجيات خبير في ${language} مع تخصص في التطبيقات متعددة اللغات والثقافات، خاصة العربية والآسيوية.`,
        temperature: 0.2,
        maxTokens: 2500,
      })
    } catch (error) {
      console.error('Qwen generateCode error:', error)
      throw new Error('فشل في توليد الكود باستخدام Qwen')
    }
  }

  async analyzeImage(image: any): Promise<any> {
    try {
      // Qwen has vision capabilities
      const response = await fetch(`${this.baseUrl}/services/aigc/multimodal-generation/generation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'qwen-vl-plus',
          input: {
            messages: [
              {
                role: 'system',
                content: 'أنت محلل صور ذكي متخصص في فهم الصور مع السياق الثقافي العربي والآسيوي.'
              },
              {
                role: 'user',
                content: [
                  {
                    type: 'text',
                    text: 'حلل هذه الصورة تحليلاً شاملاً مع مراعاة السياق الثقافي، وأعطِ وصفاً تفصيلياً لجميع العناصر المرئية.'
                  },
                  {
                    type: 'image',
                    image: image.url || `data:${image.mimeType || 'image/jpeg'};base64,${image.data}`
                  }
                ]
              }
            ]
          },
          parameters: {
            max_tokens: 1000,
            temperature: 0.3,
          }
        }),
      })

      if (!response.ok) {
        // Fallback if vision model is not available
        return {
          description: 'تحليل الصور غير متاح حالياً في Qwen',
          model: 'qwen-turbo',
          note: 'يتطلب تحديث API لدعم تحليل الصور'
        }
      }

      const data = await response.json()
      
      return {
        description: data.output?.choices?.[0]?.message?.content || '',
        model: 'qwen-vl-plus'
      }
    } catch (error) {
      console.error('Qwen analyzeImage error:', error)
      return {
        description: 'تحليل الصور غير متاح حالياً في Qwen',
        model: 'qwen-turbo',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }
}

