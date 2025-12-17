import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: 'class',
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/modules/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // Dark mode color palette (matching the Cline UI image)
        dark: {
          bg: '#0a0a0f',           // Main background
          surface: '#12121a',      // Slightly elevated surface
          card: '#1a1a2e',         // Card backgrounds
          border: '#2a2a4a',       // Border color
          hover: '#252542',        // Hover states
          muted: '#6b6b8a',        // Muted text
        },
        // Light mode complementary palette
        light: {
          bg: '#f8fafc',           // Main background (slate-50)
          surface: '#ffffff',      // Elevated surface
          card: '#ffffff',         // Card backgrounds
          border: '#e2e8f0',       // Border color (slate-200)
          hover: '#f1f5f9',        // Hover states (slate-100)
          muted: '#64748b',        // Muted text (slate-500)
        },
        // Brand accent colors
        brand: {
          purple: '#a855f7',       // Purple-500
          indigo: '#6366f1',       // Indigo-500
          gradient: {
            from: '#6366f1',       // Indigo
            to: '#a855f7',         // Purple
          },
        },
      },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(to right, #6366f1, #a855f7)',
        'gradient-brand-hover': 'linear-gradient(to right, #4f46e5, #9333ea)',
      },
    },
  },
  plugins: [],
};

export default config;
