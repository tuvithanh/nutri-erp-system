/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        sidebar: {
          bg: "#18181b", // Tối đậm
          hover: "#27272a", // Hover item
          active: "#6366f1", // Tím active
        },
      },
    },
  },
  plugins: [],
};
