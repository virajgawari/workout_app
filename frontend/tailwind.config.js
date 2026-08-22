/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#07111f",
        panel: "#0d192b",
        panelSoft: "#12233a",
        glow: "#5ef2b6",
        ember: "#ff7a59",
        pulse: "#66d0ff",
        gold: "#f6cf56"
      },
      fontFamily: {
        sans: ["Space Grotesk", "ui-sans-serif", "system-ui"],
        display: ["Bebas Neue", "Impact", "sans-serif"]
      },
      boxShadow: {
        neon: "0 0 0 1px rgba(94,242,182,0.15), 0 24px 70px rgba(0,0,0,0.35)"
      },
      backgroundImage: {
        mesh:
          "radial-gradient(circle at top left, rgba(102,208,255,0.22), transparent 30%), radial-gradient(circle at top right, rgba(255,122,89,0.20), transparent 28%), linear-gradient(145deg, #07111f 0%, #0b1a2e 35%, #07111f 100%)"
      }
    }
  },
  plugins: []
};
