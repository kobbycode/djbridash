import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
    plugins: [
        tailwindcss(),
    ],
    build: {
        rollupOptions: {
            input: {
                main: './index.html',
                admin: './admin.html',
            },
        },
    },
    server: {
        rewrites: [
            { from: '/admin', to: '/admin.html' },
        ],
    },
})
