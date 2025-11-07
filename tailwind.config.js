/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // YYO AI Custom Colors
        yyo: {
          primary: "#2563eb",
          secondary: "#7c3aed",
          accent: "#06b6d4",
          success: "#10b981",
          warning: "#f59e0b",
          error: "#ef4444",
          info: "#3b82f6",
        },
        // Department Colors
        finance: "#10b981",
        operations: "#f59e0b",
        sales: "#ef4444",
        hr: "#8b5cf6",
        projects: "#06b6d4",
        it: "#6366f1",
        support: "#84cc16",
        innovation: "#f97316",
        resources: "#14b8a6",
        quality: "#ec4899",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
        "fade-in": {
          "0%": { opacity: 0, transform: "translateY(10px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        "slide-in-right": {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(0)" },
        },
        "slide-in-left": {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(0)" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 5px rgba(37, 99, 235, 0.5)" },
          "50%": { boxShadow: "0 0 20px rgba(37, 99, 235, 0.8)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.5s ease-out",
        "slide-in-right": "slide-in-right 0.3s ease-out",
        "slide-in-left": "slide-in-left 0.3s ease-out",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
      },
      fontFamily: {
        arabic: ['Cairo', 'Tajawal', 'Amiri', 'sans-serif'],
        english: ['Inter', 'Roboto', 'sans-serif'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      backdropBlur: {
        xs: '2px',
      },
      screens: {
        'xs': '475px',
        '3xl': '1600px',
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    // RTL Support Plugin
    function({ addUtilities }) {
      const newUtilities = {
        '.rtl': {
          direction: 'rtl',
        },
        '.ltr': {
          direction: 'ltr',
        },
        '.text-start': {
          'text-align': 'start',
        },
        '.text-end': {
          'text-align': 'end',
        },
        '.float-start': {
          float: 'inline-start',
        },
        '.float-end': {
          float: 'inline-end',
        },
        '.ms-auto': {
          'margin-inline-start': 'auto',
        },
        '.me-auto': {
          'margin-inline-end': 'auto',
        },
        '.ps-0': { 'padding-inline-start': '0' },
        '.ps-1': { 'padding-inline-start': '0.25rem' },
        '.ps-2': { 'padding-inline-start': '0.5rem' },
        '.ps-3': { 'padding-inline-start': '0.75rem' },
        '.ps-4': { 'padding-inline-start': '1rem' },
        '.ps-5': { 'padding-inline-start': '1.25rem' },
        '.ps-6': { 'padding-inline-start': '1.5rem' },
        '.pe-0': { 'padding-inline-end': '0' },
        '.pe-1': { 'padding-inline-end': '0.25rem' },
        '.pe-2': { 'padding-inline-end': '0.5rem' },
        '.pe-3': { 'padding-inline-end': '0.75rem' },
        '.pe-4': { 'padding-inline-end': '1rem' },
        '.pe-5': { 'padding-inline-end': '1.25rem' },
        '.pe-6': { 'padding-inline-end': '1.5rem' },
      }
      addUtilities(newUtilities)
    }
  ],
}

