import React, { useState } from "react";
import { ProjectArea, DocumentationRequest } from "../types";
import { X, Calendar, MessageSquare, AlertCircle, Sparkles, Send } from "lucide-react";

interface RequestModalProps {
  areas: ProjectArea[];
  onAddRequest: (requestedArea: string, description: string, priority: DocumentationRequest["priority"], deadline: string, isRecurring: boolean) => void;
  onClose: () => void;
}

export default function RequestModal({ areas, onAddRequest, onClose }: RequestModalProps) {
  const [requestedArea, setRequestedArea] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [priority, setPriority] = useState<DocumentationRequest["priority"]>("medium");
  const [isRecurring, setIsRecurring] = useState<boolean>(false);
  
  // Set default deadline to +2 days from now
  const getDefaultDeadline = () => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toISOString().split("T")[0];
  };
  const [deadline, setDeadline] = useState<string>(getDefaultDeadline());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const finalArea = requestedArea.trim();

    if (!finalArea) {
      alert("Harap tentukan Area Pekerjaan yang akan direquest dokumentasinya.");
      return;
    }
    if (!description.trim()) {
      alert("Harap masukkan deskripsi detail request dokumen.");
      return;
    }
    if (!deadline) {
      alert("Harap tentukan batas waktu penyerahan foto.");
      return;
    }

    onAddRequest(finalArea, description.trim(), priority, deadline, isRecurring);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/90 z-50 flex items-center justify-center p-4 backdrop-blur-md animate-fade-in" id="request-modal-overlay">
      <div className="w-full max-w-lg bg-slate-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col backdrop-blur-xl animate-scale-up" id="request-modal-box">
        {/* Header bar */}
        <div className="px-5 py-4 border-b border-white/5 bg-slate-950 flex justify-between items-center bg-zinc-50">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-cyan-500 animate-pulse" />
            <h3 className="font-display font-bold text-white text-sm tracking-wide">
              Kirim Request Dokumentasi Baru (PM)
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition bg-slate-900 hover:bg-slate-800 p-1.5 rounded-full cursor-pointer text-xs"
            id="btn-close-request-modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          {/* TARGET AREA INPUT */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
              Target Area Pekerjaan *
            </label>
            <input
              type="text"
              id="requested-area-input"
              value={requestedArea}
              onChange={(e) => setRequestedArea(e.target.value)}
              placeholder="Contoh: Saluran Air Sektor Selatan, Kolom 5, Ramp A"
              className="w-full bg-slate-950 border border-white/10 text-white rounded-xl px-4 py-3 text-xs focus:outline-none focus:ring-1 focus:ring-cyan-500/50 font-sans"
            />
          </div>

          {/* RECURRING OPTION */}
          <div className="bg-slate-950/45 border border-white/5 p-4 rounded-xl space-y-2">
            <label className="flex items-start gap-3 cursor-pointer group select-none">
              <input
                type="checkbox"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
                className="mt-1 accent-cyan-500 rounded border-white/10 focus:ring-1 focus:ring-cyan-500 cursor-pointer"
              />
              <div className="text-left">
                <span className="text-xs font-bold text-white group-hover:text-cyan-400 transition-colors block">
                  🔄 Otomatisasi Berulang Harian (Setiap Hari)
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5 leading-relaxed">
                  Sistem akan otomatis menerbitkan ulang permintaan dokumentasi baru untuk area ini setiap 24 jam secara otomatis.
                </span>
              </div>
            </label>
          </div>

          {/* REQUEST REQUIREMENTS */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest" htmlFor="req-desc_field">
              Detail Instruksi Dokumentasi *
            </label>
            <textarea
              id="req-desc_field"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Instruksikan hal penting yang ingin dipantau. Misal: 'Foto pembesian bekisting sambungan daktil gempa sebelum cor ditutup.'"
              className="w-full bg-slate-950 border border-white/10 text-white rounded-xl p-3 text-xs focus:outline-none focus:ring-1 focus:ring-cyan-500/50 font-sans leading-relaxed"
            />
          </div>

          {/* PRIORITY & DEADLINE GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                Prioritas Proyek
              </label>
              <div className="flex gap-2">
                {(["low", "medium", "high"] as const).map((p) => {
                  const activeColor = {
                    low: "bg-slate-800 text-slate-200 border-white/15 ring-2 ring-slate-500/25",
                    medium: "bg-cyan-950/40 text-cyan-400 border border-cyan-500/20 ring-2 ring-cyan-500/20",
                    high: "bg-red-950/40 text-red-400 border border-red-500/20 ring-2 ring-red-500/20"
                  };
                  const selected = priority === p;
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPriority(p)}
                      className={`flex-1 py-2 text-center text-xs font-sans font-bold border rounded-lg transition-all capitalize cursor-pointer ${
                        selected
                          ? activeColor[p]
                          : "border-white/10 text-slate-500 hover:bg-slate-950 hover:text-slate-300"
                      }`}
                    >
                      {p === "low" ? "Rendah" : p === "medium" ? "Sedang" : "Tinggi"}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest" htmlFor="deadline-input">
                Tenggat Waktu Penyetoran (Deadline)
              </label>
              <div className="relative">
                <input
                  id="deadline-input"
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full bg-slate-950 border border-white/10 text-white rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-cyan-500/50 font-sans"
                />
              </div>
            </div>
          </div>



          {/* FOOTER ACTIONS */}
          <div className="pt-3 border-t border-white/5 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-900 border border-white/10 text-slate-400 hover:bg-slate-800 hover:text-white text-xs font-sans font-bold rounded-xl transition-all cursor-pointer"
            >
              Batalkan
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 text-xs font-sans font-bold rounded-xl transition-all shadow-lg flex items-center gap-1.5 cursor-pointer"
              id="btn-confirm-send-request"
            >
              <Send className="w-3.5 h-3.5" />
              Kirim Request Pekerjaan
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
