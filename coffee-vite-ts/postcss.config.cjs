module.exports = {
  plugins: [
    // Support `&:hover {}` / nested rules in existing `src/style.css`.
    require('postcss-nesting'),
    // Tailwind v4 moved the PostCSS plugin to a separate package.
    require('@tailwindcss/postcss'),
    require('autoprefixer'),
  ],
};

