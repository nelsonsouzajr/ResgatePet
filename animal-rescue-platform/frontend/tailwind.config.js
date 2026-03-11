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
      // Paleta de cores do projeto ResgatePet
      colors: {
        primary: {
          50:  '#fef2f2',
          100: '#fee2e2',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
        },
        brand: {
          DEFAULT: '#e85d04',
          light:   '#f48c06',
          dark:    '#9d0208',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
