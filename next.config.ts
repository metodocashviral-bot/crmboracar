import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  devIndicators: false,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.supabase.co' },
      { protocol: 'https', hostname: 'pps.whatsapp.net' },
    ],
  },
}

export default nextConfig
