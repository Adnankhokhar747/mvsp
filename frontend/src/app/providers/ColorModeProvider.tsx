import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { darkTheme, lightTheme } from '../../theme/theme'

type Mode = 'light' | 'dark'

interface ColorModeContextValue {
  mode: Mode
  toggle: () => void
}

const ColorModeContext = createContext<ColorModeContextValue | null>(null)

const STORAGE_KEY = 'servicehub-color-mode'

function getInitialMode(): Mode {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === 'light' || stored === 'dark') return stored
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function ColorModeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<Mode>(getInitialMode)

  const value = useMemo<ColorModeContextValue>(
    () => ({
      mode,
      toggle: () =>
        setMode((prev) => {
          const next = prev === 'light' ? 'dark' : 'light'
          localStorage.setItem(STORAGE_KEY, next)
          return next
        }),
    }),
    [mode],
  )

  return (
    <ColorModeContext.Provider value={value}>
      <ThemeProvider theme={mode === 'light' ? lightTheme : darkTheme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  )
}

export function useColorMode() {
  const ctx = useContext(ColorModeContext)
  if (!ctx) throw new Error('useColorMode must be used within ColorModeProvider')
  return ctx
}
