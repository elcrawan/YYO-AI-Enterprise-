import { AIServiceInterface } from '../router'

export class DeepSeekService implements AIServiceInterface {
  private apiKey: string
  private baseUrl: string = 'https://api.deepseek.com/v1'

  constructor() {
    this.apiKey = process.env.DEEPSEEK_API_KEY || ''
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
          model: options?.model || 'deepseek-chat',
          messages,
          max_tokens: options?.maxTokens || 1000,
          temperature: options?.temperature || 0.7,
        }),
      })

      if (!response.ok) {
        throw new Error(`DeepSeek API error: ${response.status}`)
      }

      const data = await response.json()
      return data.choices?.[0]?.message?.content || ''
    } catch (error) {
      console.error('DeepSeek generateText error:', error)
      throw new Error('فشل في توليد النص باستخدام DeepSeek')
    }
  }

  async analyzeText(text: string, type: 'sentiment' | 'summary' | 'keywords'): Promise<any> {
    try {
      let prompt = ''
      let systemPrompt = ''

      switch (type) {
        case 'sentiment':
          systemPrompt = 'أنت محلل مشاعر تقني متقدم مع خبرة في التحليل العميق للنصوص التقنية والأكاديمية.'
          prompt = `حلل المشاعر في النص التالي مع التركيز على الجوانب التقنية والمنطقية:

النص: "${text}"

أعطِ النتيجة بصيغة JSON تحتوي على:
- sentiment: (positive/negative/neutral)
- confidence: (0-1)
- technical_sentiment: تحليل المشاعر التقنية
- logical_structure: تحليل البنية المنطقية
- emotions: مصفوفة من المشاعر المكتشفة
- reasoning: التبرير التقني للتحليل`
          break

        case 'summary':
          systemPrompt = 'أنت خبير في التلخيص التقني والأكاديمي مع قدرة على استخراج المعلومات الأساسية بدقة.'
          prompt = `لخص النص التالي بطريقة تقنية دقيقة مع الحفاظ على المعلومات الأساسية:

"${text}"

الملخص التقني:`
          break

        case 'keywords':
          systemPrompt = 'أنت خبير في استخراج المصطلحات التقنية والمفاهيم العلمية من النصوص المتخصصة.'
          prompt = `استخرج الكلمات المفتاحية والمصطلحات التقنية من النص التالي:

"${text}"

أعطِ النتيجة بصيغة JSON تحتوي على:
- technical_keywords: مصطلحات تقنية مع درجات الأهمية
- concepts: المفاهيم الأساسية
- entities: الكيانات التقنية
- methodologies: المنهجيات المذكورة
- tools_technologies: الأدوات والتقنيات`
          break
      }

      const result = await this.generateText(prompt, {
        systemPrompt,
        temperature: 0.2,
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
      console.error('DeepSeek analyzeText error:', error)
      throw new Error('فشل في تحليل النص باستخدام DeepSeek')
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

      const prompt = `ترجم النص التالي من ${fromLang} إلى ${toLang} مع الحفاظ على المصطلحات التقنية والدقة العلمية:

"${text}"

الترجمة التقنية:`

      return await this.generateText(prompt, {
        systemPrompt: 'أنت مترجم تقني متخصص في ترجمة النصوص العلمية والتقنية مع الحفاظ على دقة المصطلحات.',
        temperature: 0.2,
        maxTokens: Math.max(text.length * 2, 100),
      })
    } catch (error) {
      console.error('DeepSeek translateText error:', error)
      throw new Error('فشل في ترجمة النص باستخدام DeepSeek')
    }
  }

  async analyzeDocument(document: any): Promise<any> {
    try {
      const documentText = document.text || document.content || JSON.stringify(document)
      
      const prompt = `حلل المستند التالي تحليلاً تقنياً شاملاً مع التركيز على الجوانب المنهجية والتقنية:

المستند:
"${documentText}"

أعطِ التحليل التقني بصيغة JSON يحتوي على:
- document_type: نوع المستند التقني
- technical_summary: ملخص تقني
- key_findings: النتائج الرئيسية
- methodologies: المنهجيات المستخدمة
- technical_concepts: المفاهيم التقنية
- data_analysis: تحليل البيانات إن وجدت
- recommendations: توصيات تقنية
- implementation_notes: ملاحظات التنفيذ
- technical_requirements: المتطلبات التقنية`

      const result = await this.generateText(prompt, {
        systemPrompt: 'أنت محلل مستندات تقني متخصص في تحليل الوثائق العلمية والتقنية والأكاديمية.',
        temperature: 0.2,
        maxTokens: 1500,
      })

      try {
        return JSON.parse(result)
      } catch {
        return { analysis: result }
      }
    } catch (error) {
      console.error('DeepSeek analyzeDocument error:', error)
      throw new Error('فشل في تحليل المستند باستخدام DeepSeek')
    }
  }

  async generateCode(description: string, language: string): Promise<string> {
    try {
      const prompt = `اكتب كود ${language} محسن وعالي الجودة للمتطلب التالي:

المتطلب: ${description}

يرجى تضمين:
- كود محسن ومنظم
- تعليقات تقنية مفصلة
- معالجة شاملة للأخطاء
- اتباع أفضل الممارسات في ${language}
- تحسينات الأداء والذاكرة
- اختبارات وحدة إذا أمكن

الكود المحسن:`

      return await this.generateText(prompt, {
        systemPrompt: `أنت مطور برمجيات خبير ومتخصص في ${language} مع خبرة عميقة في كتابة كود محسن وعالي الأداء. ركز على الجودة والكفاءة.`,
        temperature: 0.1,
        maxTokens: 3000,
      })
    } catch (error) {
      console.error('DeepSeek generateCode error:', error)
      throw new Error('فشل في توليد الكود باستخدام DeepSeek')
    }
  }

  async analyzeImage(image: any): Promise<any> {
    try {
      // DeepSeek may have vision capabilities in newer models
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'deepseek-vl-chat', // Hypothetical vision model
          messages: [
            {
              role: 'system',
              content: 'أنت محلل صور تقني متخصص في تحليل الصور التقنية والمخططات والرسوم البيانية.'
            },
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: 'حلل هذه الصورة تحليلاً تقنياً مفصلاً، مع التركيز على العناصر التقنية والبيانات المرئية.'
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
          temperature: 0.2,
        }),
      })

      if (!response.ok) {
        // Fallback if vision model is not available
        return {
          description: 'تحليل الصور غير متاح حالياً في DeepSeek',
          model: 'deepseek-chat',
          note: 'يتطلب تحديث API لدعم تحليل الصور'
        }
      }

      const data = await response.json()
      
      return {
        description: data.choices?.[0]?.message?.content || '',
        model: 'deepseek-vl-chat'
      }
    } catch (error) {
      console.error('DeepSeek analyzeImage error:', error)
      return {
        description: 'تحليل الصور غير متاح حالياً في DeepSeek',
        model: 'deepseek-chat',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }
}

