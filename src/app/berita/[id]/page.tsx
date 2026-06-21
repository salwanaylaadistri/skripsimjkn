import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Calendar } from "lucide-react";
import StatusBar from "@/components/layout/StatusBar";

const GRADIENT = "linear-gradient(135deg, #46ADDC 0%, #46ADDC 40%, #D26AA1 100%)";

const articles: Record<string, { title: string; date: string; image: string; content: string[] }> = {
  "1": {
    title: "BPJS Kesehatan dan Kemenimipas Perkuat Perlindungan JKN Bagi Warga",
    date: "27/04/2026",
    image: "/images/gambarberita1.jpeg",
    content: [
      "Jakarta - Pemerintah menegaskan komitmen negara dalam menjamin kepastian kepesertaan Program Jaminan Kesehatan Nasional (JKN) bagi tahanan dan warga binaan pemasyarakatan melalui Keputusan Bersama (SKB) dan Nota Kesepahaman (MoU) lintas kementerian dan lembaga. Penandatanganan SKB dan MoU dilakukan bertepatan dengan peringatan Hari Bakti Pemasyarakatan Tahun 2026, di Kampus Politeknik IMIPAS, Tangerang, Banten, Senin (27/4). Keputusan Bersama (SKB) tentang Penguatan Penyelenggaraan Pelayanan Kesehatan bagi Tahanan dan Warga Binaan dalam Kerangka Jaminan Kesehatan Nasional dan Desentralisasi ditetapkan dan ditandatangani oleh Menteri Imigrasi dan Pemasyarakatan, Menteri Dalam Negeri, Menteri Kesehatan, Menteri Sosial, serta Direktur Utama BPJS Kesehatan.",
      "Sementara itu, Nota Kesepahaman (MoU) tentang Sinergi Penyelenggaraan Program Jaminan Kesehatan Nasional di Lingkungan Kementerian Imigrasi dan Pemasyarakatan (Imipas) ditandatangani oleh Menteri Imipas, Agus Andrianto dan Direktur Utama BPJS Kesehatan, Prihati Pujowaskito. Pujowaskito menyampaikan bahwa antar lembaga ini menjadi faktor penting untuk menjaga ketertiban pelaksanaan JKN dari sisi kebijakan, kepesertaan, dan tata kelola data.",
      "\"BPJS Kesehatan saat ini mengelola lebih dari 285 juta jiwa peserta, atau hampir seluruh penduduk Indonesia. Capaian sebesar ini harus ditopang oleh sinergi kebijakan lintas kementerian agar pelaksanaannya tetap tepat sasaran, tertib administrasi, dan berkelanjutan, termasuk dalam memastikan data warga binaan yang terdaftar sebagai peserta BPJS Kesehatan akurat dan mutakhir,\" ujar Pujo dalam keterangannya, Selasa (28/4/2026).",
      "Lebih lanjut, Pujo menjelaskan bahwa SKB dan MoU ini saling melengkapi. SKB memberikan kepastian hukum dan pembagian peran lintas kementerian dan pemerintah daerah, sementara MoU menjadi dasar kerja sama operasional antara Kemenimipas dan BPJS Kesehatan.",
      "Kebijakan ini juga sejalan dengan langkah pemerintah dalam melakukan pendataan dan verifikasi sosial ekonomi warga binaan pemasyarakatan untuk kepesertaan PBI-JK, yang dilaksanakan oleh Kementerian Sosial (Kemensos) berdasarkan Data Tunggal Sosial dan Ekonomi Nasional (DTSEN) dengan dukungan pemadanan data kependudukan.",
      "\"Ketepatan data sangat menentukan ketepatan layanan sekaligus pengendalian pembiayaan. Oleh karena itu, sinergi melalui SKB dan MoU ini menjadi payung yang kuat untuk mendorong pertukaran dan pemanfaatan data antarinstansi secara interoperabel, aman, dan akuntabel,\" kata Pujo.",
      "Sementara itu, Agus menegaskan bahwa penguatan sinergi dan kolaborasi lintas sektoral menjadi kunci utama dalam mendorong transformasi pemasyarakatan. Namun demikian, ia mengingatkan bahwa kolaborasi tidak akan berarti tanpa dilandasi integritas yang kuat di setiap lini pelaksanaan.",
      "\"Saya mendorong seluruh jajaran untuk fokus pada aksi nyata di lapangan yang berdampak bagi warga binaan dan masyarakat luas. Satukan langkah dari pusat hingga tingkat pelaksana untuk mewujudkan pemasyarakatan yang produktif, berintegritas, dan modern,\" katanya.",
      "Agus menjelaskan, pemasyarakatan lahir sebagai manifestasi komitmen bangsa dalam membina, memberikan harapan, membangun jati diri manusia, serta menghadirkan keadilan bagi masyarakat. Menurutnya, berbagai perubahan telah dilakukan, termasuk perubahan cara pandang dan penerapan sistem pengelolaan yang mengedepankan pendekatan berbasis kemanusiaan.",
      "\"Banyak perubahan yang telah kita lakukan, baik dari sisi cara pandang terhadap narapidana maupun sistem pengelolaan yang kini lebih berbasis kemanusiaan. Hari ini saya mengajak kita semua untuk melakukan refleksi mendalam, apa yang sudah dicapai, apa yang belum, dan apa yang harus kita lakukan bersama sebagai bagian integral dari pembangunan nasional,\" katanya.",
      "Lebih lanjut, Agus menyebut semangat baru pemasyarakatan diwujudkan melalui 15 program yang selaras dengan visi Asta Cita Presiden Republik Indonesia, Prabowo Subianto dan harus diterjemahkan dalam langkah konkret yang menyentuh masyarakat.",
      "Sebagai informasi, dalam SKB ini mengatur penguatan pembagian peran dan kewenangan lintas kementerian dan lembaga, meliputi Kemenimipas, Kementerian Dalam Negeri, Kementerian Kesehatan, Kementerian Sosial, dan BPJS Kesehatan untuk memastikan setiap tahanan dan warga binaan terdaftar sebagai peserta JKN aktif, termasuk sebagai Penerima Bantuan Iuran (PBI) bagi yang tidak mampu.",
      "Pengaturan ini mencakup kepastian kepesertaan, penyelenggaraan pelayanan kesehatan dasar dan rujukan di rutan, lapas, dan LPKA, serta pendanaan yang bersumber dari APBN, APBD, dan sumber sah lainnya sesuai ketentuan peraturan perundang-undangan.",
      "Selain itu, Nota Kesepahaman antara Kemenimipas dan BPJS Kesehatan berfungsi sebagai payung kerja sama strategis untuk mengoptimalkan pelaksanaan tugas dan fungsi masing-masing pihak. MoU ini bertujuan meningkatkan komitmen, koordinasi, serta efektivitas kerja sama dalam penyelenggaraan Program JKN di lingkungan Kemenimipas.",
      "Selanjutnya, ruang lingkup MoU meliputi optimalisasi kepesertaan JKN aktif bagi ASN dan pegawai non-ASN, dukungan aktivasi kepesertaan JKN, dukungan kebijakan kepesertaan JKN pada pelayanan publik, pelaksanaan interoperabilitas pertukaran dan pemanfaatan data, dukungan kerja sama fasilitas kesehatan, serta bentuk kerja sama lain yang disepakati para pihak.",
    ],
  },
  "2": {
    title: "BPJS Kesehatan dan Kemenimipas Perkuat Perlindungan JKN Bagi Warga",
    date: "27/04/2026",
    image: "/images/gambarberita.png",
    content: ["Konten artikel ini sama dengan artikel pertama sebagai data dummy."],
  },
  "3": {
    title: "BPJS Kesehatan dan Kemenimipas Perkuat Perlindungan JKN Bagi Warga",
    date: "27/04/2026",
    image: "/images/gambarberita.png",
    content: ["Konten artikel ini sama dengan artikel pertama sebagai data dummy."],
  },
  "4": {
    title: "BPJS Kesehatan dan Kemenimipas Perkuat Perlindungan JKN Bagi Warga",
    date: "27/04/2026",
    image: "/images/gambarberita.png",
    content: ["Konten artikel ini sama dengan artikel pertama sebagai data dummy."],
  },
};

