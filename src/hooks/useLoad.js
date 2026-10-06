import { useEffect, useState } from 'react'
import { api } from '../services/client'
// Общая загрузка с повторным запросом; version обновляется после изменений в админке.
export function useLoad(path, version = 0) {
  const [state, set] = useState({ loading: true, data: null, error: '' })
  const [retry, setRetry] = useState(0)
  useEffect(() => {
    // При смене фильтра или страницы игнорируем запоздалый ответ предыдущего запроса.
    let alive = true
    set({ loading: true, data: null, error: '' })
    api
      .request(path)
      .then((data) => alive && set({ loading: false, data, error: '' }))
      .catch((e) => alive && set({ loading: false, data: null, error: e.message }))
    return () => {
      alive = false
    }
  }, [path, version, retry])
  return { ...state, retry: () => setRetry((v) => v + 1) }
}
