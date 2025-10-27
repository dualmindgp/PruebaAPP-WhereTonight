/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // ← NUEVO: Habilita export estático para Capacitor
  images: {
    unoptimized: true // ← NUEVO: Necesario para export estático
  },
  experimental: {
    serverComponentsExternalPackages: ['maplibre-gl']
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      'maplibre-gl': 'maplibre-gl/dist/maplibre-gl.js'
    }
    return config
  }
};

module.exports = nextConfig;
