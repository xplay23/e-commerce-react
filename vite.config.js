import { defineConfig, loadEnv } from 'vite'
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const target = env.API_PROXY_TARGET || 'http://localhost:8080'
  return {
    base: '/e-commerce-react/',
    server: { port: 5174, strictPort: true, proxy: { '/api': { target, changeOrigin: true } } },
    preview: {
      port: 4174,
      proxy: {
        '/e-commerce-react/backend/public/api': {
          target,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/e-commerce-react\/backend\/public\/api/, '/api'),
        },
      },
    },
  }
})
