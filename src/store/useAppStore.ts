import { create } from "zustand"
import {
  seedAdjustments,
  seedMovements,
  seedProducts,
  seedSales,
  seedStockIns,
  seedUsers,
} from "../mock/seed"
import type {
  ActionResult,
  Adjustment,
  AdjustmentType,
  MovementType,
  Product,
  Role,
  Sale,
  SaleItem,
  StockIn,
  StockMovement,
  ToastState,
  User,
} from "../types/api"

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

export type LoginResult = { ok: true; role: Role } | { ok: false; message: string }

interface AppState {
  users: User[]
  currentUserId: number | null
  products: Product[]
  stockIns: StockIn[]
  adjustments: Adjustment[]
  sales: Sale[]
  movements: StockMovement[]
  toast: ToastState | null
  login: (email: string) => LoginResult
  logout: () => void
  notify: (message: string, tone?: ToastState["tone"]) => void
  dismissToast: () => void
  createProduct: (input: ProductInput) => ActionResult
  updateProduct: (id: number, input: ProductInput) => ActionResult
  stockIn: (input: StockInInput) => ActionResult
  createSale: (items: SaleInputItem[]) => ActionResult
  confirmSale: (id: number) => ActionResult
  cancelSale: (id: number, reason: string) => ActionResult
  deleteSale: (id: number) => ActionResult
  createAdjustment: (input: AdjustmentInput) => ActionResult
  resetMock: () => void
}

function nextId(items: Array<{ id: number }>): number {
  return items.reduce((max, item) => Math.max(max, item.id), 0) + 1
}

function activeUser(state: AppState): User | undefined {
  return state.users.find((user) => user.id === state.currentUserId)
}

function cloneSeed() {
  return {
    users: seedUsers.map((user) => ({ ...user })),
    products: seedProducts.map((product) => ({ ...product })),
    stockIns: seedStockIns.map((item) => ({ ...item })),
    adjustments: seedAdjustments.map((item) => ({ ...item })),
    sales: structuredClone(seedSales),
    movements: seedMovements.map((item) => ({ ...item })),
  }
}

const fail = (message: string): ActionResult => ({ ok: false, message })

