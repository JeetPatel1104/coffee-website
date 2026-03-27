module.exports = {
  plugins: [
    // Inline `@import "shadcn/tailwind.css"` so Tailwind can see the theme tokens.
    require('postcss-import'),
    // Support CSS nesting used in existing `src/index.css`.
    require('postcss-nesting'),
    // Tailwind v4 PostCSS plugin.
    require('@tailwindcss/postcss'),
    require('autoprefixer'),
  ],
};

