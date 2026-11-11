import type { ReactNode } from "react"
import Modal from "./Modal"
import { dangerButton, secondaryButton } from "../lib/ui"

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel,
  children,
}: {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description?: string
  confirmLabel: string
  children?: ReactNode
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      footer={
        <>
          <button type="button" onClick={onClose} className={secondaryButton}>
            Batal
          </button>
          <button type="button" onClick={onConfirm} className={dangerButton}>
            {confirmLabel}
          </button>
        </>
      }
    >
      {children}
    </Modal>
  )
}
