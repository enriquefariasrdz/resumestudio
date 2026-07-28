import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  serverExternalPackages: [
    'pdf-parse-debugging-disabled',
    'mammoth',
    'pdfjs-dist',
    'tesseract.js',
    '@napi-rs/canvas',
  ],
};

export default nextConfig;