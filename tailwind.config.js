/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Brand atoms — warm off-white surface, near-black ink, hairline borders
        surface: "#FAFAF7",
        ink: {
          DEFAULT: "#111111",
          2: "#5A5A58",
          3: "#9A9A98",
        },
        hair: "rgba(0,0,0,0.07)",
      },
      fontFamily: {
        // Each weight/style is its own family because RN does not synthesize
        // weight/italic for custom fonts (esp. on Android).
        sans: ["Inter_400Regular"],
        "sans-medium": ["Inter_500Medium"],
        "sans-semibold": ["Inter_600SemiBold"],
        // Fraunces — the editorial serif.
        serif: ["Fraunces_400Regular"],
        "serif-medium": ["Fraunces_500Medium"],
        "serif-semibold": ["Fraunces_600SemiBold"],
        "serif-italic": ["Fraunces_400Regular_Italic"],
      },
    },
  },
  plugins: [],
};
