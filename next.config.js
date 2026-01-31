/** @type {import('next').NextConfig} */
module.exports = {
  output: 'export',
  
  // Exclude editor pages from static export
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

  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback.fs = false;
    }
    return config;
  },
};
