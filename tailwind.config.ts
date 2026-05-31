import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#1A1C1E", // Heritage Primary (Ink)
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#6C7278", // Heritage Secondary (Slate)
          foreground: "#FFFFFF",
        },
        tertiary: {
          DEFAULT: "#B8422E", // Heritage Tertiary (Accent Red)
          foreground: "#FFFFFF",
        },
        neutral: {
          DEFAULT: "#F7F5F2", // Heritage Neutral (Limestone)
          foreground: "#1A1C1E",
        },
        surface: {
          DEFAULT: "#FFFFFF", // Heritage Surface
          foreground: "#1A1C1E",
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
        // Balikin Gold Theme Colors (Legacy/Alternative)
        "surface-container": "#231f14",
        "status-critical": "#FF4D4D",
        "on-error": "#690005",
        "data-mask-overlay": "rgba(255, 255, 255, 0.05)",
        "on-surface": "#eae2cf",
        "inverse-surface": "#eae2cf",
        "on-secondary": "#313030",
        "on-tertiary": "#00363a",
        "on-primary": "#3a3000",
        "surface-dim": "#161308",
        "on-secondary-fixed-variant": "#474646",
        "primary-fixed": "#ffe16d",
        "on-secondary-fixed": "#1c1b1b",
        "surface-deep": "#0A0A0A",
        "status-resolved": "#00E676",
        "surface-variant": "#393528",
        "error-container": "#93000a",
        "secondary-fixed-dim": "#c8c6c5",
        "outline-variant": "#4d4732",
        "surface-container-high": "#2e2a1e",
        "on-background": "#eae2cf",
        "inverse-on-surface": "#343024",
        "on-tertiary-container": "#006a70",
        "on-tertiary-fixed": "#002022",
        "surface-bright": "#3d392c",
        "surface-container-lowest": "#110e05",
        "tertiary-fixed-dim": "#00dbe8",
        "surface-tint": "#e9c400",
        "balikin-gold": "#FFD700",
        "surface-container-low": "#1f1b10",
        "primary-fixed-dim": "#e9c400",
        "primary-container": "#ffd700",
        error: "#ffb4ab",
        "premium-badge": "#FFD700",
        "secondary-container": "#4a4949",
        "on-primary-fixed-variant": "#544600",
        "on-error-container": "#ffdad6",
        "on-primary-fixed": "#221b00",
        "tertiary-fixed": "#79f5ff",
        "secondary-fixed": "#e5e2e1",
        "on-tertiary-fixed-variant": "#004f54",
        "on-secondary-container": "#bab8b7",
        "status-open": "#2979FF",
        "surface-container-highest": "#393528",
        "on-primary-container": "#705e00",
        "on-surface-variant": "#d0c6ab",
        "inverse-primary": "#705d00",

        // Mobile Design Tokens - Single Source of Truth for Mobile App
        mobile: {
          primary: {
            DEFAULT: "#2563eb", // blue-600 equivalent
            light: "#3b82f6", // blue-500
            dark: "#1d4ed8", // blue-700
            lighter: "#dbeafe", // blue-100
          },
          success: {
            DEFAULT: "#10b981", // emerald-600
            light: "#34d399", // emerald-500
            lighter: "#d1fae5", // emerald-100
          },
          danger: {
            DEFAULT: "#e11d48", // rose-600
            light: "#f43f5e", // rose-500
            lighter: "#ffe4e6", // rose-100
          },
          warning: {
            DEFAULT: "#f97316", // orange-500
            light: "#fbbf24", // amber-400
            lighter: "#ffedd5", // orange-100
          },
          info: {
            DEFAULT: "#a855f7", // purple-600
            light: "#c084fc", // purple-500
            lighter: "#f3e8ff", // purple-100
          },
          background: {
            DEFAULT: "#f0f9ff", // blue-50
            to: "#ffffff",
          },
        },
      },
      borderRadius: {
        lg: "8px", // Heritage lg
        md: "4px", // Heritage md
        sm: "2px", // Heritage sm
        DEFAULT: "0.25rem",
        xl: "0.75rem",
        full: "9999px",
      },
      spacing: {
        "sidebar-width": "248px",
        "gutter-md": "1.5rem",
        "container-padding": "2rem",
        "h-sm": "8px",
        "h-md": "16px",
        "h-lg": "32px",
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        body: ["var(--font-body)", "sans-serif"],
        label: ["var(--font-label)", "sans-serif"],
        "label-caps": ["var(--font-label)", "sans-serif"],
        "data-mono": ["JetBrains Mono", "monospace"],
        "body-lg": ["var(--font-body)", "sans-serif"],
        "headline-xl": ["var(--font-display)", "serif"],
        "headline-md": ["var(--font-display)", "serif"],
        "body-md": ["var(--font-body)", "sans-serif"],
        "headline-lg": ["var(--font-display)", "serif"],
      },
      fontSize: {
        "label-caps": ["12px", { lineHeight: "16px", letterSpacing: "0.08em", fontWeight: "700" }],
        "data-mono": ["14px", { lineHeight: "20px", fontWeight: "500" }],
        "body-lg": ["16px", { lineHeight: "24px", fontWeight: "400" }],
        "headline-xl": ["36px", { lineHeight: "44px", letterSpacing: "-0.02em", fontWeight: "700" }],
        "headline-md": ["20px", { lineHeight: "28px", fontWeight: "600" }],
        "body-md": ["14px", { lineHeight: "20px", fontWeight: "400" }],
        "headline-lg": ["28px", { lineHeight: "36px", letterSpacing: "-0.01em", fontWeight: "600" }],
        "display": ["4rem", { lineHeight: "1.1", letterSpacing: "-0.02em", fontWeight: "500" }],
        "h1": ["2.5rem", { lineHeight: "1.2", fontWeight: "500" }],
      },
    },
  },
  plugins: [],
};

export default config;
 