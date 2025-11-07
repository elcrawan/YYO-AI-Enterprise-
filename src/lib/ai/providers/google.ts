import { AIServiceInterface } from '../router'

export class GoogleAIService implements AIServiceInterface {
  private apiKey: string
  private baseUrl: string = 'https://generativelanguage.googleapis.com/v1beta'

  constructor() {
    this.apiKey = process.env.GOOGLE_AI_API_KEY || ''
  }

  async generateText(prompt: string, options?: {
    model?: string
    maxTokens?: number
    temperature?: number
    systemPrompt?: string
  }): Promise<string> {
    try {
      const model = options?.model || 'gemini-pro'
      const url = `${this.baseUrl}/models/${model}:generateContent?key=${this.apiKey}`

      const messages = []
      if (options?.systemPrompt) {
        messages.push({
          role: 'user',
          parts: [{ text: options.systemPrompt }]
        })
      }
      messages.push({
        role: 'user',
        parts: [{ text: prompt }]
      })

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: messages,
          generationConfig: {
            temperature: options?.temperature || 0.7,
            maxOutputTokens: options?.maxTokens || 1000,
          },
        }),
      })

      if (!response.ok) {
        throw new Error(`Google AI API error: ${response.status}`)
      }

      const data = await response.json()
      return data.candidates?.[0]?.content?.parts?.[0]?.text || ''
    } catch (error) {
      console.error('Google AI generateText error:', error)
      throw new Error('فشل في توليد النص باستخدام Google AI')
    }
  }

  async analyzeText(text: string, type: 'sentiment' | 'summary' | 'keywords'): Promise<any> {
    try {
      let prompt = ''
      
      switch (type) {
        case 'sentiment':
          prompt = `حلل المشاعر في النص التالي وأعطِ النتيجة بصيغة JSON:

النص: "${text}"

أعطِ النتيجة بصيغة JSON تحتوي على:
- sentiment: (positive/negative/neutral)
- confidence: (0-1)
- emotions: مصفوفة من المشاعر المكتشفة
- summary: ملخص قصير للتحليل`
          break

        case 'summary':
          prompt = `لخص النص التالي بشكل مفيد ومختصر:

"${text}"

الملخص:`
          break

        case 'keywords':
          prompt = `استخرج الكلمات المفتاحية الأكثر أهمية من النص التالي:

"${text}"

أعطِ النتيجة بصيغة JSON تحتوي على:
- keywords: مصفوفة من الكلمات المفتاحية
- topics: المواضيع الرئيسية
- entities: الكيانات المذكورة`
          break
      }

      const result = await this.generateText(prompt, {
        temperature: 0.3,
        maxTokens: 500,
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
      console.error('Google AI analyzeText error:', error)
      throw new Error('فشل في تحليل النص باستخدام Google AI')
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

      const prompt = `ترجم النص التالي من ${fromLang} إلى ${toLang}:

"${text}"

الترجمة:`

      return await this.generateText(prompt, {
        temperature: 0.3,
        maxTokens: Math.max(text.length * 2, 100),
      })
    } catch (error) {
      console.error('Google AI translateText error:', error)
      throw new Error('فشل في ترجمة النص باستخدام Google AI')
    }
  }

  async analyzeDocument(document: any): Promise<any> {
    try {
      const documentText = document.text || document.content || JSON.stringify(document)
      
      const prompt = `حلل المستند التالي وأعطِ تحليلاً شاملاً:

المستند:
"${documentText}"

أعطِ التحليل بصيغة JSON يحتوي على:
- type: نوع المستند
- summary: ملخص المحتوى
- key_points: النقاط الرئيسية
- sentiment: تحليل المشاعر العام
- topics: المواضيع المطروحة
- recommendations: توصيات أو إجراءات مقترحة`

      const result = await this.generateText(prompt, {
        temperature: 0.3,
        maxTokens: 1000,
      })

      try {
        return JSON.parse(result)
      } catch {
        return { analysis: result }
      }
    } catch (error) {
      console.error('Google AI analyzeDocument error:', error)
      throw new Error('فشل في تحليل المستند باستخدام Google AI')
    }
  }

  async generateCode(description: string, language: string): Promise<string> {
    try {
      const prompt = `اكتب كود ${language} للمتطلب التالي:

المتطلب: ${description}

الكود:`

      return await this.generateText(prompt, {
        temperature: 0.2,
        maxTokens: 2000,
        systemPrompt: `أنت مطور برمجيات خبير في ${language}. اكتب كود نظيف وموثق وقابل للصيانة.`
      })
    } catch (error) {
      console.error('Google AI generateCode error:', error)
      throw new Error('فشل في توليد الكود باستخدام Google AI')
    }
  }

  async analyzeImage(image: any): Promise<any> {
    try {
      // Google Gemini Vision API
      const model = 'gemini-pro-vision'
      const url = `${this.baseUrl}/models/${model}:generateContent?key=${this.apiKey}`

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [
              {
                text: 'حلل هذه الصورة وأعطِ وصفاً تفصيلياً لمحتواها، بما في ذلك العناصر المرئية والنص إن وجد.'
              },
              {
                inline_data: {
                  mime_type: image.mimeType || 'image/jpeg',
                  data: image.data
                }
              }
            ]
          }],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 1000,
          },
        }),
      })

      if (!response.ok) {
        throw new Error(`Google AI Vision API error: ${response.status}`)
      }

      const data = await response.json()
      
      return {
        description: data.candidates?.[0]?.content?.parts?.[0]?.text || '',
        model: 'gemini-pro-vision'
      }
    } catch (error) {
      console.error('Google AI analyzeImage error:', error)
      throw new Error('فشل في تحليل الصورة باستخدام Google AI')
    }
  }
}

