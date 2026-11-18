import { useState, type FormEvent } from "react"
import {
  CircleCheck,
  Clock,
  Plus,
  UserRound,
  Wrench,
  X,
} from "lucide-react"
import PageHeader from "../components/PageHeader"
import StatCard from "../components/StatCard"
import Badge, { type BadgeTone } from "../components/Badge"
import DataTable, { type Column } from "../components/DataTable"
import EmptyState from "../components/EmptyState"
import Field from "../components/Field"
import Modal from "../components/Modal"
import Pagination from "../components/Pagination"
import { ErrorBlock, LoadingBlock } from "../components/QueryFeedback"
import {
  useAdjustments,
  useApproveAdjustment,
  useCreateAdjustment,
  useProducts,
  useRejectAdjustment,
} from "../api/hooks"
import { errorMessage } from "../api/client"
import { useAuth } from "../auth/useAuth"
import { useToastStore } from "../store/useToastStore"
import type { Adjustment, AdjustmentStatus, AdjustmentType } from "../types/api"
import { angka, rupiah, tanggalWaktu } from "../lib/format"
import { pageCount } from "../lib/pagination"
import { inputClass, primaryButton, secondaryButton, selectClass } from "../lib/ui"

const statusTone: Record<AdjustmentStatus, BadgeTone> = {
  PENDING: "warning",
  APPROVED: "success",
  REJECTED: "danger",
}

const statusLabel: Record<AdjustmentStatus, string> = {
  PENDING: "Menunggu",
  APPROVED: "Disetujui",
  REJECTED: "Ditolak",
}

const typeLabel: Record<AdjustmentType, string> = {
  DAMAGED: "Barang rusak",
  CORRECTION: "Koreksi stok",
}

const PAGE_SIZE = 8

