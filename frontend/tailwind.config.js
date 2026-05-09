/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },
      keyframes: {
        pulseSoft: {
          "0%, 100%": { opacity: 1 },
          "50%": { opacity: 0.55 },
        },
        slideUp: {
          "0%": { opacity: 0, transform: "translateY(8px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        pop: {
          "0%": { transform: "scale(0)", opacity: 0 },
          "60%": { transform: "scale(1.25)", opacity: 1 },
          "100%": { transform: "scale(1)", opacity: 1 },
        },
        flyOff: {
          "0%": {
            opacity: 0,
            transform: "translate(-50%, 0) scale(0.5) rotate(0deg)",
          },
          "15%": {
            opacity: 1,
            transform: "translate(-50%, -10px) scale(1) rotate(6deg)",
          },
          "100%": {
            opacity: 0,
            transform:
              "translate(calc(-50% + var(--dx, 0px)), -110px) scale(0.85) rotate(var(--rz, 20deg))",
          },
        },
      },
      animation: {
        pulseSoft: "pulseSoft 2s ease-in-out infinite",
        slideUp: "slideUp 220ms ease-out",
        pop: "pop 360ms cubic-bezier(.17,.67,.4,1.4) both",
        flyOff: "flyOff 1100ms ease-out forwards",
      },
    },
  },
  plugins: [],
};
