import { createTheme, type ThemeOptions } from '@mui/material/styles'

const shape = { borderRadius: 12 }

const typography: ThemeOptions['typography'] = {
  fontFamily: [
    'Inter',
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
  h3: { fontWeight: 600 },
  h4: { fontWeight: 600 },
  h5: { fontWeight: 600 },
  h6: { fontWeight: 600 },
  button: { fontWeight: 600, textTransform: 'none' },
}

const components: ThemeOptions['components'] = {
  MuiButton: {
    styleOverrides: {
      root: { borderRadius: 10, paddingInline: 16 },
    },
  },
  MuiPaper: {
    styleOverrides: {
      root: { backgroundImage: 'none' },
    },
  },
  MuiCard: {
    styleOverrides: {
      root: { borderRadius: 16 },
    },
  },
  MuiTableCell: {
    styleOverrides: {
      head: { fontWeight: 600 },
    },
  },
}

export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#4F46E5' },
    secondary: { main: '#0EA5E9' },
    background: { default: '#F7F7FB', paper: '#FFFFFF' },
  },
  shape,
  typography,
  components,
})

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#818CF8' },
    secondary: { main: '#38BDF8' },
    background: { default: '#0B0E14', paper: '#12151C' },
  },
  shape,
  typography,
  components,
})
