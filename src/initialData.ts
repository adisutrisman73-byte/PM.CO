import { ProjectArea, DocumentationRecord, DocumentationRequest } from "./types";

export const INITIAL_AREAS: ProjectArea[] = [
  {
    id: "area-1",
    name: "Sektor Utara - Struktur Utama Lantai 3",
    description: "Pekerjaan pengecoran kolom, pemasangan bekisting, dan pembesian slab lantai 3.",
    category: "Struktur",
    createdAt: "2026-05-15T08:00:00Z"
  },
  {
    id: "area-2",
    name: "Ruang ME Utama - Gedung B Lantai Semi-Basement",
    description: "Instalasi jalur kabel utama, rak kabel feeder, dan panel distribusi daya listrik.",
    category: "MEP",
    createdAt: "2026-05-18T09:30:00Z"
  },
  {
    id: "area-3",
    name: "Fasad Depan - Sektor Timur",
    description: "Pemasangan cladding panel komposit aluminium dan rangka dinding tirai kaca tempered.",
    category: "Fasad",
    createdAt: "2026-05-20T10:15:00Z"
  },
  {
    id: "area-4",
    name: "Area Lobi - Pekerjaan Lantai & Dinding",
    description: "Pemasangan granit lantai ukuran 80x80 cm dan pengerjaan finishing cat dasar dinding.",
    category: "Finishing",
    createdAt: "2026-05-22T14:00:00Z"
  },
  {
    id: "area-5",
    name: "Galian Sump-Pit & Pondasi Lift Belakang",
    description: "Pekerjaan galian basah, sumuran pondasi lift, dewatering, dan pengerjaan pembesian tapak.",
    category: "Pondasi",
    createdAt: "2026-05-10T11:00:00Z"
  }
];

export const INITIAL_RECORDS: DocumentationRecord[] = [
  {
    id: "rec-1",
    areaId: "area-5",
    areaName: "Galian Sump-Pit & Pondasi Lift Belakang",
    description: "Proses pengecoran pondasi tapak lift belakang selesai dilakukan menggunakan mutu beton K-350. Hasil cor padat tanpa rongga.",
    photoUrl: "https://images.unsplash.com/photo-1590069261209-f8e9b8642343?auto=format&fit=crop&w=600&q=80",
    submittedBy: "Bambang Pamungkas (SM)",
    submittedAt: "2026-05-12T16:45:00Z",
    status: "approved"
  },
  {
    id: "rec-2",
    areaId: "area-1",
    areaName: "Sektor Utara - Struktur Utama Lantai 3",
    description: "Pembesian slab lantai 3 selesai diperiksa dan diikat dengan kawat bendrat. Siap untuk pengecoran besok pagi sesuai izin konstruksi.",
    photoUrl: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=600&q=80",
    submittedBy: "Bambang Pamungkas (SM)",
    submittedAt: "2026-05-28T10:45:00Z",
    status: "approved"
  },
  {
    id: "rec-3",
    areaId: "area-2",
    areaName: "Ruang ME Utama - Gedung B Lantai Semi-Basement",
    description: "Instalasi tray kabel utama sudah mencapai progres 85%. Sambungan kabel tanah dan grounding aman serta tahan cuaca lembab.",
    photoUrl: "https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=600&q=80",
    submittedBy: "Hendro Wijaya (SM)",
    submittedAt: "2026-05-30T15:20:00Z",
    status: "pending_approval"
  },
  {
    id: "rec-4",
    areaId: "area-3",
    areaName: "Fasad Depan - Sektor Timur",
    description: "Rangka aluminium glazing bagian atas telah terpasang sejajar sumbu. Sebagian kaca panel telah terangkat ke scaffold.",
    photoUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80",
    submittedBy: "Hendro Wijaya (SM)",
    submittedAt: "2026-05-31T09:15:00Z",
    status: "pending_approval"
  },
  {
    id: "rec-5",
    areaId: "area-4",
    areaName: "Area Lobi - Pekerjaan Lantai & Dinding",
    description: "Pemasangan granit dasar lantai lobi utara arah depan. Sudah rata meteran air namun terlihat sedikit bercak semen.",
    photoUrl: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80",
    submittedBy: "Bambang Pamungkas (SM)",
    submittedAt: "2026-05-29T11:00:00Z",
    status: "rejected",
    feedback: "Tolokan: Granit di sudut kanan dekat pilar kurang rata, ada rongga kosong saat diketuk. Tolong diperbaiki dan dokumentasikan ulang.",
    requestId: "req-1"
  }
];

export const INITIAL_REQUESTS: DocumentationRequest[] = [
  {
    id: "req-1",
    requestedArea: "Area Lobi - Pekerjaan Lantai & Dinding",
    description: "Mohon kirimkan dokumentasi perbaikan granit sudut dekat pilar utama setelah dibongkar dan dirapikan kembali.",
    priority: "high",
    deadline: "2026-06-03",
    status: "pending",
    requestedBy: "Subianto (PM)",
    requestedAt: "2026-05-30T17:00:00Z"
  },
  {
    id: "req-2",
    requestedArea: "Fasad Depan - Sektor Timur",
    description: "Dokumentasi detail pengait braket kaca tumpuan tirai (spider fittings) untuk analisis kekuatan strukturnya.",
    priority: "medium",
    deadline: "2026-06-05",
    status: "pending",
    requestedBy: "Subianto (PM)",
    requestedAt: "2026-05-31T14:30:00Z"
  }
];
