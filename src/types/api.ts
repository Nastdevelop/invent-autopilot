export type Role = "OWNER" | "MANAGER"

export interface User {
  id: number
  name: string
  email: string
  role: Role
}

export interface UserRef {
  id: number
  name: string
}

export interface ProductRef {
  id: number
  sku: string
  name: string
}

export type ProductStatus = "ACTIVE" | "PENDING_APPROVAL"

export interface Product {
  id: number
  sku: string
  name: string
  category: string
  unit: string
  price: number
  avgCost: number
  stock: number
  minStock: number
  status: ProductStatus
  createdAt: string
}

export interface Paginated<T> {
  items: T[]
  page: number
  limit: number
  total: number
}

export interface StockIn {
  id: number
  productId: number
  qty: number
  unitCost: number
  createdAt: string
  product?: ProductRef
  createdBy?: UserRef
}

export type AdjustmentType = "DAMAGED" | "CORRECTION"
export type AdjustmentStatus = "PENDING" | "APPROVED" | "REJECTED"

export interface Adjustment {
  id: number
  productId: number
  type: AdjustmentType
  qtyChange: number
  reason: string
  status: AdjustmentStatus
  lossValue: number | null
  product: ProductRef
  requestedBy: UserRef
  decidedBy: UserRef | null
  createdAt: string
  decidedAt: string | null
}

export type SaleStatus = "PENDING" | "SUCCESS" | "CANCELLED"

export interface SaleItem {
  id: number
  productId: number
  product: { sku: string; name: string; unit: string }
  qty: number
  price: number
  hppSnapshot: number | null
  subtotal: number
}

export interface SaleBase {
  id: number
  status: SaleStatus
  total: number
  totalHpp: number | null
  grossProfit: number | null
  itemCount: number
  createdBy: UserRef
  createdAt: string
  confirmedAt: string | null
  cancelledBy: UserRef | null
  cancelledAt: string | null
  cancelReason: string | null
}

export interface Sale extends SaleBase {
  items: SaleItem[]
}

export type SaleSummary = SaleBase

export type MovementType =
  | "STOCK_IN"
  | "SALE"
  | "CANCEL_SALE"
  | "DAMAGED"
  | "ADJUSTMENT"

export type MovementReferenceType = "STOCK_IN" | "SALE" | "ADJUSTMENT"

export interface StockMovement {
  id: number
  type: MovementType
  quantityChange: number
  product: ProductRef
  reference: { type: MovementReferenceType; id: number } | null
  reason: string | null
  createdBy: UserRef
  createdAt: string
}

export interface DashboardSummary {
  period: { from: string; to: string; timezone: string }
  sales: {
    count: number
    omzet: number
    hpp: number
    grossProfit: number
    grossMarginPercent: number
    cancelledCount: number
  }
  damaged: { count: number; units: number; lossValue: number }
  profitAfterLoss: number
  inventory: {
    productCount: number
    totalUnits: number
    totalValue: number
    lowStockCount: number
    outOfStockCount: number
  }
}

export interface SalesTrend {
  period: { from: string; to: string; timezone: string }
  series: Array<{
    date: string
    count: number
    omzet: number
    hpp: number
    grossProfit: number
  }>
}

export interface LowStockItem {
  id: number
  sku: string
  name: string
  category: string
  unit: string
  stock: number
  minStock: number
  shortage: number
  isOutOfStock: boolean
}

export interface ProductInput {
  sku: string
  name: string
  category: string
  unit: string
  price: number
  minStock: number
}

export interface StockInInput {
  productId: number
  qty: number
  unitCost: number
}

export interface SaleInputItem {
  productId: number
  qty: number
}

export interface AdjustmentInput {
  productId: number
  type: AdjustmentType
  qtyChange: number
  reason: string
}

export interface ProductListParams {
  search?: string
  category?: string
  status?: ProductStatus
  page?: number
  limit?: number
}

export interface StockInListParams {
  productId?: number
  page?: number
  limit?: number
}

export interface AdjustmentListParams {
  status?: AdjustmentStatus
  type?: AdjustmentType
  productId?: number
  page?: number
  limit?: number
}

export interface SaleListParams {
  status?: SaleStatus
  page?: number
  limit?: number
}

export interface MovementListParams {
  productId?: number
  type?: MovementType
  from?: string
  to?: string
  page?: number
  limit?: number
}

export interface DashboardParams {
  from?: string
  to?: string
}