export default function Adjustments() {
  const { user } = useAuth()
  const isOwner = user?.role === "OWNER"
  const notify = useToastStore((state) => state.notify)

  const [status, setStatus] = useState<"ALL" | AdjustmentStatus>("ALL")
  const [type, setType] = useState<"ALL" | AdjustmentType>("ALL")
  const [page, setPage] = useState(1)

  const params = {
    status: status === "ALL" ? undefined : status,
    type: type === "ALL" ? undefined : type,
    page,
    limit: PAGE_SIZE,
  }

  const list = useAdjustments(params)
  const all = useAdjustments({ limit: 1 })
  const pending = useAdjustments({ status: "PENDING", limit: 1 })
  const approved = useAdjustments({ status: "APPROVED", limit: 1 })
  const rejected = useAdjustments({ status: "REJECTED", limit: 1 })

  const activeProducts = useProducts({ status: "ACTIVE", limit: 100 })
  const createAdjustment = useCreateAdjustment()
  const approveAdjustment = useApproveAdjustment()
  const rejectAdjustment = useRejectAdjustment()

  const [open, setOpen] = useState(false)
  const [productId, setProductId] = useState("")
  const [formType, setFormType] = useState<AdjustmentType>("DAMAGED")
  const [qty, setQty] = useState("1")
  const [reason, setReason] = useState("")

  const openCreate = () => {
    setProductId("")
    setFormType("DAMAGED")
    setQty("1")
    setReason("")
    setOpen(true)
  }

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const id = Number(productId)
    const value = Number(qty)

    if (!id) {
      notify("Pilih produk terlebih dahulu.", "error")
      return
    }
    if (!Number.isInteger(value) || value === 0) {
      notify("Jumlah harus bilangan bulat dan tidak boleh nol.", "error")
      return
    }
    if (formType === "DAMAGED" && value < 0) {
      notify("Untuk barang rusak, isi jumlah positif. Sistem memakai nilai negatif.", "error")
      return
    }
    if (!reason.trim()) {
      notify("Alasan wajib diisi.", "error")
      return
    }

    try {
      await createAdjustment.mutateAsync({
        productId: id,
        type: formType,
        qtyChange: formType === "DAMAGED" ? -Math.abs(value) : value,
        reason: reason.trim(),
      })
      notify(
        isOwner
          ? "Adjustment disimpan dan langsung disetujui. Stok sudah diperbarui."
          : "Adjustment dikirim dan menunggu persetujuan owner.",
        "success",
      )
      setOpen(false)
      setPage(1)
    } catch (error) {
      notify(errorMessage(error), "error")
    }
  }

  const onApprove = async (item: Adjustment) => {
    try {
      await approveAdjustment.mutateAsync(item.id)
      notify(`Adjustment #${item.id} disetujui. Stok sudah diperbarui.`, "success")
    } catch (error) {
      notify(errorMessage(error), "error")
    }
  }

  const onReject = async (item: Adjustment) => {
    try {
      await rejectAdjustment.mutateAsync(item.id)
      notify(`Adjustment #${item.id} ditolak. Stok tidak berubah.`, "success")
    } catch (error) {
      notify(errorMessage(error), "error")
    }
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
      render: (item) => (
        <div>
          <p className="font-medium text-ink">{item.product.name}</p>
          <p className="mt-0.5 text-xs text-ink-soft">{item.product.sku}</p>
        </div>
      ),
    },
    {
      key: "type",
      header: "Jenis",
      render: (item) => (
        <Badge tone={item.type === "DAMAGED" ? "danger" : "info"}>{typeLabel[item.type]}</Badge>
      ),
    },
    {
      key: "change",
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
      key: "requester",
      header: "Pengaju",
      render: (item) => (
        <div className="flex items-center gap-2">
          <span className="grid size-7 shrink-0 place-items-center rounded-full bg-paper text-[11px] font-bold text-ink-soft">
            <UserRound size={13} />
          </span>
          <span className="text-ink">{item.requestedBy.name}</span>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (item) => <Badge tone={statusTone[item.status]}>{statusLabel[item.status]}</Badge>,
    },
    ...(isOwner
      ? [
          {
            key: "action",
            header: "Aksi",
            align: "right" as const,
            render: (item: Adjustment) =>
              item.status === "PENDING" ? (
                <div className="flex flex-wrap items-center justify-end gap-1.5">
                  <button
                    type="button"
                    onClick={() => onApprove(item)}
                    disabled={approveAdjustment.isPending || rejectAdjustment.isPending}
                    className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-xs font-semibold text-emerald-700 transition-colors hover:bg-emerald-100 disabled:opacity-50"
                  >
                    <CircleCheck size={13} />
                    Setujui
                  </button>
                  <button
                    type="button"
                    onClick={() => onReject(item)}
                    disabled={approveAdjustment.isPending || rejectAdjustment.isPending}
                    className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs font-semibold text-danger transition-colors hover:bg-red-100 disabled:opacity-50"
                  >
                    <X size={13} />
                    Tolak
                  </button>
                </div>
              ) : (
                <span className="text-xs text-ink-soft/70">—</span>
              ),
          },
        ]
      : []),
  ]

  const data = list.data

  return (
    <div className="rise space-y-6">
      <PageHeader
        eyebrow="Penyesuaian"
        title="Adjustment"
        description={
          isOwner
            ? "Setujui atau tolak pengajuan manager. Adjustment yang dibuat owner langsung mengubah stok."
            : "Ajukan barang rusak atau koreksi stok. Pengajuan manager menunggu persetujuan owner sebelum stok berubah."
        }
        actions={
          <button type="button" onClick={openCreate} className={primaryButton}>
            <Plus size={16} />
            {isOwner ? "Catat adjustment" : "Ajukan adjustment"}
          </button>
        }
      />

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total pengajuan" value={angka(all.data?.total ?? 0)} icon={Wrench} tone="slate" />
        <StatCard label="Menunggu" value={angka(pending.data?.total ?? 0)} icon={Clock} tone="amber" />
        <StatCard label="Disetujui" value={angka(approved.data?.total ?? 0)} icon={CircleCheck} tone="emerald" />
        <StatCard label="Ditolak" value={angka(rejected.data?.total ?? 0)} icon={X} tone="red" />
      </section>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-sm font-semibold text-ink">
            {isOwner ? "Semua pengajuan" : "Pengajuan saya"}
          </h2>
          <p className="mt-0.5 text-xs text-ink-soft">
            {isOwner
              ? "Owner melihat seluruh adjustment manager dan bisa langsung memutuskan."
              : "Manager hanya melihat adjustment miliknya sendiri."}
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <select
            value={status}
            onChange={(event) => {
              setStatus(event.target.value as "ALL" | AdjustmentStatus)
              setPage(1)
            }}
            aria-label="Filter status adjustment"
            className={`${selectClass} sm:w-40`}
          >
            <option value="ALL">Semua status</option>
            <option value="PENDING">Menunggu</option>
            <option value="APPROVED">Disetujui</option>
            <option value="REJECTED">Ditolak</option>
          </select>
          <select
            value={type}
            onChange={(event) => {
              setType(event.target.value as "ALL" | AdjustmentType)
              setPage(1)
            }}
            aria-label="Filter jenis adjustment"
            className={`${selectClass} sm:w-44`}
          >
            <option value="ALL">Semua jenis</option>
            <option value="DAMAGED">Barang rusak</option>
            <option value="CORRECTION">Koreksi stok</option>
          </select>
        </div>
      </div>

      <section className="overflow-hidden rounded-2xl border border-line bg-surface">
        {list.isPending ? (
          <LoadingBlock label="Memuat adjustment..." />
        ) : list.error ? (
          <ErrorBlock error={list.error} onRetry={() => void list.refetch()} />
        ) : (
          <DataTable
            columns={columns}
            rows={data?.items ?? []}
            rowKey={(item) => item.id}
            minWidth={980}
            empty={
              <EmptyState
                icon={<Wrench size={24} strokeWidth={1.9} />}
                title="Belum ada adjustment"
                description="Ajukan barang rusak atau koreksi stok lewat tombol di atas."
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
        open={open}
        onClose={() => setOpen(false)}
        title={isOwner ? "Catat adjustment" : "Ajukan adjustment"}
        description={
          isOwner
            ? "Adjustment owner langsung disetujui dan stok berubah saat disimpan."
            : "Pengajuan akan berstatus pending sampai owner menyetujui."
        }
        footer={
          <>
            <button type="button" onClick={() => setOpen(false)} className={secondaryButton}>
              Batal
            </button>
            <button
              type="submit"
              form="adjustment-form"
              disabled={createAdjustment.isPending}
              className={primaryButton}
            >
              {isOwner ? "Simpan & setujui" : "Kirim pengajuan"}
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
              {(activeProducts.data?.items ?? []).map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name} ({product.sku}) · stok {product.stock}
                </option>
              ))}
            </select>
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Jenis" htmlFor="adjustment-type">
              <select
                id="adjustment-type"
                value={formType}
                onChange={(event) => setFormType(event.target.value as AdjustmentType)}
                className={selectClass}
              >
                <option value="DAMAGED">Barang rusak</option>
                <option value="CORRECTION">Koreksi stok</option>
              </select>
            </Field>
            <Field
              label="Jumlah"
              htmlFor="adjustment-qty"
              hint={
                formType === "DAMAGED"
                  ? "Isi positif, sistem memakai nilai negatif."
                  : "Positif menambah stok, negatif mengurangi."
              }
            >
              <input
                id="adjustment-qty"
                type="number"
                step="1"
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
            {isOwner
              ? "Untuk barang rusak, kerugian dihitung dari jumlah × HPP rata-rata saat disimpan."
              : "Untuk barang rusak, kerugian dihitung dari jumlah × HPP rata-rata saat owner menyetujui."}
          </p>
        </form>
      </Modal>
    </div>
  )
}
