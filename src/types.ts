export interface Project {
  id: string;
  name: string;
  code: string;
  location: string;
  managerName: string;
  siteManagerName?: string;
  createdAt: string;
}

export interface ProjectArea {
  id: string;
  projectId?: string; // Links back to a specific Project
  name: string;
  description: string;
  category: "Pondasi" | "Struktur" | "Fasad" | "MEP" | "Finishing" | "Lainnya";
  createdAt: string;
}

export type RecordStatus = "pending_approval" | "approved" | "rejected";

export interface DocumentationRecord {
  id: string;
  projectId?: string; // Links back to a specific Project
  areaId: string;
  areaName: string; // Cached area name
  description: string;
  photoUrl: string; // base64 or placeholder URLs
  submittedBy: string; // Name of Site Manager
  submittedAt: string;
  status: RecordStatus;
  feedback?: string; // Rejection reason if rejected
  requestId?: string; // Optional reference if this was a requested task
}

export interface DocumentationRequest {
  id: string;
  projectId?: string; // Links back to a specific Project
  requestedArea: string;
  description: string;
  priority: "low" | "medium" | "high";
  deadline: string;
  status: "pending" | "completed";
  requestedBy: string; // Project Manager name
  requestedAt: string;
  completedAt?: string;
  completedRecordId?: string;
  isRecurring?: boolean;
}

export type UserRole = "SITE_MANAGER" | "PROJECT_MANAGER";

export interface CameraMarker {
  id: string;
  label: string;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  angle: number; // 0-360
  viewCone: number; // FOV angle in degrees
  targetDesc: string;
  range?: number; // reach range of view cone (percentage 5-70)
}

export interface CameraSketch {
  id: string;
  projectId: string;
  areaId: string;
  title: string;
  blueprintType: "grid" | "building" | "bridge" | "excavation";
  markers: CameraMarker[];
  customLines: Array<{ x1: number; y1: number; x2: number; y2: number }>;
  imageUrl?: string;
  createdAt: string;
}
