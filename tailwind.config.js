/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["layouts/**/*.html", "content/**/*.md", "public/**/*.js"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'Liberation Mono', 'Courier New', 'monospace'],
      },
      screens: {
        '3xl': '1920px',
      },
    },
  },
  plugins: [],
}

