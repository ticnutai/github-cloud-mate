import { useState, useCallback, useRef, useEffect } from "react";
import { Globe, Settings, Pin, PinOff, ChevronLeft, ChevronRight as ChevronRightIcon, ChevronDown, Puzzle } from "lucide-react";
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
import PartDetailsDialog from "@/components/viewer/PartDetailsDialog";
import ModelComposerDialog from "@/components/viewer/ModelComposerDialog";
import ThemeSettingsDialog from "@/components/viewer/ThemeSettingsDialog";

function Section({ title, defaultOpen = false, children }: { title: string; defaultOpen?: boolean; children: React.ReactNode }) {
  const [open, setOpen] = useState(defaultOpen);
  const lang = useViewerStore((s) => s.lang);
  const isRtl = lang === "he";
  return (
    <div className="border-b border-border">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center w-full px-3 py-2 hover:bg-accent/50 transition-colors gap-2"
        style={{ flexDirection: isRtl ? "row-reverse" : "row" }}
      >
        <span className="text-[11px] font-semibold flex-1" style={{ textAlign: isRtl ? "right" : "left" }}>{title}</span>
        {open ? <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" /> : (
          isRtl ? <ChevronLeft className="w-3.5 h-3.5 text-muted-foreground shrink-0" /> : <ChevronRightIcon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
        )}
      </button>
      {open && <div className="px-3 pb-3">{children}</div>}
    </div>
  );
}

