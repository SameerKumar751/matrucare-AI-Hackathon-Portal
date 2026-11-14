/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        void: '#080711',      // primary background
        night: '#100D1D',     // secondary background
        surface: '#171425',   // surfaces
        magenta: '#FF2DAA',   // accent 1
        neon: '#00E5FF',      // accent 2
        gold: '#F5C879',      // metallic highlight
        fg: '#F7F4ED',        // primary text
        muted: '#A5A1B5',     // secondary text
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"Space Mono"', 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [],
};
