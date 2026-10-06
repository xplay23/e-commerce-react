import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Heart, ShoppingBag, User, ArrowRight, Plus } from 'lucide-react'
import { useI18n } from '../i18n'
import { api } from '../services/client'
import { useStore } from '../store/StoreProvider'
export function Header() {
  const { t, language, setLanguage } = useI18n()
  const { user, cart, favorites } = useStore()
  return (
    <>
      <div className="announcement">
        {t('Вещи, которые делают каждый день лучше')} <span>{t('Продумано до мелочей.')}</span>
      </div>
      <header>
        <Link to="/" className="logo">
          NORD<span>MARKET</span>
        </Link>
        <nav>
          <Link to="/catalog">{t('Каталог')}</Link>
          <Link to="/catalog?inStock=true">{t('В наличии')}</Link>
          <Link to="/favorites">{t('Избранное')}</Link>
        </nav>
        <div className="header-actions">
          <select
            className="language-switch"
            aria-label={t('Язык интерфейса')}
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            <option value="uk">УКР</option>
            <option value="ru">РУС</option>
            <option value="en">ENG</option>
          </select>
          <Link to="/favorites" aria-label={t('Избранное')}>
            <Heart size={21} />
            {favorites.length > 0 && <b>{favorites.length}</b>}
          </Link>
          <Link to={user ? '/account' : '/login'} aria-label={t('Личный кабинет')}>
            <User size={21} />
          </Link>
          <Link to="/cart" aria-label={t('Корзина')}>
            <ShoppingBag size={21} />
            {cart.length > 0 && <b>{cart.reduce((n, item) => n + item.quantity, 0)}</b>}
          </Link>
        </div>
      </header>
    </>
  )
}

export function Footer() {
  const { t } = useI18n()
  return (
    <footer>
      <Link className="logo" to="/">
        NORD<span>MARKET</span>
      </Link>
      <product>{t('Меньше случайных вещей. Больше любимых.')}</product>
      <Link to="/catalog">
        {t('Найти своё')} <ArrowRight size={16} />
      </Link>
      <small>© {new Date().getFullYear()} NORD Market</small>
    </footer>
  )
}

export function ErrorBox({ error, retry }) {
  const { t } = useI18n()
  return (
    <div className="error" role="alert">
      <product>{t(error)}</product>
      {retry && <button onClick={retry}>{t('Попробовать снова')}</button>}
    </div>
  )
}

export function Empty({ children }) {
  const { t } = useI18n()
  return (
    <div className="empty">
      <ShoppingBag size={32} />
      <product>{children}</product>
      <Link className="button" to="/catalog">
        {t('Перейти в каталог')} <ArrowRight size={16} />
      </Link>
    </div>
  )
}

export function ProductImage({ product }) {
  return (
    <img
      src={product.image_url || `${import.meta.env.BASE_URL}placeholder.svg`}
      alt={product.name}
      loading="lazy"
      onError={(e) => {
        e.currentTarget.onerror = null
        e.currentTarget.src = `${import.meta.env.BASE_URL}placeholder.svg`
      }}
    />
  )
}

export function FavoriteButton({ product }) {
  const { t } = useI18n()
  const { user, favorites, refreshFavorites, setNotice } = useStore()
  const navigate = useNavigate()
  const [busy, setBusy] = useState(false)
  const active = favorites.some((f) => f.product_id === product.id)
  async function toggle() {
    if (!user) {
      navigate('/login')
      return
    }
    setBusy(true)
    try {
      await api.request(
        active ? `favorites?product_id=${encodeURIComponent(product.id)}` : 'favorites',
        active ? { method: 'DELETE' } : { method: 'POST', body: { product_id: product.id } },
      )
      await refreshFavorites()
    } catch (e) {
      setNotice(e.message)
    } finally {
      setBusy(false)
    }
  }
  return (
    <button
      className={`favorite ${active ? 'selected' : ''}`}
      aria-label={active ? t('Удалить из избранного') : t('Добавить в избранное')}
      aria-pressed={active}
      disabled={busy}
      onClick={toggle}
    >
      <Heart size={19} />
    </button>
  )
}

export function Card({ product }) {
  const { t, money } = useI18n()
  const { addCart } = useStore()
  return (
    <article className="product-card">
      <div className="product-photo">
        <Link to={`/product/${product.slug}`}>
          <ProductImage product={product} />
        </Link>
        <FavoriteButton product={product} />
        {product.old_price > product.price && (
          <span className="badge">
            −{Math.round((1 - product.price / product.old_price) * 100)}%
          </span>
        )}
      </div>
      <div className="product-meta">{product.category?.name || t('Коллекция NORD')}</div>
      <Link className="product-name" to={`/product/${product.slug}`}>
        {product.name}
      </Link>
      <div className="price-row">
        <span>
          {money(product.price)}{' '}
          {product.old_price > product.price && <del>{money(product.old_price)}</del>}
        </span>
        <button
          aria-label={t('Добавить {name} в корзину', { name: product.name })}
          disabled={!product.stock}
          onClick={() => addCart(product)}
        >
          <Plus size={18} />
        </button>
      </div>
      {!product.stock && <small>{t('Нет в наличии')}</small>}
    </article>
  )
}

export function Grid({ products }) {
  const { t } = useI18n()
  return products.length ? (
    <div className="product-grid">
      {products.map((product) => (
        <Card key={product.id} product={product} />
      ))}
    </div>
  ) : (
    <Empty>{t('Пока нет товаров')}</Empty>
  )
}

// Клиентская проверка нужна для интерфейса. Реальные права администратора проверяет PHP requireAdmin().
export function Guard({ children, admin = false }) {
  const { t } = useI18n()
  const { user, ready } = useStore()
  if (!ready) return <product className="loading">{t('Проверяем сессию…')}</product>
  if (!user)
    return (
      <section className="auth-panel">
        <h1>{t('Войдите в аккаунт')}</h1>
        <product>{t('Эта страница доступна после входа.')}</product>
        <Link className="button" to="/login">
          {t('Войти')}
        </Link>
      </section>
    )
  if (admin && user.role !== 'admin')
    return <ErrorBox error="У вас нет доступа к управлению товарами." />
  return children
}
