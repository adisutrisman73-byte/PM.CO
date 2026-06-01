import React, { useState, useRef, useEffect } from "react";
import { ProjectArea, DocumentationRequest, DocumentationRecord } from "../types";
import { Camera, Upload, AlertCircle, Plus, Sparkles, Check, Trash2, ArrowLeft } from "lucide-react";
import CameraCapture from "./CameraCapture";

interface UploadFormProps {
  areas: ProjectArea[];
  requests: DocumentationRequest[];
  onAddArea: (name: string, description: string, category: ProjectArea["category"]) => ProjectArea;
  onAddRecord: (record: Omit<DocumentationRecord, "id" | "submittedBy" | "submittedAt" | "status">) => void;
  preSelectedRequestId?: string;
  onCancel: () => void;
}

export default function UploadForm({
  areas,
  requests,
  onAddArea,
  onAddRecord,
  preSelectedRequestId,
  onCancel
}: UploadFormProps) {
  const [selectedAreaId, setSelectedAreaId] = useState<string>("");
  const [selectedRequestId, setSelectedRequestId] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [photoUrl, setPhotoUrl] = useState<string>("");
  
  // Custom Area Insertion Inline Toggle
  const [isAddingNewArea, setIsAddingNewArea] = useState<boolean>(false);
  const [newAreaName, setNewAreaName] = useState<string>("");
  const [newAreaDesc, setNewAreaDesc] = useState<string>("");
  const [newAreaCategory, setNewAreaCategory] = useState<ProjectArea["category"]>("Struktur");

  // Camera Capture Modal Toggle
  const [isCameraOpen, setIsCameraOpen] = useState<boolean>(false);
  
  // File upload state & ref
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState<boolean>(false);

  // Auto-fill if pre-selected via request hook
  useEffect(() => {
    if (preSelectedRequestId) {
      const freq = requests.find(r => r.id === preSelectedRequestId);
      if (freq) {
        setSelectedRequestId(preSelectedRequestId);
        // Find if area exists
        const matchedArea = areas.find(a => a.name.toLowerCase() === freq.requestedArea.toLowerCase());
        if (matchedArea) {
          setSelectedAreaId(matchedArea.id);
        } else {
          // prefill default or option to create
          setIsAddingNewArea(true);
          setNewAreaName(freq.requestedArea);
          setNewAreaDesc(`Area khusus ditarik dari request PM: "${freq.description}"`);
        }
      }
    }
  }, [preSelectedRequestId, requests, areas]);

  // Handle file import to base64
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Hanya file gambar (JPEG/PNG) yang diperbolehkan.");
      return;
    }
    
    // Max 10MB to avoid local storage explosion, though standard base64 is compressed
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        setPhotoUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Drag and Drop triggers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleCreateAreaAndSubmit = () => {
    if (!photoUrl) {
      alert("Harap ambil atau unggah foto dokumentasi terlebih dahulu.");
      return;
    }
    if (!description.trim()) {
      alert("Harap isi deskripsi hasil pekerjaan.");
      return;
    }

    let finalAreaId = selectedAreaId;
    let finalAreaName = "";

    if (isAddingNewArea) {
      if (!newAreaName.trim()) {
        alert("Nama area baru tidak boleh kosong.");
        return;
      }
      const createdArea = onAddArea(newAreaName, newAreaDesc, newAreaCategory);
      finalAreaId = createdArea.id;
      finalAreaName = createdArea.name;
    } else {
      if (!selectedAreaId) {
        alert("Harap pilih Area Proyek yang akan didokumentasikan.");
        return;
      }
      const existingArea = areas.find(a => a.id === selectedAreaId);
      finalAreaName = existingArea ? existingArea.name : "";
    }

    onAddRecord({
      areaId: finalAreaId,
      areaName: finalAreaName,
      description: description,
      photoUrl: photoUrl,
      requestId: selectedRequestId || undefined
    });
  };

  return (
    <div className="bg-slate-900/90 border border-white/10 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl animate-fade-in" id="sm-upload-form-container">
      {/* Block top bar */}
      <div className="px-6 py-4 border-b border-white/5 bg-slate-950 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button 
            type="button" 
            onClick={onCancel} 
            className="p-1.5 px-3 bg-slate-900 border border-white/10 font-sans hover:bg-slate-800 rounded-lg text-xs font-semibold text-slate-300 transition flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Kembali
          </button>
          <span className="h-4 w-px bg-white/10" />
          <h2 className="font-display font-bold text-white text-sm tracking-wide">Buat & Setor Dokumentasi Baru</h2>
        </div>
        <p className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 py-1 px-3 rounded-full">
          SM WORKSPACE ACTIVE
        </p>
      </div>

      <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Side: Inputs */}
        <div className="md:col-span-7 flex flex-col gap-5">
          
          {/* TAUTKAN REQUEST PM (Optional/Preselected) */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest" htmlFor="link-request">
              Hubungkan dengan Request Project Manager? (Opsional)
            </label>
            <select
              id="link-request"
              value={selectedRequestId}
              onChange={(e) => {
                setSelectedRequestId(e.target.value);
                const matchedReq = requests.find(r => r.id === e.target.value);
                if (matchedReq) {
                  // Pre-fill
                  const targetArea = areas.find(a => a.name.toLowerCase() === matchedReq.requestedArea.toLowerCase());
                  if (targetArea) {
                    setSelectedAreaId(targetArea.id);
                    setIsAddingNewArea(false);
                  } else {
                    setIsAddingNewArea(true);
                    setNewAreaName(matchedReq.requestedArea);
                  }
                }
              }}
              className="w-full bg-slate-950 border border-white/10 text-white rounded-xl px-4 py-3 text-xs focus:outline-none focus:ring-1 focus:ring-cyan-500/50 font-sans"
            >
              <option value="">-- Tidak ditautkan ke request spesifik --</option>
              {requests
                .filter(r => r.status === "pending" || r.id === preSelectedRequestId)
                .map(r => (
                  <option key={r.id} value={r.id} className="bg-slate-900 text-white">
                    [{r.priority.toUpperCase()}] {r.requestedArea} (Batas: {r.deadline})
                  </option>
                ))}
            </select>
          </div>

          {/* AREA SELECTOR & SWITCH */}
          <div className="border border-white/5 rounded-xl p-4 bg-slate-950/40">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                Area Pekerjaan Proyek
              </span>
              <button
                type="button"
                onClick={() => setIsAddingNewArea(!isAddingNewArea)}
                className="text-[11px] font-sans font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 px-2.5 py-1 bg-slate-900 border border-white/10 rounded-lg transition-all cursor-pointer"
                id="btn-toggle-new-area"
              >
                <Plus className="w-3.5 h-3.5" />
                {isAddingNewArea ? "Pilih Area Eksisting" : "Tambah Area Baru"}
              </button>
            </div>

            {isAddingNewArea ? (
              /* New Area Sub-Form */
              <div className="space-y-3.5 p-3.5 bg-slate-950 border border-white/5 rounded-xl shadow-inner animate-fade-in" id="new-area-subform">
                <div>
                  <label className="block text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest mb-1" htmlFor="new-area-name">
                    Nama Area Baru
                  </label>
                  <input
                    id="new-area-name"
                    type="text"
                    value={newAreaName}
                    onChange={(e) => setNewAreaName(e.target.value)}
                    placeholder="Contoh: Tangga Darurat Sektor Barat"
                    className="w-full bg-slate-900 border border-white/10 text-white rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-cyan-500/50 font-sans"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest mb-1" htmlFor="new-area-category">
                      Kategori Area
                    </label>
                    <select
                      id="new-area-category"
                      value={newAreaCategory}
                      onChange={(e) => setNewAreaCategory(e.target.value as ProjectArea["category"])}
                      className="w-full bg-slate-900 border border-white/10 text-white rounded-lg px-2 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-cyan-500/50 font-sans"
                    >
                      <option value="Pondasi">Pondasi</option>
                      <option value="Struktur">Struktur</option>
                      <option value="Fasad">Fasad</option>
                      <option value="MEP">MEP (Mekanikal Elektrikal)</option>
                      <option value="Finishing">Finishing Interior/Eksterior</option>
                      <option value="Lainnya">Lainnya</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest mb-1" htmlFor="new-area-desc">
                      Catatan Deskripsi Area
                    </label>
                    <input
                      id="new-area-desc"
                      type="text"
                      value={newAreaDesc}
                      onChange={(e) => setNewAreaDesc(e.target.value)}
                      placeholder="Contoh: Pekerjaan dak tangga struktur"
                      className="w-full bg-slate-900 border border-white/10 text-white rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-cyan-500/50 font-sans"
                    />
                  </div>
                </div>
              </div>
            ) : (
              /* Existing Area Dropdown */
              <div>
                <select
                  value={selectedAreaId}
                  onChange={(e) => setSelectedAreaId(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 text-white rounded-xl px-4 py-3 text-xs focus:outline-none focus:ring-1 focus:ring-cyan-500/50 font-sans"
                >
                  <option value="">-- Pilih Area Konstruksi Eksisting --</option>
                  {areas.map(a => (
                    <option key={a.id} value={a.id} className="bg-slate-900 text-white">
                      {a.category.toUpperCase()} - {a.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* DOCUMENTATION CAPTION NOTE */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest" htmlFor="capsual-desc">
              Deskripsi & Progres Pekerjaan Aktual *
            </label>
            <textarea
              id="capsual-desc"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Jelaskan secara detail kemajuan fisik pekerjaan, persentase estimasi, jenis material yang digunakan, serta ketaatan gambar teknis di lapangan..."
              className="w-full bg-slate-950 border border-white/10 text-white rounded-xl p-4 text-xs focus:outline-none focus:ring-1 focus:ring-cyan-500/50 font-sans leading-relaxed"
            />
          </div>

        </div>

        {/* Right Side: Photo Selector & Camera Engine */}
        <div className="md:col-span-5 flex flex-col gap-4">
          <span className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
            Foto Dokumentasi Fisik Lapangan *
          </span>

          {photoUrl ? (
            /* Selected File / Camera Captured Frame */
            <div className="relative group rounded-xl border border-white/10 overflow-hidden aspect-video bg-slate-950 flex items-center justify-center" id="img-preview-box">
              <img
                src={photoUrl}
                alt="Pratinjau Dokumentasi"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-slate-950/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsCameraOpen(true)}
                  className="p-3 bg-white text-slate-950 hover:bg-slate-100 rounded-full cursor-pointer hover:scale-105 transition shadow-lg"
                  title="Ambil Ulang Menggunakan Kamera"
                  id="btn-rec-cam"
                >
                  <Camera className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={() => setPhotoUrl("")}
                  className="p-3 bg-red-600 text-white hover:bg-red-500 rounded-full cursor-pointer hover:scale-105 transition shadow-lg"
                  title="Hapus / Ganti Gambar"
                  id="btn-trash-preview"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ) : (
            /* Blank Selector Frame with File Drag Drop & Camera Action Hook */
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center text-center transition-all min-h-[220px] cursor-default ${
                dragActive
                  ? "border-cyan-500 bg-cyan-500/10 text-cyan-400"
                  : "border-white/10 bg-slate-950/50 hover:bg-slate-950 text-slate-400"
              }`}
              id="file-dropzone"
            >
              <Upload className={`w-8 h-8 mb-3 ${dragActive ? "text-cyan-400 animate-bounce" : "text-slate-500"}`} />
              
              <p className="font-sans font-semibold text-xs text-slate-300 max-w-xs mb-1">
                Drag & drop berkas foto di sini, atau pilih salah satu metode di bawah
              </p>
              <p className="font-sans text-[11px] text-slate-500 mb-5">
                Mendukung PNG, JPG, JPEG (Max 10MB)
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full max-w-[320px]">
                {/* Method 1: Local file */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-2.5 px-3 bg-slate-900 hover:bg-slate-800 border border-white/10 hover:border-cyan-500/30 text-slate-200 text-xs font-sans font-semibold rounded-xl transition flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                  id="btn-trigger-upload-field"
                >
                  Pilih dari Folder
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {/* Method 2: Live Camera */}
                <button
                  type="button"
                  onClick={() => setIsCameraOpen(true)}
                  className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-sans font-semibold rounded-xl transition flex items-center justify-center gap-1.5 shadow-md shadow-emerald-950/20 cursor-pointer"
                  id="btn-camera-trigger-modal"
                >
                  <Camera className="w-3.5 h-3.5" />
                  Ambil Foto Kamera
                </button>
              </div>
            </div>
          )}


        </div>
      </div>

      {/* FOOTER ACTIONS */}
      <div className="px-6 py-4.5 bg-slate-950 border-t border-white/5 flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-2.5 bg-slate-900 border border-white/10 text-slate-400 hover:bg-slate-800 hover:text-white text-xs font-sans font-bold rounded-xl transition-all cursor-pointer"
        >
          Batalkan form
        </button>
        <button
          type="button"
          onClick={handleCreateAreaAndSubmit}
          className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 hover:opacity-90 text-xs font-sans font-bold rounded-xl transition-all shadow-lg flex items-center gap-1.5 cursor-pointer"
          id="btn-submit-documentation"
        >
          <Check className="w-4 h-4" />
          Kirim Dokumentasi Sekarang
        </button>
      </div>

      {/* Floating Camera Overlay Capture Tool */}
      {isCameraOpen && (
        <CameraCapture
          onCapture={(base64Str) => {
            setPhotoUrl(base64Str);
            setIsCameraOpen(false);
          }}
          onClose={() => setIsCameraOpen(false)}
        />
      )}
    </div>
  );
}
