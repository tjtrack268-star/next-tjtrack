/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    domains: ['147.93.9.170'], // Add your backend domain here
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '147.93.9.170',
        port: '8080',
        pathname: '/api/v1.0/images/**',
      },
      {
        protocol: 'http',
        hostname: '147.93.9.170',
        port: '8080',
        pathname: '/api/v1.0/images/**',
      },
    ],
  },
  // API routes configuration
  async rewrites() {
    return [
      {
        source: '/api/proxy/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://147.93.9.170:8080/api/v1.0'}/:path*`,
      },
    ]
  },
  // CORS headers for development
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ]
  },
}

export default nextConfig
