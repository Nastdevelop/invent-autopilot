import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query"
import { api } from "./endpoints"
import { useAuthStore } from "../store/useAuthStore"
import type {
  AdjustmentInput,
  AdjustmentListParams,
  DashboardParams,
  MovementListParams,
  ProductInput,
  ProductListParams,
  SaleInputItem,
  SaleListParams,
  StockInInput,
  StockInListParams,
} from "../types/api"

const DATA_KEYS = [
  "products",
  "product",
  "stock-ins",
  "adjustments",
  "sales",
  "sale",
  "dashboard-summary",
  "dashboard-trend",
  "dashboard-low-stock",
  "stock-movements",
]

export function invalidateData(queryClient: QueryClient) {
  for (const key of DATA_KEYS) {
    void queryClient.invalidateQueries({ queryKey: [key] })
  }
}

export const queryKeys = {
  products: (params: ProductListParams) => ["products", params] as const,
  stockIns: (params: StockInListParams) => ["stock-ins", params] as const,
  adjustments: (params: AdjustmentListParams) => ["adjustments", params] as const,
  sales: (params: SaleListParams) => ["sales", params] as const,
  sale: (id: number) => ["sale", id] as const,
  summary: (params: DashboardParams) => ["dashboard-summary", params] as const,
  trend: (params: DashboardParams) => ["dashboard-trend", params] as const,
  lowStock: (params: { page?: number; limit?: number }) =>
    ["dashboard-low-stock", params] as const,
  movements: (params: MovementListParams) => ["stock-movements", params] as const,
}

// Auth
export function useLogin() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: api.login,
    onSuccess: ({ token, user }) => {
      useAuthStore.getState().setSession(token, user)
      queryClient.clear()
    },
  })
}

// Products
export function useProducts(params: ProductListParams = {}, enabled = true) {
  return useQuery({
    queryKey: queryKeys.products(params),
    queryFn: () => api.listProducts(params),
    enabled,
    placeholderData: keepPreviousData,
  })
}

export function useCreateProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: ProductInput) => api.createProduct(input),
    onSuccess: () => invalidateData(queryClient),
  })
}

export function useUpdateProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: Partial<ProductInput> }) =>
      api.updateProduct(id, input),
    onSuccess: () => invalidateData(queryClient),
  })
}

export function useDeleteProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => api.deleteProduct(id),
    onSuccess: () => invalidateData(queryClient),
  })
}

export function useApproveProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => api.approveProduct(id),
    onSuccess: () => invalidateData(queryClient),
  })
}

// Stock in
export function useStockIns(params: StockInListParams = {}) {
  return useQuery({
    queryKey: queryKeys.stockIns(params),
    queryFn: () => api.listStockIns(params),
    placeholderData: keepPreviousData,
  })
}

export function useCreateStockIn() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: StockInInput) => api.createStockIn(input),
    onSuccess: () => invalidateData(queryClient),
  })
}

// Adjustments
export function useAdjustments(params: AdjustmentListParams = {}) {
  return useQuery({
    queryKey: queryKeys.adjustments(params),
    queryFn: () => api.listAdjustments(params),
    placeholderData: keepPreviousData,
  })
}

export function useCreateAdjustment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: AdjustmentInput) => api.createAdjustment(input),
    onSuccess: () => invalidateData(queryClient),
  })
}

export function useApproveAdjustment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => api.approveAdjustment(id),
    onSuccess: () => invalidateData(queryClient),
  })
}

export function useRejectAdjustment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => api.rejectAdjustment(id),
    onSuccess: () => invalidateData(queryClient),
  })
}

// Sales
export function useSales(params: SaleListParams = {}) {
  return useQuery({
    queryKey: queryKeys.sales(params),
    queryFn: () => api.listSales(params),
    placeholderData: keepPreviousData,
  })
}

export function useSale(id: number | null) {
  return useQuery({
    queryKey: queryKeys.sale(id ?? 0),
    queryFn: () => api.getSale(id as number),
    enabled: id !== null,
  })
}

export function useCreateSale() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (items: SaleInputItem[]) => api.createSale(items),
    onSuccess: () => invalidateData(queryClient),
  })
}

export function useDeleteSale() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => api.deleteSale(id),
    onSuccess: () => invalidateData(queryClient),
  })
}

export function useConfirmSale() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => api.confirmSale(id),
    onSuccess: () => invalidateData(queryClient),
  })
}

export function useCancelSale() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) =>
      api.cancelSale(id, reason),
    onSuccess: () => invalidateData(queryClient),
  })
}

// Dashboard
export function useDashboardSummary(params: DashboardParams = {}) {
  return useQuery({
    queryKey: queryKeys.summary(params),
    queryFn: () => api.dashboardSummary(params),
  })
}

export function useSalesTrend(params: DashboardParams = {}) {
  return useQuery({
    queryKey: queryKeys.trend(params),
    queryFn: () => api.salesTrend(params),
  })
}

export function useLowStock(params: { page?: number; limit?: number } = {}) {
  return useQuery({
    queryKey: queryKeys.lowStock(params),
    queryFn: () => api.lowStock(params),
  })
}

// Movements
export function useMovements(params: MovementListParams = {}) {
  return useQuery({
    queryKey: queryKeys.movements(params),
    queryFn: () => api.listMovements(params),
    placeholderData: keepPreviousData,
  })
}
