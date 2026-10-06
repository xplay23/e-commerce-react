import React, { createContext, useContext, useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { useI18n } from '../i18n'
import { api } from '../services/client'
const StoreContext = createContext(null)
export const useStore = () => useContext(StoreContext)
// Корзина хранится в браузере: в существующей БД нет таблицы корзин. Проверяем сохранённые данные.
function readCart() {
  try {
    const value = JSON.parse(localStorage.getItem('nord-react-cart') || '[]')
    return Array.isArray(value)
      ? value.filter(
          (item) => item?.product?.id && Number.isInteger(item.quantity) && item.quantity > 0,
        )
      : []
  } catch {
    return []
  }
}
export function Provider({ children }) {
  const { t } = useI18n()
  const [user, setUser] = useState(null)
  const [ready, setReady] = useState(false)
  const [favorites, setFavorites] = useState([])
  const [cart, setCart] = useState(readCart)
  const [notice, setNotice] = useState('')
  // Восстанавливаем пользователя по серверной сессии, а не по данным из localStorage.
  useEffect(() => {
    const expire = () => {
      setUser(null)
      setFavorites([])
    }
    window.addEventListener('auth-expired', expire)
    if (api.tokens.get())
      api
        .request('auth/me')
        .then(setUser)
        .catch((e) => setNotice(e.message))
        .finally(() => setReady(true))
    else setReady(true)
    return () => window.removeEventListener('auth-expired', expire)
  }, [])
  // Избранное всегда читаем из PHP API: оба магазина используют одну таблицу favorites.
  const refreshFavorites = async () => setFavorites(await api.request('favorites'))
  useEffect(() => {
    setFavorites([])
    if (user) refreshFavorites().catch((e) => setNotice(e.message))
  }, [user?.id])
  useEffect(() => {
    localStorage.setItem('nord-react-cart', JSON.stringify(cart))
  }, [cart])
  useEffect(() => {
    if (notice) {
      const timer = setTimeout(() => setNotice(''), 6000)
      return () => clearTimeout(timer)
    }
  }, [notice])
  // Один product_id соответствует одной строке корзины. Количество ограничено известным остатком;
  // окончательную проверку наличия и цены выполняет PHP при оформлении заказа.
  const addCart = (product) => {
    setCart((items) => {
      const found = items.find((item) => item.product.id === product.id)
      return found
        ? items.map((item) =>
            item.product.id === product.id
              ? { product, quantity: Math.min(item.quantity + 1, product.stock) }
              : item,
          )
        : [...items, { product, quantity: 1 }]
    })
    setNotice('Товар добавлен в корзину')
  }
  return (
    <StoreContext.Provider
      value={{
        user,
        setUser,
        ready,
        favorites,
        refreshFavorites,
        cart,
        setCart,
        addCart,
        setNotice,
      }}
    >
      {children}
      {notice && (
        <div className="toast" role="status">
          {t(notice)}
          <button aria-label={t('Закрыть уведомление')} onClick={() => setNotice('')}>
            <X size={16} />
          </button>
        </div>
      )}
    </StoreContext.Provider>
  )
}
