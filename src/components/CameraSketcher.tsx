import React, { useState, useEffect, useRef } from "react";
import { ProjectArea, CameraSketch, CameraMarker } from "../types";
import { 
  Camera, 
  Map, 
  Move, 
  Plus, 
  Trash2, 
  Save, 
  Grid, 
  Compass, 
  RotateCw, 
  Play, 
  Sparkles, 
  HelpCircle, 
  Layers,
  Activity,
  CheckCircle,
  Undo,
  Image,
  Upload,
  Sliders,
  Menu
} from "lucide-react";

interface CameraSketcherProps {
  projectId: string;
  areas: ProjectArea[];
  currentRole: "SITE_MANAGER" | "PROJECT_MANAGER";
}

export default function CameraSketcher({ projectId, areas, currentRole }: CameraSketcherProps) {
  // Sketches state loaded from state/localStorage
  const [sketches, setSketches] = useState<CameraSketch[]>(() => {
    const saved = localStorage.getItem("construx_sketches");
    if (saved) return JSON.parse(saved);
    return [
      {
        id: "sketch-1",
        projectId: "project-1",
        areaId: "area-1",
        title: "Panduan Sudut Kamera Struktur Pilar Sisi Barat",
        blueprintType: "building",
        createdAt: "2026-05-15T00:00:00Z",
        markers: [
          {
            id: "marker-1",
            label: "Kamera Utama (Tampak Depan)",
            x: 25,
            y: 40,
            angle: 45,
            viewCone: 65,
            targetDesc: "Berdiri tegak lurus 3 meter dari pilar utama B1. Lensa mengarah 45 derajat ke atas mengunci area sambungan balok girder."
          },
          {
            id: "marker-2",
            label: "Kamera Detail Las Sambungan",
            x: 70,
            y: 65,
            angle: 180,
            viewCone: 45,
            targetDesc: "Pengambilan gambar jarak dekat (macro). Pastikan memotret nomor pilar dan las penahan gempa dengan jelas."
          }
        ],
        customLines: [
          { x1: 10, y1: 20, x2: 90, y2: 20 },
          { x1: 10, y1: 80, x2: 90, y2: 80 },
          { x1: 20, y1: 20, x2: 20, y2: 80 },
          { x1: 80, y1: 20, x2: 80, y2: 80 }
        ]
      },
      {
        id: "sketch-2",
        projectId: "project-2",
        areaId: "area-3",
        title: "SOP Pengambilan Dokumentasi Girder Jembatan",
        blueprintType: "bridge",
        createdAt: "2026-05-18T00:00:00Z",
        markers: [
          {
            id: "marker-3",
            label: "Perspektif Pier Head",
            x: 50,
            y: 35,
            angle: 90,
            viewCone: 90,
            targetDesc: "Menghadap langsung ke sisi utara pilar penopang baja. Wajib menggunakan lensa wide-angle agar seluruh tumpuan Pier masuk frame."
          }
        ],
        customLines: [
          { x1: 5, y1: 50, x2: 95, y2: 50 },
          { x1: 5, y1: 55, x2: 95, y2: 55 },
          { x1: 30, y1: 45, x2: 30, y2: 60 },
          { x1: 70, y1: 45, x2: 70, y2: 60 }
        ]
      }
    ];
  });

  // Active Sketch selected for display/editing
  const [activeSketchId, setActiveSketchId] = useState<string | null>(null);

  // Filter sketches by current active project
  const filteredSketches = sketches.filter(s => s.projectId === projectId);

  // Set first sketch of filtered active project on load
  useEffect(() => {
    if (filteredSketches.length > 0) {
      if (!activeSketchId || !filteredSketches.some(s => s.id === activeSketchId)) {
        setActiveSketchId(filteredSketches[0].id);
      }
    } else {
      setActiveSketchId(null);
    }
  }, [projectId]);

  // Persist sketches state
  useEffect(() => {
    localStorage.setItem("construx_sketches", JSON.stringify(sketches));
  }, [sketches]);

  // Form states for creating sketch
  const [isCreatingNew, setIsCreatingNew] = useState<boolean>(false);
  const [newSketchTitle, setNewSketchTitle] = useState<string>("");
  const [newSketchAreaId, setNewSketchAreaId] = useState<string>("");
  const [newSketchType, setNewSketchType] = useState<CameraSketch["blueprintType"]>("building");

  // Canvas interaction states
  const [drawingMode, setDrawingMode] = useState<"select" | "draw_wall" | "add_camera">("select");
  const [tempLineStart, setTempLineStart] = useState<{ x: number, y: number } | null>(null);
  const [hoverCoords, setHoverCoords] = useState<{ x: number, y: number } | null>(null);
  const [selectedMarkerId, setSelectedMarkerId] = useState<string | null>(null);

  // Dragging and interactive relocation support
  const [isDraggingNode, setIsDraggingNode] = useState<string | null>(null);
  const [bgOpacity, setBgOpacity] = useState<number>(0.65);
  const [isRelocatingSelected, setIsRelocatingSelected] = useState<boolean>(false);

  const canvasRef = useRef<SVGSVGElement>(null);

  // Find active sketch
  const activeSketch = sketches.find(s => s.id === activeSketchId);

  // Handler for adding/editing markers inside active sketch
  const handleUpdateActiveSketch = (updater: (prev: CameraSketch) => CameraSketch) => {
    if (!activeSketchId) return;
    setSketches(prev => prev.map(s => {
      if (s.id === activeSketchId) {
        return updater(s);
      }
      return s;
    }));
  };

  // Create new sketch item
  const handleCreateSketch = () => {
    if (!newSketchTitle.trim()) {
      alert("Harap tentukan judul acuan sketsa.");
      return;
    }
    if (!newSketchAreaId) {
      alert("Harap pilih Sektor Area terkait untuk peta acuan ini.");
      return;
    }

    // Default template lines inside blueprint types
    let customLines: CameraSketch["customLines"] = [];
    if (newSketchType === "building") {
      customLines = [
        { x1: 15, y1: 15, x2: 85, y2: 15 },
        { x1: 15, y1: 85, x2: 85, y2: 85 },
        { x1: 15, y1: 15, x2: 15, y2: 85 },
        { x1: 85, y1: 15, x2: 85, y2: 85 },
        { x1: 50, y1: 15, x2: 50, y2: 85 }
      ];
    } else if (newSketchType === "bridge") {
      customLines = [
        { x1: 10, y1: 45, x2: 90, y2: 45 },
        { x1: 10, y1: 55, x2: 90, y2: 55 },
        { x1: 33, y1: 35, x2: 33, y2: 65 },
        { x1: 66, y1: 35, x2: 66, y2: 65 }
      ];
    } else if (newSketchType === "excavation") {
      customLines = [
        { x1: 25, y1: 25, x2: 75, y2: 25 },
        { x1: 75, y1: 25, x2: 75, y2: 75 },
        { x1: 75, y1: 75, x2: 25, y2: 75 },
        { x1: 25, y1: 75, x2: 25, y2: 25 },
        { x1: 35, y1: 35, x2: 65, y2: 35 },
        { x1: 65, y1: 35, x2: 65, y2: 65 },
        { x1: 65, y1: 65, x2: 35, y2: 65 },
        { x1: 35, y1: 65, x2: 35, y2: 35 }
      ];
    } else {
      // standard plaingrid
      customLines = [];
    }

    const newSketch: CameraSketch = {
      id: `sketch-${Date.now()}`,
      projectId,
      areaId: newSketchAreaId,
      title: newSketchTitle.trim(),
      blueprintType: newSketchType,
      markers: [],
      customLines,
      createdAt: new Date().toISOString()
    };

    setSketches(prev => [newSketch, ...prev]);
    setActiveSketchId(newSketch.id);
    setIsCreatingNew(false);
    setNewSketchTitle("");
    setNewSketchAreaId("");
  };

  const handleDeleteSketch = (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus sketsa acuan kamera ini?")) {
      setSketches(prev => prev.filter(s => s.id !== id));
      if (activeSketchId === id) {
        setActiveSketchId(null);
      }
    }
  };

  // Convert client SVG coordinate to percentage
  const getCoordinatesFromEvent = (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
    if (!canvasRef.current) return null;
    const rect = canvasRef.current.getBoundingClientRect();
    const xRaw = e.clientX - rect.left;
    const yRaw = e.clientY - rect.top;
    
    // Express as percentage (0-100) bound to decimals
    const x = Math.round((xRaw / rect.width) * 100);
    const y = Math.round((yRaw / rect.height) * 100);
    return { x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) };
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
    const coords = getCoordinatesFromEvent(e);
    if (coords) {
      setHoverCoords(coords);
      if (isDraggingNode && currentRole === "PROJECT_MANAGER") {
        handleUpdateActiveSketch(sched => ({
          ...sched,
          markers: sched.markers.map(m => {
            if (m.id === isDraggingNode) {
              return { ...m, x: coords.x, y: coords.y };
            }
            return m;
          })
        }));
      }
    }
  };

  const handleCanvasMouseUp = () => {
    setIsDraggingNode(null);
  };

  const handleCanvasClick = (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
    // Left-click interactive functions
    const coords = getCoordinatesFromEvent(e);
    if (!coords || !activeSketch) return;

    // Interactive left-click direct reposition helper
    if (isRelocatingSelected && selectedMarkerId && currentRole === "PROJECT_MANAGER") {
      handleUpdateActiveSketch(sched => ({
        ...sched,
        markers: sched.markers.map(m => m.id === selectedMarkerId ? { ...m, x: coords.x, y: coords.y } : m)
      }));
      setIsRelocatingSelected(false);
      return;
    }

    if (drawingMode === "draw_wall") {
      if (!tempLineStart) {
        // First click sets starting anchor point of wall
        setTempLineStart(coords);
      } else {
        // Second click finishes the line and pushes into state
        handleUpdateActiveSketch(sched => ({
          ...sched,
          customLines: [...sched.customLines, { x1: tempLineStart.x, y1: tempLineStart.y, x2: coords.x, y2: coords.y }]
        }));
        setTempLineStart(null);
      }
    } else if (drawingMode === "add_camera") {
      // Prompt/create node on that spot
      const currentArea = areas.find(a => a.id === activeSketch.areaId);
      const newMarker: CameraMarker = {
        id: `marker-${Date.now()}`,
        label: `Kamera-${activeSketch.markers.length + 1} Sektor ${currentArea?.name || ""}`,
        x: coords.x,
        y: coords.y,
        angle: 90,
        viewCone: 65,
        targetDesc: "Posisikan kamera dengan stabil mengarah ke tumpuan sudut pekerjaan."
      };

      handleUpdateActiveSketch(sched => ({
        ...sched,
        markers: [...sched.markers, newMarker]
      }));
      setSelectedMarkerId(newMarker.id);
      setDrawingMode("select"); // Toggle back to pointer interaction default
    }
  };

  const handleDragOverMarker = (e: React.DragEvent, id: string) => {
    e.preventDefault();
  };

  const handleMarkerSettingsChange = (markerId: string, fields: Partial<CameraMarker>) => {
    handleUpdateActiveSketch(sched => ({
      ...sched,
      markers: sched.markers.map(m => {
        if (m.id === markerId) {
          return { ...m, ...fields };
        }
        return m;
      })
    }));
  };

  const handleDeleteMarker = (markerId: string) => {
    handleUpdateActiveSketch(sched => ({
      ...sched,
      markers: sched.markers.filter(m => m.id !== markerId)
    }));
    if (selectedMarkerId === markerId) {
      setSelectedMarkerId(null);
    }
  };

  const handleUndoCustomLine = () => {
    handleUpdateActiveSketch(sched => ({
      ...sched,
      customLines: sched.customLines.slice(0, -1)
    }));
  };

  const selectedMarker = activeSketch?.markers.find(m => m.id === selectedMarkerId);

  return (
    <div className="bg-slate-900 border border-white/10 rounded-2xl shadow-xl overflow-hidden text-left" id="camera-position-sketcher">
      
      {/* MINIMAL DESIGN BOARD HEADER */}
      <div className="p-5 border-b border-white/5 bg-slate-950 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 text-cyan-400 border border-cyan-500/20 rounded-xl">
            <Compass className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="font-display font-bold text-white text-sm tracking-wide">
              Plotter & Sketsa Posisi Acuan Lensa Kamera
            </h2>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              Gambar denah rintangan pilar dan letakkan pin kamera kompas sebagai penunjuk arah bidik bagi Site Manager.
            </p>
          </div>
        </div>

        {currentRole === "PROJECT_MANAGER" && !isCreatingNew && (
          <button
            onClick={() => {
              const defaultArea = areas.find(a => a.projectId === projectId || (!a.projectId && projectId === 'project-1'))?.id || areas[0]?.id || "";
              setNewSketchAreaId(defaultArea);
              setNewSketchType("grid");
              setNewSketchTitle("");
              setIsCreatingNew(true);
            }}
            className="px-4 py-2.5 bg-gradient-to-r from-cyan-400 to-cyan-500 hover:from-cyan-300 hover:to-cyan-400 text-slate-950 font-sans font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-lg active:scale-95 whitespace-nowrap shrink-0 select-none"
            id="btn-trigger-new-sketch"
          >
            <Plus className="w-3.5 h-3.5" />
            Buat Sketsa Denah Baru
          </button>
        )}
      </div>

      {/* FORM: NEW SKETCH */}
      {isCreatingNew && (
        <div className="bg-indigo-950/20 border-b border-indigo-500/20 p-5 space-y-4 animate-fade-in" id="new-sketch-form-panel">
          <h3 className="text-xs font-mono font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="w-4 h-4 animate-bounce" /> Hubungkan Sketsa Denah SOP Baru
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-12 space-y-1">
              <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest" htmlFor="sk-title">
                Judul Denah Acuan *
              </label>
              <input
                id="sk-title"
                type="text"
                placeholder="Misal: Posisi Lensa Pilar Elevasi P3B"
                value={newSketchTitle}
                onChange={(e) => setNewSketchTitle(e.target.value)}
                className="w-full bg-slate-950 border border-white/10 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
              />
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <button
              onClick={() => setIsCreatingNew(false)}
              className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg text-xs font-bold transition"
            >
              Batalkan
            </button>
            <button
              onClick={handleCreateSketch}
              className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-indigo-500 text-slate-950 font-bold rounded-lg text-xs transition flex items-center gap-1 shadow-lg shadow-indigo-950/45"
            >
              Buat & Buka Kanvas Kerja
            </button>
          </div>
        </div>
      )}

      {/* CORE WORKSPACE SECTION DIVISION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[460px]">
        
        {/* SIDE BAR: SELECT EXISTING SKETCH MAP */}
        <div className="lg:col-span-3 border-r border-white/5 bg-slate-950/40 p-4 flex flex-col gap-3">
          <span className="block text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">
            Daftar Denah Proyek Terpasang ({filteredSketches.length})
          </span>

          {filteredSketches.length === 0 ? (
            <div className="p-8 text-center text-slate-500 border border-dashed border-white/5 rounded-xl block bg-slate-950/20">
              <Compass className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="text-xs font-sans">Belum ada sketsa panduan kamera di proyek ini.</p>
              {currentRole === "PROJECT_MANAGER" && (
                <button
                  type="button"
                  onClick={() => {
                    const defaultArea = areas.find(a => a.projectId === projectId || (!a.projectId && projectId === 'project-1'))?.id || areas[0]?.id || "";
                    setNewSketchAreaId(defaultArea);
                    setNewSketchType("grid");
                    setNewSketchTitle("");
                    setIsCreatingNew(true);
                  }}
                  className="mt-2 text-[10px] text-cyan-400 hover:underline font-bold"
                >
                  Buat Sekarang!
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
              {filteredSketches.map(s => {
                const targetArea = areas.find(a => a.id === s.areaId);
                const isActive = activeSketchId === s.id;
                return (
                  <div
                    key={s.id}
                    onClick={() => {
                      setActiveSketchId(s.id);
                      setSelectedMarkerId(null);
                    }}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition flex flex-col justify-between gap-2 shadow-inner group ${
                      isActive 
                        ? "bg-slate-800 border-cyan-500/30 text-white" 
                        : "bg-slate-900/50 border-white/5 text-slate-300 hover:bg-slate-800/40"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-mono bg-slate-950 border border-white/10 text-cyan-400 px-2 py-0.5 rounded leading-none uppercase font-bold">
                          {s.blueprintType}
                        </span>
                        {currentRole === "PROJECT_MANAGER" && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteSketch(s.id);
                            }}
                            className="text-slate-600 hover:text-red-400 p-1 opacity-10 group-hover:opacity-100 transition"
                            title="Hapus sketsa"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                      <h4 className="text-xs font-sans font-bold leading-tight mt-1.5">{s.title}</h4>
                    </div>

                    <div className="text-[10px] text-slate-500 font-mono flex items-center justify-between border-t border-white/5 pt-1.5">
                      <span>{targetArea?.name || "Semua Area"}</span>
                      <strong className="text-indigo-400">{s.markers.length} Pin</strong>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="bg-slate-950 border border-white/5 p-3 rounded-xl space-y-1.5 mt-auto">
            <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest block">
              SOP Orientasi Lensa
            </span>
            <p className="text-[10px] text-slate-500 font-sans leading-relaxed">
              Site Manager direkomendasikan mengarahkan sudut hadap kamera mengikuti petunjuk radial jarum kompas berwarna putih di dalam kanvas untuk foto tervalid.
            </p>
          </div>
        </div>

        {/* WORK CANVAS AREA PLATFORM */}
        <div className="lg:col-span-9 p-4 flex flex-col md:flex-row gap-5">
          
          {activeSketch ? (
            <>
              {/* CANVAS GRAPH COLUMN */}
              <div className="flex-1 space-y-3">
                
                {/* TOOLBAR FOR PM ACTIONS */}
                <div className="flex items-center justify-between bg-slate-900 p-2 border border-white/10 rounded-xl" id="canvas-toolbar">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        setDrawingMode("select");
                        setTempLineStart(null);
                      }}
                      className={`p-2 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                        drawingMode === "select"
                          ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                          : "text-slate-400 hover:bg-slate-800"
                      }`}
                      title="Model Interaksi Pemilihan & Geser"
                    >
                      <Move className="w-3.5 h-3.5" />
                      Interaksi
                    </button>

                    {currentRole === "PROJECT_MANAGER" && (
                      <>
                        <button
                          onClick={() => {
                            setDrawingMode("draw_wall");
                            setTempLineStart(null);
                          }}
                          className={`p-2 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                            drawingMode === "draw_wall"
                              ? "bg-amber-500/15 text-amber-400 border border-amber-500/20"
                              : "text-slate-400 hover:bg-slate-800"
                          }`}
                          title="Klik dua titik berbeda pada grid untuk membuat garis rintangan beton pilar"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Garis Denah (+Wall)
                        </button>

                        <button
                          onClick={() => {
                            setDrawingMode("add_camera");
                            setTempLineStart(null);
                          }}
                          className={`p-2 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                            drawingMode === "add_camera"
                              ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                              : "text-slate-400 hover:bg-slate-800"
                          }`}
                          title="Klik di mana saja di area blueprint bawah untuk menempatkan kamera bidik baru"
                        >
                          <Camera className="w-3.5 h-3.5" />
                          Taruh Kamera (+Pin)
                        </button>
                      </>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    {activeSketch.customLines.length > 0 && currentRole === "PROJECT_MANAGER" && (
                      <button
                        onClick={handleUndoCustomLine}
                        className="p-1 px-2.5 bg-slate-950 border border-white/5 hover:bg-slate-800 rounded-lg text-[10px] text-slate-400 hover:text-white transition flex items-center gap-1 cursor-pointer font-bold"
                        title="Batalkan garis yang terakhir ditarik"
                      >
                        <Undo className="w-3 h-3" />
                        Undo Garis
                      </button>
                    )}
                    <span className="text-[10px] font-mono text-slate-500 bg-slate-950 px-2 py-1 rounded">
                      {hoverCoords ? `X: ${hoverCoords.x}% Y: ${hoverCoords.y}%` : "Kompas Grid"}
                    </span>
                  </div>
                </div>

                {/* GRAPH SCREEN MAP PLATFORM CANVAS */}
                <div className="relative aspect-square md:aspect-[4/3] bg-slate-950 border-2 border-white/5 rounded-2xl overflow-hidden grid-blueprint-accent shadow-inner">
                  
                  {/* Grid Lines Backdrop */}
                  <div className="absolute inset-0 opacity-10 pointer-events-none grid grid-cols-10 divide-x divide-cyan-500/60 h-full w-full">
                    {[...Array(10)].map((_, i) => <div key={i} />)}
                  </div>
                  <div className="absolute inset-0 opacity-10 pointer-events-none flex flex-col justify-between divide-y divide-cyan-500/60 h-full w-full">
                    {[...Array(8)].map((_, i) => <div key={i} />)}
                  </div>

                  {/* Mode Banner Indicator Overlay */}
                  <div className="absolute top-3 left-3 z-10 font-mono text-[9px] uppercase font-bold tracking-widest bg-slate-900/90 border border-white/10 px-2.5 py-1 rounded-lg flex items-center gap-1.5 pointer-events-none">
                    <span className={`w-1.5 h-1.5 rounded-full ${isRelocatingSelected ? "bg-amber-400 animate-ping" : drawingMode === "select" ? "bg-cyan-500" : drawingMode === "draw_wall" ? "bg-amber-500 animate-pulse" : "bg-emerald-500 animate-pulse"}`} />
                    {isRelocatingSelected 
                      ? "MODE PEMINDAHAN: KLIK DI MANA SAJA UNTUK PINDAHKAN KAMERA" 
                      : drawingMode === "select" 
                        ? "KONSOL BROWSER (GESER PIN KAMERA AKTIF)" 
                        : drawingMode === "draw_wall" 
                          ? "KLIK 2 PERMUKAAN UNTUK GARIS STRUKTUR" 
                          : "KLIK JENDELA UNTUK LETAKKAN KAMERA BARU"
                    }
                  </div>

                  {/* DRAWING BLUEPRINT SVG VIEWERPORT */}
                  <svg
                    ref={canvasRef}
                    onClick={handleCanvasClick}
                    onMouseMove={handleCanvasMouseMove}
                    onMouseUp={handleCanvasMouseUp}
                    onMouseLeave={handleCanvasMouseUp}
                    className="absolute inset-0 w-full h-full cursor-crosshair select-none"
                  >
                    {/* Render custom reference image background if present */}
                    {activeSketch.imageUrl && (
                      <image
                        href={activeSketch.imageUrl}
                        x="0"
                        y="0"
                        width="100%"
                        height="100%"
                        preserveAspectRatio="none"
                        opacity={bgOpacity}
                        className="transition-opacity duration-200 pointer-events-none"
                      />
                    )}

                    {/* Render active lines (Walls/Structures/Obstacles) */}
                    {activeSketch.customLines.map((line, idx) => (
                      <line
                        key={idx}
                        x1={`${line.x1}%`}
                        y1={`${line.y1}%`}
                        x2={`${line.x2}%`}
                        y2={`${line.y2}%`}
                        className="stroke-cyan-500/60 stroke-[3.5] stroke-linecap-round"
                        strokeDasharray={activeSketch.blueprintType === "excavation" ? "4,4" : undefined}
                      />
                    ))}

                    {/* Rendering temporary drawing line preview */}
                    {drawingMode === "draw_wall" && tempLineStart && hoverCoords && (
                      <line
                        x1={`${tempLineStart.x}%`}
                        y1={`${tempLineStart.y}%`}
                        x2={`${hoverCoords.x}%`}
                        y2={`${hoverCoords.y}%`}
                        className="stroke-amber-400 stroke-[2] stroke-dash-array animate-pulse"
                        strokeDasharray="4,4"
                      />
                    )}

                    {/* RENDERING RADAR FOV LIGHT CONES FOR PIN AND CAMERAS */}
                    {activeSketch.markers.map((marker) => {
                      const isSelected = selectedMarkerId === marker.id;
                      
                      // Compute coordinates for SVGs arc wedge path starting point
                      const radAngle = (marker.angle * Math.PI) / 180;
                      const halfFovRad = ((marker.viewCone / 2) * Math.PI) / 180;
                      
                      // Cone length in drawing coordinate space percentage raw representation (default 22)
                      const coneLen = marker.range ?? 22; 
                      
                      // Target coordinates for FOV visual sweep sector arcs
                      const startX = marker.x + coneLen * Math.cos(radAngle - halfFovRad);
                      const startY = marker.y + coneLen * Math.sin(radAngle - halfFovRad);
                      const endX = marker.x + coneLen * Math.cos(radAngle + halfFovRad);
                      const endY = marker.y + coneLen * Math.sin(radAngle + halfFovRad);

                      // Middle range arcs coordinates at 50% & 75%
                      const m50 = coneLen * 0.5;
                      const m50X1 = marker.x + m50 * Math.cos(radAngle - halfFovRad);
                      const m50Y1 = marker.y + m50 * Math.sin(radAngle - halfFovRad);
                      const m50X2 = marker.x + m50 * Math.cos(radAngle + halfFovRad);
                      const m50Y2 = marker.y + m50 * Math.sin(radAngle + halfFovRad);

                      const m75 = coneLen * 0.75;
                      const m75X1 = marker.x + m75 * Math.cos(radAngle - halfFovRad);
                      const m75Y1 = marker.y + m75 * Math.sin(radAngle - halfFovRad);
                      const m75X2 = marker.x + m75 * Math.cos(radAngle + halfFovRad);
                      const m75Y2 = marker.y + m75 * Math.sin(radAngle + halfFovRad);

                      return (
                        <g key={marker.id} className="pointer-events-none">
                          {/* Full potential 360-degree reach circular orbit helper for selected node */}
                          {isSelected && (
                            <>
                              {/* Maximum envelope range circle */}
                              <circle
                                cx={`${marker.x}%`}
                                cy={`${marker.y}%`}
                                r={`${coneLen}%`}
                                className="fill-cyan-500/[0.015] stroke-cyan-500/20 stroke-[1] stroke-dasharray-[3,4]"
                                strokeDasharray="3,4"
                              />
                              {/* Standard inner threshold marker ring */}
                              <circle
                                cx={`${marker.x}%`}
                                cy={`${marker.y}%`}
                                r={`${coneLen * 0.5}%`}
                                className="fill-none stroke-cyan-500/10 stroke-[0.75] stroke-dasharray-[2,4]"
                                strokeDasharray="2,4"
                              />
                            </>
                          )}

                          {/* Radial sector path for FOV lighting */}
                          <path
                            d={`M ${marker.x}% ${marker.y}% L ${startX}% ${startY}% A ${coneLen}% ${coneLen}% 0 0 1 ${endX}% ${endY}% Z`}
                            className={`fill-cyan-500/10 stroke-cyan-400/25 stroke-[1.5] transition-all duration-150 ${
                              isSelected ? "fill-cyan-400/20 stroke-cyan-300/65 stroke-[2] animate-pulse" : ""
                            }`}
                          />

                          {/* Concentric distance sector arcs for depth-of-field zoning (only active pin) */}
                          {isSelected && (
                            <>
                              {/* 50% Distance Zone Arc */}
                              <path
                                d={`M ${m50X1}% ${m50Y1}% A ${m50}% ${m50}% 0 0 1 ${m50X2}% ${m50Y2}%`}
                                className="fill-none stroke-cyan-400/50 stroke-[1.25] stroke-dasharray-[1,2]"
                                strokeDasharray="1,2"
                              />
                              {/* 75% Distance Zone Arc */}
                              <path
                                d={`M ${m75X1}% ${m75Y1}% A ${m75}% ${m75}% 0 0 1 ${m75X2}% ${m75Y2}%`}
                                className="fill-none stroke-cyan-400/35 stroke-[1] stroke-dasharray-[1,2]"
                                strokeDasharray="1,2"
                              />
                            </>
                          )}

                          {/* Compass centerline needle pointer arrow for direction orient */}
                          <line
                            x1={`${marker.x}%`}
                            y1={`${marker.y}%`}
                            x2={`${marker.x + coneLen * 0.7 * Math.cos(radAngle)}%`}
                            y2={`${marker.y + coneLen * 0.7 * Math.sin(radAngle)}%`}
                            className="stroke-white/35 stroke-[1] stroke-dasharray-[1,2]"
                          />
                        </g>
                      );
                    })}

                    {/* DRAGGABLE CAMERA NODES */}
                    {activeSketch.markers.map((marker) => {
                      const isSelected = selectedMarkerId === marker.id;
                      return (
                        <g
                          key={marker.id}
                          className="cursor-pointer pointer-events-auto select-none group"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedMarkerId(marker.id);
                          }}
                          onMouseDown={(e) => {
                            if (currentRole === "PROJECT_MANAGER") {
                              e.stopPropagation();
                              e.preventDefault();
                              setIsDraggingNode(marker.id);
                              setSelectedMarkerId(marker.id);
                            }
                          }}
                        >
                          {/* Drag circle background area */}
                          <circle
                            cx={`${marker.x}%`}
                            cy={`${marker.y}%`}
                            r="14"
                            className={`fill-slate-950 stroke-[2] transition duration-200 ${
                              isSelected 
                                ? "stroke-cyan-400 fill-cyan-950/90 shadow-md ring-4 ring-cyan-500/20" 
                                : "stroke-white/20 fill-slate-900 group-hover:stroke-cyan-500/40"
                            }`}
                          />
                          
                          {/* High-fidelity rotating CCTV camera visual icon */}
                          <svg
                            x={`${marker.x}%`}
                            y={`${marker.y}%`}
                            width="32"
                            height="32"
                            viewBox="0 0 32 32"
                            className="overflow-visible"
                            style={{
                              transform: `translate(-16px, -16px) rotate(${marker.angle}deg)`,
                              transformOrigin: '16px 16px',
                              transition: 'transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1)',
                            }}
                          >
                            {/* Antenna pointing backward */}
                            <line 
                              x1="12" 
                              y1="11" 
                              x2="6" 
                              y2="5" 
                              stroke={isSelected ? "#22d3ee" : "#64748b"} 
                              strokeWidth="1.25" 
                              strokeLinecap="round"
                            />
                            <circle 
                              cx="6" 
                              cy="5" 
                              r="1" 
                              fill={isSelected ? "#22d3ee" : "#64748b"} 
                            />

                            {/* Mounting Base Socket */}
                            <circle 
                              cx="13" 
                              cy="16" 
                              r="2" 
                              fill={isSelected ? "#083344" : "#1e293b"} 
                              stroke={isSelected ? "#22d3ee" : "#475569"} 
                              strokeWidth="1" 
                            />
                            {/* Mounting bracket arm */}
                            <path 
                              d="M 13,16 h 4 v -3" 
                              stroke={isSelected ? "#22d3ee" : "#94a3b8"} 
                              strokeWidth="1.5" 
                              strokeLinecap="round" 
                              strokeLinejoin="round" 
                              fill="none"
                            />

                            {/* CCTV Bullet Body / Housing Shell */}
                            <path
                              d="M 11,9 h 10 l 1.5,-1 v 6.5 l -1.5,-1 h -10 Q 9.5,11.5 11,9 Z"
                              fill="#0f172a"
                              stroke={isSelected ? "#22d3ee" : "#94a3b8"}
                              strokeWidth="1.25"
                              strokeLinejoin="round"
                            />

                            {/* Bullet Camera Top Sun/Rain Visor Plate Shield */}
                            <path 
                              d="M 10,8 h 13" 
                              stroke={isSelected ? "#67e8f9" : "#cbd5e1"} 
                              strokeWidth="1.25" 
                              strokeLinecap="round"
                            />

                            {/* Dark Tinted Front Glass Shield Panel */}
                            <path 
                              d="M 21,8 L 22.5,8 v 6.5 L 21,14.5 Z" 
                              fill="#020617" 
                            />

                            {/* Real-time Blinking Red Recording LED status dot */}
                            <circle 
                              cx="15" 
                              cy="11.5" 
                              r="1" 
                              className="fill-red-500 animate-[pulse_1.2s_infinite]" 
                            />

                            {/* Camera Focal Lens Glare dot */}
                            <circle 
                              cx="21.5" 
                              cy="11.25" 
                              r="0.75" 
                              fill="#ffffff" 
                              opacity="0.8"
                            />
                          </svg>

                          {/* Float visual name pin above camera node */}
                          <text
                            x={`${marker.x}%`}
                            y={`${marker.y - 5.5}%`}
                            className={`font-sans text-[7.5px] uppercase font-bold tracking-wider text-center flex justify-center text-anchor-middle ${
                              isSelected ? "fill-cyan-300 font-extrabold" : "fill-slate-400"
                            }`}
                            textAnchor="middle"
                          >
                            {marker.label.slice(0, 10)}..
                          </text>

                          {/* Float camera opening width below camera node */}
                          <text
                            x={`${marker.x}%`}
                            y={`${marker.y + 6.5}%`}
                            className={`font-mono text-[7px] font-bold text-center flex justify-center text-anchor-middle ${
                              isSelected ? "fill-cyan-400 font-extrabold" : "fill-slate-500 font-medium"
                            }`}
                            textAnchor="middle"
                          >
                            Bukaan: {marker.viewCone}°
                          </text>
                        </g>
                      );
                    })}
                  </svg>

                  {/* Hint Guide Overlay footer inside canvas screen */}
                  <div className="absolute bottom-3 right-3 left-3 bg-slate-950/80 px-3 py-2 rounded-xl text-[10px] font-sans text-slate-400 border border-white/5 backdrop-blur-md pointer-events-none">
                    <strong>Pemberitahuan Sistem:</strong> {currentRole === "PROJECT_MANAGER" ? "Tahan & klik di penanda kamera untuk memodifikasi arah panduan di sisi kanan." : "Klik pada simpul kamera bulat di atas untuk melihat detail deskripsi panduan sudut penyetoran."}
                  </div>
                </div>
              </div>

              {/* DETAILS AND CONFIGURATION ADJUSTOR FOR CHOSEN POINT */}
              <div className="w-full md:w-[280px] shrink-0 bg-slate-950/40 border border-white/5 rounded-xl p-4 flex flex-col justify-between">
                
                {selectedMarker ? (
                  <div className="space-y-4 animate-fade-in text-left">
                    <div className="flex justify-between items-center border-b border-white/5 pb-2.5">
                      <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-1.5 text-left">
                        <Camera className="w-4 h-4 text-cyan-400" />
                        Detail Acuan Lensa
                      </h4>
                      {currentRole === "PROJECT_MANAGER" && (
                        <button
                          onClick={() => handleDeleteMarker(selectedMarker.id)}
                          className="p-1.5 bg-slate-900 hover:bg-red-950/30 text-slate-400 hover:text-red-400 border border-white/5 rounded-lg transition"
                          title="Hapus pin kamera"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <div className="space-y-3.5">
                      <div>
                        <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest mb-1">
                          Nama / Label Titik Ambil *
                        </label>
                        <input
                          type="text"
                          value={selectedMarker.label}
                          disabled={currentRole === "SITE_MANAGER"}
                          onChange={(e) => handleMarkerSettingsChange(selectedMarker.id, { label: e.target.value })}
                          className="w-full bg-slate-950 border border-white/10 rounded-lg p-2 text-xs text-white disabled:opacity-60 focus:outline-none"
                        />
                      </div>

                      {/* ROTATION ANGLE ADJUSTMENT */}
                      <div>
                        <div className="flex justify-between items-center text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest mb-1">
                          <span>Sudut Bidik (Putar)</span>
                          <span className="text-cyan-400 font-extrabold">{selectedMarker.angle}°</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <input
                            type="range"
                            min="0"
                            max="359"
                            disabled={currentRole === "SITE_MANAGER"}
                            value={selectedMarker.angle}
                            onChange={(e) => handleMarkerSettingsChange(selectedMarker.id, { angle: parseInt(e.target.value) })}
                            className="flex-1 accent-cyan-400 cursor-pointer disabled:opacity-40"
                          />
                          <button
                            type="button"
                            disabled={currentRole === "SITE_MANAGER"}
                            onClick={() => handleMarkerSettingsChange(selectedMarker.id, { angle: (selectedMarker.angle + 45) % 360 })}
                            className="p-1 px-2 bg-slate-900 hover:bg-slate-800 border border-white/10 rounded text-xs text-slate-300 transition shrink-0 cursor-pointer disabled:opacity-40"
                            title="Putar 45"
                          >
                            <RotateCw className="w-3 h-3 text-current" />
                          </button>
                        </div>
                      </div>

                      {/* VIEW CONE WIDTH SLIDER */}
                      <div>
                        <div className="flex justify-between items-center text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest mb-1">
                          <span>Lebar Bukaan Kamera (FOV)</span>
                          <span className="text-cyan-400 font-extrabold">{selectedMarker.viewCone}°</span>
                        </div>
                        <input
                          type="range"
                          min="30"
                          max="120"
                          disabled={currentRole === "SITE_MANAGER"}
                          value={selectedMarker.viewCone}
                          onChange={(e) => handleMarkerSettingsChange(selectedMarker.id, { viewCone: parseInt(e.target.value) })}
                          className="w-full accent-cyan-400 cursor-pointer disabled:opacity-40"
                        />
                      </div>

                      {/* CAMERA COVERAGE REACH RADIUS SLIDER */}
                      <div>
                        <div className="flex justify-between items-center text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest mb-1">
                          <span>Radius Jangkauan Kamera</span>
                          <span className="text-cyan-400 font-extrabold">{selectedMarker.range ?? 22}% / {Math.round((selectedMarker.range ?? 22) * 1.5)}m</span>
                        </div>
                        <input
                          type="range"
                          min="10"
                          max="65"
                          disabled={currentRole === "SITE_MANAGER"}
                          value={selectedMarker.range ?? 22}
                          onChange={(e) => handleMarkerSettingsChange(selectedMarker.id, { range: parseInt(e.target.value) })}
                          className="w-full accent-cyan-400 cursor-pointer disabled:opacity-40"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest mb-1">
                          SOP / Petunjuk Pengambilan Foto PM *
                        </label>
                        <textarea
                          rows={4}
                          value={selectedMarker.targetDesc}
                          disabled={currentRole === "SITE_MANAGER"}
                          onChange={(e) => handleMarkerSettingsChange(selectedMarker.id, { targetDesc: e.target.value })}
                          placeholder="Terangkan panduan sudut hadap, jarak berdiri, maupun aspek krusial yang ditargetkan..."
                          className="w-full bg-slate-950 border border-white/10 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-500/20 disabled:text-slate-300 leading-normal"
                        />
                      </div>
                    </div>

                    <div className="bg-slate-950 border border-white/5 p-3 rounded-lg flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />
                      <span className="text-[10px] text-slate-400 font-sans leading-relaxed">
                        Data koordinat: {selectedMarker.x}% X / {selectedMarker.y}% Y
                      </span>
                    </div>

                    {/* Direct left-click positioning teleport button */}
                    {currentRole === "PROJECT_MANAGER" && (
                      <div className="pt-1.5">
                        <button
                          type="button"
                          onClick={() => setIsRelocatingSelected(!isRelocatingSelected)}
                          className={`w-full py-2 px-3 rounded-xl border text-[11px] font-sans font-bold flex items-center justify-center gap-2 transition duration-200 cursor-pointer ${
                            isRelocatingSelected 
                              ? "bg-amber-500 border-amber-500 text-slate-950 shadow-md shadow-amber-500/20" 
                              : "bg-slate-900 border-white/10 text-slate-200 hover:bg-slate-800"
                          }`}
                          title="Klik tombol ini lalu tekan lokasi baru pada map untuk menepatkan instan koordinat kamera."
                        >
                          <Move className="w-3.5 h-3.5 h-3.5" />
                          {isRelocatingSelected ? "Batal Tempatkan" : "Klik Canvas untuk Atur Posisi"}
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-4 text-left">
                      <div className="flex items-center gap-2 pb-2 h-7 border-b border-white/5">
                        <Image className="w-4 h-4 text-cyan-400" />
                        <h4 className="text-[11px] font-mono font-bold text-white uppercase tracking-wider">
                          Gambar Acuan Lensa
                        </h4>
                      </div>

                      <div className="space-y-3.5">
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                          Sisipkan sketsa, foto drone, atau denah rintangan pilar di belakang kamera untuk mempermudah SM mendaratkan foto acuan.
                        </p>

                        {/* File upload trigger */}
                        {currentRole === "PROJECT_MANAGER" ? (
                          <div className="relative group border border-dashed border-white/15 bg-slate-950/60 p-3 rounded-xl text-center hover:border-cyan-500/40 transition">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                const reader = new FileReader();
                                reader.onload = (event) => {
                                  if (event.target?.result) {
                                    handleUpdateActiveSketch(sched => ({
                                      ...sched,
                                      imageUrl: event.target!.result as string
                                    }));
                                  }
                                };
                                reader.readAsDataURL(file);
                              }}
                              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-15"
                            />
                            <Upload className="w-5 h-5 text-slate-500 mx-auto mb-1 group-hover:text-cyan-400 transition" />
                            <span className="block text-[10px] text-white font-sans font-bold">
                              Pilih Gambar Blueprint / Foto
                            </span>
                            <span className="block text-[8px] text-slate-500 mt-0.5">
                              Format Gambar Bebas (Maks 10MB)
                            </span>
                          </div>
                        ) : (
                          <div className="p-3 bg-slate-950/40 border border-white/5 rounded-xl text-center">
                            <span className="text-[10px] text-slate-500 block">
                              Blueprint Latar dikunci PM
                            </span>
                          </div>
                        )}

                        {/* Adjust transparency details */}
                        {activeSketch.imageUrl && (
                          <div className="p-2.5 bg-slate-950 border border-white/5 rounded-xl space-y-2">
                            <div className="flex justify-between items-center text-[10px] font-mono text-cyan-400">
                              <span className="font-bold uppercase tracking-wider">Latar Saat Ini</span>
                              {currentRole === "PROJECT_MANAGER" && (
                                <button
                                  type="button"
                                  onClick={() => handleUpdateActiveSketch(sched => ({ ...sched, imageUrl: undefined }))}
                                  className="text-amber-500 hover:text-red-400 font-bold hover:underline transition"
                                >
                                  Hapus Latar
                                </button>
                              )}
                            </div>
                            
                            <div className="space-y-1">
                              <div className="flex justify-between text-[9px] font-mono text-slate-400">
                                <span>Transparansi Gambar</span>
                                <span className="text-white">{Math.round(bgOpacity * 100)}%</span>
                              </div>
                              <input
                                type="range"
                                min="10"
                                max="100"
                                value={Math.round(bgOpacity * 100)}
                                onChange={(e) => setBgOpacity(parseFloat(e.target.value) / 100)}
                                className="w-full accent-cyan-400 cursor-pointer"
                              />
                            </div>
                          </div>
                        )}

                      </div>
                    </div>

                    <div className="bg-slate-950/60 border border-white/5 p-3 rounded-xl text-center space-y-1">
                      <h4 className="text-[10px] font-sans font-bold text-slate-300">Pilih Node Kamera</h4>
                      <p className="text-[9px] text-slate-500 leading-normal">
                        Tekan pin kamera bulat di kanvas peta samping untuk membuka konfigurasi target, kompas, maupun deskripsi rincian hadap SOP.
                      </p>
                    </div>
                  </div>
                )}

                <div className="border-t border-white/5 pt-3 mt-4 text-[10px] text-slate-500 font-mono flex items-center justify-between text-left">
                  <span>Drafting Koordinat</span>
                  <span className="text-emerald-400 font-bold font-sans">CONSTRUX AUTO-SAVE</span>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-500 py-16">
              <Map className="w-12 h-12 text-slate-700 mb-2" />
              <h4 className="font-display font-bold text-slate-300 text-sm">Pilih Denah Proyek Terdaftar</h4>
              <p className="text-xs text-slate-400 max-w-sm mt-1">
                Silakan pilih sketsa acuan kamera dari panel navigasi sebelah kiri, atau buat denah blueprint baru jika Anda memiliki akses Project Manager.
              </p>
            </div>
          )}

        </div>
      </div>

    </div>
  );
}
