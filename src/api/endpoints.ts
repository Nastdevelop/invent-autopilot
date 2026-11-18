import { buildQuery, request } from "./client"
import type {
  Adjustment,
  AdjustmentInput,
  AdjustmentListParams,
  DashboardParams,
  DashboardSummary,
  LowStockItem,
  MovementListParams,
  Paginated,
  Product,
  ProductInput,
  ProductListParams,
  Sale,
  SaleBase,
  SaleInputItem,
  SaleListParams,
  SalesTrend,
  StockIn,
  StockInInput,
  StockInListParams,
  StockMovement,
  User,
} from "../types/api"

interface ListParams {
  page?: number
  limit?: number
}

export const api = {
  // Auth
  login(input: { email: string; password: string }) {
    return request<{ token: string; user: User }>("/auth/login", {
      method: "POST",
      body: input,
    })
  },
  me() {
    return request<{ user: User }>("/auth/me")
  },

  // Products
  listProducts(params: ProductListParams = {}) {
    return request<Paginated<Product>>(`/products${buildQuery(params)}`)
  },
  createProduct(input: ProductInput) {
    return request<{ product: Product }>("/products", { method: "POST", body: input })
  },
  updateProduct(id: number, input: Partial<ProductInput>) {
    return request<{ product: Product }>(`/products/${id}`, { method: "PATCH", body: input })
  },
  deleteProduct(id: number) {
    return request<{ id: number }>(`/products/${id}`, { method: "DELETE" })
  },
  approveProduct(id: number) {
    return request<{ product: Product }>(`/products/${id}/approve`, { method: "POST" })
  },

  // Stock in
  listStockIns(params: StockInListParams = {}) {
    return request<Paginated<StockIn>>(`/stock-ins${buildQuery(params)}`)
  },
  createStockIn(input: StockInInput) {
    return request<{ stockIn: StockIn; product: Product }>("/stock-ins", {
      method: "POST",
      body: input,
    })
  },

  // Adjustments
  listAdjustments(params: AdjustmentListParams = {}) {
    return request<Paginated<Adjustment>>(`/adjustments${buildQuery(params)}`)
  },
  createAdjustment(input: AdjustmentInput) {
    return request<{ adjustment: Adjustment }>("/adjustments", {
      method: "POST",
      body: input,
    })
  },
  approveAdjustment(id: number) {
    return request<{ adjustment: Adjustment }>(`/adjustments/${id}/approve`, {
      method: "POST",
    })
  },
  rejectAdjustment(id: number) {
    return request<{ adjustment: Adjustment }>(`/adjustments/${id}/reject`, {
      method: "POST",
    })
  },

  // Sales
  listSales(params: SaleListParams = {}) {
    return request<Paginated<SaleBase>>(`/sales${buildQuery(params)}`)
  },
  getSale(id: number) {
    return request<{ sale: Sale }>(`/sales/${id}`)
  },
  createSale(items: SaleInputItem[]) {
    return request<{ sale: Sale }>("/sales", { method: "POST", body: { items } })
  },
  deleteSale(id: number) {
    return request<{ id: number }>(`/sales/${id}`, { method: "DELETE" })
  },
  confirmSale(id: number) {
    return request<{ sale: Sale }>(`/sales/${id}/confirm`, { method: "POST" })
  },
  cancelSale(id: number, reason: string) {
    return request<{ sale: Sale }>(`/sales/${id}/cancel`, {
      method: "POST",
      body: { reason },
    })
  },

  // Dashboard (owner)
  dashboardSummary(params: DashboardParams = {}) {
    return request<DashboardSummary>(`/dashboard/summary${buildQuery(params)}`)
  },
  salesTrend(params: DashboardParams = {}) {
    return request<SalesTrend>(`/dashboard/sales-trend${buildQuery(params)}`)
  },
  lowStock(params: ListParams = {}) {
    return request<Paginated<LowStockItem>>(`/dashboard/low-stock${buildQuery(params)}`)
  },

  // Stock movements
  listMovements(params: MovementListParams = {}) {
    return request<Paginated<StockMovement>>(`/stock-movements${buildQuery(params)}`)
  },
}
