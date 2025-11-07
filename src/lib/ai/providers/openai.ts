import OpenAI from 'openai'
import { AIServiceInterface } from '../router'

export class OpenAIService implements AIServiceInterface {
  private client: OpenAI

  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
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

      const response = await this.client.chat.completions.create({
        model: options?.model || 'gpt-4-turbo-preview',
        messages,
        max_tokens: options?.maxTokens || 1000,
        temperature: options?.temperature || 0.7,
      })

      return response.choices[0]?.message?.content || ''
    } catch (error) {
      console.error('OpenAI generateText error:', error)
      throw new Error('فشل في توليد النص باستخدام OpenAI')
    }
  }

  async analyzeText(text: string, type: 'sentiment' | 'summary' | 'keywords'): Promise<any> {
    try {
      let prompt = ''
      let systemPrompt = ''

      switch (type) {
        case 'sentiment':
          systemPrompt = 'أنت محلل مشاعر خبير. قم بتحليل المشاعر في النص المعطى وأعطِ النتيجة بصيغة JSON.'
          prompt = `حلل المشاعر في النص التالي وأعطِ النتيجة بالتفصيل:

النص: "${text}"

أعطِ النتيجة بصيغة JSON تحتوي على:
- sentiment: (positive/negative/neutral)
- confidence: (0-1)
- emotions: مصفوفة من المشاعر المكتشفة
- summary: ملخص قصير للتحليل`
          break

        case 'summary':
          systemPrompt = 'أنت خبير في تلخيص النصوص. قم بإنشاء ملخص مفيد ومختصر للنص المعطى.'
          prompt = `لخص النص التالي بشكل مفيد ومختصر:

"${text}"

الملخص:`
          break

        case 'keywords':
          systemPrompt = 'أنت خبير في استخراج الكلمات المفتاحية. استخرج أهم الكلمات والمفاهيم من النص.'
          prompt = `استخرج الكلمات المفتاحية الأكثر أهمية من النص التالي:

"${text}"

أعطِ النتيجة بصيغة JSON تحتوي على:
- keywords: مصفوفة من الكلمات المفتاحية
- topics: المواضيع الرئيسية
- entities: الكيانات المذكورة (أشخاص، أماكن، منظمات)`
          break
      }

      const response = await this.client.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        max_tokens: 500,
        temperature: 0.3,
      })

      const result = response.choices[0]?.message?.content || ''
      
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
      console.error('OpenAI analyzeText error:', error)
      throw new Error('فشل في تحليل النص باستخدام OpenAI')
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

      const response = await this.client.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: 'أنت مترجم محترف. قم بترجمة النصوص بدقة مع الحفاظ على المعنى والسياق.'
          },
          { role: 'user', content: prompt }
        ],
        max_tokens: Math.max(text.length * 2, 100),
        temperature: 0.3,
      })

      return response.choices[0]?.message?.content?.trim() || ''
    } catch (error) {
      console.error('OpenAI translateText error:', error)
      throw new Error('فشل في ترجمة النص باستخدام OpenAI')
    }
  }

  async analyzeDocument(document: any): Promise<any> {
    try {
      // For document analysis, we'll extract text and analyze it
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

      const response = await this.client.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: 'أنت محلل مستندات خبير. قم بتحليل المستندات وتقديم رؤى مفيدة.'
          },
          { role: 'user', content: prompt }
        ],
        max_tokens: 1000,
        temperature: 0.3,
      })

      const result = response.choices[0]?.message?.content || ''
      
      try {
        return JSON.parse(result)
      } catch {
        return { analysis: result }
      }
    } catch (error) {
      console.error('OpenAI analyzeDocument error:', error)
      throw new Error('فشل في تحليل المستند باستخدام OpenAI')
    }
  }

  async generateCode(description: string, language: string): Promise<string> {
    try {
      const prompt = `اكتب كود ${language} للمتطلب التالي:

المتطلب: ${description}

الكود:`

      const response = await this.client.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: `أنت مطور برمجيات خبير في ${language}. اكتب كود نظيف وموثق وقابل للصيانة.`
          },
          { role: 'user', content: prompt }
        ],
        max_tokens: 2000,
        temperature: 0.2,
      })

      return response.choices[0]?.message?.content || ''
    } catch (error) {
      console.error('OpenAI generateCode error:', error)
      throw new Error('فشل في توليد الكود باستخدام OpenAI')
    }
  }

  async analyzeImage(image: any): Promise<any> {
    try {
      // OpenAI Vision API
      const response = await this.client.chat.completions.create({
        model: 'gpt-4-vision-preview',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'حلل هذه الصورة وأعطِ وصفاً تفصيلياً لمحتواها، بما في ذلك العناصر المرئية والنص إن وجد.'
              },
              {
                type: 'image_url',
                image_url: {
                  url: image.url || image.data,
                  detail: 'high'
                }
              }
            ]
          }
        ],
        max_tokens: 1000,
        temperature: 0.3,
      })

      return {
        description: response.choices[0]?.message?.content || '',
        model: 'gpt-4-vision-preview'
      }
    } catch (error) {
      console.error('OpenAI analyzeImage error:', error)
      throw new Error('فشل في تحليل الصورة باستخدام OpenAI')
    }
  }
}

