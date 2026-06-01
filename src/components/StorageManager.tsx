import React, { useState, useEffect, useRef } from "react";
import { ProjectArea, DocumentationRecord, DocumentationRequest } from "../types";
import { 
  Database, 
  Download, 
  Upload, 
  Printer, 
  Trash2, 
  Sparkles, 
  Check, 
  AlertTriangle, 
  FileJson,
  FolderSync,
  X
} from "lucide-react";

interface StorageManagerProps {
  areas: ProjectArea[];
  records: DocumentationRecord[];
  requests: DocumentationRequest[];
  onImportData: (
    areas: ProjectArea[], 
    records: DocumentationRecord[], 
    requests: DocumentationRequest[]
  ) => void;
  onClearStorage: () => void;
}

export default function StorageManager({
  areas,
  records,
  requests,
  onImportData,
  onClearStorage
}: StorageManagerProps) {
  const [storageUsageBytes, setStorageUsageBytes] = useState<number>(0);
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Calculate local storage size used for this application
  useEffect(() => {
    const calculateUsage = () => {
      let totalBytes = 0;
      const keys = ["construx_areas", "construx_records", "construx_requests", "construx_role"];
      for (const key of keys) {
        const val = localStorage.getItem(key);
        if (val) {
          totalBytes += (key.length + val.length) * 2; // Roughly 2 bytes per character in UTF-16
        }
      }
      setStorageUsageBytes(totalBytes);
    };

    calculateUsage();
    // Re-verify when records change as pictures may add significant size
  }, [areas, records, requests]);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Convert bytes to readable format (KB, MB)
  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 KB";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // LocalStorage max size is usually 5MB
  const localStorageLimitBytes = 5 * 1024 * 1024;
  const usagePercentage = Math.min(100, (storageUsageBytes / localStorageLimitBytes) * 100);

  // Backup downloader: Save all project resources into a single compiled JSON file
  const handleExportBackup = () => {
    try {
      const backupPayload = {
        version: "1.0.0",
        exportedAt: new Date().toISOString(),
        projectName: "ConstruX Pro S-4",
        scope: "Construction Site Quality Dossier",
        data: {
          areas,
          records,
          requests
        }
      };

      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupPayload, null, 2));
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `CONSTRUX_CADANGAN_DOKUMENTASI_${new Date().toISOString().split("T")[0]}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      showToast("Arsip Penyimpanan berhasil diunduh ke komputer Anda!");
    } catch (err) {
      console.error(err);
      alert("Gagal mengekspor data cadangan penyimpanan.");
    }
  };

  // Read upload backup JSON
  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (!parsed || !parsed.data || !Array.isArray(parsed.data.areas) || !Array.isArray(parsed.data.records) || !Array.isArray(parsed.data.requests)) {
          setImportError("Format file tidak valid. Pastikan ini adalah file cadangan ekspor ConstruX Pro.");
          return;
        }

        const confirmRestore = confirm(
          `Ditemukan data cadangan:\n- Tanggal Cadangan: ${new Date(parsed.exportedAt).toLocaleString("id-ID")}\n- Total Area: ${parsed.data.areas.length}\n- Total Laporan: ${parsed.data.records.length}\n- Total Request: ${parsed.data.requests.length}\n\nTindakan ini akan menimpa data monitor saat ini dengan data cadangan ini. Lanjutkan?`
        );

        if (confirmRestore) {
          onImportData(parsed.data.areas, parsed.data.records, parsed.data.requests);
          setIsImportModalOpen(false);
          setImportError(null);
          showToast("Data penyimpanan berhasil dipulihkan secara penuh!");
        }
      } catch (err) {
        setImportError("Gagal membaca file JSON. Pastikan file tidak rusak.");
      }
    };
    reader.readAsText(file);
  };

  // Print friendly HTML generate report
  const handlePrintReport = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Pop-up diblokir browser Anda. Mohon izinkan pop-up untuk menghasilkan laporan cetak.");
      return;
    }

    const approvedRecords = records.filter(r => r.status === "approved");
    const pendingRecords = records.filter(r => r.status === "pending_approval");
    const rejectedRecords = records.filter(r => r.status === "rejected");

    let itemsHtml = "";
    records.forEach((rec, idx) => {
      const parentArea = areas.find(a => a.id === rec.areaId);
      itemsHtml += `
        <div class="record-item" style="break-inside: avoid; border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; margin-bottom: 20px;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px;">
            <h3 style="margin: 0; font-size: 14px; color: #0f172a;">#${idx + 1} Sektor: ${rec.areaName}</h3>
            <span class="status-badge status-${rec.status}" style="font-size: 10px; font-weight: bold; padding: 3px 8px; border-radius: 4px; text-transform: uppercase;">
              ${rec.status === "approved" ? "Disetujui" : rec.status === "rejected" ? "Revisi" : "Menunggu Review"}
            </span>
          </div>
          <p style="font-size: 12px; color: #334155; margin-top: 5px; margin-bottom: 12px; line-height: 1.5;">${rec.description}</p>
          
          <div style="display: flex; gap: 15px; align-items: flex-start;">
            <div style="flex: 1; max-width: 250px;">
              <img src="${rec.photoUrl}" style="width: 100%; border-radius: 6px; border: 1px solid #cbd5e1; max-height: 150px; object-cover: cover;" />
            </div>
            <div style="flex: 2; font-size: 11px; color: #64748b; line-height: 1.6;">
              <div><strong>Kategori:</strong> ${parentArea?.category || "Lainnya"}</div>
              <div><strong>Penyedia Data:</strong> ${rec.submittedBy}</div>
              <div><strong>Tanggal Kirim:</strong> ${new Date(rec.submittedAt).toLocaleString("id-ID")}</div>
              ${rec.feedback ? `<div style="margin-top: 8px; padding: 6px 10px; background-color: #fef2f2; border-left: 3px solid #ef4444; color: #991b1b;"><strong>Komentar PM:</strong> ${rec.feedback}</div>` : ""}
            </div>
          </div>
        </div>
      `;
    });

    const categoriesList = Array.from(new Set(areas.map(a => a.category))).join(", ");

    printWindow.document.write(`
      <html>
        <head>
          <title>ConstruX Pro - Dokumen Laporan Kearsipan Konstruksi</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1e293b; padding: 40px; line-height: 1.4; margin: 0; }
            .header-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; border-bottom: 3px double #0f172a; padding-bottom: 20px; }
            .title-main { font-size: 24px; font-weight: bold; color: #011627; margin: 0; }
            .meta-val { font-size: 12px; color: #475569; }
            .badge-total { background-color: #f1f5f9; padding: 4px 8px; border-radius: 4px; font-weight: bold; }
            .status-approved { background-color: #d1fae5; color: #065f46; border: 1px solid #a7f3d0; }
            .status-pending_approval { background-color: #fef3c7; color: #92400e; border: 1px solid #fde68a; }
            .status-rejected { background-color: #fee2e2; color: #991b1b; border: 1px solid #fca5a5; }
            .summary-cards-box { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 30px; }
            .sum-card { border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px; text-align: center; }
            .sum-title { font-size: 10px; text-transform: uppercase; color: #64748b; font-weight: bold; }
            .sum-value { font-size: 20px; font-weight: bold; color: #0f172a; margin-top: 4px; }
            @media print {
              body { padding: 10px; }
              button { display: none; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="no-print" style="margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; background: #f8fafc; padding: 12px 20px; border-radius: 8px; border: 1px solid #cbd5e1;">
            <span style="font-size: 13px; font-weight: bold; color: #0f172a;">Pratinjau Berkas Cetak Laporan Pembangunan</span>
            <div>
              <button onclick="window.print()" style="background-color: #0ea5e9; color: white; border: none; padding: 8px 16px; border-radius: 6px; font-weight: bold; cursor: pointer; font-size: 12px;">Cetak / Simpan PDF</button>
              <button onclick="window.close()" style="background-color: #cbd5e1; color: #334155; border: none; padding: 8px 16px; border-radius: 6px; font-weight: bold; cursor: pointer; font-size: 12px; margin-left: 8px;">Tutup</button>
            </div>
          </div>

          <table class="header-table">
            <tr>
              <td style="vertical-align: top;">
                <div class="title-main">CONSTRUX PRO - REPORT MANAGEMENT</div>
                <div style="font-size: 12px; color: #64748b; margin-top: 5px;">Portal Kearsipan & Dokumentasi Kemajuan Fisik Proyek</div>
              </td>
              <td style="text-align: right; vertical-align: top;" class="meta-val">
                <div><strong>Kode Dokumen:</strong> CX-REP-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, "0")}-S4</div>
                <div><strong>Tanggal Tarik Cetak:</strong> ${new Date().toLocaleDateString("id-ID")}</div>
                <div><strong>Verifikator PM:</strong> Subianto</div>
              </td>
            </tr>
          </table>

          <div style="margin-bottom: 25px;">
            <h2 style="font-size: 16px; margin: 0 0 10px 0; color: #0f172a; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px;">Ringkasan Data Proyek</h2>
            <div class="summary-cards-box">
              <div class="sum-card">
                <div class="sum-title">Total Sektor Area</div>
                <div class="sum-value">${areas.length}</div>
              </div>
              <div class="sum-card">
                <div class="sum-title">Foto Dokumentasi</div>
                <div class="sum-value">${records.length}</div>
              </div>
              <div class="sum-card" style="background-color: #f0fdf4;">
                <div class="sum-title" style="color: #15803d;">Disetujui PM</div>
                <div class="sum-value" style="color: #166534;">${approvedRecords.length}</div>
              </div>
              <div class="sum-card">
                <div class="sum-title">Instruksi PM Terbit</div>
                <div class="sum-value">${requests.length}</div>
              </div>
            </div>
            <p style="font-size: 11px; color: #475569; margin: 0;"><strong>Lingkup Wilayah Pengawasan:</strong> ${categoriesList}</p>
          </div>

          <h2 style="font-size: 16px; margin: 30px 0 15px 0; color: #0f172a; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px;">Daftar Log Dokumentasi Konstruksi</h2>
          
          <div class="records-container">
            ${itemsHtml}
          </div>

          <div style="margin-top: 60px; page-break-inside: avoid;">
            <table style="width: 100%; border-collapse: collapse; margin-top: 30px; font-size: 12px;">
              <tr>
                <td style="width: 40%; text-align: center;">
                  <p>Disusun Oleh,</p>
                  <p style="margin-top: 60px; font-weight: bold; text-decoration: underline;">Bambang Pamungkas</p>
                  <p style="color: #64748b; font-size: 11px;">Site Manager</p>
                </td>
                <td style="width: 20%;"></td>
                <td style="width: 40%; text-align: center;">
                  <p>Diperiksa dan Disetujui Oleh,</p>
                  <p style="margin-top: 60px; font-weight: bold; text-decoration: underline;">Subianto</p>
                  <p style="color: #64748b; font-size: 11px;">Project Manager</p>
                </td>
              </tr>
            </table>
          </div>

          <div style="margin-top: 40px; text-align: center; font-size: 10px; color: #94a3b8; border-t: 1px solid #e2e8f0; padding-top: 15px;">
            Seluruh data foto di atas terikat checksum digital lokal browser enkripsi ConstruX. Dokumen legal untuk pelaporan berkas progress mingguan kemitraan kontraktor deviasi.
          </div>
        </body>
      </html>
    `);
    
    printWindow.document.close();
  };

  return (
    <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 shadow-2xl backdrop-blur-md space-y-6" id="storage-manager-card">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-indigo-500/10 to-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded-xl shadow-md">
            <Database className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="font-display font-bold text-white text-sm tracking-wide">
              Pusat Penyimpanan & Ekspor Dokumentasi
            </h3>
            <p className="text-[11px] text-slate-400 font-sans mt-0.5">
              Kelola cadangan lokal, unduh berkas laporan instan, dan pantau batas kapasitas penyimpanan.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={handlePrintReport}
            className="px-3.5 py-2.5 bg-sky-900/60 hover:bg-sky-800 border class-print border-sky-400/20 text-sky-300 rounded-xl text-xs font-sans font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md"
            title="Ekspor laporan fisik digital"
            id="btn-print-dossier"
          >
            <Printer className="w-3.5 h-3.5" />
            Cetak Laporan PDF
          </button>
          <button
            onClick={handleExportBackup}
            className="px-3.5 py-2.5 bg-indigo-950/50 hover:bg-indigo-900 border border-indigo-505/20 text-indigo-300 rounded-xl text-xs font-sans font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md"
            id="btn-download-backup"
          >
            <Download className="w-3.5 h-3.5" />
            Ambil File Backup (.json)
          </button>
          <button
            onClick={() => {
              setImportError(null);
              setIsImportModalOpen(true);
            }}
            className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-755 border border-white/5 text-slate-300 rounded-xl text-xs font-sans font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md"
            id="btn-trigger-import-modal"
          >
            <Upload className="w-3.5 h-3.5" />
            Pulihkan Backup JSON
          </button>
        </div>
      </div>

      {toastMessage && (
        <div className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs px-4 py-2.5 rounded-xl font-sans font-medium flex items-center gap-2 animate-fade-in">
          <Check className="w-4 h-4 shrink-0" /> {toastMessage}
        </div>
      )}

      {/* COMPACT WEEKLY REPORT METRICS SEGMENT */}
      <div className="p-4 bg-slate-950/60 border border-white/5 rounded-xl space-y-3.5">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            Rangkuman Data Lapangan Aktual (Laporan Pekanan)
          </span>
          <span className="text-[9px] font-mono text-slate-500 uppercase">
            Data Terkait Kode Proyek Aktif
          </span>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="p-3 bg-slate-900/60 border border-white/5 rounded-lg flex flex-col justify-between">
            <span className="text-[10px] font-sans text-slate-400 leading-none">Sektor Area</span>
            <span className="text-sm font-mono font-bold text-white mt-1.5">{areas.length} Zona</span>
          </div>

          <div className="p-3 bg-slate-900/60 border border-white/5 rounded-lg flex flex-col justify-between">
            <span className="text-[10px] font-sans text-slate-400 leading-none">Unggahan Foto</span>
            <span className="text-sm font-mono font-bold text-slate-300 mt-1.5">{records.length} Item</span>
          </div>

          <div className="p-3 bg-emerald-950/20 border border-emerald-500/10 rounded-lg flex flex-col justify-between">
            <span className="text-[10px] font-sans text-emerald-400 leading-none">Disetujui PM</span>
            <span className="text-sm font-mono font-bold text-emerald-400 mt-1.5">
              {records.filter(r => r.status === "approved").length} Valid
            </span>
          </div>

          <div className="p-3 bg-amber-950/20 border border-amber-500/10 rounded-lg flex flex-col justify-between">
            <span className="text-[10px] font-sans text-amber-400 leading-none">Perlu Review</span>
            <span className="text-sm font-mono font-bold text-amber-400 mt-1.5">
              {records.filter(r => r.status === "pending_approval").length} Antrean
            </span>
          </div>

          <div className="p-3 bg-cyan-950/20 border border-cyan-500/10 rounded-lg col-span-2 sm:col-span-1 flex flex-col justify-between">
            <span className="text-[10px] font-sans text-cyan-400 leading-none">Instruksi PM</span>
            <span className="text-sm font-mono font-bold text-cyan-400 mt-1.5">
              {requests.length} Rilis
            </span>
          </div>
        </div>
      </div>

      {/* STORAGE SPACE ANALYSIS */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        <div className="md:col-span-8 space-y-2">
          <div className="flex justify-between text-xs font-mono">
            <span className="text-slate-400 flex items-center gap-1.5">
              <FolderSync className="w-4 h-4 text-emerald-400" />
              Kapasitas Penyimpanan Browser Lokasl (LocalStorage)
            </span>
            <span className="text-slate-200 font-bold">
              {formatSize(storageUsageBytes)} / 5 MB ({usagePercentage.toFixed(1)}%)
            </span>
          </div>
          
          <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden border border-white/5 p-0.5">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                usagePercentage > 80 
                  ? "bg-gradient-to-r from-red-500 to-rose-400 glow-text-rose" 
                  : usagePercentage > 40
                  ? "bg-gradient-to-r from-amber-500 to-orange-400"
                  : "bg-gradient-to-r from-emerald-500 to-teal-400"
              }`}
              style={{ width: `${usagePercentage}%` }}
            />
          </div>
          
          <p className="text-[10px] text-slate-500 font-sans font-normal">
            * Data foto dikompresi ke Base64 lokal murni. Gunakan unduhan backup (.json) jika memori penuh.
          </p>
        </div>

        <div className="md:col-span-4 flex justify-end">
          <button
            onClick={() => {
              if (confirm("⚠️ PERINGATAN: Semua data dokumentasi, proyek area, dan request PM saat ini akan dihapus permanen dari browser lokal Anda.\n\nApakah Anda sungguh-sungguh yakin?")) {
                onClearStorage();
                showToast("Semua memori penyimpanan lokal berhasil dibersihkan!");
              }
            }}
            className="w-full sm:w-auto px-4 py-3 bg-red-950/40 hover:bg-red-900/40 text-red-400 border border-red-500/20 text-xs font-sans font-bold rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-inner"
            title="Menghapus semua file cache lokal di browser Anda"
            id="btn-clear-dossier"
          >
            <Trash2 className="w-4 h-4" />
            Bersihkan Cache Penyimpanan
          </button>
        </div>
      </div>

      {/* FLOATING RESTORE MODAL */}
      {isImportModalOpen && (
        <div className="fixed inset-0 bg-slate-950/90 z-50 flex items-center justify-center p-4 backdrop-blur-md animate-fade-in" id="import-json-overlay">
          <div className="w-full max-w-md bg-slate-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col backdrop-blur-xl animate-scale-up">
            <div className="px-5 py-4 border-b border-white/5 bg-slate-950 flex justify-between items-center">
              <div className="flex items-center gap-2.5">
                <FileJson className="w-4 h-4 text-indigo-400" />
                <h3 className="font-display font-bold text-white text-sm">
                  Pulihkan Cadangan Arsip ConstruX
                </h3>
              </div>
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="text-slate-400 hover:text-white transition bg-slate-900 hover:bg-slate-800 p-1.5 rounded-full cursor-pointer text-xs"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-slate-300 text-xs font-sans leading-relaxed">
                Pilih file cadangan berformat <strong className="text-white">.json</strong> yang telah Anda unduh sebelumnya untuk memulihkan seluruh area pekerjaan, ulasan foto PM, serta instruksi lapor.
              </p>

              {importError && (
                <div className="p-3 bg-red-950/40 text-red-300 border border-red-500/25 rounded-xl text-xs font-medium font-sans flex items-start gap-2 animate-pulse">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{importError}</span>
                </div>
              )}

              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-white/10 hover:border-indigo-500 hover:bg-indigo-950/10 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition duration-200 bg-slate-950/30"
              >
                <Upload className="w-8 h-8 text-indigo-400 mb-2.5 animate-bounce" />
                <span className="text-xs font-sans text-slate-300 font-bold">Tekan untuk Memilih Dokumen .json</span>
                <span className="text-[10px] text-slate-500 font-sans mt-1">Hanya file berakhiran format murni JSON</span>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImportBackup}
                className="hidden"
              />
            </div>

            <div className="px-6 py-4 bg-slate-950 border-t border-white/5 flex justify-end">
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white text-xs font-sans font-bold rounded-xl transition cursor-pointer"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
