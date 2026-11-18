import { useState, type FormEvent } from "react"
import {
  CircleCheck,
  Eye,
  Plus,
  ShoppingCart,
  Trash2,
  TrendingUp,
  Wallet,
  XCircle,
} from "lucide-react"
import PageHeader from "../components/PageHeader"
import StatCard from "../components/StatCard"
import Badge, { type BadgeTone } from "../components/Badge"
import DataTable, { type Column } from "../components/DataTable"
import EmptyState from "../components/EmptyState"
import Field from "../components/Field"
import Modal from "../components/Modal"
import ConfirmDialog from "../components/ConfirmDialog"
import Pagination from "../components/Pagination"
import { ErrorBlock, LoadingBlock } from "../components/QueryFeedback"
import {
  useCancelSale,
  useConfirmSale,
  useCreateSale,
  useDeleteSale,
  useProducts,
  useSale,
  useSales,
} from "../api/hooks"
import { errorMessage } from "../api/client"
import { useAuth } from "../auth/useAuth"
import { useToastStore } from "../store/useToastStore"
import type { SaleBase, SaleStatus } from "../types/api"
import { angka, rupiah, tanggalWaktu } from "../lib/format"
import { pageCount } from "../lib/pagination"
import {
  dangerButton,
  inputClass,
  primaryButton,
  secondaryButton,
  selectClass,
  smallButton,
  smallDangerButton,
} from "../lib/ui"

interface BuilderItem {
  productId: string
  qty: string
}

const statusTone: Record<SaleStatus, BadgeTone> = {
  PENDING: "warning",
  SUCCESS: "success",
  CANCELLED: "danger",
}

const statusLabel: Record<SaleStatus, string> = {
  PENDING: "Pending",
  SUCCESS: "Sukses",
  CANCELLED: "Dibatalkan",
}

const PAGE_SIZE = 8

