export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
  animation: {
    'spin-slow': 'spin 4s linear infinite',
  },
    screens: {
      'xs': '480px',
      '3xl': '2000px',
    },
    colors: {
      'primary': '#1E40AF',
      'secondary': '#FBBF24',
      'accent': '#EF4444',
      'neutral': '#374151',
      'base-100': '#FFFFFF',
      'info': '#3B82F6',
      'success': '#10B981',
      'warning': '#F59E0B',
      'error': '#EF4444',
    },  
  },
},
  plugins: [],
}
