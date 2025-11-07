'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { initI18n } from '@/lib/i18n/config'

type Language = 'ar' | 'en'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  isRTL: boolean
  t: (key: string, options?: any) => string
  isLoading: boolean
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

interface LanguageProviderProps {
  children: ReactNode
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [isInitialized, setIsInitialized] = useState(false)
  const { i18n, t } = useTranslation()
  const [language, setLanguageState] = useState<Language>('ar')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const initializeI18n = async () => {
      try {
        await initI18n()
        setIsInitialized(true)
        
        // Get saved language from localStorage or use default
        const savedLanguage = localStorage.getItem('yyo-language') as Language
        const initialLanguage = savedLanguage || 'ar'
        
        setLanguageState(initialLanguage)
        await i18n.changeLanguage(initialLanguage)
        
        // Update document attributes
        document.documentElement.lang = initialLanguage
        document.documentElement.dir = initialLanguage === 'ar' ? 'rtl' : 'ltr'
        
        setIsLoading(false)
      } catch (error) {
        console.error('Failed to initialize i18n:', error)
        setIsLoading(false)
      }
    }

    initializeI18n()
  }, [i18n])

  const setLanguage = async (lang: Language) => {
    try {
      setIsLoading(true)
      setLanguageState(lang)
      
      // Save to localStorage
      localStorage.setItem('yyo-language', lang)
      
      // Change i18n language
      await i18n.changeLanguage(lang)
      
      // Update document attributes
      document.documentElement.lang = lang
      document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'
      
      // Update body class for styling
      document.body.className = document.body.className.replace(/\b(rtl|ltr)\b/g, '')
      document.body.classList.add(lang === 'ar' ? 'rtl' : 'ltr')
      
      setIsLoading(false)
    } catch (error) {
      console.error('Failed to change language:', error)
      setIsLoading(false)
    }
  }

  const isRTL = language === 'ar'

  const value: LanguageContextType = {
    language,
    setLanguage,
    isRTL,
    t,
    isLoading: isLoading || !isInitialized,
  }

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}

// Language switcher component
export function LanguageSwitcher() {
  const { language, setLanguage, isLoading } = useLanguage()

  if (isLoading) {
    return <div className="h-8 w-16 animate-pulse rounded bg-muted" />
  }

  return (
    <div className="flex items-center rounded-lg border bg-background p-1">
      <button
        onClick={() => setLanguage('ar')}
        className={`rounded px-2 py-1 text-sm font-medium transition-colors ${
          language === 'ar'
            ? 'bg-primary text-primary-foreground'
            : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        العربية
      </button>
      <button
        onClick={() => setLanguage('en')}
        className={`rounded px-2 py-1 text-sm font-medium transition-colors ${
          language === 'en'
            ? 'bg-primary text-primary-foreground'
            : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        English
      </button>
    </div>
  )
}

