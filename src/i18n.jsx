import React, { createContext, useContext, useEffect, useState } from 'react'
import { locales, normalizeLanguage, readLanguage, translate } from './translations'
const LanguageContext = createContext(null)
export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => readLanguage(localStorage))
  useEffect(() => {
    document.documentElement.lang = language
    document.title =
      language === 'uk'
        ? 'NORD — речі для життя'
        : language === 'ru'
          ? 'NORD — вещи для жизни'
          : 'NORD — things for living'
    try {
      localStorage.setItem('nord-language', language)
    } catch {
      /* The language still works without browser storage. */
    }
  }, [language])
  return (
    <LanguageContext.Provider
      value={{ language, setLanguage: (value) => setLanguage(normalizeLanguage(value)) }}
    >
      {children}
    </LanguageContext.Provider>
  )
}
export function useI18n() {
  const { language, setLanguage } = useContext(LanguageContext)
  return {
    language,
    setLanguage,
    t: (key, values) => translate(key, language, values),
    money: (value) =>
      new Intl.NumberFormat(locales[language], {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 2,
      }).format(Number(value)),
    date: (value) =>
      new Intl.DateTimeFormat(locales[language], { dateStyle: 'medium' }).format(
        new Date(value.replace(' ', 'T')),
      ),
  }
}
