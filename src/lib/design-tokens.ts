export const colors = {
  primary: "#C2410C",
  primaryHover: "#9A3412",
  accent: "#F59E0B",
  neutral: "#78716C",
  background: "#FAFAF9",
  surface: "#F5F5F4",
  surfaceRaised: "#E7E5E4",
  textPrimary: "#1C1917",
  textSecondary: "#57534E",
  border: "#D6D3D1",
  success: "#16A34A",
  warning: "#D97706",
  error: "#DC2626",
  focusRing: "rgba(194, 65, 12, 0.12)",
  primaryGlow: "rgba(194, 65, 12, 0.25)",
} as const;

export const fonts = {
  display: "var(--font-playfair)",
  body: "var(--font-source-sans)",
  code: "var(--font-fira-code)",
} as const;

export const spacing = {
  base: "4px",
  xs: "4px",
  sm: "8px",
  md: "16px",
  lg: "24px",
  xl: "32px",
  xxl: "48px",
  containerMax: "1200px",
  sidebarWidth: "256px",
} as const;

export const radii = {
  small: "4px",
  control: "8px",
  card: "12px",
  full: "9999px",
} as const;

export const shadows = {
  cardHover: "0 4px 16px rgba(28, 25, 23, 0.06)",
  primaryHover: "0 4px 12px rgba(194, 65, 12, 0.25)",
  modal: "0 24px 48px rgba(28, 25, 23, 0.12)",
} as const;

export const typeScale = {
  display: "64px",
  headline: "48px",
  sectionHeading: "28px",
  subhead: "20px",
  body: "16px",
  small: "14px",
  caption: "12px",
  overline: "11px",
} as const;
