export class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.status = status
  }
}
// Единый клиент сохраняет контракт существующего PHP API для всех страниц магазина.
export function createApi({
  base = '/api',
  storage = localStorage,
  fetcher = fetch,
  onUnauthorized = () => {},
} = {}) {
  // Отдельный ключ позволяет React и Vue иметь независимые сессии на одном домене.
  const key = 'nord-react-auth-token'
  const tokens = {
    get: () => storage.getItem(key),
    set: (token) => storage.setItem(key, token),
    clear: () => storage.removeItem(key),
  }
  async function request(path, { body, ...options } = {}) {
    const headers = new Headers(options.headers)
    headers.set('Accept', 'application/json')
    if (body !== undefined) headers.set('Content-Type', 'application/json')
    // PHP ищет SHA-256 этого Bearer-токена в общей таблице auth_tokens.
    if (tokens.get()) headers.set('Authorization', `Bearer ${tokens.get()}`)
    let response
    try {
      response = await fetcher(`${base.replace(/\/$/, '')}/${path.replace(/^\//, '')}`, {
        ...options,
        headers,
        ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
      })
    } catch {
      throw new ApiError('Сервер недоступен. Проверьте подключение к API.', 0)
    }
    const data = await response.json().catch(() => null)
    if (!response.ok) {
      // Удаляем истёкший токен и уведомляем React, чтобы закрыть защищённые страницы.
      if (response.status === 401) {
        tokens.clear()
        onUnauthorized()
      }
      throw new ApiError(data?.message || `Ошибка сервера (${response.status})`, response.status)
    }
    if (data === null) throw new ApiError('API вернул некорректный ответ.', response.status)
    return data
  }
  return { request, tokens }
}
