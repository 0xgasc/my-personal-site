import { createContext, useContext, useState, useEffect } from 'react'

const AppContext = createContext()

export function AppProvider({ children }) {
  const [language, setLanguage] = useState('EN')
  const [darkMode, setDarkMode] = useState(false)

  // Load preferences from localStorage
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language')
    const savedDarkMode = localStorage.getItem('darkMode')
    if (savedLanguage) setLanguage(savedLanguage)
    if (savedDarkMode) setDarkMode(savedDarkMode === 'true')
  }, [])

  // Save preferences to localStorage
  useEffect(() => {
    localStorage.setItem('language', language)
    localStorage.setItem('darkMode', darkMode.toString())
  }, [language, darkMode])

  const languages = ['EN', 'ES', 'PT', 'FR']
  const cycleLanguage = () => {
    const currentIndex = languages.indexOf(language)
    const nextIndex = (currentIndex + 1) % languages.length
    setLanguage(languages[nextIndex])
  }

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage,
        cycleLanguage,
        darkMode,
        setDarkMode,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within AppProvider')
  }
  return context
}
