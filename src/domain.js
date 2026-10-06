export const money = (value) =>
  new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(Number(value))
// PUT в PHP заменяет все поля товара, поэтому формируем полный payload и при скрытии товара.
export function productPayload(form) {
  const price = Number(form.price)
  const stock = Number(form.stock)
  // Пустая старая цена должна стать null, а не 0 после числового преобразования.
  const oldPrice = form.old_price === '' || form.old_price == null ? null : Number(form.old_price)
  if (
    !form.name.trim() ||
    !form.description.trim() ||
    !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(form.slug)
  )
    throw new Error('Заполните название, описание и slug (латиница, цифры, дефисы).')
  if (
    !Number.isFinite(price) ||
    price < 0 ||
    !Number.isInteger(stock) ||
    stock < 0 ||
    (oldPrice !== null && (!Number.isFinite(oldPrice) || oldPrice < 0))
  )
    throw new Error('Проверьте цену и остаток.')
  return {
    category_id: form.category_id || '',
    name: form.name.trim(),
    slug: form.slug,
    description: form.description.trim(),
    short_description: form.short_description || '',
    price,
    old_price: oldPrice,
    stock,
    image_url: form.image_url || '',
    is_active: Boolean(form.is_active),
    is_featured: Boolean(form.is_featured),
  }
}
