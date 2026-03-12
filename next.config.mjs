/** @type {import('next').NextConfig} */
const nextConfig = {
    // Use loose react strict mode if needed, but keeping default true is better
    reactStrictMode: true,
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'epolbovqrclrfozfgwvc.supabase.co',
            },
            {
                protocol: 'https',
                hostname: '*.supabase.co',
            },
            {
                protocol: 'https',
                hostname: 'lh3.googleusercontent.com',
            },
            {
                protocol: 'https',
                hostname: 'images.unsplash.com',
            },
            {
                protocol: 'https',
                hostname: '*.googleusercontent.com',
            },
        ],
    },
    // Ensure we can handle the heavy libraries if needed
    experimental: {
        serverComponentsExternalPackages: ['sharp', 'onnxruntime-node'],
    },
};

export default nextConfig;
