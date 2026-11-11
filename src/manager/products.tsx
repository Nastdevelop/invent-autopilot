import { useMemo, useState, type FormEvent } from "react"
import { CircleCheck, PackageOpen, Pencil, Plus, Search, Trash2 } from "lucide-react"
import PageHeader from "../components/PageHeader"
import StatCard from "../components/StatCard"
import Badge from "../components/Badge"
import DataTable, { type Column } from "../components/DataTable"
import EmptyState from "../components/EmptyState"
import Field from "../components/Field"
import Modal from "../components/Modal"
import ConfirmDialog from "../components/ConfirmDialog"
import Pagination from "../components/Pagination"
import { useAppStore, type ProductInput } from "../store/useAppStore"
import { useAuth } from "../auth/useAuth"
import type { Product } from "../types/api"
import { angka, rupiah } from "../lib/format"
import { paginate } from "../lib/selectors"
import {
  inputClass,
  primaryButton,
  secondaryButton,
  selectClass,
  smallButton,
  smallDangerButton,
} from "../lib/ui"

interface FormState {
  sku: string
  name: string
  category: string
  unit: string
  price: string
  minStock: string
}

const emptyForm: FormState = {
  sku: "",
  name: "",
  category: "",
  unit: "",
  price: "",
  minStock: "0",
}

function statusBadge(status: Product["status"]) {
  return status === "ACTIVE" ? (
    <Badge tone="success">Aktif</Badge>
  ) : (
    <Badge tone="warning">Menunggu owner</Badge>
  )
}

