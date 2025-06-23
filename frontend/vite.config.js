export default {
    server: {
        proxy: {
            '^/(api|media|control)(/.*)?$': { // proxy all requests
				target: 'http://localhost:8000', // Backend server
				changeOrigin: true,
				rewrite: (path) => path, // Forward the full path
			},
        },
    },
    build: {
        outDir: 'build',
    },
}