export default async function BeritaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const article = articles[id];
  if (!article) notFound();

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <div className="sticky top-0 z-10" style={{ background: GRADIENT }}>
        <StatusBar />
        <div className="relative flex items-center px-4 pb-6 pt-6">
          <Link
            href="/berita"
            className="w-8 h-8 flex items-center justify-center shrink-0 z-10"
          >
            <ChevronLeft className="w-7 h-7 text-white" strokeWidth={2} />
          </Link>
          <h1 className="absolute inset-x-0 text-white font-bold text-lg text-center pointer-events-none">
            Berita dan Artikel
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 bg-white px-4 pt-5 pb-6 flex flex-col gap-4">
        {/* Judul */}
        <h2 className="text-[#184087] font-bold text-lg leading-snug">
          {article.title}
        </h2>

        {/* Tanggal */}
        <div className="flex items-center gap-1.5 text-gray-400 text-sm -mt-2">
          <Calendar className="w-4 h-4" strokeWidth={1.5} />
          <span>{article.date}</span>
        </div>

        {/* Gambar */}
        <img
          src={article.image}
          alt={article.title}
          className="w-full rounded-2xl object-cover"
        />

        {/* Isi artikel */}
        <div className="flex flex-col gap-4">
          {article.content.map((paragraph, i) => (
            <p key={i} className="text-gray-700 text-sm leading-relaxed text-justify">
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
