/* eslint-disable @typescript-eslint/no-require-imports */
// Tailwind v4 plugin wrapper for HeroUI v2 theme
// Required for v2 components (Table, Pagination) that use v2 utility classes
// like bg-content1, bg-default-100, rounded-large, shadow-small, text-tiny, etc.
const { heroui } = require("@heroui/theme");

module.exports = heroui();
