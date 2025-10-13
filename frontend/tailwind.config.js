/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // TMS Color Palette - Enhanced Modern Theme
        primary: {
          background: '#F8FAFC',
          text: '#0F172A',
          accent: '#3B82F6',
        },
        card: {
          background: '#FFFFFF',
        },
        text: {
          primary: '#0F172A',
          secondary: '#64748B',
          accent: '#3B82F6',
        },
        tab: {
          background: '#1E293B',
          active: {
            background: '#FFFFFF',
            text: '#0F172A',
          },
          inactive: {
            text: '#F1F5F9',
          }
        },
        pill: {
          success: {
            background: '#D1FAE5',
            text: '#10B981',
          },
          warning: {
            border: '#F97316',
            text: '#F97316',
          },
          approve: {
            background: '#10B981',
            text: '#FFFFFF',
          },
          edit: {
            border: '#E5E7EB',
            text: '#0D1A33',
          }
        },
        progress: {
          fill: '#1E3A8A',
          track: '#E5E7EB',
        }
      },
      fontFamily: {
        sans: ['Inter', 'Poppins', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'header': ['28px', { lineHeight: '1.2', fontWeight: '700' }],
        'subtitle': ['14px', { lineHeight: '1.4', fontWeight: '600' }],
        'body': ['14px', { lineHeight: '1.5', fontWeight: '500' }],
        'pill': ['12px', { lineHeight: '1.3', fontWeight: '600' }],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      borderRadius: {
        'card': '12px',
        'tab': '12px',
        'button': '8px',
      },
      boxShadow: {
        'card': '0px 4px 16px rgba(0, 0, 0, 0.04)',
        'hover': '0px 8px 32px rgba(0, 0, 0, 0.12)',
        'glow': '0 0 20px rgba(59, 130, 246, 0.3)',
        'xl-glow': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 0 50px rgba(59, 130, 246, 0.2)',
      },
      animation: {
        'slideDown': 'slideDown 0.4s ease-out',
        'fadeIn': 'fadeIn 0.3s ease-out',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'bounce-slow': 'bounce 3s infinite',
      },
      keyframes: {
        slideDown: {
          '0%': { transform: 'translateY(-20px) scale(0.95)', opacity: '0' },
          '100%': { transform: 'translateY(0) scale(1)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 20px rgba(59, 130, 246, 0.3)' },
          '100%': { boxShadow: '0 0 30px rgba(59, 130, 246, 0.6)' },
        },
      },
    },
  },
  plugins: [],
}