import { useMemo, useState, type FormEvent } from "react"
import { CircleAlert, CircleCheck, Clock, Plus, Wrench } from "lucide-react"
import PageHeader from "../components/PageHeader"
import StatCard from "../components/StatCard"
import Badge, { type BadgeTone } from "../components/Badge"
import DataTable, { type Column } from "../components/DataTable"
import EmptyState from "../components/EmptyState"
import Field from "../components/Field"
import Modal from "../components/Modal"
import Pagination from "../components/Pagination"
import { useAppStore } from "../store/useAppStore"
import type { Adjustment, AdjustmentStatus, AdjustmentType } from "../types/api"
import { angka, rupiah, tanggalWaktu } from "../lib/format"
import { paginate } from "../lib/selectors"
import { inputClass, primaryButton, secondaryButton, selectClass } from "../lib/ui"

const statusTone: Record<AdjustmentStatus, BadgeTone> = {
  PENDING: "warning",
  APPROVED: "success",
  REJECTED: "danger",
}

const statusLabel: Record<AdjustmentStatus, string> = {
  PENDING: "Menunggu owner",
  APPROVED: "Disetujui",
  REJECTED: "Ditolak",
}

const typeLabel: Record<AdjustmentType, string> = {
  DAMAGED: "Barang rusak",
  CORRECTION: "Koreksi stok",
}

