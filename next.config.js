/** @type {import('next').NextConfig} */
const isStaticExport = process.env.STATIC_EXPORT === '1';

module.exports = {
  // Only set output: 'export' when building for static deployment
  ...(isStaticExport && {
    output: 'export',
    exportPathMap: async function (defaultPathMap) {
      // Remove editor routes - they only work in dev mode
      const paths = { ...defaultPathMap };
      Object.keys(paths).forEach((path) => {
        if (path.startsWith('/editor') || path.startsWith('/api')) {
          delete paths[path];
        }
      });
      return paths;
    },
  }),

  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback.fs = false;
    }
    return config;
  },
};
