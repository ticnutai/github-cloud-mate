import { useState, useCallback, useRef } from "react";
import { Globe, Settings, Pin, PinOff, ChevronLeft, ChevronRight as ChevronRightIcon, ChevronDown, Puzzle, Layers, Eye, Scan, BookOpen, Wrench, Move3D, Camera, Stethoscope, Library, GitCompare, FolderTree } from "lucide-react";
import { useViewerStore } from "@/lib/viewerStore";
import { MODELS, type ModelEntry } from "@/lib/models";
import SceneCanvas from "@/components/viewer/SceneCanvas";
import StructurePanel from "@/components/viewer/StructurePanel";
import XRayPanel from "@/components/viewer/XRayPanel";
import InfoBar from "@/components/viewer/InfoBar";
import CameraControls from "@/components/viewer/CameraControls";
import ProToolsPanel from "@/components/viewer/ProToolsPanel";
import AnalysisPanel from "@/components/viewer/AnalysisPanel";
import StudyModePanel from "@/components/viewer/StudyModePanel";
import AdvancedToolsPanel from "@/components/viewer/AdvancedToolsPanel";
import XYZPanel from "@/components/viewer/XYZPanel";
import LayerManagerPanel from "@/components/viewer/LayerManagerPanel";
import DirectLibraryPanel from "@/components/viewer/DirectLibraryPanel";
import CompareModelsPanel from "@/components/viewer/CompareModelsPanel";
import PartDetailsDialog from "@/components/viewer/PartDetailsDialog";
import ModelComposerDialog from "@/components/viewer/ModelComposerDialog";
import ThemeSettingsDialog from "@/components/viewer/ThemeSettingsDialog";
import AnimationsGalleryDialog from "@/components/viewer/AnimationsGalleryDialog";

function Section({ title, icon, defaultOpen = false, children }: { title: string; icon?: React.ReactNode; defaultOpen?: boolean; children: React.ReactNode }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-border/60">
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center w-full px-4 py-2.5 transition-all duration-200 gap-2.5 group ${open ? "bg-accent/40" : "hover:bg-accent/30"}`}
      >
        {icon && <span className="text-gold-dark shrink-0">{icon}</span>}
        <span className="text-[11px] font-semibold flex-1 text-right text-foreground">{title}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground shrink-0 transition-transform duration-200 ${open ? "" : "-rotate-90"}`} />
      </button>
      <div className={`overflow-hidden transition-all duration-200 ${open ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"}`}>
        <div className="px-4 pb-3 pt-1 animate-fade-in">{children}</div>
      </div>
    </div>
  );
}