export const useAppStore = create<AppState>((set, get) => ({
  ...cloneSeed(),
  currentUserId: null,
  toast: null,

  login: (email) => {
    const user = get().users.find(
      (candidate) => candidate.email.toLowerCase() === email.trim().toLowerCase(),
    )
    if (!user) {
      return {
        ok: false,
        message: "Email demo tidak dikenal. Gunakan owner@demo.com atau manager@demo.com.",
      }
    }
    set({ currentUserId: user.id })
    return { ok: true, role: user.role }
  },

  logout: () => set({ currentUserId: null }),

  notify: (message, tone = "success") => {
    set({ toast: { id: Date.now(), message, tone } })
  },

  dismissToast: () => set({ toast: null }),

  createProduct: (input) => {
    const state = get()
    const user = activeUser(state)
    if (!user) return fail("Sesi tidak ditemukan. Silakan login ulang.")
    if (user.role !== "MANAGER") return fail("Hanya manager yang bisa menambah produk.")

    const sku = input.sku.trim().toUpperCase()
    const name = input.name.trim()
    if (!sku || !name || !input.category.trim() || !input.unit.trim()) {
      return fail("SKU, nama, kategori, dan satuan wajib diisi.")
    }
    if (!Number.isFinite(input.price) || input.price <= 0) {
      return fail("Harga jual harus berupa angka lebih dari 0.")
    }
    if (!Number.isFinite(input.minStock) || input.minStock < 0) {
      return fail("Stok minimum tidak boleh negatif.")
    }
    if (state.products.some((product) => product.sku.toUpperCase() === sku)) {
      return fail(`SKU ${sku} sudah dipakai produk lain.`)
    }

    const product: Product = {
      id: nextId(state.products),
      sku,
      name,
      category: input.category.trim(),
      unit: input.unit.trim(),
      price: input.price,
      avgCost: 0,
      stock: 0,
      minStock: input.minStock,
      status: "PENDING_APPROVAL",
      createdBy: user.id,
      createdAt: new Date().toISOString(),
    }

    set({ products: [product, ...state.products] })
    return { ok: true, message: "Produk dikirim dan menunggu persetujuan owner." }
  },

  updateProduct: (id, input) => {
    const state = get()
    const user = activeUser(state)
    if (!user) return fail("Sesi tidak ditemukan. Silakan login ulang.")
    const product = state.products.find((item) => item.id === id)
    if (!product) return fail("Produk tidak ditemukan.")
    if (
      user.role !== "MANAGER" ||
      product.createdBy !== user.id ||
      product.status !== "PENDING_APPROVAL"
    ) {
      return fail("Hanya produk milikmu yang masih menunggu persetujuan yang bisa diubah.")
    }

    const sku = input.sku.trim().toUpperCase()
    if (!sku || !input.name.trim()) return fail("SKU dan nama wajib diisi.")
    if (!Number.isFinite(input.price) || input.price <= 0) {
      return fail("Harga jual harus berupa angka lebih dari 0.")
    }
    if (!Number.isFinite(input.minStock) || input.minStock < 0) {
      return fail("Stok minimum tidak boleh negatif.")
    }
    if (
      state.products.some(
        (item) => item.id !== id && item.sku.toUpperCase() === sku,
      )
    ) {
      return fail(`SKU ${sku} sudah dipakai produk lain.`)
    }

    const updated: Product = {
      ...product,
      sku,
      name: input.name.trim(),
      category: input.category.trim(),
      unit: input.unit.trim(),
      price: input.price,
      minStock: input.minStock,
    }
    set({
      products: state.products.map((item) => (item.id === id ? updated : item)),
    })
    return { ok: true, message: "Produk diperbarui." }
  },

  stockIn: (input) => {
    const state = get()
    const user = activeUser(state)
    if (!user) return fail("Sesi tidak ditemukan. Silakan login ulang.")
    const product = state.products.find((item) => item.id === input.productId)
    if (!product) return fail("Produk tidak ditemukan.")
    if (product.status !== "ACTIVE") return fail("Produk belum aktif, belum bisa menerima stok.")
    if (!Number.isInteger(input.qty) || input.qty <= 0) {
      return fail("Jumlah barang masuk harus bilangan bulat lebih dari 0.")
    }
    if (!Number.isFinite(input.unitCost) || input.unitCost < 0) {
      return fail("Harga beli per unit tidak boleh negatif.")
    }

    const totalQty = product.stock + input.qty
    const avgCost =
      totalQty === 0
        ? 0
        : (product.stock * product.avgCost + input.qty * input.unitCost) / totalQty
    const record: StockIn = {
      id: nextId(state.stockIns),
      productId: product.id,
      qty: input.qty,
      unitCost: input.unitCost,
      createdBy: user.id,
      createdAt: new Date().toISOString(),
    }
    const movement: StockMovement = {
      id: nextId(state.movements),
      type: "STOCK_IN",
      quantityChange: input.qty,
      productId: product.id,
      reference: { type: "STOCK_IN", id: record.id },
      reason: null,
      createdBy: user.id,
      createdAt: record.createdAt,
    }

    set({
      products: state.products.map((item) =>
        item.id === product.id
          ? { ...item, stock: totalQty, avgCost }
          : item,
      ),
      stockIns: [record, ...state.stockIns],
      movements: [movement, ...state.movements],
    })
    return {
      ok: true,
      message: `${input.qty} ${product.unit} ${product.name} masuk. Stok jadi ${totalQty}.`,
    }
  },

  createSale: (items) => {
    const state = get()
    const user = activeUser(state)
    if (!user) return fail("Sesi tidak ditemukan. Silakan login ulang.")
    if (user.role !== "MANAGER") return fail("Hanya manager yang bisa membuat penjualan.")
    if (items.length < 1 || items.length > 50) {
      return fail("Penjualan harus berisi 1 sampai 50 item.")
    }
    const ids = items.map((item) => item.productId)
    if (new Set(ids).size !== ids.length) return fail("Produk tidak boleh kembar dalam satu penjualan.")

    const saleItems: SaleItem[] = []
    for (const item of items) {
      const product = state.products.find((candidate) => candidate.id === item.productId)
      if (!product) return fail("Ada produk yang tidak ditemukan.")
      if (product.status !== "ACTIVE") return fail(`Produk ${product.name} belum aktif.`)
      if (!Number.isInteger(item.qty) || item.qty <= 0) {
        return fail(`Jumlah ${product.name} harus bilangan bulat lebih dari 0.`)
      }
      saleItems.push({
        id: saleItems.length + 1,
        productId: product.id,
        qty: item.qty,
        price: product.price,
        hppSnapshot: null,
        subtotal: product.price * item.qty,
      })
    }

    const sale: Sale = {
      id: nextId(state.sales),
      status: "PENDING",
      total: saleItems.reduce((total, item) => total + item.subtotal, 0),
      totalHpp: null,
      grossProfit: null,
      createdBy: user.id,
      createdAt: new Date().toISOString(),
      confirmedAt: null,
      cancelledBy: null,
      cancelledAt: null,
      cancelReason: null,
      items: saleItems,
    }

    set({ sales: [sale, ...state.sales] })
    return { ok: true, message: "Penjualan dibuat. Konfirmasi untuk mengurangi stok." }
  },

  confirmSale: (id) => {
    const state = get()
    const user = activeUser(state)
    if (!user) return fail("Sesi tidak ditemukan. Silakan login ulang.")
    const sale = state.sales.find((item) => item.id === id)
    if (!sale) return fail("Penjualan tidak ditemukan.")
    if (sale.status !== "PENDING") return fail("Hanya penjualan PENDING yang bisa dikonfirmasi.")

    for (const item of sale.items) {
      const product = state.products.find((candidate) => candidate.id === item.productId)
      if (!product) return fail("Ada produk yang sudah tidak tersedia.")
      if (product.status !== "ACTIVE") return fail(`Produk ${product.name} belum aktif.`)
      if (product.stock < item.qty) {
        return fail(`Stok ${product.name} tidak cukup. Sisa ${product.stock}.`)
      }
    }

    const confirmedAt = new Date().toISOString()
    const newMovements: StockMovement[] = []
    let movementId = nextId(state.movements)

    const products = state.products.map((product) => {
      const item = sale.items.find((candidate) => candidate.productId === product.id)
      if (!item) return product
      newMovements.push({
        id: movementId,
        type: "SALE",
        quantityChange: -item.qty,
        productId: product.id,
        reference: { type: "SALE", id: sale.id },
        reason: null,
        createdBy: user.id,
        createdAt: confirmedAt,
      })
      movementId += 1
      return { ...product, stock: product.stock - item.qty }
    })

    const items = sale.items.map((item) => {
      const product = state.products.find((candidate) => candidate.id === item.productId)
      return {
        ...item,
        hppSnapshot: product ? product.avgCost : 0,
      }
    })
    const totalHpp = items.reduce(
      (total, item) => total + item.qty * (item.hppSnapshot ?? 0),
      0,
    )
    const updated: Sale = {
      ...sale,
      status: "SUCCESS",
      items,
      totalHpp,
      grossProfit: sale.total - totalHpp,
      confirmedAt,
    }

    set({
      products,
      sales: state.sales.map((item) => (item.id === id ? updated : item)),
      movements: [...newMovements, ...state.movements],
    })
    return { ok: true, message: "Penjualan dikonfirmasi. Stok sudah berkurang." }
  },

  cancelSale: (id, reason) => {
    const state = get()
    const user = activeUser(state)
    if (!user) return fail("Sesi tidak ditemukan. Silakan login ulang.")
    const sale = state.sales.find((item) => item.id === id)
    if (!sale) return fail("Penjualan tidak ditemukan.")
    if (sale.status === "PENDING") return fail("Penjualan PENDING tidak dibatalkan. Hapus saja.")
    if (sale.status === "CANCELLED") return fail("Penjualan ini sudah dibatalkan.")
    const cleanReason = reason.trim()
    if (!cleanReason) return fail("Alasan pembatalan wajib diisi.")
    if (cleanReason.length > 500) return fail("Alasan pembatalan maksimal 500 karakter.")

    const cancelledAt = new Date().toISOString()
    const newMovements: StockMovement[] = []
    let movementId = nextId(state.movements)

    const products = state.products.map((product) => {
      const item = sale.items.find((candidate) => candidate.productId === product.id)
      if (!item) return product
      newMovements.push({
        id: movementId,
        type: "CANCEL_SALE",
        quantityChange: item.qty,
        productId: product.id,
        reference: { type: "SALE", id: sale.id },
        reason: cleanReason,
        createdBy: user.id,
        createdAt: cancelledAt,
      })
      movementId += 1
      return { ...product, stock: product.stock + item.qty }
    })

    const updated: Sale = {
      ...sale,
      status: "CANCELLED",
      grossProfit: null,
      cancelledBy: user.id,
      cancelledAt,
      cancelReason: cleanReason,
    }

    set({
      products,
      sales: state.sales.map((item) => (item.id === id ? updated : item)),
      movements: [...newMovements, ...state.movements],
    })
    return { ok: true, message: "Penjualan dibatalkan. Stok dikembalikan." }
  },

  deleteSale: (id) => {
    const state = get()
    const sale = state.sales.find((item) => item.id === id)
    if (!sale) return fail("Penjualan tidak ditemukan.")
    if (sale.status !== "PENDING") return fail("Hanya penjualan PENDING yang bisa dihapus.")
    set({ sales: state.sales.filter((item) => item.id !== id) })
    return { ok: true, message: "Penjualan pending dihapus." }
  },

  createAdjustment: (input) => {
    const state = get()
    const user = activeUser(state)
    if (!user) return fail("Sesi tidak ditemukan. Silakan login ulang.")
    const product = state.products.find((item) => item.id === input.productId)
    if (!product) return fail("Produk tidak ditemukan.")
    if (product.status !== "ACTIVE") return fail("Produk belum aktif.")
    if (input.type === "DAMAGED" && input.qtyChange >= 0) {
      return fail("Barang rusak harus memakai jumlah negatif.")
    }
    if (input.type === "CORRECTION" && input.qtyChange === 0) {
      return fail("Koreksi stok tidak boleh nol.")
    }
    if (!Number.isInteger(input.qtyChange)) {
      return fail("Perubahan jumlah harus bilangan bulat.")
    }
    const reason = input.reason.trim()
    if (!reason) return fail("Alasan wajib diisi.")

    const adjustment: Adjustment = {
      id: nextId(state.adjustments),
      productId: product.id,
      type: input.type,
      qtyChange: input.qtyChange,
      reason,
      status: "PENDING",
      lossValue: null,
      requestedBy: user.id,
      decidedBy: null,
      createdAt: new Date().toISOString(),
      decidedAt: null,
    }

    set({ adjustments: [adjustment, ...state.adjustments] })
    return { ok: true, message: "Adjustment dikirim dan menunggu persetujuan owner." }
  },

  resetMock: () => {
    set({ ...cloneSeed(), toast: null })
  },
}))

export const movementLabels: Record<MovementType, string> = {
  STOCK_IN: "Barang masuk",
  SALE: "Penjualan",
  CANCEL_SALE: "Pembatalan",
  DAMAGED: "Barang rusak",
  ADJUSTMENT: "Koreksi stok",
}