export default function Sales() {
  const { user } = useAuth()
  const isManager = user?.role === "MANAGER"
  const notify = useToastStore((state) => state.notify)

  const [status, setStatus] = useState<"ALL" | SaleStatus>("ALL")
  const [page, setPage] = useState(1)

  const list = useSales({
    status: status === "ALL" ? undefined : status,
    page,
    limit: PAGE_SIZE,
  })
  const recent = useSales({ limit: 100 })
  const pendingCount = useSales({ status: "PENDING", limit: 1 })
  const activeProducts = useProducts({ status: "ACTIVE", limit: 100 })

  const createSale = useCreateSale()
  const confirmSale = useConfirmSale()
  const cancelSale = useCancelSale()
  const deleteSale = useDeleteSale()

  const [builderOpen, setBuilderOpen] = useState(false)
  const [items, setItems] = useState<BuilderItem[]>([{ productId: "", qty: "1" }])
  const [detailId, setDetailId] = useState<number | null>(null)
  const [deleting, setDeleting] = useState<SaleBase | null>(null)
  const [cancelling, setCancelling] = useState<SaleBase | null>(null)
  const [cancelReason, setCancelReason] = useState("")

  const detailQuery = useSale(detailId)
  const detail = detailQuery.data?.sale ?? null
  const products = activeProducts.data?.items ?? []
  const recentSales = recent.data?.items ?? []

  const omzet = recentSales
    .filter((sale) => sale.status === "SUCCESS")
    .reduce((total, sale) => total + sale.total, 0)
  const grossProfit = recentSales
    .filter((sale) => sale.status === "SUCCESS")
    .reduce((total, sale) => total + (sale.grossProfit ?? 0), 0)

  const builderTotal = items.reduce((total, item) => {
    const product = products.find((candidate) => candidate.id === Number(item.productId))
    if (!product) return total
    return total + product.price * (Number(item.qty) || 0)
  }, 0)

  const openBuilder = () => {
    setItems([{ productId: "", qty: "1" }])
    setBuilderOpen(true)
  }

  const updateItem = (index: number, patch: Partial<BuilderItem>) => {
    setItems((current) =>
      current.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item)),
    )
  }

  const addItem = () => {
    if (items.length >= 50) {
      notify("Maksimal 50 item per penjualan.", "error")
      return
    }
    setItems((current) => [...current, { productId: "", qty: "1" }])
  }

  const removeItem = (index: number) => {
    setItems((current) => current.filter((_, itemIndex) => itemIndex !== index))
  }

  const onCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const payload = items.map((item) => ({
      productId: Number(item.productId),
      qty: Number(item.qty),
    }))

    if (payload.some((item) => !item.productId)) {
      notify("Pilih produk untuk setiap item.", "error")
      return
    }
    if (payload.some((item) => !Number.isInteger(item.qty) || item.qty <= 0)) {
      notify("Jumlah setiap item harus bilangan bulat lebih dari 0.", "error")
      return
    }
    if (new Set(payload.map((item) => item.productId)).size !== payload.length) {
      notify("Produk tidak boleh kembar dalam satu penjualan.", "error")
      return
    }

    try {
      await createSale.mutateAsync(payload)
      notify("Penjualan dibuat dengan status pending.", "success")
      setBuilderOpen(false)
      setPage(1)
    } catch (error) {
      notify(errorMessage(error), "error")
    }
  }

  const onConfirm = async (sale: SaleBase) => {
    try {
      await confirmSale.mutateAsync(sale.id)
      notify(`Penjualan #${sale.id} dikonfirmasi. Stok sudah dipotong.`, "success")
    } catch (error) {
      notify(errorMessage(error), "error")
    }
  }

  const onDelete = async () => {
    if (!deleting) return
    try {
      await deleteSale.mutateAsync(deleting.id)
      notify(`Penjualan #${deleting.id} dihapus.`, "success")
      setDeleting(null)
    } catch (error) {
      notify(errorMessage(error), "error")
    }
  }

  const onCancel = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!cancelling) return
    if (!cancelReason.trim()) {
      notify("Alasan pembatalan wajib diisi.", "error")
      return
    }
    try {
      await cancelSale.mutateAsync({ id: cancelling.id, reason: cancelReason.trim() })
      notify(`Penjualan #${cancelling.id} dibatalkan. Stok dikembalikan.`, "success")
      setCancelling(null)
      setCancelReason("")
    } catch (error) {
      notify(errorMessage(error), "error")
    }
  }

  const columns: Column<SaleBase>[] = [
    {
      key: "sale",
      header: "Penjualan",
      render: (sale) => (
        <div>
          <p className="font-semibold text-ink">#{sale.id}</p>
          <p className="mt-0.5 text-xs text-ink-soft">{tanggalWaktu(sale.createdAt)}</p>
        </div>
      ),
    },
    {
      key: "items",
      header: "Item",
      render: (sale) => (
        <div>
          <p className="text-ink">{angka(sale.itemCount)} produk</p>
          <p className="mt-0.5 text-xs text-ink-soft">oleh {sale.createdBy.name}</p>
        </div>
      ),
    },
    {
      key: "total",
      header: "Total",
      align: "right",
      render: (sale) => (
        <div>
          <p className="font-semibold tabular-nums">{rupiah(sale.total)}</p>
          <p className="mt-0.5 text-xs text-ink-soft">
            {sale.grossProfit === null ? "Laba belum dikunci" : `Laba ${rupiah(sale.grossProfit)}`}
          </p>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (sale) => <Badge tone={statusTone[sale.status]}>{statusLabel[sale.status]}</Badge>,
    },
    {
      key: "action",
      header: "Aksi",
      align: "right",
      render: (sale) => (
        <div className="flex flex-wrap items-center justify-end gap-1.5">
          <button type="button" onClick={() => setDetailId(sale.id)} className={smallButton}>
            <Eye size={13} />
            Detail
          </button>
          {sale.status === "PENDING" && isManager ? (
            <>
              <button
                type="button"
                onClick={() => onConfirm(sale)}
                disabled={confirmSale.isPending}
                className={smallButton}
              >
                <CircleCheck size={13} />
                Konfirmasi
              </button>
              <button
                type="button"
                onClick={() => setDeleting(sale)}
                className={smallDangerButton}
              >
                <Trash2 size={13} />
                Hapus
              </button>
            </>
          ) : null}
          {sale.status === "SUCCESS" ? (
            <button
              type="button"
              onClick={() => {
                setCancelling(sale)
                setCancelReason("")
              }}
              className={smallDangerButton}
            >
              <XCircle size={13} />
              Batalkan
            </button>
          ) : null}
        </div>
      ),
    },
  ]

  const data = list.data

  return (
    <div className="rise space-y-6">
      <PageHeader
        eyebrow="Transaksi"
        title="Penjualan"
        description={
          isManager
            ? "Buat penjualan, konfirmasi untuk memotong stok, atau batalkan penjualan sukses dengan alasan."
            : "Pantau seluruh penjualan manager dan batalkan penjualan sukses bila diperlukan."
        }
        actions={
          isManager ? (
            <button type="button" onClick={openBuilder} className={primaryButton}>
              <Plus size={16} />
              Penjualan baru
            </button>
          ) : (
            <Badge tone="accent">Mode owner</Badge>
          )
        }
      />

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total penjualan"
          value={angka(data?.total ?? 0)}
          icon={ShoppingCart}
          tone="slate"
        />
        <StatCard
          label="Pending"
          value={angka(pendingCount.data?.total ?? 0)}
          hint="Belum memotong stok"
          icon={ShoppingCart}
          tone="amber"
        />
        <StatCard
          label="Omzet sukses"
          value={rupiah(omzet)}
          hint="Dari 100 transaksi terbaru"
          icon={TrendingUp}
          tone="emerald"
        />
        <StatCard
          label="Laba kotor"
          value={rupiah(grossProfit)}
          hint="Dari 100 transaksi terbaru"
          icon={Wallet}
          tone="accent"
        />
      </section>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-sm font-semibold text-ink">Daftar penjualan</h2>
          <p className="mt-0.5 text-xs text-ink-soft">
            {angka(data?.total ?? 0)} transaksi
          </p>
        </div>
        <select
          value={status}
          onChange={(event) => {
            setStatus(event.target.value as "ALL" | SaleStatus)
            setPage(1)
          }}
          aria-label="Filter status penjualan"
          className={`${selectClass} sm:w-48`}
        >
          <option value="ALL">Semua status</option>
          <option value="PENDING">Pending</option>
          <option value="SUCCESS">Sukses</option>
          <option value="CANCELLED">Dibatalkan</option>
        </select>
      </div>

      <section className="overflow-hidden rounded-2xl border border-line bg-surface">
        {list.isPending ? (
          <LoadingBlock label="Memuat penjualan..." />
        ) : list.error ? (
          <ErrorBlock error={list.error} onRetry={() => void list.refetch()} />
        ) : (
          <DataTable
            columns={columns}
            rows={data?.items ?? []}
            rowKey={(sale) => sale.id}
            minWidth={900}
            empty={
              <EmptyState
                icon={<ShoppingCart size={24} strokeWidth={1.9} />}
                title="Belum ada penjualan"
                description={
                  isManager
                    ? "Buat penjualan baru untuk mulai mencatat transaksi."
                    : "Belum ada penjualan yang dicatat manager."
                }
                action={
                  isManager ? (
                    <button type="button" onClick={openBuilder} className={primaryButton}>
                      <Plus size={15} />
                      Penjualan baru
                    </button>
                  ) : undefined
                }
              />
            }
          />
        )}
        {data ? (
          <Pagination
            page={data.page}
            pageCount={pageCount(data.total, PAGE_SIZE)}
            total={data.total}
            onPage={setPage}
          />
        ) : null}
      </section>

      <Modal
        open={builderOpen}
        onClose={() => setBuilderOpen(false)}
        title="Penjualan baru"
        description="Harga jual dikunci saat penjualan dibuat. HPP dikunci saat dikonfirmasi."
        wide
        footer={
          <>
            <button type="button" onClick={() => setBuilderOpen(false)} className={secondaryButton}>
              Batal
            </button>
            <button
              type="submit"
              form="sale-form"
              disabled={createSale.isPending}
              className={primaryButton}
            >
              Simpan sebagai pending
            </button>
          </>
        }
      >
        <form id="sale-form" onSubmit={onCreate} className="space-y-4">
          <div className="space-y-3">
            {items.map((item, index) => {
              const product = products.find(
                (candidate) => candidate.id === Number(item.productId),
              )
              return (
                <div
                  key={index}
                  className="grid gap-3 rounded-xl border border-line bg-surface-muted p-3 sm:grid-cols-[1fr_120px_auto] sm:items-end"
                >
                  <Field label={`Produk ${index + 1}`} htmlFor={`sale-product-${index}`}>
                    <select
                      id={`sale-product-${index}`}
                      value={item.productId}
                      onChange={(event) => updateItem(index, { productId: event.target.value })}
                      className={selectClass}
                    >
                      <option value="">Pilih produk</option>
                      {products.map((candidate) => (
                        <option key={candidate.id} value={candidate.id}>
                          {candidate.name} · {rupiah(candidate.price)} · stok {candidate.stock}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Jumlah" htmlFor={`sale-qty-${index}`}>
                    <input
                      id={`sale-qty-${index}`}
                      type="number"
                      min="1"
                      step="1"
                      value={item.qty}
                      onChange={(event) => updateItem(index, { qty: event.target.value })}
                      className={inputClass}
                    />
                  </Field>
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    disabled={items.length === 1}
                    aria-label={`Hapus item ${index + 1}`}
                    className={`${smallDangerButton} h-[42px] px-3`}
                  >
                    <Trash2 size={14} />
                  </button>
                  {product ? (
                    <p className="text-xs text-ink-soft sm:col-span-3">
                      Subtotal {angka(Number(item.qty) || 0)} × {rupiah(product.price)} ={" "}
                      <span className="font-semibold text-ink">
                        {rupiah(product.price * (Number(item.qty) || 0))}
                      </span>
                    </p>
                  ) : null}
                </div>
              )
            })}
          </div>

          <button type="button" onClick={addItem} className={secondaryButton}>
            <Plus size={15} />
            Tambah item
          </button>

          <div className="flex items-center justify-between rounded-xl border border-line bg-surface-muted px-4 py-3">
            <span className="text-sm font-semibold text-ink">Total penjualan</span>
            <span className="text-lg font-semibold tabular-nums text-ink">{rupiah(builderTotal)}</span>
          </div>
        </form>
      </Modal>

      <Modal
        open={detailId !== null}
        onClose={() => setDetailId(null)}
        title={detail ? `Detail penjualan #${detail.id}` : "Detail penjualan"}
        description={
          detail
            ? `${tanggalWaktu(detail.createdAt)} · dibuat oleh ${detail.createdBy.name}`
            : undefined
        }
        wide
        footer={
          <button type="button" onClick={() => setDetailId(null)} className={secondaryButton}>
            Tutup
          </button>
        }
      >
        {detailQuery.isPending ? (
          <LoadingBlock label="Memuat detail penjualan..." />
        ) : detailQuery.error ? (
          <ErrorBlock error={detailQuery.error} onRetry={() => void detailQuery.refetch()} />
        ) : detail ? (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={statusTone[detail.status]}>{statusLabel[detail.status]}</Badge>
              <Badge tone="neutral">{detail.items.length} item</Badge>
              {detail.confirmedAt ? (
                <span className="text-xs text-ink-soft">
                  Dikonfirmasi {tanggalWaktu(detail.confirmedAt)}
                </span>
              ) : null}
            </div>

            <div className="overflow-hidden rounded-xl border border-line">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-line bg-surface-muted">
                    <th className="px-3 py-2 text-xs font-semibold text-ink-soft">Produk</th>
                    <th className="px-3 py-2 text-right text-xs font-semibold text-ink-soft">Qty</th>
                    <th className="px-3 py-2 text-right text-xs font-semibold text-ink-soft">Harga</th>
                    <th className="px-3 py-2 text-right text-xs font-semibold text-ink-soft">HPP</th>
                    <th className="px-3 py-2 text-right text-xs font-semibold text-ink-soft">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {detail.items.map((item) => (
                    <tr key={item.id} className="border-b border-line/70 last:border-0">
                      <td className="px-3 py-2.5">
                        <p className="font-medium text-ink">{item.product.name}</p>
                        <p className="text-xs text-ink-soft">{item.product.sku}</p>
                      </td>
                      <td className="px-3 py-2.5 text-right tabular-nums">{item.qty}</td>
                      <td className="px-3 py-2.5 text-right tabular-nums">{rupiah(item.price)}</td>
                      <td className="px-3 py-2.5 text-right tabular-nums">
                        {item.hppSnapshot === null ? "—" : rupiah(item.hppSnapshot)}
                      </td>
                      <td className="px-3 py-2.5 text-right font-semibold tabular-nums">
                        {rupiah(item.subtotal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <dl className="grid gap-2 text-sm sm:grid-cols-2">
              <div className="flex items-center justify-between rounded-lg bg-surface-muted px-3 py-2">
                <dt className="text-ink-soft">Total jual</dt>
                <dd className="font-semibold tabular-nums">{rupiah(detail.total)}</dd>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-surface-muted px-3 py-2">
                <dt className="text-ink-soft">Total HPP</dt>
                <dd className="font-semibold tabular-nums">
                  {detail.totalHpp === null ? "Belum dikunci" : rupiah(detail.totalHpp)}
                </dd>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-surface-muted px-3 py-2">
                <dt className="text-ink-soft">Laba kotor</dt>
                <dd className="font-semibold tabular-nums">
                  {detail.grossProfit === null ? "—" : rupiah(detail.grossProfit)}
                </dd>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-surface-muted px-3 py-2">
                <dt className="text-ink-soft">Pembatalan</dt>
                <dd className="max-w-[220px] truncate text-right text-xs text-ink-soft">
                  {detail.cancelReason ?? "—"}
                </dd>
              </div>
            </dl>
          </div>
        ) : null}
      </Modal>

      <ConfirmDialog
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        onConfirm={() => void onDelete()}
        title="Hapus penjualan pending?"
        description="Penjualan pending belum memotong stok, jadi aman dihapus. Tindakan ini tidak bisa dibatalkan."
        confirmLabel="Hapus penjualan"
      >
        <p className="rounded-xl border border-line bg-surface-muted px-4 py-3 text-sm text-ink">
          {deleting ? `Penjualan #${deleting.id} · ${rupiah(deleting.total)}` : ""}
        </p>
      </ConfirmDialog>

      <Modal
        open={cancelling !== null}
        onClose={() => setCancelling(null)}
        title={cancelling ? `Batalkan penjualan #${cancelling.id}` : "Batalkan penjualan"}
        description="Stok akan dikembalikan setelah pembatalan. Penjualan sukses tidak bisa dihapus."
        footer={
          <>
            <button type="button" onClick={() => setCancelling(null)} className={secondaryButton}>
              Kembali
            </button>
            <button
              type="submit"
              form="cancel-form"
              disabled={cancelSale.isPending}
              className={dangerButton}
            >
              Batalkan penjualan
            </button>
          </>
        }
      >
        <form id="cancel-form" onSubmit={onCancel} className="space-y-4">
          <Field label="Alasan pembatalan" htmlFor="cancel-reason" hint="Maksimal 500 karakter.">
            <textarea
              id="cancel-reason"
              value={cancelReason}
              onChange={(event) => setCancelReason(event.target.value)}
              rows={3}
              maxLength={500}
              className={inputClass}
              placeholder="Customer batal membeli"
            />
          </Field>
        </form>
      </Modal>
    </div>
  )
}
