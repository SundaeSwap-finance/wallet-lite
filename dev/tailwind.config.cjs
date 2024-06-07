const { theme } = require("@sundae/tailwind-config");

module.exports = {
  content: ["./**/*.{js,ts,jsx,tsx}"],
  theme,
  plugins: [
    require("tailwindcss-radix")(),
    require("tailwindcss-animation-delay"),
    require("@tailwindcss/forms"),
  ],
};
