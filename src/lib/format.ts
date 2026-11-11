const rupiahFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
})

const numberFormatter = new Intl.NumberFormat("id-ID")

export function rupiah(value: number): string {
  return rupiahFormatter.format(value)
}

export function angka(value: number): string {
  return numberFormatter.format(value)
}

export function tanggal(iso: string): string {
  return new Date(iso).toLocaleDateString("id-ID", {
    timeZone: "Asia/Jakarta",
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

export function tanggalWaktu(iso: string): string {
  return new Date(iso).toLocaleString("id-ID", {
    timeZone: "Asia/Jakarta",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function dateKey(iso: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(iso))
}

export function todayKey(): string {
  return dateKey(new Date().toISOString())
}

export function lastNDays(count: number): string[] {
  const keys: string[] = []
  const today = new Date()
  for (let index = count - 1; index >= 0; index -= 1) {
    const date = new Date(today)
    date.setDate(today.getDate() - index)
    keys.push(dateKey(date.toISOString()))
  }
  return keys
}

export function shortDate(key: string): string {
  return new Date(`${key}T00:00:00`).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
  })
}
