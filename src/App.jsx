import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Provider } from './store/StoreProvider'
import { Header, Footer, Guard, Empty } from './components/storefront'
import { useI18n } from './i18n'
import Home from './pages/Home'
import Catalog from './pages/Catalog'
import Product from './pages/Product'
import Auth from './pages/Auth'
import Favorites from './pages/Favorites'
import Account from './pages/Account'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import Admin from './pages/Admin'

export default function App({
  Router = BrowserRouter,
  routerProps = { basename: import.meta.env.BASE_URL },
}) {
  const { t } = useI18n()
  return (
    <Router {...routerProps}>
      <Provider>
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/catalog" element={<Catalog />} />
            <Route path="/product/:slug" element={<Product />} />
            <Route path="/login" element={<Auth />} />
            <Route path="/register" element={<Auth register />} />
            <Route
              path="/favorites"
              element={
                <Guard>
                  <Favorites />
                </Guard>
              }
            />
            <Route
              path="/account"
              element={
                <Guard>
                  <Account />
                </Guard>
              }
            />
            <Route
              path="/admin"
              element={
                <Guard admin>
                  <Admin />
                </Guard>
              }
            />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="*" element={<Empty>{t('Страница не найдена')}</Empty>} />
          </Routes>
        </main>
        <Footer />
      </Provider>
    </Router>
  )
}
