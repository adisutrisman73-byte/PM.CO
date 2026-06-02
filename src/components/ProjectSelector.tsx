import React, { useState } from "react";
import { Project, ProjectArea, DocumentationRecord, DocumentationRequest, UserRole } from "../types";
import { FolderGit2, Plus, X, Landmark, Compass, Briefcase, ChevronDown, Edit, Menu, ClipboardList, CheckCircle2, Clock, MapPin, Calendar, Layers, Shield, Camera } from "lucide-react";

interface ProjectSelectorProps {
  projects: Project[];
  activeProjectId: string;
  onSelectProject: (id: string) => void;
  onCreateProject: (name: string, code: string, location: string, managerName: string, siteManagerName: string) => void;
  onUpdateProject: (id: string, name: string, code: string, location: string, managerName: string, siteManagerName: string) => void;
  areas: ProjectArea[];
  records: DocumentationRecord[];
  requests: DocumentationRequest[];
  
  // High-level auto-hide drawer props
  isDetailsOpen: boolean;
  setIsDetailsOpen: (open: boolean) => void;
  currentRole: UserRole;
  activePMName: string;
  activeSMName: string;
  onTriggerRequest: () => void;
  onTriggerUpload: () => void;
}

export default function ProjectSelector({
  projects,
  activeProjectId,
  onSelectProject,
  onCreateProject,
  onUpdateProject,
  areas = [],
  records = [],
  requests = [],
  isDetailsOpen,
  setIsDetailsOpen,
  currentRole,
  activePMName,
  activeSMName,
  onTriggerRequest,
  onTriggerUpload
}: ProjectSelectorProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  
  // Create Project Fields
  const [newName, setNewName] = useState("");
  const [newCode, setNewCode] = useState("");
  const [newLocation, setNewLocation] = useState("");
  const [newManager, setNewManager] = useState("");
  const [newSiteManager, setNewSiteManager] = useState("");

  // Edit Project Fields
  const [editName, setEditName] = useState("");
  const [editCode, setEditCode] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [editManager, setEditManager] = useState("");
  const [editSiteManager, setEditSiteManager] = useState("");

  const activeProject = projects.find(p => p.id === activeProjectId) || projects[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newCode.trim()) {
      alert("Nama Proyek dan Kode Proyek wajib diisi.");
      return;
    }
    onCreateProject(
      newName.trim(),
      newCode.trim().toUpperCase(),
      newLocation.trim() || "Tidak ditentukan",
      newManager.trim() || "Subianto (PM)",
      newSiteManager.trim() || "Bambang Pamungkas (SM)"
    );
    // Reset Form
    setNewName("");
    setNewCode("");
    setNewLocation("");
    setNewManager("");
    setNewSiteManager("");
    setIsCreating(false);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim() || !editCode.trim()) {
      alert("Nama Proyek dan Kode Proyek wajib diisi.");
      return;
    }
    const targetId = editingProjectId || activeProject.id;
    const targetProject = projects.find(p => p.id === targetId) || activeProject;
    onUpdateProject(
      targetId,
      editName.trim(),
      editCode.trim().toUpperCase(),
      editLocation.trim(),
      editManager.trim() || targetProject.managerName,
      editSiteManager.trim() || targetProject.siteManagerName || "Bambang Pamungkas (SM)"
    );
    setIsEditing(false);
    setEditingProjectId(null);
  };

  return (
    <>
      {/* CREATE NEW PROJECT MODAL OVERLAY */}
      {isCreating && (
        <div className="fixed inset-0 bg-slate-950/90 z-50 flex items-center justify-center p-4 backdrop-blur-md animate-fade-in" id="project-creation-overlay">
          <div className="w-full max-w-md bg-slate-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col backdrop-blur-xl animate-scale-up">
            
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-white/5 bg-slate-950 flex justify-between items-center">
              <div className="flex items-center gap-2.5">
                <Landmark className="w-4 h-4 text-cyan-400" />
                <h3 className="font-display font-bold text-white text-sm">
                  Inisiasi Proyek Baru
                </h3>
              </div>
              <button
                onClick={() => setIsCreating(false)}
                className="text-slate-400 hover:text-white transition bg-slate-900 hover:bg-slate-800 p-1.5 rounded-full cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1 space-y-1">
                  <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest" htmlFor="p-code">
                    Kode Proyek *
                  </label>
                  <input
                    id="p-code"
                    type="text"
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                    placeholder="E.g. AP-PKB"
                    className="w-full bg-slate-950 border border-white/10 text-white rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-cyan-500/50 font-sans uppercase font-bold"
                  />
                </div>
                <div className="col-span-2 space-y-1">
                  <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest" htmlFor="p-name">
                    Nama Proyek Konstruksi *
                  </label>
                  <input
                    id="p-name"
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="E.g. Apartemen Mediterania Tower C"
                    className="w-full bg-slate-950 border border-white/10 text-white rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-cyan-500/50 font-sans"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest" htmlFor="p-loc">
                  Lokasi / Sektor Sampingan
                </label>
                <input
                  id="p-loc"
                  type="text"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  placeholder="E.g. Kebayoran Baru, Jakarta Selatan"
                  className="w-full bg-slate-950 border border-white/10 text-white rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-cyan-500/50 font-sans"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest" htmlFor="p-mgr">
                    Project Manager
                  </label>
                  <input
                    id="p-mgr"
                    type="text"
                    value={newManager}
                    onChange={(e) => setNewManager(e.target.value)}
                    placeholder="Subianto, M.T."
                    className="w-full bg-slate-950 border border-white/10 text-white rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-cyan-500/50 font-sans"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest" htmlFor="p-smgr">
                    Site Manager
                  </label>
                  <input
                    id="p-smgr"
                    type="text"
                    value={newSiteManager}
                    onChange={(e) => setNewSiteManager(e.target.value)}
                    placeholder="Bambang P."
                    className="w-full bg-slate-950 border border-white/10 text-white rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-cyan-500/50 font-sans"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-white/5 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-4 py-2 bg-slate-900 border border-white/10 text-slate-400 hover:bg-slate-800 hover:text-white text-xs font-sans font-bold rounded-xl transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 text-xs font-sans font-bold rounded-xl transition shadow-lg cursor-pointer"
                  id="btn-confirm-add-project"
                >
                  Tambahkan Proyek
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* EDIT EXISTING PROJECT MODAL OVERLAY */}
      {isEditing && (
        <div className="fixed inset-0 bg-slate-950/90 z-50 flex items-center justify-center p-4 backdrop-blur-md animate-fade-in" id="project-editing-overlay">
          <div className="w-full max-w-md bg-slate-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col backdrop-blur-xl animate-scale-up">
            
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-white/5 bg-slate-950 flex justify-between items-center">
              <div className="flex items-center gap-2.5">
                <Edit className="w-4 h-4 text-amber-400" />
                <h3 className="font-display font-bold text-white text-sm">
                  Ubah Detail Proyek Aktif
                </h3>
              </div>
              <button
                onClick={() => setIsEditing(false)}
                className="text-slate-400 hover:text-white transition bg-slate-900 hover:bg-slate-800 p-1.5 rounded-full cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1 space-y-1">
                  <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest" htmlFor="edit-p-code">
                    Kode Proyek *
                  </label>
                  <input
                    id="edit-p-code"
                    type="text"
                    value={editCode}
                    onChange={(e) => setEditCode(e.target.value)}
                    placeholder="E.g. AP-PKB"
                    className="w-full bg-slate-950 border border-white/10 text-white rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-cyan-500/50 font-sans uppercase font-bold"
                  />
                </div>
                <div className="col-span-2 space-y-1">
                  <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest" htmlFor="edit-p-name">
                    Nama Proyek Konstruksi *
                  </label>
                  <input
                    id="edit-p-name"
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="E.g. Apartemen Mediterania"
                    className="w-full bg-slate-950 border border-white/10 text-white rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-cyan-500/50 font-sans"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest" htmlFor="edit-p-loc">
                  Lokasi / Sektor Sampingan
                </label>
                <input
                  id="edit-p-loc"
                  type="text"
                  value={editLocation}
                  onChange={(e) => setEditLocation(e.target.value)}
                  placeholder="E.g. Kebayoran Baru, Jakarta Selatan"
                  className="w-full bg-slate-950 border border-white/10 text-white rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-cyan-500/50 font-sans"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest" htmlFor="edit-p-mgr">
                    Project Manager
                  </label>
                  <input
                    id="edit-p-mgr"
                    type="text"
                    value={editManager}
                    onChange={(e) => setEditManager(e.target.value)}
                    placeholder="Subianto, M.T."
                    className="w-full bg-slate-950 border border-white/10 text-white rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-cyan-500/50 font-sans"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest" htmlFor="edit-p-smgr">
                    Site Manager
                  </label>
                  <input
                    id="edit-p-smgr"
                    type="text"
                    value={editSiteManager}
                    onChange={(e) => setEditSiteManager(e.target.value)}
                    placeholder="Bambang P."
                    className="w-full bg-slate-950 border border-white/10 text-white rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-cyan-500/50 font-sans"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-white/5 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 bg-slate-900 border border-white/10 text-slate-400 hover:bg-slate-800 hover:text-white text-xs font-sans font-bold rounded-xl transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 text-xs font-sans font-bold rounded-xl transition shadow-lg cursor-pointer"
                  id="btn-confirm-edit-project"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* HAMBURGER DRAWER FOR PROJECT SPECIFICATION */}
      {isDetailsOpen && (
        <div className="fixed inset-0 z-50 flex justify-start p-0 m-0 overflow-hidden animate-fade-in" id="project-hamburger-drawer-container">
          {/* Backdrop Blur overlay */}
          <div 
            onClick={() => setIsDetailsOpen(false)}
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity duration-300"
          />
          
          {/* Main Slide Panel */}
          <div className="relative w-full max-w-sm bg-slate-900 border-r border-white/10 h-full flex flex-col shadow-2xl justify-between z-10 overflow-hidden transform transition-transform duration-300 ease-out animate-slide-right">
            
            {/* Drawer Header */}
            <div className="p-6 border-b border-white/5 bg-slate-950 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-xl animate-pulse">
                  <FolderGit2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-white text-sm tracking-tight leading-tight">
                    Pilih Proyek Aktif
                  </h3>
                  <p className="text-[10px] text-cyan-400 font-mono font-bold tracking-widest uppercase">
                    {projects.length} Proyek Konstruksi
                  </p>
                </div>
              </div>
              
              <button
                onClick={() => setIsDetailsOpen(false)}
                className="text-slate-400 hover:text-white transition bg-slate-900 hover:bg-slate-800 p-2 rounded-full cursor-pointer"
                title="Tutup Menu"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Drawer Content - Scrollable */}
            <div className="flex-1 p-6 space-y-6 overflow-y-auto">
              
              {/* LIST PROYEK KONSTRUKSI (Switchable) */}
              <div className="space-y-2.5">
                <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest block">
                  Daftar Proyek Konstruksi (Pilih Proyek)
                </span>
                <div className="space-y-2" id="drawer-projects-list">
                  {projects.map(p => {
                    const isSelected = p.id === activeProjectId;
                    return (
                      <div
                        key={p.id}
                        onClick={() => {
                          onSelectProject(p.id);
                          setIsDetailsOpen(false);
                        }}
                        className={`p-3.5 rounded-xl border cursor-pointer text-left transition-all ${
                          isSelected
                            ? "bg-cyan-500/10 border-cyan-400/40 shadow shadow-cyan-950/30 font-semibold"
                            : "bg-slate-950/60 border-white/5 hover:border-white/12 hover:bg-slate-900/60"
                        }`}
                        title="Klik untuk beralih proyek"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-sans font-bold text-xs text-white max-w-[65%] truncate">
                            {p.name}
                          </span>
                          <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => {
                                setEditingProjectId(p.id);
                                setEditName(p.name);
                                setEditCode(p.code);
                                setEditLocation(p.location || "");
                                setEditManager(p.managerName);
                                setEditSiteManager(p.siteManagerName || "");
                                setIsDetailsOpen(false);
                                setIsEditing(true);
                              }}
                              className="p-1.5 bg-slate-900 border border-white/10 hover:border-amber-500/30 text-amber-400 hover:text-amber-300 rounded-lg transition cursor-pointer flex items-center justify-center"
                              title="Edit proyek ini"
                            >
                              <Edit className="w-3 h-3" />
                            </button>
                            <span className={`px-1.5 py-0.5 rounded font-mono text-[9px] uppercase font-bold shrink-0 ${
                              isSelected ? "bg-cyan-400 text-slate-950" : "bg-slate-800 text-slate-400"
                            }`}>
                              {p.code}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2 border-t border-white/[0.03] pt-2">
                          <span className="truncate max-w-[48%] font-sans">PM: {p.managerName}</span>
                          <span className="truncate max-w-[48%] font-sans">Loc: {p.location || "Default Sektor"}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* Drawer Actions */}
            <div className="p-4 border-t border-white/5 bg-slate-950 space-y-2 shrink-0">
              <button
                onClick={() => {
                  setNewName("");
                  setNewCode("");
                  setNewLocation("");
                  setNewManager("");
                  setNewSiteManager("");
                  setIsDetailsOpen(false);
                  setIsCreating(true);
                }}
                className="w-full py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl text-xs font-sans font-bold tracking-wider uppercase transition active:scale-95 cursor-pointer shadow-md text-center flex items-center justify-center gap-1.5"
                title="Tambah proyek konstruksi baru"
              >
                <Plus className="w-3.5 h-3.5" />
                Tambah Proyek Baru
              </button>
              
              <div className="text-center pt-2 border-t border-white/[0.02]">
                <span className="text-[9px] font-mono text-slate-600 uppercase tracking-wider block">
                  CONSTRUX PRO SYSTEM
                </span>
              </div>
            </div>

          </div>
        </div>
      )}

    </>
  );
}