export default function Adjustments() {
  const products = useAppStore((state) => state.products)
  const adjustments = useAppStore((state) => state.adjustments)
  const currentUserId = useAppStore((state) => state.currentUserId)
  const createAdjustment = useAppStore((state) => state.createAdjustment)
  const notify = useAppStore((state) => state.notify)

  const activeProducts = useMemo(
    () => products.filter((product) => product.status === "ACTIVE"),
    [products],
  )
  const mine = useMemo(
    () => adjustments.filter((item) => item.requestedBy === currentUserId),
    [adjustments, currentUserId],
  )

  const [status, setStatus] = useState<"ALL" | AdjustmentStatus>("ALL")
  const [page, setPage] = useState(1)
  const [open, setOpen] = useState(false)
  const [productId, setProductId] = useState("")
  const [type, setType] = useState<AdjustmentType>("DAMAGED")
  const [qty, setQty] = useState("1")
  const [reason, setReason] = useState("")

  const filtered = useMemo(
    () => mine.filter((item) => status === "ALL" || item.status === status),
    [mine, status],
  )
  const pageData = paginate(filtered, page, 8)

  const pendingCount = mine.filter((item) => item.status === "PENDING").length
  const approvedCount = mine.filter((item) => item.status === "APPROVED").length
  const rejectedCount = mine.filter((item) => item.status === "REJECTED").length

  const openCreate = () => {
    setProductId("")
    setType("DAMAGED")
    setQty("1")
    setReason("")
    setOpen(true)
  }

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const value = Number(qty)
    const result = createAdjustment({
      productId: Number(productId),
      type,
      qtyChange: type === "DAMAGED" ? -Math.abs(value) : value,
      reason,
    })
    notify(result.message ?? (result.ok ? "Adjustment dibuat." : "Gagal."), result.ok ? "success" : "error")
    if (result.ok) setOpen(false)
  }

  const columns: Column<Adjustment>[] = [
    {
      key: "adjustment",
      header: "Adjustment",
      render: (item) => (
        <div>
          <p className="font-semibold text-ink">#{item.id}</p>
          <p className="mt-0.5 text-xs text-ink-soft">{tanggalWaktu(item.createdAt)}</p>
        </div>
      ),
    },
    {
      key: "product",
      header: "Produk",
      render: (item) => {
        const product = products.find((candidate) => candidate.id === item.productId)
        return (
          <div>
            <p className="font-medium text-ink">{product?.name ?? "Produk"}</p>
            <p className="mt-0.5 text-xs text-ink-soft">{product?.sku ?? "-"}</p>
          </div>
        )
      },
    },
    {
      key: "type",
      header: "Jenis",
      render: (item) => (
        <div>
          <p className="text-ink">{typeLabel[item.type]}</p>
          <p className="mt-0.5 text-xs text-ink-soft">{item.reason}</p>
        </div>
      ),
    },
    {
      key: "qty",
      header: "Perubahan",
      align: "right",
      render: (item) => (
        <span
          className={`font-semibold tabular-nums ${
            item.qtyChange < 0 ? "text-danger" : "text-emerald-700"
          }`}
        >
          {item.qtyChange > 0 ? "+" : ""}
          {angka(item.qtyChange)}
        </span>
      ),
    },
    {
      key: "loss",
      header: "Kerugian",
      align: "right",
      render: (item) =>
        item.lossValue === null ? (
          <span className="text-xs text-ink-soft/70">—</span>
        ) : (
          <span className="tabular-nums">{rupiah(item.lossValue)}</span>
        ),
    },
    {
      key: "status",
      header: "Status",
      render: (item) => <Badge tone={statusTone[item.status]}>{statusLabel[item.status]}</Badge>,
    },
  ]

  return (
    <div className="rise space-y-6">
      <PageHeader
        eyebrow="Penyesuaian"
        title="Adjustment"
        description="Ajukan barang rusak atau koreksi stok. Pengajuan manager menunggu persetujuan owner sebelum stok berubah."
        actions={
          <button type="button" onClick={openCreate} className={primaryButton}>
            <Plus size={16} />
            Ajukan adjustment
          </button>
        }
      />

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total pengajuan" value={angka(mine.length)} icon={Wrench} tone="slate" />
        <StatCard label="Menunggu" value={angka(pendingCount)} icon={Clock} tone="amber" />
        <StatCard label="Disetujui" value={angka(approvedCount)} icon={CircleCheck} tone="emerald" />
        <StatCard label="Ditolak" value={angka(rejectedCount)} icon={CircleAlert} tone="red" />
      </section>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-sm font-semibold text-ink">Pengajuan saya</h2>
          <p className="mt-0.5 text-xs text-ink-soft">
            Manager hanya melihat adjustment miliknya sendiri.
          </p>
        </div>
        <select
          value={status}
          onChange={(event) => {
            setStatus(event.target.value as "ALL" | AdjustmentStatus)
            setPage(1)
          }}
          aria-label="Filter status adjustment"
          className={`${selectClass} sm:w-48`}
        >
          <option value="ALL">Semua status</option>
          <option value="PENDING">Menunggu owner</option>
          <option value="APPROVED">Disetujui</option>
          <option value="REJECTED">Ditolak</option>
        </select>
      </div>

      <section className="overflow-hidden rounded-2xl border border-line bg-surface">
        <DataTable
          columns={columns}
          rows={pageData.items}
          rowKey={(item) => item.id}
          minWidth={860}
          empty={
            <EmptyState
              icon={<Wrench size={24} strokeWidth={1.9} />}
              title="Belum ada adjustment"
              description="Ajukan barang rusak atau koreksi stok lewat tombol di atas."
              action={
                <button type="button" onClick={openCreate} className={primaryButton}>
                  <Plus size={15} />
                  Ajukan adjustment
                </button>
              }
            />
          }
        />
        <Pagination
          page={pageData.page}
          pageCount={pageData.pageCount}
          total={pageData.total}
          onPage={setPage}
        />
      </section>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Ajukan adjustment"
        description="Pengajuan akan berstatus pending sampai owner menyetujui."
        footer={
          <>
            <button type="button" onClick={() => setOpen(false)} className={secondaryButton}>
              Batal
            </button>
            <button type="submit" form="adjustment-form" className={primaryButton}>
              Kirim pengajuan
            </button>
          </>
        }
      >
        <form id="adjustment-form" onSubmit={onSubmit} className="space-y-4">
          <Field label="Produk" htmlFor="adjustment-product">
            <select
              id="adjustment-product"
              value={productId}
              onChange={(event) => setProductId(event.target.value)}
              className={selectClass}
            >
              <option value="">Pilih produk aktif</option>
              {activeProducts.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name} ({product.sku}) · stok {product.stock} {product.unit}
                </option>
              ))}
            </select>
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Jenis" htmlFor="adjustment-type">
              <select
                id="adjustment-type"
                value={type}
                onChange={(event) => setType(event.target.value as AdjustmentType)}
                className={selectClass}
              >
                <option value="DAMAGED">Barang rusak</option>
                <option value="CORRECTION">Koreksi stok</option>
              </select>
            </Field>
            <Field
              label={type === "DAMAGED" ? "Jumlah rusak" : "Perubahan stok"}
              htmlFor="adjustment-qty"
              hint={
                type === "DAMAGED"
                  ? "Isi jumlah positif. Sistem menyimpannya sebagai pengurangan stok."
                  : "Boleh positif (stok bertambah) atau negatif (stok berkurang)."
              }
            >
              <input
                id="adjustment-qty"
                type="number"
                step="1"
                min={type === "DAMAGED" ? "1" : undefined}
                value={qty}
                onChange={(event) => setQty(event.target.value)}
                className={inputClass}
              />
            </Field>
          </div>

          <Field label="Alasan" htmlFor="adjustment-reason">
            <textarea
              id="adjustment-reason"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              rows={3}
              className={inputClass}
              placeholder="Karung sobek saat bongkar muat"
            />
          </Field>

          <p className="rounded-xl border border-line bg-surface-muted px-3.5 py-3 text-xs leading-relaxed text-ink-soft">
            Untuk barang rusak, kerugian dihitung dari jumlah × HPP rata-rata saat owner menyetujui.
          </p>
        </form>
      </Modal>
    </div>
  )
}