export default function ViewerPage() {
  const [currentModel, setCurrentModel] = useState<ModelEntry>(MODELS[0]);
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [pinned, setPinned] = useState(true);
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
  const showSidebar = pinned ? sidebarVisible : (sidebarVisible && hovering);

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
      }, 400);
    }
  }, [pinned]);

  const handleMouseEnterSidebar = useCallback(() => {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    if (!pinned) setHovering(true);
  }, [pinned]);

  const handleToggleSidebar = useCallback(() => {
    setSidebarVisible((v) => !v);
    if (!sidebarVisible) setHovering(true);
  }, [sidebarVisible]);

  const handleZoomIn = useCallback(() => {}, []);
  const handleZoomOut = useCallback(() => {}, []);
  const handleResetView = useCallback(() => {}, []);
  const handleFocusSelected = useCallback(() => {}, []);
  const handleSetAngle = useCallback((_angle: "front" | "side" | "top") => {}, []);

  return (
    <div className="flex flex-col h-screen bg-background text-foreground overflow-hidden" dir={isRtl ? "rtl" : "ltr"}>
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-2 border-b border-border bg-card shrink-0">
        <h1 className="text-sm font-semibold tracking-tight">Open3DModel Viewer</h1>
        <div className="flex items-center gap-1.5">
          <button onClick={handleToggleSidebar} className="p-1.5 rounded hover:bg-accent transition-colors" title={sidebarVisible ? (isRtl ? "הסתר פאנל" : "Hide panel") : (isRtl ? "הצג פאנל" : "Show panel")}>
            {isRtl
              ? (showSidebar ? <ChevronRightIcon className="w-4 h-4 text-muted-foreground" /> : <ChevronLeft className="w-4 h-4 text-muted-foreground" />)
              : (showSidebar ? <ChevronRightIcon className="w-4 h-4 text-muted-foreground" /> : <ChevronLeft className="w-4 h-4 text-muted-foreground" />)
            }
          </button>
          <button
            onClick={() => setPinned(!pinned)}
            className={`p-1.5 rounded transition-colors ${pinned ? "bg-primary/20 text-primary" : "hover:bg-accent text-muted-foreground"}`}
            title={pinned ? (isRtl ? "ביטול נעיצה — אוטו-הסתרה" : "Unpin — auto-hide") : (isRtl ? "נעץ סיידבר" : "Pin sidebar")}
          >
            {pinned ? <Pin className="w-4 h-4" /> : <PinOff className="w-4 h-4" />}
          </button>
          <button onClick={() => setThemeSettingsOpen(true)} className="p-1.5 rounded hover:bg-accent transition-colors" title={isRtl ? "ערכת נושא" : "Theme"}>
            <Settings className="w-4 h-4 text-muted-foreground" />
          </button>
          <button onClick={toggleLang} className="p-1.5 rounded hover:bg-accent transition-colors" title={isRtl ? "שפה" : "Language"}>
            <Globe className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        {/* 3D Viewer */}
        <div className="flex-1 relative">
          {loading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/80">
              <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin" />
                <span className="text-sm text-muted-foreground">
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
            className={`absolute top-0 bottom-0 w-4 z-30 cursor-pointer flex items-center justify-center hover:bg-primary/10 transition-colors ${isRtl ? "right-0" : "left-auto right-0"}`}
            onMouseEnter={handleMouseEnterEdge}
          >
            <div className={`w-1 h-16 bg-primary/30 rounded-full`} />
          </div>
        )}

        {/* Sidebar */}
        <aside
          className={`border-border bg-card flex flex-col overflow-hidden shrink-0 transition-all duration-300 ease-in-out ${isRtl ? "border-l" : "border-r"} ${showSidebar ? "w-80 opacity-100" : "w-0 opacity-0"}`}
          style={{ borderWidth: showSidebar ? undefined : 0 }}
          onMouseEnter={handleMouseEnterSidebar}
          onMouseLeave={handleMouseLeaveSidebar}
        >
          <div className="flex-1 overflow-y-auto scrollbar-thin w-80">
            {/* Model Select */}
            <div className="px-3 py-2 border-b border-border">
              <select
                value={currentModel.key}
                onChange={(e) => {
                  const m = MODELS.find((m) => m.key === e.target.value);
                  if (m) setCurrentModel(m);
                }}
                className="w-full bg-secondary border border-border rounded px-2 py-1.5 text-[11px] text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                dir={isRtl ? "rtl" : "ltr"}
              >
                {MODELS.map((m) => (
                  <option key={m.key} value={m.key}>
                    {isRtl ? m.labels.he : m.labels.en}
                  </option>
                ))}
              </select>
              <div className="flex gap-1 mt-1.5">
                <button onClick={() => setComposerOpen(true)} className="px-2 py-1 text-[10px] bg-secondary border border-border rounded hover:bg-accent transition-colors flex items-center gap-1">
                  <Puzzle className="w-3 h-3" /> {isRtl ? "קומפוזר" : "Composer"}
                </button>
              </div>
            </div>

            {/* Info */}
            <div className="px-3 py-2 border-b border-border">
              <InfoBar />
            </div>

            <Section title={isRtl ? "תצוגת רנטגן" : "X-Ray"} defaultOpen>
              <XRayPanel />
            </Section>

            <Section title={isRtl ? "מצלמה" : "Camera Controls"} defaultOpen>
              <CameraControls
                onZoomIn={handleZoomIn}
                onZoomOut={handleZoomOut}
                onResetView={handleResetView}
                onFocusSelected={handleFocusSelected}
                onSetAngle={handleSetAngle}
              />
            </Section>

            <Section title={isRtl ? "שכבות" : "Structures"} defaultOpen>
              <StructurePanel />
            </Section>

            <Section title={isRtl ? "הדמיה מקצועית" : "Professional Tools"}>
              <ProToolsPanel />
            </Section>

            <Section title={isRtl ? "ניתוח ושכבות" : "Analysis & Layers"}>
              <AnalysisPanel />
            </Section>

            <Section title={isRtl ? "מצב לימוד" : "Study Mode"}>
              <StudyModePanel />
            </Section>

            <Section title={isRtl ? "כלים מתקדמים" : "Advanced Tools"}>
              <AdvancedToolsPanel />
            </Section>

            <Section title={isRtl ? "כיול XYZ" : "XYZ Calibration"}>
              <XYZPanel />
            </Section>
          </div>
        </aside>
      </div>

      {/* Footer */}
      <footer className="px-4 py-1.5 border-t border-border bg-card text-[10px] text-muted-foreground text-center shrink-0">
        Built with <a href="https://threejs.org/" target="_blank" rel="noopener" className="underline hover:text-foreground">three.js</a> · Models licensed under CC BY SA · <a href="https://anatomytool.org/open3dmodel" target="_blank" rel="noopener" className="underline hover:text-foreground">Open3DModel</a>
      </footer>

      {/* Dialogs */}
      {partDetailsOpen && <PartDetailsDialog onClose={() => setPartDetailsOpen(false)} />}
      {composerOpen && <ModelComposerDialog onClose={() => setComposerOpen(false)} />}
      {themeSettingsOpen && <ThemeSettingsDialog onClose={() => setThemeSettingsOpen(false)} />}
    </div>
  );
}
