import { useState, type FormEvent } from "react"
import {
  CircleCheck,
  PackageOpen,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react"
import PageHeader from "../components/PageHeader"
import StatCard from "../components/StatCard"
import Badge from "../components/Badge"
import DataTable, { type Column } from "../components/DataTable"
import EmptyState from "../components/EmptyState"
import Field from "../components/Field"
import Modal from "../components/Modal"
import ConfirmDialog from "../components/ConfirmDialog"
import Pagination from "../components/Pagination"
import { ErrorBlock, LoadingBlock } from "../components/QueryFeedback"
import {
  useApproveProduct,
  useCreateProduct,
  useDeleteProduct,
  useProducts,
  useUpdateProduct,
} from "../api/hooks"
import { errorMessage } from "../api/client"
import { useAuth } from "../auth/useAuth"
import { useToastStore } from "../store/useToastStore"
import type { Product, ProductStatus } from "../types/api"
import { angka, rupiah } from "../lib/format"
import { pageCount, useDebouncedValue } from "../lib/pagination"
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

function statusBadge(status: ProductStatus) {
  return status === "ACTIVE" ? (
    <Badge tone="success">Aktif</Badge>
  ) : (
    <Badge tone="warning">Menunggu owner</Badge>
  )
}

export default function Products() {
  const { user } = useAuth()
  const isOwner = user?.role === "OWNER"
  const notify = useToastStore((state) => state.notify)

  const [search, setSearch] = useState("")
  const [status, setStatus] = useState<"ALL" | ProductStatus>("ALL")
  const [page, setPage] = useState(1)
  const debouncedSearch = useDebouncedValue(search)

  const params = {
    search: debouncedSearch.trim() || undefined,
    status: status === "ALL" ? undefined : status,
    page,
    limit: 10,
  }

  const list = useProducts(params)
  const totals = useProducts({ limit: 1 })
  const activeTotals = useProducts({ status: "ACTIVE", limit: 1 })
  const pendingTotals = useProducts({ status: "PENDING_APPROVAL", limit: 1 })

  const createProduct = useCreateProduct()
  const updateProduct = useUpdateProduct()
  const approveProduct = useApproveProduct()
  const deleteProduct = useDeleteProduct()

  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)
  const [deleting, setDeleting] = useState<Product | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)

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

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const input = {
      sku: form.sku.trim().toUpperCase(),
      name: form.name.trim(),
      category: form.category.trim(),
      unit: form.unit.trim(),
      price: Number(form.price),
      minStock: Number(form.minStock),
    }
    if (!input.sku || !input.name || !input.category || !input.unit) {
      notify("SKU, nama, kategori, dan satuan wajib diisi.", "error")
      return
    }
    if (!Number.isFinite(input.price) || input.price <= 0) {
      notify("Harga jual harus berupa angka lebih dari 0.", "error")
      return
    }
    if (!Number.isFinite(input.minStock) || input.minStock < 0) {
      notify("Stok minimum tidak boleh negatif.", "error")
      return
    }

    try {
      if (editing) {
        await updateProduct.mutateAsync({ id: editing.id, input })
        notify("Produk diperbarui.", "success")
      } else {
        await createProduct.mutateAsync(input)
        notify(
          isOwner
            ? "Produk ditambahkan dan langsung aktif."
            : "Produk dikirim dan menunggu persetujuan owner.",
          "success",
        )
      }
      setOpen(false)
    } catch (error) {
      notify(errorMessage(error), "error")
    }
  }

  const onApprove = async (product: Product) => {
    try {
      await approveProduct.mutateAsync(product.id)
      notify(`Produk ${product.name} disetujui dan sekarang aktif.`, "success")
    } catch (error) {
      notify(errorMessage(error), "error")
    }
  }

  const onDelete = async () => {
    if (!deleting) return
    const rejected = deleting.status === "PENDING_APPROVAL"
    try {
      await deleteProduct.mutateAsync(deleting.id)
      notify(
        rejected
          ? `Pengajuan produk ${deleting.name} ditolak.`
          : `Produk ${deleting.name} dihapus.`,
        "success",
      )
      setDeleting(null)
    } catch (error) {
      notify(errorMessage(error), "error")
    }
  }

  const columns: Column<Product>[] = [
    {
      key: "product",
      header: "Produk",
      render: (product) => (
        <div className="min-w-0">
          <p className="font-semibold text-ink">{product.name}</p>
          <p className="mt-0.5 text-xs text-ink-soft">
            {product.sku} · {product.category}
          </p>
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
          <p
            className={`font-semibold tabular-nums ${
              product.status === "ACTIVE" && product.stock <= product.minStock
                ? "text-danger"
                : "text-ink"
            }`}
          >
            {angka(product.stock)} {product.unit}
          </p>
          <p className="mt-0.5 text-xs text-ink-soft">min {angka(product.minStock)}</p>
        </div>
      ),
    },
    {
      key: "cost",
      header: "HPP rata-rata",
      align: "right",
      render: (product) => (
        <span className="tabular-nums text-ink-soft">{rupiah(product.avgCost)}</span>
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
        const canEdit = isOwner || product.status === "PENDING_APPROVAL"
        const canApprove = isOwner && product.status === "PENDING_APPROVAL"
        if (!canEdit && !canApprove) {
          return <span className="text-xs text-ink-soft/70">—</span>
        }
        return (
          <div className="flex flex-wrap items-center justify-end gap-1.5">
            {canApprove ? (
              <button
                type="button"
                onClick={() => onApprove(product)}
                disabled={approveProduct.isPending}
                className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-xs font-semibold text-emerald-700 transition-colors hover:bg-emerald-100 disabled:opacity-50"
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
                {product.status === "PENDING_APPROVAL" ? (
                  <>
                    <X size={13} />
                    Tolak
                  </>
                ) : (
                  <>
                    <Trash2 size={13} />
                    Hapus
                  </>
                )}
              </button>
            ) : null}
          </div>
        )
      },
    },
  ]

  const data = list.data
  const limit = params.limit

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
        <StatCard
          label="Total produk"
          value={angka(totals.data?.total ?? 0)}
          icon={PackageOpen}
          tone="slate"
        />
        <StatCard
          label="Produk aktif"
          value={angka(activeTotals.data?.total ?? 0)}
          icon={CircleCheck}
          tone="emerald"
        />
        <StatCard
          label="Menunggu persetujuan"
          value={angka(pendingTotals.data?.total ?? 0)}
          icon={Pencil}
          tone="amber"
        />
      </section>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search
            size={15}
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
            className={`${inputClass} py-2 pl-9 text-xs`}
          />
        </div>
        <select
          value={status}
          onChange={(event) => {
            setStatus(event.target.value as "ALL" | ProductStatus)
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
            <p className="mt-0.5 text-xs text-ink-soft">
              {angka(data?.total ?? 0)} produk ditemukan
            </p>
          </div>
          <Badge tone="neutral">
            {status === "ALL" ? "Semua" : status === "ACTIVE" ? "Aktif" : "Pending"}
          </Badge>
        </div>

        {list.isPending ? (
          <LoadingBlock label="Memuat produk..." />
        ) : list.error ? (
          <ErrorBlock error={list.error} onRetry={() => void list.refetch()} />
        ) : (
          <DataTable
            columns={columns}
            rows={data?.items ?? []}
            rowKey={(product) => product.id}
            minWidth={900}
            empty={
              <EmptyState
                icon={<PackageOpen size={24} strokeWidth={1.9} />}
                title={search || status !== "ALL" ? "Produk tidak ditemukan" : "Belum ada produk"}
                description={
                  search || status !== "ALL"
                    ? "Ubah kata kunci atau filter status untuk melihat produk lain."
                    : "Tambahkan produk pertama untuk mulai mencatat stok dan penjualan."
                }
                action={
                  search || status !== "ALL" ? undefined : (
                    <button type="button" onClick={openCreate} className={primaryButton}>
                      <Plus size={15} />
                      Tambah produk
                    </button>
                  )
                }
              />
            }
          />
        )}

        {data ? (
          <Pagination
            page={data.page}
            pageCount={pageCount(data.total, limit)}
            total={data.total}
            onPage={setPage}
          />
        ) : null}
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
            <button
              type="submit"
              form="product-form"
              disabled={createProduct.isPending || updateProduct.isPending}
              className={primaryButton}
            >
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
                required
              />
            </Field>
            <Field label="Nama produk" htmlFor="name">
              <input
                id="name"
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
                className={inputClass}
                placeholder="Beras 5kg"
                required
              />
            </Field>
            <Field label="Kategori" htmlFor="category">
              <input
                id="category"
                value={form.category}
                onChange={(event) => setForm({ ...form, category: event.target.value })}
                className={inputClass}
                placeholder="Sembako"
                required
              />
            </Field>
            <Field label="Satuan" htmlFor="unit">
              <input
                id="unit"
                value={form.unit}
                onChange={(event) => setForm({ ...form, unit: event.target.value })}
                className={inputClass}
                placeholder="karung"
                required
              />
            </Field>
            <Field label="Harga jual" htmlFor="price">
              <input
                id="price"
                type="number"
                min="1"
                step="any"
                value={form.price}
                onChange={(event) => setForm({ ...form, price: event.target.value })}
                className={inputClass}
                placeholder="65000"
                required
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
        onConfirm={() => void onDelete()}
        title={
          deleting?.status === "PENDING_APPROVAL" ? "Tolak produk?" : "Hapus produk?"
        }
        description={
          deleting?.status === "PENDING_APPROVAL"
            ? "Menolak pengajuan produk manager sama dengan menghapusnya. Produk pending belum dipakai transaksi."
            : "Produk hanya bisa dihapus kalau belum punya riwayat barang masuk, penjualan, atau adjustment."
        }
        confirmLabel={
          deleting?.status === "PENDING_APPROVAL" ? "Tolak produk" : "Hapus produk"
        }
      >
        <p className="rounded-xl border border-line bg-surface-muted px-4 py-3 text-sm text-ink">
          {deleting ? `${deleting.name} · ${deleting.sku}` : ""}
        </p>
      </ConfirmDialog>
    </div>
  )
}
