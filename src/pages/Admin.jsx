import React, { useState } from 'react'
import { X, Plus } from 'lucide-react'
import { useI18n } from '../i18n'
import { api } from '../services/client'
import { useLoad } from '../hooks/useLoad'
import { productPayload } from '../domain'
import { ErrorBox } from '../components/storefront'
const blank = {
  name: '',
  slug: '',
  category_id: '',
  description: '',
  short_description: '',
  price: '',
  old_price: '',
  stock: 0,
  image_url: '',
  is_active: true,
  is_featured: false,
}

export default function Admin() {
  const { t, money } = useI18n()
  const [version, setVersion] = useState(0)
  const products = useLoad('admin/products', version)
  const categories = useLoad('categories')
  const [edit, setEdit] = useState(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  async function save(e) {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      const payload = productPayload(edit)
      await api.request(edit.id ? `admin/products/${edit.id}` : 'admin/products', {
        method: edit.id ? 'PUT' : 'POST',
        body: payload,
      })
      setEdit(null)
      setVersion((v) => v + 1)
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }
  // Скрываем товар через is_active, сохраняя его ID и связи в общей базе.
  async function hide(product) {
    setBusy(true)
    setError('')
    try {
      await api.request(`admin/products/${product.id}`, {
        method: 'PUT',
        body: productPayload({ ...product, is_active: !product.is_active }),
      })
      setVersion((v) => v + 1)
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }
  return (
    <section className="section">
      <div className="account-heading">
        <div>
          <div className="eyebrow">{t('ПАНЕЛЬ АДМИНИСТРАТОРА')}</div>
          <h1>{t('Управление товарами')}</h1>
          <product className="muted">{t('Изменения видны в обоих магазинах.')}</product>
        </div>
        <button
          className="button"
          onClick={() => {
            setError('')
            setEdit({ ...blank })
          }}
        >
          <Plus size={18} /> {t('Добавить товар')}
        </button>
      </div>
      {error && <ErrorBox error={error} />}{' '}
      {products.loading ? (
        <product>{t('Загружаем…')}</product>
      ) : products.error ? (
        <ErrorBox error={products.error} retry={products.retry} />
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>{t('Товар')}</th>
                <th>{t('Цена')}</th>
                <th>{t('Остаток')}</th>
                <th>{t('Статус')}</th>
                <th>{t('Действия')}</th>
              </tr>
            </thead>
            <tbody>
              {products.data.map((product) => (
                <tr key={product.id}>
                  <td>
                    {product.name}
                    <small>{product.slug}</small>
                  </td>
                  <td>{money(product.price)}</td>
                  <td>{product.stock}</td>
                  <td>{product.is_active ? t('Опубликован') : t('Скрыт')}</td>
                  <td>
                    <button
                      disabled={busy}
                      onClick={() => {
                        setError('')
                        setEdit({
                          ...product,
                          category_id: product.category_id || '',
                          old_price: product.old_price ?? '',
                        })
                      }}
                    >
                      {t('Редактировать')}
                    </button>
                    <button disabled={busy} onClick={() => hide(product)}>
                      {product.is_active ? t('Скрыть') : t('Опубликовать')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {edit && (
        <div className="modal-backdrop">
          <section
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-label={t('Редактирование товара')}
          >
            <div className="account-heading">
              <h2>{edit.id ? t('Редактировать товар') : t('Новый товар')}</h2>
              <button disabled={busy} aria-label={t('Закрыть')} onClick={() => setEdit(null)}>
                <X />
              </button>
            </div>
            <form onSubmit={save}>
              {[
                ['name', t('Название'), 'text'],
                ['slug', t('Slug (латиница и дефисы)'), 'text'],
                ['price', t('Цена, USD'), 'number'],
                ['old_price', t('Старая цена, USD'), 'number'],
                ['stock', t('Остаток'), 'number'],
                ['image_url', t('URL изображения'), 'url'],
              ].map(([key, label, type]) => (
                <label key={key}>
                  {label}
                  <input
                    type={type}
                    min={type === 'number' ? 0 : undefined}
                    step={key === 'stock' ? 1 : 'any'}
                    required={['name', 'slug', 'price', 'stock'].includes(key)}
                    value={edit[key] ?? ''}
                    onChange={(e) => setEdit({ ...edit, [key]: e.target.value })}
                  />
                </label>
              ))}
              <label>
                {t('Категория')}
                <select
                  value={edit.category_id}
                  onChange={(e) => setEdit({ ...edit, category_id: e.target.value })}
                >
                  <option value="">{t('Без категории')}</option>
                  {categories.data?.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </label>
              {categories.error && <ErrorBox error={categories.error} retry={categories.retry} />}
              <label>
                {t('Краткое описание')}
                <textarea
                  maxLength="500"
                  value={edit.short_description || ''}
                  onChange={(e) => setEdit({ ...edit, short_description: e.target.value })}
                />
              </label>
              <label>
                {t('Описание')}
                <textarea
                  required
                  value={edit.description}
                  onChange={(e) => setEdit({ ...edit, description: e.target.value })}
                />
              </label>
              {[
                ['is_active', t('Опубликован')],
                ['is_featured', t('Показывать на главной')],
              ].map(([key, label]) => (
                <label className="check" key={key}>
                  <input
                    type="checkbox"
                    checked={edit[key]}
                    onChange={(e) => setEdit({ ...edit, [key]: e.target.checked })}
                  />
                  {label}
                </label>
              ))}
              {error && <ErrorBox error={error} />}
              <button className="button" disabled={busy}>
                {busy ? t('Сохраняем…') : t('Сохранить')}
              </button>
            </form>
          </section>
        </div>
      )}
    </section>
  )
}