export default function ViewerPage() {
  const [currentModel, setCurrentModel] = useState<ModelEntry>(MODELS[0]);
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [pinned, setPinned] = useState(false);
  const [hovering, setHovering] = useState(false);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lang = useViewerStore((s) => s.lang);
  const toggleLang = useViewerStore((s) => s.toggleLang);
  const loading = useViewerStore((s) => s.loading);
  const partDetailsOpen = useViewerStore((s) => s.partDetailsOpen);
  const setPartDetailsOpen = useViewerStore((s) => s.setPartDetailsOpen);
  const themeSettingsOpen = useViewerStore((s) => s.themeSettingsOpen);
  const setThemeSettingsOpen = useViewerStore((s) => s.setThemeSettingsOpen);
  const composerOpen = useViewerStore((s) => s.composerOpen);
  const setComposerOpen = useViewerStore((s) => s.setComposerOpen);

  const isRtl = lang === "he";
  const showSidebar = pinned ? sidebarVisible : (sidebarVisible && hovering) || (pinned && sidebarVisible);

  const handleMouseEnterEdge = useCallback(() => {
    if (!pinned) {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
      setHovering(true);
      setSidebarVisible(true);
    }
  }, [pinned]);

  const handleMouseLeaveSidebar = useCallback(() => {
    if (!pinned) {
      hideTimerRef.current = setTimeout(() => {
        setHovering(false);
      }, 500);
    }
  }, [pinned]);

  const handleMouseEnterSidebar = useCallback(() => {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    if (!pinned) setHovering(true);
  }, [pinned]);

  const handleToggleSidebar = useCallback(() => {
    if (pinned) {
      setSidebarVisible((v) => !v);
    } else {
      setSidebarVisible(true);
      setHovering(true);
    }
  }, [pinned]);

  const handleZoomIn = useCallback(() => {}, []);
  const handleZoomOut = useCallback(() => {}, []);
  const handleResetView = useCallback(() => {}, []);
  const handleFocusSelected = useCallback(() => {}, []);
  const handleSetAngle = useCallback((_angle: "front" | "side" | "top") => {}, []);

  return (
    <div className="flex flex-col h-screen bg-background text-foreground overflow-hidden" dir="rtl">
      {/* Header — Gold gradient border bottom */}
      <header className="flex items-center justify-between px-5 py-2.5 bg-card shrink-0 relative" style={{ borderBottom: '2px solid', borderImage: 'linear-gradient(90deg, hsl(43 80% 38%), hsl(43 74% 49%), hsl(43 60% 65%), hsl(43 74% 49%), hsl(43 80% 38%)) 1' }}>
        <div className="flex items-center gap-3">
          {/* Logo area */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">3D</span>
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tight text-foreground">Open3DModel</h1>
              <span className="text-[9px] text-muted-foreground font-medium">מציג אנטומיה תלת-ממדי</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={handleToggleSidebar} className="p-2 rounded-lg hover:bg-accent transition-colors" title={showSidebar ? "הסתר פאנל" : "הצג פאנל"}>
            {showSidebar ? <ChevronLeft className="w-4 h-4 text-foreground" /> : <ChevronRightIcon className="w-4 h-4 text-foreground" />}
          </button>
          <button
            onClick={() => setPinned(!pinned)}
            className={`p-2 rounded-lg transition-all duration-200 ${pinned ? "bg-gold/15 text-gold-dark ring-1 ring-gold/30" : "hover:bg-accent text-muted-foreground"}`}
            title={pinned ? "ביטול נעיצה — אוטו-הסתרה" : "נעץ סיידבר"}
          >
            {pinned ? <Pin className="w-4 h-4" /> : <PinOff className="w-4 h-4" />}
          </button>
          <button onClick={() => setThemeSettingsOpen(true)} className="p-2 rounded-lg hover:bg-accent transition-colors" title="ערכת נושא">
            <Settings className="w-4 h-4 text-foreground" />
          </button>
          <button onClick={toggleLang} className="p-2 rounded-lg hover:bg-accent transition-colors" title="שפה">
            <Globe className="w-4 h-4 text-foreground" />
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        {/* 3D Viewer */}
        <div className="flex-1 relative">
          {loading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/90 backdrop-blur-sm">
              <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 rounded-full border-[3px] border-gold/30 border-t-gold animate-spin" />
                <span className="text-sm text-foreground font-medium">
                  {isRtl ? "טוען מודל..." : "Loading model..."}
                </span>
              </div>
            </div>
          )}
          <SceneCanvas model={currentModel} />
        </div>

        {/* Edge hover trigger for auto-hide */}
        {!pinned && !showSidebar && (
          <div
            className="absolute top-0 bottom-0 right-0 w-5 z-30 cursor-pointer flex items-center justify-center group"
            onMouseEnter={handleMouseEnterEdge}
          >
            <div className="w-1 h-20 rounded-full bg-gold/40 group-hover:bg-gold group-hover:h-28 transition-all duration-300" />
          </div>
        )}

        {/* Sidebar */}
        <aside
          className={`bg-card flex flex-col overflow-hidden shrink-0 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] z-20 ${showSidebar ? "w-80 opacity-100" : "w-0 opacity-0"} ${!pinned && showSidebar ? "absolute top-0 bottom-0 right-0 sidebar-shadow" : ""}`}
          style={showSidebar ? { borderLeft: '2px solid', borderImage: 'linear-gradient(180deg, hsl(43 80% 38%), hsl(43 74% 49%), hsl(43 60% 65%)) 1' } : { border: 'none' }}
          onMouseEnter={handleMouseEnterSidebar}
          onMouseLeave={handleMouseLeaveSidebar}
        >
          <div className="flex-1 overflow-y-auto scrollbar-gold w-80">
            {/* Sidebar Header */}
            <div className="px-4 py-3 border-b border-border/60 bg-gradient-to-l from-accent/50 to-transparent">
              <select
                value={currentModel.key}
                onChange={(e) => {
                  const m = MODELS.find((m) => m.key === e.target.value);
                  if (m) setCurrentModel(m);
                }}
                className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-[11px] text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-gold/40 transition-shadow"
                dir="rtl"
              >
                {MODELS.map((m) => (
                  <option key={m.key} value={m.key}>
                    {isRtl ? m.labels.he : m.labels.en}
                  </option>
                ))}
              </select>
              <div className="flex gap-1.5 mt-2">
                <button onClick={() => setComposerOpen(true)} className="px-3 py-1.5 text-[10px] font-medium bg-secondary border border-border rounded-lg hover:bg-accent hover:border-gold/40 transition-all flex items-center gap-1.5">
                  <Puzzle className="w-3 h-3 text-gold-dark" /> קומפוזר
                </button>
              </div>
            </div>

            {/* Info */}
            <div className="px-4 py-2.5 border-b border-border/60">
              <InfoBar />
            </div>

            <Section title={isRtl ? "תצוגת רנטגן" : "X-Ray"} icon={<Eye className="w-3.5 h-3.5" />} defaultOpen>
              <XRayPanel />
            </Section>

            <Section title={isRtl ? "מצלמה" : "Camera Controls"} icon={<Camera className="w-3.5 h-3.5" />} defaultOpen>
              <CameraControls
                onZoomIn={handleZoomIn}
                onZoomOut={handleZoomOut}
                onResetView={handleResetView}
                onFocusSelected={handleFocusSelected}
                onSetAngle={handleSetAngle}
              />
            </Section>

            <Section title={isRtl ? "שכבות" : "Structures"} icon={<Layers className="w-3.5 h-3.5" />} defaultOpen>
              <StructurePanel />
            </Section>

            <Section title={isRtl ? "הדמיה מקצועית" : "Professional Tools"} icon={<Stethoscope className="w-3.5 h-3.5" />}>
              <ProToolsPanel />
            </Section>

            <Section title={isRtl ? "ניתוח ושכבות" : "Analysis & Layers"} icon={<Scan className="w-3.5 h-3.5" />}>
              <AnalysisPanel />
            </Section>

            <Section title={isRtl ? "מצב לימוד" : "Study Mode"} icon={<BookOpen className="w-3.5 h-3.5" />}>
              <StudyModePanel />
            </Section>

            <Section title={isRtl ? "כלים מתקדמים" : "Advanced Tools"} icon={<Wrench className="w-3.5 h-3.5" />}>
              <AdvancedToolsPanel />
            </Section>

            <Section title={isRtl ? "כיול XYZ" : "XYZ Calibration"} icon={<Move3D className="w-3.5 h-3.5" />}>
              <XYZPanel />
            </Section>
          </div>
        </aside>
      </div>

      {/* Footer — Gold top border */}
      <footer className="px-5 py-1.5 bg-card text-[10px] text-muted-foreground text-center shrink-0" style={{ borderTop: '1px solid hsl(43 50% 72%)' }}>
        Built with <a href="https://threejs.org/" target="_blank" rel="noopener" className="underline hover:text-gold-dark transition-colors">three.js</a> · Models licensed under CC BY SA · <a href="https://anatomytool.org/open3dmodel" target="_blank" rel="noopener" className="underline hover:text-gold-dark transition-colors">Open3DModel</a>
      </footer>

      {/* Dialogs */}
      {partDetailsOpen && <PartDetailsDialog onClose={() => setPartDetailsOpen(false)} />}
      {composerOpen && <ModelComposerDialog onClose={() => setComposerOpen(false)} />}
      {themeSettingsOpen && <ThemeSettingsDialog onClose={() => setThemeSettingsOpen(false)} />}
    </div>
  );
}
