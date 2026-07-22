import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  serverExternalPackages: ['pdf-parse-debugging-disabled', 'mammoth'],
};

export default nextConfig;