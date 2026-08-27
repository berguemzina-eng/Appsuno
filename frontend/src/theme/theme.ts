/**
 * theme.ts - Paleta y estilos compartidos de la app.
 * Inspirado en tonos marroquíes: terracota, dorado y azul noche,
 * sobre un tema oscuro estilo Suno.
 */

export const colors = {
  background: '#0F0F1A',
  surface: '#1A1A2E',
  surfaceLight: '#242440',
  primary: '#E0A458', // dorado / terracota
  primaryDark: '#C4863A',
  secondary: '#7C4DFF',
  accent: '#2EC4B6',
  text: '#F5F5F7',
  textSecondary: '#A0A0B8',
  border: '#2E2E48',
  error: '#FF6B6B',
  success: '#4CD964',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const radius = {
  sm: 8,
  md: 14,
  lg: 22,
  pill: 999,
};

export const typography = {
  heading: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: colors.text,
  },
  subheading: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.textSecondary,
  },
  body: {
    fontSize: 14,
    fontWeight: '400' as const,
    color: colors.text,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400' as const,
    color: colors.textSecondary,
  },
};

const theme = { colors, spacing, radius, typography };

export default theme;
