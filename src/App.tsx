import { useState, useEffect } from "react";
import { 
  INITIAL_AREAS, 
  INITIAL_RECORDS, 
  INITIAL_REQUESTS 
} from "./initialData";
import { ProjectArea, DocumentationRecord, DocumentationRequest, UserRole, Project } from "./types";
import { 
  Camera, 
  Shield, 
  User, 
  ClipboardList, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Plus, 
  Eye, 
  Calendar, 
  MapPin, 
  SlidersHorizontal, 
  AlertTriangle, 
  Check, 
  ArrowRight,
  Info,
  Layers,
  Sparkles,
  Inbox,
  HardHat,
  Grid,
  List,
  Compass,
  Menu,
  Trash2
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import MetricCard from "./components/MetricCard";
import UploadForm from "./components/UploadForm";
import RequestModal from "./components/RequestModal";
import StorageManager from "./components/StorageManager";
import ProjectSelector from "./components/ProjectSelector";
import CameraSketcher from "./components/CameraSketcher";

export default function App() {
  // Multi-Project state initialized from localStorage with initial default templates
  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem("construx_projects");
    if (saved) return JSON.parse(saved);
    return [
      {
        id: "project-1",
        name: "Apartemen Pakubuwono Signature",
        code: "AP-PKB-26",
        location: "Kebayoran Baru, Jakarta Selatan",
        managerName: "Subianto (PM)",
        siteManagerName: "Bambang Pamungkas (SM)",
        createdAt: "2026-05-01T00:00:00Z"
      },
      {
        id: "project-2",
        name: "Jalur Layang LRT Kelapa Gading - Manggarai",
        code: "LRT-KG-2B",
        location: "Kelapa Gading - Sunter, Jakarta Utara",
        managerName: "Hermawan (PM)",
        siteManagerName: "Hendro Wijaya (SM)",
        createdAt: "2026-05-10T00:00:00Z"
      }
    ];
  });

  const [activeProjectId, setActiveProjectId] = useState<string>(() => {
    const saved = localStorage.getItem("construx_active_project_id");
    return saved || "project-1";
  });

  // Photo listing layout view mode state
  const [viewMode, setViewMode] = useState<"grid" | "list">(() => {
    const saved = localStorage.getItem("construx_view_mode");
    return (saved as "grid" | "list") || "grid";
  });

  // Persistent state initialized from localStorage with initial default data values
  const [areas, setAreas] = useState<ProjectArea[]>(() => {
    const saved = localStorage.getItem("construx_areas");
    if (saved) return JSON.parse(saved);
    // Assigning default project ID to initial areas for backward compatibility
    return INITIAL_AREAS.map(a => ({ ...a, projectId: "project-1" }));
  });

  const [records, setRecords] = useState<DocumentationRecord[]>(() => {
    const saved = localStorage.getItem("construx_records");
    if (saved) return JSON.parse(saved);
    // Assigning default project ID to initial records for backward compatibility
    return INITIAL_RECORDS.map(r => ({ ...r, projectId: "project-1" }));
  });

  const [requests, setRequests] = useState<DocumentationRequest[]>(() => {
    const saved = localStorage.getItem("construx_requests");
    if (saved) return JSON.parse(saved);
    // Assigning default project ID to initial requests for backward compatibility
    return INITIAL_REQUESTS.map(req => ({ ...req, projectId: "project-1" }));
  });

  // Current active role toggle: SITE_MANAGER or PROJECT_MANAGER (default PROJECT_MANAGER to display verification process first)
  const [currentRole, setCurrentRole] = useState<UserRole>(() => {
    const saved = localStorage.getItem("construx_role");
    return (saved as UserRole) || "PROJECT_MANAGER";
  });

  // Category filter for the Area Explorer
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>("Semua");

  // Selection state for image zoom light-box
  const [selectedRecordForPreview, setSelectedRecordForPreview] = useState<DocumentationRecord | null>(null);

  // Modal open states
  const [isRequestModalOpen, setIsRequestModalOpen] = useState<boolean>(false);
  const [isUploadFormOpen, setIsUploadFormOpen] = useState<boolean>(false);
  const [preSelectedReqIdForUpload, setPreSelectedReqIdForUpload] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"monitoring" | "sketcher">("monitoring");
  const [isDetailsOpen, setIsDetailsOpen] = useState<boolean>(false);

  // PM rejection temporary comment box index
  const [feedbackInput, setFeedbackInput] = useState<{ [recordId: string]: string }>({});

  const activeProject = projects.find(p => p.id === activeProjectId) || projects[0];
  const activePMName = activeProject?.managerName || "Subianto (PM)";
  const activeSMName = activeProject?.siteManagerName || (activeProject?.id === "project-2" ? "Hendro Wijaya (SM)" : "Bambang Pamungkas (SM)");

  // Sync state variables with localStorage on every change
  useEffect(() => {
    localStorage.setItem("construx_projects", JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem("construx_active_project_id", activeProjectId);
  }, [activeProjectId]);

  useEffect(() => {
    localStorage.setItem("construx_view_mode", viewMode);
  }, [viewMode]);

  useEffect(() => {
    localStorage.setItem("construx_areas", JSON.stringify(areas));
  }, [areas]);

  useEffect(() => {
    localStorage.setItem("construx_records", JSON.stringify(records));
  }, [records]);

  useEffect(() => {
    localStorage.setItem("construx_requests", JSON.stringify(requests));
  }, [requests]);

  // Automated Daily Recurring engine
  useEffect(() => {
    if (requests.length === 0) return;

    const recurringTemplates = requests.filter(r => r.isRecurring);
    if (recurringTemplates.length === 0) return;

    // Get today's calendar date in local timezone YYYY-MM-DD
    const localNow = new Date();
    const offset = localNow.getTimezoneOffset();
    const localDate = new Date(localNow.getTime() - (offset * 60 * 1000));
    const nowStr = localDate.toISOString().split("T")[0]; 

    let hasAddedAny = false;
    const newRequests = [...requests];

    recurringTemplates.forEach(template => {
      // Find all requests matching this template's area and description
      const related = requests.filter(
        r => r.requestedArea === template.requestedArea && r.description === template.description
      );
      
      // Find latest sorted by requestedAt date/time
      const sorted = [...related].sort(
        (a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime()
      );
      
      const latest = sorted[0];
      if (latest) {
        const latestDate = new Date(latest.requestedAt);
        const latestLocalDate = new Date(latestDate.getTime() - (offset * 60 * 1000));
        const latestDayStr = latestLocalDate.toISOString().split("T")[0];
        
        // If the latest one's day is in the past compared to today (e.g. earlier calendar date)
        if (latestDayStr < nowStr) {
          // Check if today's request already exists so we don't double-create it
          const alreadyExistsForToday = related.some(r => {
            const rDate = new Date(r.requestedAt);
            const rLocalDate = new Date(rDate.getTime() - (offset * 60 * 1000));
            return rLocalDate.toISOString().split("T")[0] === nowStr;
          });

          if (!alreadyExistsForToday) {
            // Set deadline to tomorrow
            const targetDeadlineDate = new Date();
            targetDeadlineDate.setDate(targetDeadlineDate.getDate() + 1);
            const deadlineStr = targetDeadlineDate.toISOString().split("T")[0];

            const autoRequest: DocumentationRequest = {
              id: `req-auto-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
              projectId: template.projectId,
              requestedArea: template.requestedArea,
              description: template.description,
              priority: template.priority,
              deadline: deadlineStr,
              status: "pending",
              requestedBy: "Sistem Automasi",
              requestedAt: new Date().toISOString(),
              isRecurring: true
            };

            newRequests.unshift(autoRequest);
            hasAddedAny = true;
          }
        }
      }
    });

    if (hasAddedAny) {
      setRequests(newRequests);
    }
  }, [requests]);

  useEffect(() => {
    localStorage.setItem("construx_role", currentRole);
  }, [currentRole]);

  // Actions handlers
  const handleAddNewArea = (name: string, description: string, category: ProjectArea["category"]): ProjectArea => {
    const newArea: ProjectArea = {
      id: `area-${Date.now()}`,
      projectId: activeProjectId,
      name,
      description,
      category,
      createdAt: new Date().toISOString()
    };
    setAreas(prev => [newArea, ...prev]);
    return newArea;
  };

  const handleAddNewRecord = (recordData: Omit<DocumentationRecord, "id" | "submittedBy" | "submittedAt" | "status">) => {
    const newRecord: DocumentationRecord = {
      ...recordData,
      id: `rec-${Date.now()}`,
      projectId: activeProjectId,
      submittedBy: currentRole === "SITE_MANAGER" ? activeSMName : activePMName,
      submittedAt: new Date().toISOString(),
      status: "pending_approval"
    };

    setRecords(prev => [newRecord, ...prev]);

    // Update associated request to completed status (if linked)
    if (recordData.requestId) {
      setRequests(prev => prev.map(req => {
        if (req.id === recordData.requestId) {
          return {
            ...req,
            status: "completed",
            completedAt: new Date().toISOString(),
            completedRecordId: newRecord.id
          };
        }
        return req;
      }));
    }

    setIsUploadFormOpen(false);
    setPreSelectedReqIdForUpload("");
  };

  const handleAddNewRequest = (
    requestedArea: string, 
    description: string, 
    priority: DocumentationRequest["priority"], 
    deadline: string,
    isRecurring?: boolean
  ) => {
    const newRequest: DocumentationRequest = {
      id: `req-${Date.now()}`,
      projectId: activeProjectId,
      requestedArea,
      description,
      priority,
      deadline,
      status: "pending",
      requestedBy: activePMName,
      requestedAt: new Date().toISOString(),
      isRecurring
    };

    setRequests(prev => [newRequest, ...prev]);
  };

  // Approval Processors
  const handleApproveRecord = (recordId: string) => {
    setRecords(prev => prev.map(rec => {
      if (rec.id === recordId) {
        return { ...rec, status: "approved", feedback: undefined };
      }
      return rec;
    }));
  };

  const handleRejectRecord = (recordId: string) => {
    const reason = feedbackInput[recordId]?.trim();
    if (!reason) {
      alert("Harap tuliskan alasan penolakan atau catatan instruksi perbaikan.");
      return;
    }

    setRecords(prev => prev.map(rec => {
      if (rec.id === recordId) {
        return { 
          ...rec, 
          status: "rejected", 
          feedback: `Revisi: ${reason}` 
        };
      }
      return rec;
    }));

    // If this record was linked to a request, mark the request back to pending so SM can re-upload!
    const targetRecord = records.find(r => r.id === recordId);
    if (targetRecord && targetRecord.requestId) {
      setRequests(prev => prev.map(req => {
        if (req.id === targetRecord.requestId) {
          return {
            ...req,
            status: "pending",
            completedAt: undefined,
            completedRecordId: undefined
          };
        }
        return req;
      }));
    }

    // Clean feedback temp inputs
    setFeedbackInput(prev => {
      const copy = { ...prev };
      delete copy[recordId];
      return copy;
    });
  };

  const handleDeleteRecord = (recordId: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus foto laporan lapangan ini secara permanen?")) {
      return;
    }

    const targetRecord = records.find(r => r.id === recordId);
    
    // Remove the record
    setRecords(prev => prev.filter(r => r.id !== recordId));

    // If this record was linked to a request, revert request back to "pending"
    if (targetRecord && targetRecord.requestId) {
      setRequests(prev => prev.map(req => {
        if (req.id === targetRecord.requestId) {
          return {
            ...req,
            status: "pending",
            completedAt: undefined,
            completedRecordId: undefined
          };
        }
        return req;
      }));
    }
  };

  // Create Project
  const handleCreateProject = (name: string, code: string, location: string, managerName: string, siteManagerName: string) => {
    const newProj: Project = {
      id: `project-${Date.now()}`,
      name,
      code,
      location,
      managerName,
      siteManagerName,
      createdAt: new Date().toISOString()
    };
    setProjects(prev => [...prev, newProj]);
    setActiveProjectId(newProj.id);
  };

  // Update Project Info (Edit)
  const handleUpdateProject = (id: string, name: string, code: string, location: string, managerName: string, siteManagerName: string) => {
    setProjects(prev => prev.map(p => {
      if (p.id === id) {
        return {
          ...p,
          name,
          code,
          location,
          managerName,
          siteManagerName
        };
      }
      return p;
    }));
  };

  const handleImportData = (
    importedAreas: ProjectArea[], 
    importedRecords: DocumentationRecord[], 
    importedRequests: DocumentationRequest[]
  ) => {
    setAreas(importedAreas);
    setRecords(importedRecords);
    setRequests(importedRequests);
  };

  const handleClearAllStorage = () => {
    localStorage.removeItem("construx_areas");
    localStorage.removeItem("construx_records");
    localStorage.removeItem("construx_requests");
    localStorage.removeItem("construx_projects");
    localStorage.removeItem("construx_active_project_id");
    setAreas([]);
    setRecords([]);
    setRequests([]);
    setProjects([
      {
        id: "project-1",
        name: "Apartemen Pakubuwono Signature",
        code: "AP-PKB-26",
        location: "Kebayoran Baru, Jakarta Selatan",
        managerName: "Subianto (PM)",
        siteManagerName: "Bambang Pamungkas (SM)",
        createdAt: "2026-05-01T00:00:00Z"
      }
    ]);
    setActiveProjectId("project-1");
  };

  // Filtered data partition strictly based on currently selected active project
  const filteredAreas = areas.filter(a => (a.projectId || "project-1") === activeProjectId);

  const filteredRecords = records.filter(r => {
    const parentArea = areas.find(a => a.id === r.areaId);
    const parentProjId = parentArea ? (parentArea.projectId || "project-1") : "project-1";
    return r.projectId === activeProjectId || parentProjId === activeProjectId;
  });

  const filteredRequests = requests.filter(req => (req.projectId || "project-1") === activeProjectId);

  // Metrics extraction based on active project partitions
  const totalAreasCount = filteredAreas.length;
  const pendingApprovalsCount = filteredRecords.filter(r => r.status === "pending_approval").length;
  const pendingRequestsCount = filteredRequests.filter(r => r.status === "pending").length;
  const approvedPhotosCount = filteredRecords.filter(r => r.status === "approved").length;

  return (
    <div className="min-h-screen text-slate-100 font-sans selection:bg-emerald-500/30 selection:text-emerald-300" id="main-layout-root">
      
      {/* PROFESSIONAL UPPER STATUS STRIP */}
      <div className="bg-slate-950/85 text-slate-400 py-2 px-6 flex justify-between items-center text-[11px] font-mono tracking-widest border-b border-white/5 backdrop-blur-md" id="system-status-bar">
        <span className="flex items-center gap-1.5 font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse glow-text-emerald" />
          SYSTEM ONLINE // CAMERA STREAM MODULE CAPTURE
        </span>
        <span className="text-slate-600 font-bold uppercase">CONSTRUX MONITOR</span>
      </div>

      {/* CORE HERO NAVBAR */}
      <header className="bg-slate-950/75 border-b border-white/5 sticky top-0 z-40 backdrop-blur-xl shadow-xl shadow-black/20" id="client-nav-header">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Logo Brand with Auto-hide Hamburger Trigger */}
          <div className="flex items-center gap-3 animate-fade-in">
            <button
              onClick={() => setIsDetailsOpen(true)}
              className="p-2 bg-slate-900 hover:bg-slate-800 border border-white/10 hover:border-cyan-500/25 text-cyan-400 hover:text-cyan-300 rounded-lg transition-all cursor-pointer shadow-sm relative active:scale-95 flex items-center justify-center"
              id="btn-project-hamburger"
              title="Buka Menu Navigasi & Proyek"
            >
              <Menu className="w-4 h-4 shadow-sm" />
            </button>
            <div className="p-2.5 bg-gradient-to-br from-slate-900 to-slate-950 border border-white/10 text-white rounded-xl shadow-md rotate-[-1deg]" id="app-brand-logo">
              <Layers className="w-5 h-5 text-emerald-400 animate-pulse" />
            </div>
            <div>
              <h1 className="font-display font-black text-xs sm:text-sm md:text-base text-white tracking-tight flex items-center gap-1.5" id="app-brand-title">
                CONSTRUX <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/15">PRO</span>
                <span className="text-slate-600 font-normal text-xs hidden sm:inline shrink-0">•</span>
                <span className="text-slate-300 font-sans font-extrabold text-xs truncate max-w-[140px] sm:max-w-[280px] md:max-w-[380px] hidden sm:inline" title={`${activeProject?.name}`}>
                  [{activeProject?.code}] {activeProject?.name}
                </span>
              </h1>
              <p className="text-[10px] font-semibold text-slate-400 tracking-wider font-mono">
                Sistem Monitoring & Dokumentasi Area Lapangan Proyek
              </p>
            </div>
          </div>

          {/* ACTIVE ROLE SWITCHER PANEL */}
          <div className="bg-slate-900/65 p-1 rounded-2xl border border-white/5 flex gap-2 w-full md:w-auto" id="role-switcher-panel">
            {/* PM Button */}
            <button
              onClick={() => {
                setCurrentRole("PROJECT_MANAGER");
                setIsUploadFormOpen(false);
              }}
              className={`flex-1 md:flex-none px-4 py-2 rounded-xl text-xs font-sans font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                currentRole === "PROJECT_MANAGER"
                  ? "bg-cyan-500/10 text-cyan-400 shadow-md border border-cyan-500/25 font-extrabold border-glow-cyan"
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.02]"
              }`}
              id="role-switch-pm"
            >
              <Shield className={`w-3.5 h-3.5 ${currentRole === "PROJECT_MANAGER" ? "text-cyan-400" : ""}`} />
              Project Manager
            </button>

            {/* SM Button */}
            <button
              onClick={() => {
                setCurrentRole("SITE_MANAGER");
              }}
              className={`flex-1 md:flex-none px-4 py-2 rounded-xl text-xs font-sans font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                currentRole === "SITE_MANAGER"
                  ? "bg-emerald-500/15 text-emerald-400 shadow-md border border-emerald-500/25 font-extrabold border-glow-emerald"
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.02]"
              }`}
              id="role-switch-sm"
            >
              <HardHat className="w-3.5 h-3.5" />
              Site Manager
            </button>
          </div>

        </div>
      </header>

      {/* PRIMARY CONSTRUX SYSTEM CONTAINER */}
      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8" id="core-system-workspace">

        {/* CURRENT ROLE NOTIFIER ANCHOR */}
        <div className="bg-slate-950/45 border border-white/5 rounded-xl p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md backdrop-blur-md animate-fade-in" id="user-onboarding-panel">
          <div className="flex items-center gap-3 text-center sm:text-left">
            <div className={`p-2.5 rounded-xl shrink-0 ${currentRole === "PROJECT_MANAGER" ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/15" : "bg-emerald-500/10 text-emerald-400 border-emerald-500/15"}`}>
              {currentRole === "PROJECT_MANAGER" ? <Shield className="w-4 h-4" /> : <Camera className="w-4 h-4" />}
            </div>
            <div className="text-left">
              <div className="flex items-center gap-2">
                <span className="text-slate-400 font-sans text-[10px] font-semibold uppercase tracking-wider">Akses Pengguna</span>
                <span className={`text-[9px] uppercase font-mono font-extrabold px-1.5 py-0.5 rounded border ${currentRole === "PROJECT_MANAGER" ? "bg-cyan-500/10 text-cyan-300 border-cyan-500/20" : "bg-emerald-500/10 text-emerald-300 border-emerald-500/20"}`}>
                  {currentRole === "PROJECT_MANAGER" ? "Project Manager" : "Site Manager"}
                </span>
              </div>
              <h2 className="font-display font-bold text-white text-xs mt-0.5" id="role-title-heading">
                {currentRole === "PROJECT_MANAGER" 
                  ? `${activePMName}` 
                  : `${activeSMName}`}
              </h2>
            </div>
          </div>

          <div className="flex gap-2 w-full sm:w-auto shrink-0 justify-end">
            {currentRole === "PROJECT_MANAGER" ? (
              <button
                onClick={() => setIsRequestModalOpen(true)}
                className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-lg text-xs font-bold tracking-wider uppercase transition active:scale-95 cursor-pointer shadow"
                id="btn-release-new-request"
              >
                + Request Baru
              </button>
            ) : (
              !isUploadFormOpen && (
                <button
                  onClick={() => {
                    setPreSelectedReqIdForUpload("");
                    setIsUploadFormOpen(true);
                  }}
                  className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-lg text-xs font-bold tracking-wider uppercase transition active:scale-95 cursor-pointer shadow"
                  id="btn-open-upload-panel"
                >
                  <Camera className="w-4 h-4 inline mr-1" />
                  Kirim Foto
                </button>
              )
            )}
          </div>
        </div>

        {/* TABS SWITCH NAVIGATION */}
        <div className="flex bg-slate-950 p-1 rounded-xl border border-white/5 w-full sm:w-fit" id="main-navigation-tabs">
          <button
            onClick={() => setActiveTab("monitoring")}
            className={`px-5 py-2 rounded-lg text-xs font-sans font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === "monitoring"
                ? "bg-slate-800 text-cyan-400 border border-white/5 shadow-md animate-fade-in"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Monitoring & Verifikasi Laporan
          </button>
          <button
            onClick={() => setActiveTab("sketcher")}
            className={`px-5 py-2 rounded-lg text-xs font-sans font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === "sketcher"
                ? "bg-slate-800 text-cyan-400 border border-white/5 shadow-md animate-fade-in"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            Sketsa Peta Acuan Lensa
          </button>
        </div>

        {/* INTEGRATED PROJECT EXPLORATION SELECTOR HUB */}
        <ProjectSelector
          projects={projects}
          activeProjectId={activeProjectId}
          onSelectProject={setActiveProjectId}
          onCreateProject={handleCreateProject}
          onUpdateProject={handleUpdateProject}
          areas={areas}
          records={records}
          requests={requests}
          isDetailsOpen={isDetailsOpen}
          setIsDetailsOpen={setIsDetailsOpen}
          currentRole={currentRole}
          activePMName={activePMName}
          activeSMName={activeSMName}
          onTriggerRequest={() => setIsRequestModalOpen(true)}
          onTriggerUpload={() => setIsUploadFormOpen(true)}
        />

        {activeTab === "monitoring" ? (
          <>
            {/* METRICS RETIRED FROM MAIN VIEWPORT AND INCLUDED DIRECTLY INTO DEEPER REPORT ENGINE */}

        {/* TRANSITIONING CONTAINER FOR CAMERA UPLOAD FORM */}
        <AnimatePresence mode="wait">
          {isUploadFormOpen && currentRole === "SITE_MANAGER" && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.25 }}
              key="uploader-module"
              id="animate-uploader"
            >
              <UploadForm
                areas={filteredAreas}
                requests={filteredRequests}
                onAddArea={handleAddNewArea}
                onAddRecord={handleAddNewRecord}
                preSelectedRequestId={preSelectedReqIdForUpload}
                onCancel={() => {
                  setIsUploadFormOpen(false);
                  setPreSelectedReqIdForUpload("");
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* WORKSPACE MIDDLE BODY PANELS BY ROLE */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="role-specific-workspace">
          
          {/* ======================================= */}
          {/* ====== 1. PROJECT MANAGER ACTIVE WORKFLOW ====== */}
          {/* ======================================= */}
          {currentRole === "PROJECT_MANAGER" && (
            <div className="lg:col-span-12 space-y-6" id="pm-workspace-area">
              
              {/* PRIMARY ROW: APPROVAL QUEUE PANEL */}
              <div className="bg-slate-900/40 border border-white/8 rounded-2xl shadow-xl overflow-hidden backdrop-blur-md" id="pm-approval-queue-card">
                <div className="px-6 py-4.5 border-b border-white/5 flex items-center justify-between bg-slate-950/40">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse glow-text-cyan" />
                    <h3 className="font-display font-bold text-white text-sm tracking-wide">
                      Antrean Review & Persetujuan Dokumen ({pendingApprovalsCount})
                    </h3>
                  </div>
                  <span className="text-[11px] font-mono font-bold text-cyan-400 bg-cyan-950/40 border border-cyan-500/20 px-3 py-1 rounded-lg">
                    TINDAKAN DIPERLUKAN
                  </span>
                </div>

                {filteredRecords.filter(r => r.status === "pending_approval").length === 0 ? (
                  /* Clear/Approved State */
                  <div className="p-10 text-center flex flex-col items-center justify-center text-slate-400" id="empty-approvals-box">
                    <CheckCircle2 className="w-12 h-12 text-emerald-400/90 mb-3.5 glow-text-emerald" />
                    <h4 className="font-display font-bold text-slate-200 text-sm tracking-wide">Tidak Ada Antrean Review</h4>
                    <p className="text-xs text-slate-400 max-w-sm mt-1.5 leading-normal">
                      Semua foto dokumentasi lapangan terbaru yang disetorkan oleh Site Manager telah disetujui dan diverifikasi mutunya.
                    </p>
                  </div>
                ) : (
                  /* Pending approvals slider grid */
                  <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6" id="pending-items-sub-grid">
                    {filteredRecords
                      .filter(r => r.status === "pending_approval")
                      .map(rec => {
                        const relatedReq = rec.requestId ? filteredRequests.find(rq => rq.id === rec.requestId) : null;
                        return (
                          <div 
                            key={rec.id} 
                            className="border border-white/5 rounded-xl overflow-hidden flex flex-col bg-slate-950/20 hover:border-white/10 transition shadow-inner"
                            id={`pending-card-${rec.id}`}
                          >
                            {/* Frame Photo Preview overlay */}
                            <div className="relative aspect-video bg-slate-950 group overflow-hidden border-b border-white/5">
                              <img 
                                src={rec.photoUrl} 
                                alt={rec.areaName} 
                                className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                                referrerPolicy="no-referrer"
                              />
                              <button
                                onClick={() => setSelectedRecordForPreview(rec)}
                                className="absolute bottom-3 right-3 bg-slate-950/80 text-white p-2 hover:bg-slate-900 rounded-lg text-xs font-sans font-semibold flex items-center gap-1 transition-all border border-white/5 cursor-pointer"
                                title="Klik zoom gambar"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                Perbesar
                              </button>
                              <div className="absolute top-3 left-3 bg-slate-950/90 text-slate-300 px-2.5 py-1 rounded text-[10px] font-mono tracking-wide border border-white/5">
                                ID: {rec.id}
                              </div>
                            </div>

                            {/* Info container */}
                            <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                              <div className="space-y-2.5">
                                <div className="flex items-start gap-1.5">
                                  <MapPin className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
                                  <span className="font-display font-bold text-white text-sm">
                                    {rec.areaName}
                                  </span>
                                </div>
                                <p className="text-xs text-slate-300 font-sans leading-relaxed">
                                  {rec.description}
                                </p>
                                
                                {relatedReq && (
                                  <div className="bg-cyan-950/40 text-cyan-300 border border-cyan-500/10 p-2.5 rounded-lg text-[11px] font-sans">
                                    <strong className="text-cyan-400 font-semibold">Respon PM Request</strong>: "{relatedReq.description}"
                                  </div>
                                )}

                                <div className="pt-2.5 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                                  <span>Penyedia: {rec.submittedBy}</span>
                                  <span>Setor: {new Date(rec.submittedAt).toLocaleDateString("id-ID")}</span>
                                </div>
                              </div>

                              {/* Controls Actions Form */}
                              <div className="space-y-2.5 pt-3 border-t border-white/5 bg-slate-950/40 p-3 rounded-lg">
                                <label className="block text-[10px] font-sans font-bold text-slate-400 uppercase tracking-wider mb-1" htmlFor={`reject-feedback-${rec.id}`}>
                                  Catatan Umpan Balik (Wajib Jika Menolak)
                                </label>
                                <input
                                  id={`reject-feedback-${rec.id}`}
                                  type="text"
                                  placeholder="Contoh: Lampu kurang terang / bekisting beton blur, mohon ambil ulang."
                                  value={feedbackInput[rec.id] || ""}
                                  onChange={(e) => setFeedbackInput(prev => ({ ...prev, [rec.id]: e.target.value }))}
                                  className="w-full bg-slate-950 border border-white/5 text-xs text-white placeholder-slate-500 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-cyan-500 font-sans"
                                />

                                <div className="grid grid-cols-2 gap-2">
                                  <button
                                    onClick={() => handleRejectRecord(rec.id)}
                                    className="py-2 px-3 border border-red-500/20 text-red-400 hover:bg-red-500/10 text-xs font-bold rounded-lg transition-all cursor-pointer"
                                  >
                                    Tolak (Minta Revisi)
                                  </button>
                                  <button
                                    onClick={() => handleApproveRecord(rec.id)}
                                    className="py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-all shadow shadow-emerald-950/20 cursor-pointer"
                                  >
                                    Setujui Foto
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>

              {/* SECONDARY ROW: PM ACTIVE REQUESTS TRACKER */}
              <div className="bg-slate-900/40 border border-white/8 rounded-2xl shadow-xl overflow-hidden backdrop-blur-md" id="pm-requests-tracker">
                <div className="px-6 py-4.5 border-b border-white/5 flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-slate-950/40">
                  <div>
                    <h3 className="font-display font-bold text-white text-sm tracking-wide">
                      Status Permintaan Dokumentasi Proyek Aktif ({filteredRequests.length})
                    </h3>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => setIsRequestModalOpen(true)}
                      className="px-3.5 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-xs font-bold font-display rounded-lg flex items-center gap-1.5 cursor-pointer shadow-md"
                    >
                      <Plus className="w-3.5 h-3.5" /> Request Baru
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto" id="requests-scoller-box">
                  <table className="w-full text-left font-sans text-xs" id="requests-dashboard-table">
                    <thead>
                      <tr className="bg-slate-950/25 border-b border-white/5 text-slate-400 font-bold uppercase tracking-widest text-[10px]">
                        <th className="py-3 px-6">Area Terkait</th>
                        <th className="py-3 px-6">Catatan Instruksi PM</th>
                        <th className="py-3 px-6">Prioritas</th>
                        <th className="py-3 px-6">Batas Waktu</th>
                        <th className="py-3 px-6">Status Progres</th>
                        <th className="py-3 px-6">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {filteredRequests.map(req => (
                        <tr key={req.id} className="hover:bg-white/[0.015]" id={`tr-request-${req.id}`}>
                          <td className="py-4 px-6 font-bold text-white">
                            <div className="flex flex-col gap-1 items-start">
                              <span className="font-bold text-slate-100">{req.requestedArea}</span>
                              {req.isRecurring && (
                                <span className="inline-flex items-center gap-1 text-[8.5px] font-mono uppercase bg-cyan-950 text-cyan-400 px-1.5 py-0.5 rounded border border-cyan-500/20 font-extrabold shadow-sm">
                                  🔄 Berulang Harian
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-6 text-slate-300 max-w-sm truncate" title={req.description}>
                            {req.description}
                          </td>
                          <td className="py-4 px-6">
                            <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold font-mono uppercase border ${
                              req.priority === "high" 
                                ? "bg-red-500/10 text-red-400 border-red-500/20" 
                                : req.priority === "medium" 
                                ? "bg-blue-500/10 text-cyan-400 border-blue-500/20"
                                : "bg-slate-800 text-slate-300 border-white/5"
                            }`}>
                              {req.priority}
                            </span>
                          </td>
                          <td className="py-4 px-6 font-mono text-slate-400">
                            {new Date(req.deadline).toLocaleDateString("id-ID")}
                          </td>
                          <td className="py-4 px-6">
                            {req.status === "completed" ? (
                              <span className="inline-flex items-center gap-1 text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full font-semibold border border-emerald-500/20">
                                <Check className="w-3 h-3" /> Disetor
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full font-semibold border border-amber-500/20">
                                <Clock className="w-3 h-3 animate-spin" /> Pending SM
                              </span>
                            )}
                          </td>
                          <td className="py-4 px-6">
                            {req.status === "completed" && req.completedRecordId ? (
                              <button
                                onClick={() => {
                                  const linkedRec = records.find(r => r.id === req.completedRecordId);
                                  if (linkedRec) setSelectedRecordForPreview(linkedRec);
                                }}
                                className="text-slate-200 hover:text-white border border-white/10 hover:border-white/20 bg-slate-900/60 px-3 py-1 rounded transition-all cursor-pointer text-xs"
                              >
                                Lihat Foto
                              </button>
                            ) : (
                              <span className="text-slate-400 font-sans font-medium text-[11px]">Menunggu Unggahan</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* ======================================= */}
          {/* ====== 2. SITE MANAGER ACTIVE WORKFLOW ====== */}
          {/* ======================================= */}
          {currentRole === "SITE_MANAGER" && (
            <div className="lg:col-span-12 space-y-6" id="sm-workspace-area">
              
              {/* PRIMARY ROW: REQUEST BOARD (Urgent alerts to submit photos) */}
              <div className="bg-slate-900/40 border border-white/8 rounded-2xl shadow-xl overflow-hidden backdrop-blur-md" id="sm-active-request-wall">
                <div className="px-6 py-4.5 border-b border-white/5 flex items-center justify-between bg-slate-950/40">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-pulse glow-text-cyan" />
                    <h3 className="font-display font-bold text-white text-sm tracking-wide">
                      Daftar Permintaan Dokumentasi PM Terbuka ({filteredRequests.filter(r => r.status === "pending").length})
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 py-1.5 px-3 rounded-lg tracking-wider">
                    BUTUH RESPOND KAMERA
                  </span>
                </div>

                {filteredRequests.filter(r => r.status === "pending").length === 0 ? (
                  <div className="p-10 text-center flex flex-col items-center justify-center text-slate-400">
                    <CheckCircle2 className="w-10 h-10 text-emerald-400 mb-2.5 glow-text-emerald" />
                    <h4 className="font-display font-bold text-slate-200 text-sm tracking-wide">Tidak Ada Tagihan Request</h4>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm">
                      Seluruh target request dari PM telah tersaji lengkap. Anda tetap bisa mengirimkan foto area lapor tambahan sekehendak hati.
                    </p>
                  </div>
                ) : (
                  <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4" id="sm-pending-requests-card-grid">
                    {filteredRequests
                      .filter(r => r.status === "pending")
                      .map(req => (
                        <div 
                          key={req.id} 
                          className="border border-white/5 rounded-xl p-4.5 flex flex-col justify-between gap-4 bg-slate-950/20 hover:bg-slate-950/40 hover:border-emerald-500/20 transition-all duration-300"
                          id={`sm-rq-card-${req.id}`}
                        >
                          <div className="space-y-2.5">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-display font-bold text-slate-100 flex items-center gap-1.5">
                                <MapPin className="w-4 h-4 text-emerald-400" /> {req.requestedArea}
                              </span>
                              <span className={`px-2 py-0.5 rounded text-[9.5px] font-bold font-mono uppercase tracking-wider border ${
                                req.priority === "high" ? "bg-red-500/15 text-red-400 border-red-500/20" : "bg-blue-500/10 text-cyan-400 border-blue-500/20"
                              }`}>
                                {req.priority}
                              </span>
                            </div>
                            <p className="text-xs text-slate-300 font-sans leading-relaxed">
                              {req.description}
                            </p>
                            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono">
                              <Calendar className="w-3.5 h-3.5" />
                              <span>Batas Waktu: {new Date(req.deadline).toLocaleDateString("id-ID")}</span>
                            </div>
                          </div>

                          <button
                            onClick={() => {
                              setPreSelectedReqIdForUpload(req.id);
                              setIsUploadFormOpen(true);
                              // Smooth scroll to upload form container anchor
                              setTimeout(() => {
                                document.getElementById("sm-upload-form-container")?.scrollIntoView({ behavior: "smooth" });
                              }, 150);
                            }}
                            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold font-display tracking-wider uppercase transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-950/40 cursor-pointer border border-emerald-500/20"
                          >
                            <Camera className="w-3.5 h-3.5 animate-pulse" />
                            Ambil Gambar / Respon Request ini
                          </button>
                        </div>
                      ))}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* SECONDARY ROW: SHARED HISTORIC SUBMISSIONS FEED/GALLERY FOR BOTH ROLES */}
          <div className="lg:col-span-12 space-y-6" id="shared-submissions-history">
            <div className="bg-slate-900/40 border border-white/8 rounded-2xl shadow-xl overflow-hidden backdrop-blur-md" id="sm-submissions-history">
              <div className="px-6 py-4.5 border-b border-white/5 flex items-center justify-between bg-slate-950/40">
                <h3 className="font-display font-bold text-white text-sm tracking-wide flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  {currentRole === "SITE_MANAGER" ? "Riwayat Laporan Foto Lapangan Anda" : "Database Arsip/Riwayat Seluruh Foto Lapangan"} ({filteredRecords.length})
                </h3>
                <span className="text-[10px] text-slate-400 font-mono">Menampilkan {filteredRecords.length} item</span>
              </div>

              {filteredRecords.length === 0 ? (
                <div className="p-12 text-center text-slate-500 font-sans text-xs">
                  Belum ada laporan foto lapangan yang diunggah untuk proyek ini.
                </div>
              ) : (
                <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" id="sm-submissions-grid">
                  {filteredRecords.map(rec => (
                    <div 
                      key={rec.id} 
                      className="border border-white/5 hover:border-slate-700 rounded-xl overflow-hidden flex flex-col justify-between bg-slate-950/15 hover:bg-slate-950/30 transition shadow-sm hover:shadow"
                      id={`sm-history-card-${rec.id}`}
                    >
                      <div className="relative aspect-video bg-slate-950 border-b border-white/5 mx-auto w-full">
                        <img 
                          src={rec.photoUrl} 
                          alt={rec.areaName} 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute top-2.5 right-2.5">
                          {rec.status === "approved" ? (
                            <span className="bg-slate-900/90 text-emerald-400 border border-emerald-500/25 px-2.5 py-1 rounded text-[9px] font-bold font-mono uppercase tracking-wider flex items-center gap-1">
                              ✔ Disetujui
                            </span>
                          ) : rec.status === "rejected" ? (
                            <span className="bg-slate-900/95 text-red-400 border border-red-500/25 px-2.5 py-1 rounded text-[9px] font-bold font-mono uppercase tracking-wider flex items-center gap-1 animate-pulse">
                              ✘ Ditolak
                            </span>
                          ) : (
                            <span className="bg-slate-900/90 text-amber-400 border border-amber-500/25 px-2.5 py-1 rounded text-[9px] font-bold font-mono uppercase tracking-wider flex items-center gap-1">
                              ◷ Review PM
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                        <div className="space-y-2">
                          <h4 className="font-display font-bold text-xs text-white line-clamp-1">{rec.areaName}</h4>
                          <p className="text-[11px] text-slate-300 line-clamp-3 leading-relaxed font-sans">{rec.description}</p>
                          
                          {rec.feedback && (
                            <div className="border border-red-500/20 bg-red-950/30 p-2.5 rounded-lg text-[10px] font-semibold text-red-200 leading-normal font-sans">
                              <strong className="text-red-400 font-bold">Instruksi Perbaikan</strong>: {rec.feedback}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-3 border-t border-white/5 mt-2">
                          <span>Setor: {new Date(rec.submittedAt).toLocaleDateString("id-ID")}</span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleDeleteRecord(rec.id)}
                              className="text-red-400 hover:text-red-300 flex items-center gap-1 cursor-pointer transition py-0.5 px-2 hover:bg-red-500/10 rounded font-sans font-bold active:scale-95 text-[10px] border border-red-500/15"
                              title="Hapus foto laporan ini secara permanen"
                            >
                              <Trash2 className="w-3 h-3 text-red-400" />
                              Hapus
                            </button>
                            <button
                              onClick={() => setSelectedRecordForPreview(rec)}
                              className="text-cyan-400 hover:text-cyan-300 hover:underline cursor-pointer active:scale-95 transition"
                            >
                              Detail Frame
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>




          </>
        ) : (
          <div className="animate-fade-in" id="sketcher-page-container">
            <CameraSketcher
              projectId={activeProjectId}
              areas={filteredAreas}
              currentRole={currentRole}
            />
          </div>
        )}

      </main>



      {/* ======================================================= */}
      {/* ============ OVERLAY MODAL 1: CREATE REQUEST ============ */}
      {/* ======================================================= */}
      {isRequestModalOpen && (
        <RequestModal
          areas={filteredAreas}
          onAddRequest={(requestedArea, description, priority, deadline, isRecurring) => {
            handleAddNewRequest(requestedArea, description, priority, deadline, isRecurring);
            setIsRequestModalOpen(false);
          }}
          onClose={() => setIsRequestModalOpen(false)}
        />
      )}

      {/* ======================================================= */}
      {/* ============ OVERLAY MODAL 2: ZOOM LIGHTBOX ============ */}
      {/* ======================================================= */}
      {selectedRecordForPreview && (
        <div 
          className="fixed inset-0 bg-slate-950/90 z-50 flex flex-col items-center justify-center p-4 backdrop-blur-md animate-fade-in"
          onClick={() => setSelectedRecordForPreview(null)}
          id="image-zoom-overlay"
        >
          <div 
            className="w-full max-w-3xl bg-slate-900/95 border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col backdrop-blur-xl"
            onClick={(e) => e.stopPropagation()} // Stop bubbling close clicks
            id="image-zoom-card"
          >
            {/* Header top bar */}
            <div className="px-5 py-4 border-b border-white/5 flex justify-between items-center bg-slate-950">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-400 animate-pulse animate-duration-3000" />
                <h3 className="font-display font-bold text-white text-sm">
                  {selectedRecordForPreview.areaName}
                </h3>
              </div>
              <button
                onClick={() => setSelectedRecordForPreview(null)}
                className="text-slate-400 hover:text-white transition bg-slate-900 hover:bg-slate-800 p-1.5 rounded-full cursor-pointer text-xs"
              >
                ✖
              </button>
            </div>

            {/* Picture wrapper frame */}
            <div className="relative aspect-video flex items-center justify-center bg-slate-950">
              <img
                src={selectedRecordForPreview.photoUrl}
                alt={selectedRecordForPreview.areaName}
                className="max-h-[70vh] object-contain w-full"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Meta panel description */}
            <div className="p-6 bg-slate-950/90 border-t border-white/5 space-y-4">
              <div className="space-y-1">
                <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest block">Deskripsi Detail Capaian</span>
                <p className="text-xs text-slate-300 font-sans leading-relaxed">
                  {selectedRecordForPreview.description}
                </p>
              </div>

              {selectedRecordForPreview.feedback && (
                <div className="border border-red-500/20 bg-red-950/40 p-3 rounded-lg text-xs font-semibold text-red-200">
                  ⚠️ Status Penolakan PM / Revisi: {selectedRecordForPreview.feedback}
                </div>
              )}

              <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                <div>
                  <span className="block">Pengirim: {selectedRecordForPreview.submittedBy}</span>
                  <span className="block mt-0.5">Tanggal Setor: {new Date(selectedRecordForPreview.submittedAt).toLocaleString("id-ID")}</span>
                </div>
                <div>
                  <span className={`px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider ${
                    selectedRecordForPreview.status === "approved" 
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                      : selectedRecordForPreview.status === "rejected"
                      ? "bg-red-500/10 text-red-400 border border-red-500/20"
                      : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                  }`}>
                    {selectedRecordForPreview.status === "approved" ? "DISETUJUI PM" : selectedRecordForPreview.status === "rejected" ? "REVISI TINDAK" : "PENDING REVIEW"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );

  // Helper utility function to choose area manually from direct timeline trigger
  function setSelectedAreaIdInUploader(areaId: string) {
    if (fileInputRefExistsAndSupportsPreselect(areaId)) {
      // Stub callback to trigger initial preload selector state
    }
  }

  function fileInputRefExistsAndSupportsPreselect(areaId: string) {
    // Dynamically update preselected area in uploader state if open
    return true;
  }
}
