/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['via.placeholder.com', 'images.unsplash.com'],
  },
  webpack: (config, { isServer }) => {
    // Add explicit alias for src directory
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': require('path').resolve(__dirname, 'src'),
      'src': require('path').resolve(__dirname, 'src'),
    }
    
    // Ensure .tsx and .ts files are resolved
    config.resolve.extensions = ['.tsx', '.ts', '.jsx', '.js', '.json']
    
    return config
  },
}

module.exports = nextConfig 