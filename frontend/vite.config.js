export default {
    server: {
        proxy: {
        '/api': 'http://localhost:8000',
        },
    },
    build: {
        outDir: 'build',
    },
}