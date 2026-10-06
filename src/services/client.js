import { createApi } from '../api'
// Production uses the PHP copy next to the storefront; dev uses the Vite proxy.
export const api = createApi({
  base:
    import.meta.env.VITE_API_URL ||
    (import.meta.env.DEV ? '/api' : `${import.meta.env.BASE_URL}backend/public/api`),
  onUnauthorized: () => window.dispatchEvent(new Event('auth-expired')),
})
