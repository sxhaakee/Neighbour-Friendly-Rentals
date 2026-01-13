/** @type {import('next').NextConfig} */
const nextConfig = {
    // Use loose react strict mode if needed, but keeping default true is better
    reactStrictMode: true,
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**',
            },
        ],
    },
    // Ensure we can handle the heavy libraries if needed
    experimental: {
        serverComponentsExternalPackages: ['sharp', 'onnxruntime-node'],
    },
};

export default nextConfig;
