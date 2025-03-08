import BundleAnalyzer from '@next/bundle-analyzer';

const withBundleAnalyzer = BundleAnalyzer({
    enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
    // Enable production source maps for better debugging
    productionBrowserSourceMaps: false,

    // Optimize images
    images: {
        remotePatterns: [
            {
                protocol: 'http',
                hostname: 'localhost',
                port: '',
                pathname: '/**',
            },
        ],
        deviceSizes: [640, 750, 828, 1080, 1200, 1920],
        imageSizes: [16, 32, 48, 64, 96, 128, 256],
        minimumCacheTTL: 60,
    },

    // Turbopack configuration
    experimental: {
        turbo: {
            // Turbopack specific rules
            rules: {
                // You can add Turbopack-specific rules here
            },
            // Resolve aliases (similar to webpack aliases)
            resolveAlias: {
                // Add any aliases you need
            },
        },
    },

    // Enable webpack analyzer in production build
    webpack: (config, { dev, isServer }) => {
        // Bundle optimization
        config.optimization = {
            ...config.optimization,
            moduleIds: 'deterministic',
            splitChunks: {
                chunks: 'all',
                minSize: 20000,
                maxSize: 70000,
                cacheGroups: {
                    default: false,
                    vendors: false,
                    // Vendor chunk for specific large packages
                    fullcalendar: {
                        name: 'fullcalendar',
                        test: /[\\/]node_modules[\\/]@fullcalendar[\\/]/,
                        chunks: 'all',
                        priority: 30,
                        enforce: true,
                    },
                    recharts: {
                        name: 'recharts',
                        test: /[\\/]node_modules[\\/]recharts[\\/]/,
                        chunks: 'all',
                        priority: 25,
                        enforce: true,
                    },
                    // General vendor chunk
                    vendor: {
                        name: 'vendor',
                        chunks: 'all',
                        test: /[\\/]node_modules[\\/](?!@fullcalendar|recharts)[\\/]/,
                        priority: 20,
                        enforce: true,
                    },
                    // Commons chunk
                    commons: {
                        name: 'commons',
                        chunks: 'all',
                        minChunks: 2,
                        priority: 10,
                        reuseExistingChunk: true,
                    },
                    // Styles chunk
                    styles: {
                        name: 'styles',
                        test: /\.(css|scss)$/,
                        chunks: 'all',
                        enforce: true,
                    },
                },
            },
            runtimeChunk: {
                name: 'runtime',
            },
        };

        // Production optimizations
        if (!dev) {
            config.optimization.minimize = true;
            // Add specific minimizer options if needed
            config.optimization.minimizer = config.optimization.minimizer || [];
        }

        return config;
    },

    // Enable compression
    compress: true,

    // Enable React strict mode
    reactStrictMode: true,

    // Disable x-powered-by header
    poweredByHeader: false,

    // Enable trailing slash
    trailingSlash: false,

    // Configure headers
    async headers() {
        return [
            {
                source: '/:path*',
                headers: [
                    {
                        key: 'X-DNS-Prefetch-Control',
                        value: 'on'
                    },
                    {
                        key: 'X-XSS-Protection',
                        value: '1; mode=block'
                    },
                    {
                        key: 'X-Frame-Options',
                        value: 'SAMEORIGIN'
                    },
                    {
                        key: 'X-Content-Type-Options',
                        value: 'nosniff'
                    },
                    {
                        key: 'Referrer-Policy',
                        value: 'origin-when-cross-origin'
                    }
                ]
            }
        ];
    },

    // Server runtime config
    serverRuntimeConfig: {
        bodyParser: {
            sizeLimit: '10mb',
        },
    },
};

export default withBundleAnalyzer(nextConfig);