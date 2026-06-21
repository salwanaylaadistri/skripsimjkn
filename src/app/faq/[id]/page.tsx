import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import StatusBar from "@/components/layout/StatusBar";

const GRADIENT = "linear-gradient(135deg, #46ADDC 0%, #46ADDC 40%, #D26AA1 100%)";

const faqs: Record<string, { question: string; answer: string }> = {
  "1": {
    question: "Siapa saja anggota keluarga yang ditanggung oleh pekerja penerima upah?",
    answer: "Anggota keluarga yang ditanggung meliputi istri/suami yang sah dan anak kandung, anak tiri, dan/atau anak angkat yang sah dari peserta, dengan kriteria tidak atau belum pernah menikah atau tidak mempunyai penghasilan sendiri, dan belum berusia 21 (dua puluh satu) tahun atau belum berusia 25 (dua puluh lima) tahun yang masih melanjutkan pendidikan formal.",
  },
  "2": {
    question: "Berapa besaran iuran PBI?",
    answer: "Iuran yang dibayarkan oleh pemerintah sebesar Rp42.000,00/orang tiap bulannya",
  },
  "3": {
    question: "Bagaimana jika Kartu Peserta Hilang?",
    answer: "Peserta dapat mengganti kartu yang hilang dengan mendatangi kantor BPJS Kesehatan terdekat dengan membawa KTP dan KK asli. Peserta juga dapat menggunakan aplikasi Mobile JKN untuk menampilkan kartu digital sebagai pengganti kartu fisik.",
  },
  "4": {
    question: "Berapa besaran iuran Peserta PBPU/Mandiri/Perseorangan?",
    answer: "Besaran iuran peserta PBPU/Mandiri:\n• Kelas I: Rp150.000,00/orang/bulan\n• Kelas II: Rp100.000,00/orang/bulan\n• Kelas III: Rp35.000,00/orang/bulan (setelah subsidi pemerintah)",
  },
  "5": {
    question: "Siapa saja anggota keluarga yang ditanggung oleh pekerja penerima upah?",
    answer: "Anggota keluarga yang ditanggung meliputi istri/suami yang sah dan anak kandung, anak tiri, dan/atau anak angkat yang sah dari peserta, dengan kriteria tidak atau belum pernah menikah atau tidak mempunyai penghasilan sendiri, dan belum berusia 21 (dua puluh satu) tahun atau belum berusia 25 (dua puluh lima) tahun yang masih melanjutkan pendidikan formal.",
  },
  "6": {
    question: "Berapa besaran iuran PBI?",
    answer: "Iuran yang dibayarkan oleh pemerintah sebesar Rp42.000,00/orang tiap bulannya",
  },
  "7": {
    question: "Bagaimana jika Kartu Peserta Hilang?",
    answer: "Peserta dapat mengganti kartu yang hilang dengan mendatangi kantor BPJS Kesehatan terdekat dengan membawa KTP dan KK asli. Peserta juga dapat menggunakan aplikasi Mobile JKN untuk menampilkan kartu digital sebagai pengganti kartu fisik.",
  },
  "8": {
    question: "Berapa besaran iuran Peserta PBPU/Mandiri/Perseorangan?",
    answer: "Besaran iuran peserta PBPU/Mandiri:\n• Kelas I: Rp150.000,00/orang/bulan\n• Kelas II: Rp100.000,00/orang/bulan\n• Kelas III: Rp35.000,00/orang/bulan (setelah subsidi pemerintah)",
  },
  "9": {
    question: "Siapa saja anggota keluarga yang ditanggung oleh pekerja penerima upah?",
    answer: "Anggota keluarga yang ditanggung meliputi istri/suami yang sah dan anak kandung, anak tiri, dan/atau anak angkat yang sah dari peserta, dengan kriteria tidak atau belum pernah menikah atau tidak mempunyai penghasilan sendiri, dan belum berusia 21 (dua puluh satu) tahun atau belum berusia 25 (dua puluh lima) tahun yang masih melanjutkan pendidikan formal.",
  },
  "10": {
    question: "Berapa besaran iuran PBI?",
    answer: "Iuran yang dibayarkan oleh pemerintah sebesar Rp42.000,00/orang tiap bulannya",
  },
  "11": {
    question: "Bagaimana jika Kartu Peserta Hilang?",
    answer: "Peserta dapat mengganti kartu yang hilang dengan mendatangi kantor BPJS Kesehatan terdekat dengan membawa KTP dan KK asli. Peserta juga dapat menggunakan aplikasi Mobile JKN untuk menampilkan kartu digital sebagai pengganti kartu fisik.",
  },
};

export default async function FAQDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const faq = faqs[id];
  if (!faq) notFound();

  return (
    <div className="flex flex-col min-h-full bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-10" style={{ background: GRADIENT }}>
        <StatusBar />
        <div className="relative flex items-center px-4 pb-6 pt-6">
          <Link href="/faq" className="w-8 h-8 flex items-center justify-center shrink-0 z-10">
            <ChevronLeft className="w-7 h-7 text-white" strokeWidth={2} />
          </Link>
          <h1 className="absolute inset-x-0 text-white font-bold text-lg text-center pointer-events-none">
            {faq.question.split(" ").slice(0, 3).join(" ")}...
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 pt-5 pb-6">
        <div className="bg-white rounded-2xl shadow-sm p-5 flex flex-col gap-3">
          <h2 className="text-gray-900 font-bold text-sm leading-snug">
            {faq.question}
          </h2>
          <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">
            {faq.answer}
          </p>
        </div>
      </div>
    </div>
  );
}
