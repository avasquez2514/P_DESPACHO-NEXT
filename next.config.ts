// next.config.js
const withPWA = require("next-pwa")({
  dest: "public",
  disable: process.env.NODE_ENV === "development", // 🚫 Desactiva PWA en dev
});

module.exports = withPWA({
  reactStrictMode: true,
});
