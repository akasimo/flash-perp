import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'perp-primary': '#0066FF',
        'perp-secondary': '#00D4FF',
        'perp-success': '#00FF88',
        'perp-danger': '#FF3366',
        'perp-warning': '#FFB800',
        'perp-dark': '#0A0A0B',
        'perp-darker': '#060607',
      },
    },
  },
  plugins: [],
}
export default config