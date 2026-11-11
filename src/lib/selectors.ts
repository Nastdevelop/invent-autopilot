import type { Product, User } from "../types/api"

export interface PageResult<T> {
  items: T[]
  page: number
  pageCount: number
  total: number
}

export function paginate<T>(items: T[], page: number, limit: number): PageResult<T> {
  const total = items.length
  const pageCount = Math.max(1, Math.ceil(total / limit))
  const safePage = Math.min(Math.max(1, page), pageCount)
  const start = (safePage - 1) * limit
  return {
    items: items.slice(start, start + limit),
    page: safePage,
    pageCount,
    total,
  }
}

export function findProduct(products: Product[], id: number): Product | undefined {
  return products.find((product) => product.id === id)
}

export function findUser(users: User[], id: number): User | undefined {
  return users.find((user) => user.id === id)
}

export function sum(values: number[]): number {
  return values.reduce((total, value) => total + value, 0)
}
