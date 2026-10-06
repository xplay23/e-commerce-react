import { cp, mkdir } from 'node:fs/promises'
import { resolve, basename } from 'node:path'
const destination = resolve('deploy')
await mkdir(destination, { recursive: true })
await cp('dist', destination, { recursive: true })
// В архив публикации не включаем реквизиты БД и SQL: сервер использует уже существующую базу.
await cp('backend', resolve(destination, 'backend'), {
  recursive: true,
  filter: (source) => !['.env', 'database'].includes(basename(source)),
})
console.log(
  'deploy/ is ready for /e-commerce-react/. Configure backend/.env on the server with the existing database connection.',
)
