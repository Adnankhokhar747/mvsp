import { createTheme, type ThemeOptions } from '@mui/material/styles'

const shape = { borderRadius: 10 }

const typography: ThemeOptions['typography'] = {
  fontFamily: [
    '"Plus Jakarta Sans"',
    '-apple-system',
    'BlinkMacSystemFont',
    '"Segoe UI"',
    'Roboto',
    'Helvetica',
    'Arial',
    'sans-serif',
  ].join(','),
  h1: { fontWeight: 700 },
  h2: { fontWeight: 700 },
  h3: { fontWeight: 700 },
  h4: { fontWeight: 600 },
  h5: { fontWeight: 600 },
  h6: { fontWeight: 600 },
  button: { fontWeight: 600, textTransform: 'none' },
}

const components: ThemeOptions['components'] = {
  MuiButton: {
    styleOverrides: {
      root: { borderRadius: 8, paddingInline: 20, boxShadow: 'none' },
    },
  },
  MuiPaper: {
    styleOverrides: {
      root: { backgroundImage: 'none' },
    },
    variants: [
      {
        props: { variant: 'outlined' },
        style: { boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04), 0 1px 3px rgba(15, 23, 42, 0.06)' },
      },
    ],
  },
  MuiCard: {
    styleOverrides: {
      root: { borderRadius: 12, boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04), 0 1px 3px rgba(15, 23, 42, 0.06)' },
    },
  },
}

export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#0369A1' },
    secondary: { main: '#334155' },
    background: { default: '#F8FAFC', paper: '#FFFFFF' },
    text: { primary: '#0F172A', secondary: '#64748B' },
    divider: '#E2E8F0',
    error: { main: '#DC2626' },
  },
  shape,
  typography,
  components,
})

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#38BDF8' },
    secondary: { main: '#94A3B8' },
    background: { default: '#0B1120', paper: '#131B2E' },
    text: { primary: '#F1F5F9', secondary: '#94A3B8' },
    divider: '#1E293B',
    error: { main: '#F87171' },
  },
  shape,
  typography,
  components,
})
