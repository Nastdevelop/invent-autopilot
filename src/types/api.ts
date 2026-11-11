export type Role = "OWNER" | "MANAGER"

export interface User {
  id: number
  name: string
  email: string
  role: Role
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
  createdBy: number
  createdAt: string
}

export interface StockIn {
  id: number
  productId: number
  qty: number
  unitCost: number
  createdBy: number
  createdAt: string
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
  requestedBy: number
  decidedBy: number | null
  createdAt: string
  decidedAt: string | null
}

export type SaleStatus = "PENDING" | "SUCCESS" | "CANCELLED"

export interface SaleItem {
  id: number
  productId: number
  qty: number
  price: number
  hppSnapshot: number | null
  subtotal: number
}

export interface Sale {
  id: number
  status: SaleStatus
  total: number
  totalHpp: number | null
  grossProfit: number | null
  createdBy: number
  createdAt: string
  confirmedAt: string | null
  cancelledBy: number | null
  cancelledAt: string | null
  cancelReason: string | null
  items: SaleItem[]
}

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
  productId: number
  reference: { type: MovementReferenceType; id: number } | null
  reason: string | null
  createdBy: number
  createdAt: string
}

export interface ToastState {
  id: number
  message: string
  tone: "success" | "error" | "info"
}

export type ActionResult =
  | { ok: true; message?: string }
  | { ok: false; message: string }
