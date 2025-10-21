/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Configure headers for CORS
  async headers() {
    // Get allowed origins from environment variables
    const allowedOrigins = process.env.ALLOWED_ORIGINS 
      ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
      : (process.env.NEXT_PUBLIC_BASE_URL 
        ? [process.env.NEXT_PUBLIC_BASE_URL] 
        : ['*']);

    const corsOrigin = Array.isArray(allowedOrigins) && allowedOrigins.length === 1 && allowedOrigins[0] !== '*'
      ? allowedOrigins[0]
      : '*';

    console.log('[Next.js Config] CORS configuration:');
    console.log(`[Next.js Config] Allowed origins: ${corsOrigin}`);

    return [
      {
        // Apply CORS headers to all API routes
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: corsOrigin },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
          { key: 'Access-Control-Max-Age', value: '86400' },
        ],
      },
    ];
  },
}

module.exports = nextConfig
