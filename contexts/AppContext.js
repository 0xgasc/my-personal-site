import { createContext, useContext, useState, useEffect } from 'react'

const AppContext = createContext()

export function AppProvider({ children }) {
  const [language, setLanguage] = useState('EN')
  const [darkMode, setDarkMode] = useState(false)
  const [fxEnabled, setFxEnabled] = useState(true)
  const [currentSceneId, setCurrentSceneId] = useState(null)

  // Load preferences from localStorage
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language')
    const savedDarkMode = localStorage.getItem('darkMode')
    const savedFx = localStorage.getItem('fxEnabled')
    const savedSceneId = localStorage.getItem('currentSceneId')
    if (savedLanguage) setLanguage(savedLanguage)
    if (savedDarkMode !== null) setDarkMode(savedDarkMode === 'true')
    if (savedFx !== null) setFxEnabled(savedFx === 'true')
    if (savedSceneId) setCurrentSceneId(savedSceneId)
  }, [])

  useEffect(() => {
    localStorage.setItem('language', language)
    localStorage.setItem('darkMode', darkMode.toString())
    localStorage.setItem('fxEnabled', fxEnabled.toString())
    if (currentSceneId) localStorage.setItem('currentSceneId', currentSceneId)
    else localStorage.removeItem('currentSceneId')
  }, [language, darkMode, fxEnabled, currentSceneId])

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
        fxEnabled,
        setFxEnabled,
        currentSceneId,
        setCurrentSceneId,
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
