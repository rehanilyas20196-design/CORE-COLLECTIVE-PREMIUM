/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#FFFBEB',
          100: '#FFF3CC',
          200: '#FFE699',
          300: '#FFDA66',
          400: '#E8C04A',
          500: '#D4A853',
          DEFAULT: '#C9974B',
          600: '#B4843F',
          700: '#9C7034',
          800: '#7A5829',
          900: '#5C411E',
          light: '#FFF3CC',
          dark: '#7A5829',
        },
        gold: {
          DEFAULT: '#D4A853',
          light: '#FFDA66',
          dark: '#B4843F',
        },
        gray: {
          50: '#F8F9FA',
          100: '#F1F3F5',
          200: '#E9ECEF',
          300: '#DEE2E6',
          400: '#CED4DA',
          500: '#ADB5BD',
          600: '#868E96',
          700: '#495057',
          800: '#343A40',
          900: '#212529',
        },
        success: {
          DEFAULT: '#00B517',
          light: '#E5F1E3',
          dark: '#237C02',
        },
        danger: {
          DEFAULT: '#FA3434',
          light: '#FFF0F0',
        },
        warning: {
          DEFAULT: '#FF9017',
          light: '#FFF0DF',
        },
        star: {
          DEFAULT: '#D4A853',
        },
        blue: {
          50: '#E3F0FF',
          100: '#D1E9FF',
          200: '#C3D9FF',
        },
        accent: {
          gold: '#D4A853',
          DEFAULT: '#D4A853',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          muted: '#F8F9FA',
          hover: '#F1F3F5',
          border: '#DEE2E6',
        },
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
        playfair: ['Playfair Display', 'serif'],
        fraunces: ['Fraunces', 'serif'],
        jost: ['Jost', 'sans-serif'],
        worksans: ['Work Sans', 'sans-serif'],
        spacemono: ['Space Mono', 'monospace'],
        cormorant: ['Cormorant Garamond', 'serif'],
      },
      spacing: {
        container: '1180px',
      },
      screens: {
        desktop: '920px',
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(0,0,0,0.06), 0 1px 2px 0 rgba(0,0,0,0.04)',
        'card-hover': '0 4px 12px 0 rgba(0,0,0,0.08), 0 2px 4px 0 rgba(0,0,0,0.04)',
        'elevated': '0 4px 16px 0 rgba(0,0,0,0.08), 0 2px 8px 0 rgba(0,0,0,0.04)',
        'modal': '0 8px 32px 0 rgba(0,0,0,0.12), 0 4px 16px 0 rgba(0,0,0,0.08)',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'slide-down': {
          '0%': { opacity: '0', transform: 'translateY(-8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'pulse-dot': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        'float-slow': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        'marquee': {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(212, 168, 83, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(212, 168, 83, 0.6)' },
        },
        'spin-slow': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        'count-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'width-grow': {
          '0%': { width: '0%' },
          '100%': { width: '100%' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.3s ease-out forwards',
        'fade-in-up': 'fade-in-up 0.5s ease-out forwards',
        'scale-in': 'scale-in 0.2s ease-out forwards',
        'slide-down': 'slide-down 0.2s ease-out forwards',
        'pulse-dot': 'pulse-dot 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'float-slow': 'float-slow 4s ease-in-out infinite',
        'marquee': 'marquee 30s linear infinite',
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
        'spin-slow': 'spin-slow 8s linear infinite',
        'count-up': 'count-up 0.6s ease-out forwards',
        'shimmer': 'shimmer 2s linear infinite',
        'width-grow': 'width-grow 1.5s ease-out forwards',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
};
