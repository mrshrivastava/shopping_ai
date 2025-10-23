/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      // ✅ Instagram CDNs (multiple regions)
      {
        protocol: 'https',
        hostname: '**',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.fna.fbcdn.net',
        pathname: '/**',
      },

      // ✅ Facebook CDNs (covers fbcdn.net variants)
      {
        protocol: 'https',
        hostname: '**.fbcdn.net',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.facebook.com',
        pathname: '/**',
      },

      // ✅ Twitter / X CDNs
      {
        protocol: 'https',
        hostname: '**.twimg.com',
        pathname: '/**',
      },

      // ✅ LinkedIn / Google / YouTube thumbnails
      {
        protocol: 'https',
        hostname: '**.licdn.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.googleusercontent.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.ytimg.com',
        pathname: '/**',
      },

      // ✅ Generic image hosting (optional)
      {
        protocol: 'https',
        hostname: '**.imgur.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.cloudinary.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.stockx.com',
      },
    ],
  },
};

module.exports = nextConfig;
