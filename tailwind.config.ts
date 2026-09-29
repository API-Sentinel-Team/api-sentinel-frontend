import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}", "./index.html"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "1rem",
        sm: "1.5rem",
        lg: "2rem",
      },
      screens: { "2xl": "1400px" },
    },
    extend: {
      screens: {
        // Extra-small band for dense two-column stat strips on phones.
        xs: "30rem",
        // Wide console band: enough room for the persistent detail inspector.
        "3xl": "1728px",
      },
      fontFamily: {
        sans: ["Plus Jakarta Sans", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
        mono: ["JetBrains Mono", "IBM Plex Mono", "ui-monospace", "monospace"],
        display: ["Plus Jakarta Sans", "system-ui", "sans-serif"],
        serif: ["Instrument Serif", "Georgia", "serif"],
      },
      colors: {
        brand: "var(--brand)",
        "accent-teal": "var(--accent-teal)",
        "brand-light": "var(--brand-light)",
        "brand-dark": "var(--brand-dark)",
        "brand-blue": "var(--brand-blue)",
        "brand-ink": "var(--brand-ink)",
        "brand-paper": "var(--text-primary)",
        "brand-glow": "var(--brand-glow)",
        "brand-dim": "var(--bg-selected)",
        "bg-base": "var(--bg-base)",
        "bg-surface": "var(--bg-surface)",
        "bg-elevated": "var(--bg-elevated)",
        "bg-sidebar": "var(--bg-sidebar)",
        "bg-hover": "var(--bg-hover)",
        "text-primary": "var(--text-primary)",
        "text-secondary": "var(--text-secondary)",
        "text-muted": "var(--text-muted)",
        "text-disabled": "var(--text-disabled)",
        "text-brand": "var(--text-brand)",
        "border-subtle": "var(--border-subtle)",
        "border-default": "var(--border-default)",
        "sev-critical": "var(--sev-critical)",
        "sev-high": "var(--sev-high)",
        "sev-medium": "var(--sev-medium)",
        "sev-low": "var(--sev-low)",
        "sev-info": "var(--sev-info)",
        "severity-critical": "var(--sev-critical)",
        "severity-high": "var(--sev-high)",
        "severity-medium": "var(--sev-medium)",
        "severity-low": "var(--sev-low)",
        "severity-info": "var(--sev-info)",
        "status-open": "var(--sev-critical)",
        "status-false-positive": "var(--sev-high)",
        "status-analyzed": "var(--sev-medium)",
        "status-risk-accepted": "var(--brand)",
        "status-resolved": "var(--sev-low)",
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
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": { from: { height: "0" }, to: { height: "var(--radix-accordion-content-height)" } },
        "accordion-up": { from: { height: "var(--radix-accordion-content-height)" }, to: { height: "0" } },
        "fade-in": { from: { opacity: "0", transform: "translateY(6px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        "slide-in": { from: { opacity: "0", transform: "translateX(-6px)" }, to: { opacity: "1", transform: "translateX(0)" } },
        "scale-in": { from: { opacity: "0", transform: "scale(0.95)" }, to: { opacity: "1", transform: "scale(1)" } },
        // Detail surface: slides in from the right on desktop.
        "detail-in-right": { from: { opacity: "0", transform: "translateX(28px)" }, to: { opacity: "1", transform: "translateX(0)" } },
        // Detail surface: rises from the bottom on phones.
        "detail-in-bottom": { from: { opacity: "0", transform: "translateY(24px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        // Table rows reveal themselves in sequence after a refetch.
        "row-in": { from: { opacity: "0", transform: "translateY(4px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        // Horizontal sweep for live/pulse accents.
        sweep: { from: { transform: "translateX(-120%)" }, to: { transform: "translateX(220%)" } },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.2s ease-out",
        "slide-in": "slide-in 0.2s ease-out",
        "scale-in": "scale-in 0.2s ease-out",
        "detail-in-right": "detail-in-right 0.24s cubic-bezier(0.22, 1, 0.36, 1) both",
        "detail-in-bottom": "detail-in-bottom 0.26s cubic-bezier(0.22, 1, 0.36, 1) both",
        "row-in": "row-in 0.18s ease-out both",
        sweep: "sweep 2.4s linear infinite",
      },
    },
  },
  plugins: [tailwindcssAnimate],
} satisfies Config;
