import { useState } from "react";
import { Globe, Settings, Pin } from "lucide-react";
import { useViewerStore } from "@/lib/viewerStore";
import { MODELS, type ModelEntry } from "@/lib/models";
import SceneCanvas from "@/components/viewer/SceneCanvas";
import StructurePanel from "@/components/viewer/StructurePanel";
import XRayPanel from "@/components/viewer/XRayPanel";
import InfoBar from "@/components/viewer/InfoBar";

export default function ViewerPage() {
  const [currentModel, setCurrentModel] = useState<ModelEntry>(MODELS[0]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const lang = useViewerStore((s) => s.lang);
  const toggleLang = useViewerStore((s) => s.toggleLang);
  const loading = useViewerStore((s) => s.loading);

  return (
    <div className="flex flex-col h-screen bg-background text-foreground overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-card shrink-0">
        <h1 className="text-sm font-semibold tracking-tight">
          Open3DModel Viewer
        </h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {}}
            className="p-1.5 rounded hover:bg-accent transition-colors"
            title="Pin model position"
          >
            <Pin className="w-4 h-4 text-muted-foreground" />
          </button>
          <button
            onClick={() => {}}
            className="p-1.5 rounded hover:bg-accent transition-colors"
            title="Settings"
          >
            <Settings className="w-4 h-4 text-muted-foreground" />
          </button>
          <button
            onClick={toggleLang}
            className="p-1.5 rounded hover:bg-accent transition-colors"
            title="Switch language"
          >
            <Globe className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </header>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* 3D Viewer */}
        <div className="flex-1 relative">
          {loading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/80">
              <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin" />
                <span className="text-sm text-muted-foreground">
                  {lang === "he" ? "טוען מודל..." : "Loading model..."}
                </span>
              </div>
            </div>
          )}
          <SceneCanvas model={currentModel} />
        </div>

        {/* Sidebar */}
        {sidebarOpen && (
          <aside className="w-72 border-r border-border bg-card flex flex-col overflow-hidden shrink-0" dir={lang === "he" ? "rtl" : "ltr"}>
            <div className="p-3 border-b border-border">
              <h2 className="text-xs font-semibold mb-2">
                {lang === "he" ? "בחר מודל" : "Choose Model"}
              </h2>
              <select
                value={currentModel.key}
                onChange={(e) => {
                  const m = MODELS.find((m) => m.key === e.target.value);
                  if (m) setCurrentModel(m);
                }}
                className="w-full bg-secondary border border-border rounded px-2 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              >
                {MODELS.map((m) => (
                  <option key={m.key} value={m.key}>
                    {lang === "he" ? m.labels.he : m.labels.en}
                  </option>
                ))}
              </select>
            </div>

            <div className="p-3 border-b border-border">
              <InfoBar />
            </div>

            <div className="p-3 border-b border-border">
              <XRayPanel />
            </div>

            <div className="p-3 flex-1 overflow-hidden flex flex-col">
              <h2 className="text-xs font-semibold mb-2">
                {lang === "he" ? "שכבות" : "Structures"}
              </h2>
              <StructurePanel />
            </div>
          </aside>
        )}
      </div>

      {/* Toggle sidebar button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed bottom-4 left-4 z-20 bg-card border border-border rounded-full p-2 shadow-lg hover:bg-accent transition-colors"
        title={sidebarOpen ? "Hide sidebar" : "Show sidebar"}
      >
        <Settings className="w-4 h-4" />
      </button>
    </div>
  );
}
