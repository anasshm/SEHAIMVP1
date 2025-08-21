/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        'app-bg': '#f5f5f7',
        'card-bg': '#ffffff',
        'card-border': '#e5e5e7',
        'text-primary': '#000000',
        'text-secondary': '#6b7280',
        'protein': '#ff6b6b',
        'carbs': '#ff9f43',
        'fat': '#54a0ff',
        'calories': '#ff6b6b',
        'onboarding-primary': '#1D1923', // Updated to match app's primary color 
      },
      borderRadius: {
        'card': '16px'
      }
    },
  },
  plugins: [],
}
