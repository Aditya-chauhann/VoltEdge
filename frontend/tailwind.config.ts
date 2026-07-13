import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Base dark theme
        base: {
          DEFAULT: '#0D0D1A',
          50:  '#1A1A2E',
          100: '#16213E',
          200: '#1E2040',
          300: '#252747',
        },
        // Primary accent: electric purple
        primary: {
          DEFAULT: '#6C63FF',
          50:  '#F0EFFE',
          100: '#D9D6FD',
          200: '#B4ACFB',
          300: '#8F83F9',
          400: '#6C63FF',
          500: '#5249D9',
          600: '#3D38B3',
          700: '#2A278C',
          800: '#191666',
          900: '#0D0B40',
        },
        // Secondary accent: electric cyan
        cyan: {
          DEFAULT: '#00D4FF',
          400: '#00D4FF',
          500: '#00B8E0',
        },
        // Semantic colors
        success: {
          DEFAULT: '#10B981',
          light: '#D1FAE5',
        },
        warning: {
          DEFAULT: '#F59E0B',
          light: '#FEF3C7',
        },
        danger: {
          DEFAULT: '#EF4444',
          light: '#FEE2E2',
        },
        gold: '#FFD700',
      },

      fontFamily: {
        sans:    ['Inter', 'system-ui', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
      },

      backgroundImage: {
        // Hero gradient
        'gradient-hero':
          'linear-gradient(135deg, #0D0D1A 0%, #1A1A2E 50%, #0D1B3E 100%)',
        // Card glass effect
        'gradient-glass':
          'linear-gradient(135deg, rgba(108,99,255,0.1) 0%, rgba(0,212,255,0.05) 100%)',
        // Primary button gradient
        'gradient-primary':
          'linear-gradient(135deg, #6C63FF 0%, #00D4FF 100%)',
        // Gold gradient for deals
        'gradient-gold':
          'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
      },

      boxShadow: {
        'glow-primary': '0 0 20px rgba(108, 99, 255, 0.4)',
        'glow-cyan':    '0 0 20px rgba(0, 212, 255, 0.4)',
        'glow-gold':    '0 0 20px rgba(255, 215, 0, 0.3)',
        'card':         '0 4px 24px rgba(0, 0, 0, 0.4)',
        'card-hover':   '0 8px 40px rgba(108, 99, 255, 0.2)',
      },

      animation: {
        'fade-in':     'fadeIn 0.5s ease-in-out',
        'slide-up':    'slideUp 0.4s ease-out',
        'slide-down':  'slideDown 0.4s ease-out',
        'scale-in':    'scaleIn 0.3s ease-out',
        'pulse-glow':  'pulseGlow 2s ease-in-out infinite',
        'shimmer':     'shimmer 1.5s infinite',
        'float':       'float 3s ease-in-out infinite',
        'spin-slow':   'spin 3s linear infinite',
        'bounce-slow': 'bounce 2s infinite',
      },

      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%':   { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)',    opacity: '1' },
        },
        slideDown: {
          '0%':   { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)',      opacity: '1' },
        },
        scaleIn: {
          '0%':   { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)',    opacity: '1' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(108,99,255,0.4)' },
          '50%':      { boxShadow: '0 0 40px rgba(108,99,255,0.7)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-10px)' },
        },
      },

      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },

      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};

export default config;
