import { Link } from 'react-router-dom';
import { FileQuestion } from 'lucide-react'; // Opsional: menggunakan ikon Lucide

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4 text-center">
      {/* Ikon / Ilustrasi Sederhana */}
      <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 text-gray-500">
        <FileQuestion className="h-10 w-10" />
      </div>

      {/* Kode Status & Pesan */}
      <h1 className="text-6xl font-extrabold text-gray-900 tracking-tight">404</h1>
      <h2 className="mt-2 text-2xl font-bold text-gray-800">Halaman Tidak Ditemukan</h2>
      <p className="mt-2 max-w-sm text-sm text-gray-500">
        Maaf, halaman yang Anda cari mungkin telah dihapus, diubah namanya, atau alamat URL yang Anda masukkan salah.
      </p>

      {/* Tombol Kembali ke Beranda */}
      <div className="mt-6">
        <Link
          to="/"
          className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 shadow-sm"
        >
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
}