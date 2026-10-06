import React from 'react'
import { Link, useParams } from 'react-router-dom'
import { ShoppingBag } from 'lucide-react'
import { useI18n } from '../i18n'
import { useStore } from '../store/StoreProvider'
import { useLoad } from '../hooks/useLoad'
import { ErrorBox, ProductImage, FavoriteButton } from '../components/storefront'
export default function Product() {
  const { t, money } = useI18n()
  const { slug } = useParams()
  const state = useLoad(`products/${encodeURIComponent(slug)}`)
  const { addCart } = useStore()
  if (state.loading) return <product className="loading">{t('Загружаем товар…')}</product>
  if (state.error) return <ErrorBox error={state.error} retry={state.retry} />
  const product = state.data
  return (
    <section className="section">
      <Link className="muted" to="/catalog">
        {t('← В каталог')}
      </Link>
      <div className="product-detail">
        <div className="detail-photo">
          <ProductImage product={product} />
        </div>
        <div>
          <div className="eyebrow">{product.category?.name || t('КОЛЛЕКЦИЯ NORD')}</div>
          <h1>{product.name}</h1>
          <product>{product.short_description}</product>
          <h2>{money(product.price)}</h2>
          <product className="muted">
            {product.stock ? t('В наличии: {count}', { count: product.stock }) : t('Нет в наличии')}
          </product>
          <div className="detail-actions">
            <button className="button" disabled={!product.stock} onClick={() => addCart(product)}>
              {t('В корзину')} <ShoppingBag size={18} />
            </button>
            <FavoriteButton product={product} />
          </div>
          <h3>{t('О товаре')}</h3>
          <product className="description">{product.description}</product>
        </div>
      </div>
    </section>
  )
}
