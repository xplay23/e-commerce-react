import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, X, Plus, Minus } from 'lucide-react'
import { useI18n } from '../i18n'
import { useStore } from '../store/StoreProvider'
import { Empty, ProductImage } from '../components/storefront'
export default function Cart() {
  const { t, money } = useI18n()
  const { cart, setCart } = useStore()
  const total = cart.reduce((n, item) => n + item.product.price * item.quantity, 0)
  return (
    <section className="section">
      <div className="eyebrow">{t('ПОЧТИ У ВАС')}</div>
      <h1 className="page-title">{t('Корзина')}</h1>
      {!cart.length ? (
        <Empty>{t('Ваша корзина пока пуста')}</Empty>
      ) : (
        <div className="cart-layout">
          <div>
            {cart.map((item) => (
              <div className="cart-row" key={item.product.id}>
                <Link to={`/product/${item.product.slug}`}>
                  <ProductImage product={item.product} />
                </Link>
                <div>
                  <Link to={`/product/${item.product.slug}`}>{item.product.name}</Link>
                  <product>{money(item.product.price)}</product>
                </div>
                <div className="quantity">
                  <button
                    aria-label={t('Уменьшить количество')}
                    disabled={item.quantity <= 1}
                    onClick={() =>
                      setCart(
                        cart.map((cartItem) =>
                          cartItem.product.id === item.product.id
                            ? { ...cartItem, quantity: cartItem.quantity - 1 }
                            : cartItem,
                        ),
                      )
                    }
                  >
                    <Minus size={14} />
                  </button>
                  <span>{item.quantity}</span>
                  <button
                    aria-label={t('Увеличить количество')}
                    disabled={item.quantity >= item.product.stock}
                    onClick={() =>
                      setCart(
                        cart.map((cartItem) =>
                          cartItem.product.id === item.product.id
                            ? { ...cartItem, quantity: cartItem.quantity + 1 }
                            : cartItem,
                        ),
                      )
                    }
                  >
                    <Plus size={14} />
                  </button>
                </div>
                <button
                  aria-label={t('Удалить товар')}
                  onClick={() =>
                    setCart(cart.filter((cartItem) => cartItem.product.id !== item.product.id))
                  }
                >
                  <X size={18} />
                </button>
              </div>
            ))}
          </div>
          <div className="summary">
            <h2>{t('Ваш заказ')}</h2>
            <product>
              {t('Товары')} <strong>{money(total)}</strong>
            </product>
            <small>{t('Актуальные цены и наличие проверяются при оформлении.')}</small>
            <Link className="button" to="/checkout">
              {t('Оформить заказ')} <ArrowRight size={17} />
            </Link>
          </div>
        </div>
      )}
    </section>
  )
}
