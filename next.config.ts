import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        // Replace this with your Supabase project's hostname
        // Find it in your Supabase URL: https://[YOUR_HOSTNAME].supabase.co
        hostname: 'hsagorvqnxdjefvtmdkg.supabase.co', 
        port: '',
        pathname: '/storage/v1/object/public/resource_images/**',
      },
    ],
  },
};

export default nextConfig;
