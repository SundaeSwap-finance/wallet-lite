import forms from "@tailwindcss/forms";
import animation from "tailwindcss-animation-delay";
import radix from "tailwindcss-radix";

export default {
  content: ["./**/*.{js,ts,jsx,tsx}"],
  plugins: [
    radix({
      variantPrefix: "radix",
    }),
    animation,
    forms,
  ],
};
