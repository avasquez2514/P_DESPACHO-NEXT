const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
});

const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // Ignora errores de lint en el build
  },
  // Puedes agregar otras configuraciones aquí
};

module.exports = withPWA(nextConfig);