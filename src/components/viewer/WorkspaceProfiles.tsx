import { useState, useEffect } from "react";
import { useViewerStore } from "@/lib/viewerStore";
import { Save, Trash2, Download, Upload } from "lucide-react";

interface WorkspaceProfile {
  name: string;
  timestamp: number;
  data: {
    xrayEnabled: boolean;
    xrayOpacity: number;
    animationType: string;
    animationSpeed: number;
    layerPreset: string;
    proPreset: string;
    realisticMode: boolean;
    hiddenMeshes: string[];
    favoriteMeshes: string[];
  };
}

const STORAGE_KEY = "o3d_workspace_profiles";

function loadProfiles(): WorkspaceProfile[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch { return []; }
}

function saveProfiles(profiles: WorkspaceProfile[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
}

export default function WorkspaceProfiles() {
  const lang = useViewerStore((s) => s.lang);
  const store = useViewerStore();
  const [profiles, setProfiles] = useState<WorkspaceProfile[]>([]);
  const [newName, setNewName] = useState("");
  const isRtl = lang === "he";

  useEffect(() => { setProfiles(loadProfiles()); }, []);

  const btn = "px-3 py-2 text-xs bg-secondary border border-border rounded-lg hover:bg-accent transition-colors font-medium";

  const captureState = (): WorkspaceProfile["data"] => ({
    xrayEnabled: store.xrayEnabled,
    xrayOpacity: store.xrayOpacity,
    animationType: store.animationType,
    animationSpeed: store.animationSpeed,
    layerPreset: store.layerPreset,
    proPreset: store.proPreset,
    realisticMode: store.realisticMode,
    hiddenMeshes: store.meshes.filter((m) => !m.visible).map((m) => m.name),
    favoriteMeshes: store.meshes.filter((m) => m.favorite).map((m) => m.name),
  });

  const handleSave = () => {
    const name = newName.trim() || `Profile ${profiles.length + 1}`;
    const profile: WorkspaceProfile = { name, timestamp: Date.now(), data: captureState() };
    const updated = [...profiles, profile];
    setProfiles(updated);
    saveProfiles(updated);
    setNewName("");
  };

  const handleLoad = (profile: WorkspaceProfile) => {
    const d = profile.data;
    if (d.xrayEnabled !== store.xrayEnabled) store.toggleXray();
    store.setXrayOpacity(d.xrayOpacity);
    store.setAnimationType(d.animationType as any);
    store.setAnimationSpeed(d.animationSpeed);
    store.setLayerPreset(d.layerPreset as any);
    store.setProPreset(d.proPreset as any);
    if (d.realisticMode !== store.realisticMode) store.toggleRealisticMode();
    store.meshes.forEach((m) => {
      const shouldHide = d.hiddenMeshes.includes(m.name);
      if (m.visible === shouldHide) store.toggleMesh(m.name);
    });
    store.meshes.forEach((m) => {
      const shouldFav = d.favoriteMeshes.includes(m.name);
      if (!!m.favorite !== shouldFav) store.toggleFavorite(m.name);
    });
  };

  const handleDelete = (idx: number) => {
    const updated = profiles.filter((_, i) => i !== idx);
    setProfiles(updated);
    saveProfiles(updated);
  };

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(profiles, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "workspace-profiles.json"; a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement("input");
    input.type = "file"; input.accept = ".json";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        const imported = JSON.parse(text) as WorkspaceProfile[];
        const updated = [...profiles, ...imported];
        setProfiles(updated);
        saveProfiles(updated);
      } catch {}
    };
    input.click();
  };

  return (
    <div className="flex flex-col gap-3.5">
      {/* Save new */}
      <div className="flex gap-2">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder={isRtl ? "שם פרופיל..." : "Profile name..."}
          className="flex-1 bg-secondary border border-border rounded-lg px-3 py-2 text-xs font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
        />
        <button onClick={handleSave} className={`${btn} flex items-center gap-1.5`}>
          <Save className="w-4 h-4" /> {isRtl ? "שמור" : "Save"}
        </button>
      </div>

      {/* Profiles list */}
      {profiles.length > 0 ? (
        <div className="flex flex-col gap-1.5 max-h-40 overflow-y-auto scrollbar-gold">
          {profiles.map((p, i) => (
            <div key={i} className="flex items-center gap-2 bg-secondary/50 rounded-lg px-3 py-2 group">
              <button onClick={() => handleLoad(p)} className="flex-1 text-right text-xs font-medium text-foreground hover:text-primary transition-colors truncate">
                {p.name}
              </button>
              <span className="text-[10px] text-muted-foreground shrink-0">
                {new Date(p.timestamp).toLocaleDateString()}
              </span>
              <button onClick={() => handleDelete(i)} className="p-1 rounded-lg hover:bg-destructive/20 opacity-0 group-hover:opacity-100 transition-opacity">
                <Trash2 className="w-3.5 h-3.5 text-destructive" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-xs text-muted-foreground text-center py-3 bg-secondary/30 rounded-lg">
          {isRtl ? "אין פרופילים שמורים" : "No saved profiles"}
        </div>
      )}

      {/* Import/Export */}
      <div className="flex gap-2">
        <button onClick={handleExport} className={`${btn} flex items-center gap-1.5`}>
          <Download className="w-4 h-4" /> {isRtl ? "ייצוא" : "Export"}
        </button>
        <button onClick={handleImport} className={`${btn} flex items-center gap-1.5`}>
          <Upload className="w-4 h-4" /> {isRtl ? "ייבוא" : "Import"}
        </button>
      </div>
    </div>
  );
}
