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

export const INITIAL_RECORDS: DocumentationRecord[] = [];

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
