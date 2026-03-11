/** tailwind.config.js
 * Configuração do Tailwind CSS.
 * O campo `content` aponta para todos os arquivos que usam classes Tailwind,
 * garantindo que o PurgeCSS remova estilos não usados no build de produção.
 */

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        canvas: '#fefbf5',
        ink: {
          900: '#14171f',
          700: '#2f3a4c',
          600: '#475569',
          500: '#64748b',
        },
        sand: {
          50: '#fffaf0',
          100: '#fdf1dc',
          200: '#f7ddbc',
          300: '#eec89f',
        },
        brand: {
          DEFAULT: '#d16400',
          light: '#ff8a00',
          dark: '#8c3f00',
        },
        mint: {
          100: '#dff8ef',
          500: '#2fbf88',
        },
      },
      fontFamily: {
        sans: ['Sora', 'system-ui', 'sans-serif'],
        display: ['Bricolage Grotesque', 'Sora', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 14px 42px rgba(20, 23, 31, 0.08)',
      },
    },
  },
  plugins: [],
};
