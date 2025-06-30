import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {

    // Load environment variables based on the mode
    // @ts-ignore
    const env = loadEnv(mode, process.cwd(), '');

    return {
        plugins: [react()],
        server: {
            host: '0.0.0.0',
            port: parseInt(env.VITE_HTTP_SERVER_PORT || '5001', 10),
        },
    }
})

