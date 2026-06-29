import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#3B82F6',
      dark: '#2563EB',
      light: '#93C5FD',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#8B5CF6',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#F8FAFC',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1E293B',
      secondary: '#64748B',
    },
    divider: '#E2E8F0',
    success: { main: '#10B981' },
    warning: { main: '#F59E0B' },
    error:   { main: '#EF4444' },
  },
  typography: {
    fontFamily: "'Inter', 'Apple SD Gothic Neo', sans-serif",
    h1: { fontSize: '2rem',    fontWeight: 700, lineHeight: 1.2, letterSpacing: '-0.02em' },
    h2: { fontSize: '1.5rem',  fontWeight: 700, lineHeight: 1.3, letterSpacing: '-0.01em' },
    h3: { fontSize: '1.25rem', fontWeight: 600, lineHeight: 1.4 },
    h4: { fontSize: '1rem',    fontWeight: 600, lineHeight: 1.4 },
    body1: { fontSize: '0.9375rem', lineHeight: 1.6 },
    body2: { fontSize: '0.875rem',  lineHeight: 1.5 },
    caption: { fontSize: '0.75rem', lineHeight: 1.5 },
  },
  shape: { borderRadius: 12 },
  spacing: 8,
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
          border: '1px solid #E2E8F0',
          transition: 'box-shadow 0.2s ease, transform 0.2s ease',
          '&:hover': {
            boxShadow: '0 8px 24px rgba(0,0,0,0.09)',
            transform: 'translateY(-2px)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 9999,
          textTransform: 'none',
          fontWeight: 600,
          letterSpacing: 0,
        },
        containedPrimary: {
          boxShadow: '0 1px 2px rgba(59,130,246,0.25)',
          '&:hover': { boxShadow: '0 4px 12px rgba(59,130,246,0.35)' },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 9999, fontWeight: 600, fontSize: '0.72rem' },
      },
    },
    MuiPaper:  { styleOverrides: { root: { backgroundImage: 'none' } } },
    MuiTab: {
      styleOverrides: {
        root: { textTransform: 'none', fontWeight: 500, fontSize: '0.875rem', minHeight: 44 },
      },
    },
  },
});

export default theme;