export default function Products() {
  const products = useAppStore((state) => state.products)
  const currentUserId = useAppStore((state) => state.currentUserId)
  const createProduct = useAppStore((state) => state.createProduct)
  const updateProduct = useAppStore((state) => state.updateProduct)
  const approveProduct = useAppStore((state) => state.approveProduct)
  const deleteProduct = useAppStore((state) => state.deleteProduct)
  const notify = useAppStore((state) => state.notify)
  const { user } = useAuth()
  const isOwner = user?.role === "OWNER"

  const [search, setSearch] = useState("")
  const [status, setStatus] = useState<"ALL" | Product["status"]>("ALL")
  const [page, setPage] = useState(1)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)
  const [deleting, setDeleting] = useState<Product | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    return products.filter((product) => {
      const matchQuery =
        !query ||
        product.name.toLowerCase().includes(query) ||
        product.sku.toLowerCase().includes(query)
      const matchStatus = status === "ALL" || product.status === status
      return matchQuery && matchStatus
    })
  }, [products, search, status])

  const pageData = paginate(filtered, page, 10)
  const activeCount = products.filter((product) => product.status === "ACTIVE").length
  const pendingCount = products.length - activeCount
  const lowStockCount = products.filter(
    (product) => product.status === "ACTIVE" && product.stock <= product.minStock,
  ).length

  const openCreate = () => {
    setEditing(null)
    setForm(emptyForm)
    setOpen(true)
  }

  const openEdit = (product: Product) => {
    setEditing(product)
    setForm({
      sku: product.sku,
      name: product.name,
      category: product.category,
      unit: product.unit,
      price: String(product.price),
      minStock: String(product.minStock),
    })
    setOpen(true)
  }

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const input: ProductInput = {
      sku: form.sku,
      name: form.name,
      category: form.category,
      unit: form.unit,
      price: Number(form.price),
      minStock: Number(form.minStock),
    }
    const result = editing ? updateProduct(editing.id, input) : createProduct(input)
    notify(result.message ?? (result.ok ? "Berhasil." : "Gagal."), result.ok ? "success" : "error")
    if (result.ok) setOpen(false)
  }

  const onApprove = (product: Product) => {
    const result = approveProduct(product.id)
    notify(
      result.message ?? (result.ok ? "Produk disetujui." : "Gagal menyetujui produk."),
      result.ok ? "success" : "error",
    )
  }

  const onDelete = () => {
    if (!deleting) return
    const result = deleteProduct(deleting.id)
    notify(
      result.message ?? (result.ok ? "Produk dihapus." : "Gagal menghapus produk."),
      result.ok ? "success" : "error",
    )
    if (result.ok) setDeleting(null)
  }

  const columns: Column<Product>[] = [
    {
      key: "product",
      header: "Produk",
      render: (product) => (
        <div className="min-w-0">
          <p className="truncate font-semibold text-ink">{product.name}</p>
          <p className="mt-0.5 text-xs text-ink-soft">{product.sku}</p>
        </div>
      ),
    },
    {
      key: "category",
      header: "Kategori",
      render: (product) => (
        <div>
          <p className="text-ink">{product.category}</p>
          <p className="mt-0.5 text-xs text-ink-soft">per {product.unit}</p>
        </div>
      ),
    },
    {
      key: "price",
      header: "Harga jual",
      align: "right",
      render: (product) => <span className="tabular-nums">{rupiah(product.price)}</span>,
    },
    {
      key: "stock",
      header: "Stok",
      align: "right",
      render: (product) => (
        <div>
          <p className="font-semibold tabular-nums">
            {angka(product.stock)} {product.unit}
          </p>
          <p className="mt-0.5 text-xs text-ink-soft">min {angka(product.minStock)}</p>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (product) => statusBadge(product.status),
    },
    {
      key: "action",
      header: "Aksi",
      align: "right",
      render: (product) => {
        const canEdit =
          isOwner ||
          (product.status === "PENDING_APPROVAL" && product.createdBy === currentUserId)
        const canApprove = isOwner && product.status === "PENDING_APPROVAL"
        if (!canEdit && !canApprove && !isOwner) {
          return <span className="text-xs text-ink-soft/70">—</span>
        }
        return (
          <div className="flex flex-wrap items-center justify-end gap-1.5">
            {canApprove ? (
              <button
                type="button"
                onClick={() => onApprove(product)}
                className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-xs font-semibold text-emerald-700 transition-colors hover:bg-emerald-100"
              >
                <CircleCheck size={13} />
                Setujui
              </button>
            ) : null}
            {canEdit ? (
              <button type="button" onClick={() => openEdit(product)} className={smallButton}>
                <Pencil size={13} />
                Edit
              </button>
            ) : null}
            {isOwner ? (
              <button
                type="button"
                onClick={() => setDeleting(product)}
                className={smallDangerButton}
              >
                <Trash2 size={13} />
                Hapus
              </button>
            ) : null}
          </div>
        )
      },
    },
  ]

  return (
    <div className="rise space-y-6">
      <PageHeader
        eyebrow="Katalog"
        title="Produk"
        description={
          isOwner
            ? "Kelola seluruh produk, setujui produk baru dari manager, dan hapus produk tanpa riwayat."
            : "Tambah produk baru, pantau stok, dan lengkapi data jual. Produk baru manager menunggu persetujuan owner."
        }
        actions={
          <button type="button" onClick={openCreate} className={primaryButton}>
            <Plus size={16} />
            Tambah produk
          </button>
        }
      />

      <section className="grid gap-3 sm:grid-cols-3">
        <StatCard label="Total produk" value={angka(products.length)} icon={PackageOpen} tone="slate" />
        <StatCard label="Produk aktif" value={angka(activeCount)} icon={PackageOpen} tone="emerald" />
        <StatCard
          label="Stok rendah"
          value={angka(lowStockCount)}
          hint={`${pendingCount} produk menunggu persetujuan`}
          icon={PackageOpen}
          tone="amber"
        />
      </section>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft/70"
          />
          <input
            type="search"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value)
              setPage(1)
            }}
            placeholder="Cari nama atau SKU..."
            aria-label="Cari produk"
            className={`${inputClass} pl-10`}
          />
        </div>

        <select
          value={status}
          onChange={(event) => {
            setStatus(event.target.value as "ALL" | Product["status"])
            setPage(1)
          }}
          aria-label="Filter status produk"
          className={`${selectClass} sm:w-52`}
        >
          <option value="ALL">Semua status</option>
          <option value="ACTIVE">Aktif</option>
          <option value="PENDING_APPROVAL">Menunggu persetujuan</option>
        </select>
      </div>

      <section className="overflow-hidden rounded-2xl border border-line bg-surface">
        <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3.5 sm:px-6">
          <div>
            <h2 className="text-sm font-semibold text-ink">Daftar produk</h2>
            <p className="mt-0.5 text-xs text-ink-soft">{filtered.length} produk cocok</p>
          </div>
          <Badge tone="neutral">{status === "ALL" ? "Semua" : status === "ACTIVE" ? "Aktif" : "Pending"}</Badge>
        </div>

        <DataTable
          columns={columns}
          rows={pageData.items}
          rowKey={(product) => product.id}
          empty={
            <EmptyState
              icon={<PackageOpen size={24} strokeWidth={1.9} />}
              title="Produk tidak ditemukan"
              description="Ubah kata kunci atau filter status, atau tambahkan produk baru."
              action={
                <button type="button" onClick={openCreate} className={primaryButton}>
                  <Plus size={15} />
                  Tambah produk
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
        title={editing ? "Edit produk" : "Tambah produk"}
        description={
          editing
            ? isOwner
              ? "Perubahan produk owner langsung tersimpan."
              : "Perubahan hanya bisa dilakukan selama produk masih menunggu persetujuan."
            : isOwner
              ? "Produk yang dibuat owner langsung aktif dan bisa dipakai transaksi."
              : "Produk akan berstatus menunggu persetujuan owner sebelum bisa dipakai transaksi."
        }
        footer={
          <>
            <button type="button" onClick={() => setOpen(false)} className={secondaryButton}>
              Batal
            </button>
            <button type="submit" form="product-form" className={primaryButton}>
              {editing ? "Simpan perubahan" : isOwner ? "Tambah produk" : "Kirim produk"}
            </button>
          </>
        }
      >
        <form id="product-form" onSubmit={onSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="SKU" htmlFor="sku" hint="Kode unik produk, contoh BRS-001.">
              <input
                id="sku"
                value={form.sku}
                onChange={(event) => setForm({ ...form, sku: event.target.value })}
                className={inputClass}
                placeholder="BRS-001"
              />
            </Field>
            <Field label="Nama produk" htmlFor="name">
              <input
                id="name"
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
                className={inputClass}
                placeholder="Beras 5kg"
              />
            </Field>
            <Field label="Kategori" htmlFor="category">
              <input
                id="category"
                value={form.category}
                onChange={(event) => setForm({ ...form, category: event.target.value })}
                className={inputClass}
                placeholder="Sembako"
              />
            </Field>
            <Field label="Satuan" htmlFor="unit">
              <input
                id="unit"
                value={form.unit}
                onChange={(event) => setForm({ ...form, unit: event.target.value })}
                className={inputClass}
                placeholder="karung"
              />
            </Field>
            <Field label="Harga jual" htmlFor="price" hint="Rupiah per satuan.">
              <input
                id="price"
                type="number"
                min="0"
                step="any"
                value={form.price}
                onChange={(event) => setForm({ ...form, price: event.target.value })}
                className={inputClass}
                placeholder="65000"
              />
            </Field>
            <Field label="Stok minimum" htmlFor="minStock">
              <input
                id="minStock"
                type="number"
                min="0"
                step="1"
                value={form.minStock}
                onChange={(event) => setForm({ ...form, minStock: event.target.value })}
                className={inputClass}
                placeholder="10"
              />
            </Field>
          </div>
          <p className="rounded-xl border border-line bg-surface-muted px-3.5 py-3 text-xs leading-relaxed text-ink-soft">
            Stok dan HPP rata-rata tidak diisi di sini. Keduanya berubah lewat barang masuk dan
            penjualan yang dikonfirmasi.
          </p>
        </form>
      </Modal>

      <ConfirmDialog
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        onConfirm={onDelete}
        title="Hapus produk?"
        description="Produk hanya bisa dihapus kalau belum punya riwayat barang masuk, penjualan, atau adjustment."
        confirmLabel="Hapus produk"
      >
        <p className="rounded-xl border border-line bg-surface-muted px-4 py-3 text-sm text-ink">
          {deleting ? `${deleting.name} · ${deleting.sku}` : ""}
        </p>
      </ConfirmDialog>
    </div>
  )
}
