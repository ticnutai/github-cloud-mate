import { useState, useCallback, useRef, useEffect } from "react";
import { Globe, Settings, Pin, PinOff, ChevronLeft, ChevronRight as ChevronRightIcon, ChevronDown, Puzzle, Layers, Eye, Scan, BookOpen, Wrench, Move3D, Camera, Stethoscope, Library, GitCompare, FolderTree, Gamepad2, Bug, Briefcase, Move, ZoomIn, ZoomOut, RotateCcw, Crosshair } from "lucide-react";
import { useViewerStore } from "@/lib/viewerStore";
import { MODELS, type ModelEntry } from "@/lib/models";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import SceneCanvas from "@/components/viewer/SceneCanvas";
import StructurePanel from "@/components/viewer/StructurePanel";
import XRayPanel from "@/components/viewer/XRayPanel";

import InfoBar from "@/components/viewer/InfoBar";
import ProToolsPanel from "@/components/viewer/ProToolsPanel";
import AnalysisPanel from "@/components/viewer/AnalysisPanel";
import StudyModePanel from "@/components/viewer/StudyModePanel";
import AdvancedToolsPanel from "@/components/viewer/AdvancedToolsPanel";
import XYZPanel from "@/components/viewer/XYZPanel";
import LayerManagerPanel from "@/components/viewer/LayerManagerPanel";
import DirectLibraryPanel from "@/components/viewer/DirectLibraryPanel";
import CompareModelsPanel from "@/components/viewer/CompareModelsPanel";
import WorkspaceProfiles from "@/components/viewer/WorkspaceProfiles";
import ModelPositionPanel from "@/components/viewer/ModelPositionPanel";
import PartDetailsDialog from "@/components/viewer/PartDetailsDialog";
import ModelComposerDialog from "@/components/viewer/ModelComposerDialog";
import ThemeSettingsDialog from "@/components/viewer/ThemeSettingsDialog";
import AnimationsGalleryDialog from "@/components/viewer/AnimationsGalleryDialog";
import FloatingXYZDialog from "@/components/viewer/FloatingXYZDialog";
import DebugConsole from "@/components/viewer/DebugConsole";

function Section({ title, icon, defaultOpen = false, children }: { title: string; icon?: React.ReactNode; defaultOpen?: boolean; children: React.ReactNode }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-border/40">
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center w-full px-4 py-2.5 transition-all duration-200 gap-2.5 group relative ${open ? "bg-accent/40" : "hover:bg-accent/20"}`}
      >
        {open && <div className="absolute top-1 bottom-1 right-0 w-[3px] rounded-l-full bg-primary" />}
        {icon && <span className="text-primary shrink-0">{icon}</span>}
        <span className="text-xs font-semibold flex-1 text-right text-foreground">{title}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground shrink-0 transition-transform duration-200 ${open ? "" : "-rotate-90"}`} />
      </button>
      <div className={`overflow-hidden transition-all duration-200 ${open ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"}`}>
        <div className="px-3 pb-3 pt-1.5 animate-fade-in">{children}</div>
      </div>
    </div>
  );
}

export default function ViewerPage() {
  const [currentModel, setCurrentModel] = useState<ModelEntry>(MODELS[0]);
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [pinned, setPinned] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [activeTab, setActiveTab] = useState("view");
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
  const dispatchCamera = useViewerStore((s) => s.dispatchCamera);
  const currentModelKey = useViewerStore((s) => s.currentModelKey);
  const [floatingXYZ, setFloatingXYZ] = useState(false);
  const [debugConsole, setDebugConsole] = useState(false);

  const isRtl = lang === "he";
  const showSidebar = pinned ? sidebarVisible : (sidebarVisible && hovering) || (pinned && sidebarVisible);

  useEffect(() => {
    const m = MODELS.find((m) => m.key === currentModelKey);
    if (m && m.key !== currentModel.key) setCurrentModel(m);
  }, [currentModelKey]);

  const handleMouseEnterEdge = useCallback(() => {
    if (!pinned) {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
      setHovering(true);
      setSidebarVisible(true);
    }
  }, [pinned]);

  const handleMouseLeaveSidebar = useCallback(() => {
    if (!pinned) {
      hideTimerRef.current = setTimeout(() => setHovering(false), 500);
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

  const handleZoomIn = useCallback(() => dispatchCamera("zoomIn"), [dispatchCamera]);
  const handleZoomOut = useCallback(() => dispatchCamera("zoomOut"), [dispatchCamera]);
  const handleResetView = useCallback(() => dispatchCamera("reset"), [dispatchCamera]);
  const handleFocusSelected = useCallback(() => dispatchCamera("focus"), [dispatchCamera]);
  const handleSetAngle = useCallback((angle: "front" | "side" | "top") => dispatchCamera(angle), [dispatchCamera]);

  const handleModelChange = useCallback((key: string) => {
    const m = MODELS.find((m) => m.key === key);
    if (m) {
      setCurrentModel(m);
      useViewerStore.getState().setCurrentModelKey(key);
    }
  }, []);

  const camBtn = "p-2 rounded-xl border border-border bg-card/90 backdrop-blur-sm text-foreground hover:bg-accent hover:border-primary/50 transition-all shadow-md";

  return (
    <div className="flex flex-col h-screen bg-background text-foreground overflow-hidden" dir="rtl">
      {/* Compact Header */}
      <header className="flex items-center justify-between px-4 py-1.5 bg-card shrink-0 relative" style={{ borderBottom: '2px solid', borderImage: 'linear-gradient(90deg, hsl(43 80% 38%), hsl(43 74% 49%), hsl(43 60% 65%), hsl(43 74% 49%), hsl(43 80% 38%)) 1' }}>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-[11px]">3D</span>
          </div>
          <h1 className="text-xs font-bold tracking-tight text-foreground">Open3DModel</h1>
        </div>
        <div className="flex items-center gap-0.5">
          <button onClick={handleToggleSidebar} className="p-1.5 rounded-lg hover:bg-accent transition-colors" title={showSidebar ? "הסתר פאנל" : "הצג פאנל"}>
            {showSidebar ? <ChevronLeft className="w-3.5 h-3.5 text-foreground" /> : <ChevronRightIcon className="w-3.5 h-3.5 text-foreground" />}
          </button>
          <button
            onClick={() => setPinned(!pinned)}
            className={`p-1.5 rounded-lg transition-all duration-200 ${pinned ? "bg-primary/15 text-primary ring-1 ring-primary/30" : "hover:bg-accent text-muted-foreground"}`}
            title={pinned ? "ביטול נעיצה" : "נעץ סיידבר"}
          >
            {pinned ? <Pin className="w-3.5 h-3.5" /> : <PinOff className="w-3.5 h-3.5" />}
          </button>
          <button onClick={() => setThemeSettingsOpen(true)} className="p-1.5 rounded-lg hover:bg-accent transition-colors" title="ערכת נושא">
            <Settings className="w-3.5 h-3.5 text-foreground" />
          </button>
          <button onClick={toggleLang} className="p-1.5 rounded-lg hover:bg-accent transition-colors" title="שפה">
            <Globe className="w-3.5 h-3.5 text-foreground" />
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        {/* 3D Viewer */}
        <div className="flex-1 relative">
          {loading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/90 backdrop-blur-sm">
              <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 rounded-full border-[3px] border-primary/30 border-t-primary animate-spin" />
                <span className="text-sm text-foreground font-medium">{isRtl ? "טוען מודל..." : "Loading model..."}</span>
              </div>
            </div>
          )}
          <SceneCanvas model={currentModel} />

          {/* Floating Camera Controls — directly on the 3D scene */}
          <div className="absolute top-3 left-3 z-20 flex flex-col gap-1.5">
            <button onClick={handleZoomIn} className={camBtn} title={isRtl ? "זום +" : "Zoom In"}>
              <ZoomIn className="w-4 h-4" />
            </button>
            <button onClick={handleZoomOut} className={camBtn} title={isRtl ? "זום -" : "Zoom Out"}>
              <ZoomOut className="w-4 h-4" />
            </button>
            <button onClick={handleFocusSelected} className={camBtn} title={isRtl ? "מיקוד" : "Focus"}>
              <Crosshair className="w-4 h-4" />
            </button>
            <button onClick={handleResetView} className={camBtn} title={isRtl ? "איפוס" : "Reset"}>
              <RotateCcw className="w-4 h-4" />
            </button>
            <div className="h-px bg-border/60 mx-1" />
            <button onClick={() => handleSetAngle("front")} className={`${camBtn} text-[9px] font-bold`} title={isRtl ? "חזית" : "Front"}>F</button>
            <button onClick={() => handleSetAngle("side")} className={`${camBtn} text-[9px] font-bold`} title={isRtl ? "צד" : "Side"}>S</button>
            <button onClick={() => handleSetAngle("top")} className={`${camBtn} text-[9px] font-bold`} title={isRtl ? "מלמעלה" : "Top"}>T</button>
          </div>

          {/* Floating bottom-left buttons */}
          <div className="absolute bottom-3 left-3 z-20 flex gap-1.5">
            <button
              onClick={() => setFloatingXYZ(!floatingXYZ)}
              className={`p-2 rounded-xl border shadow-md transition-all duration-200 ${floatingXYZ ? "border-primary bg-primary/15 text-primary" : "border-border bg-card/90 backdrop-blur-sm text-foreground hover:border-primary/50"}`}
              title={isRtl ? "ג'ויסטיק XYZ" : "XYZ Joystick"}
            >
              <Gamepad2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setDebugConsole(!debugConsole)}
              className={`p-2 rounded-xl border shadow-md transition-all duration-200 ${debugConsole ? "border-green-500 bg-green-500/15 text-green-600" : "border-border bg-card/90 backdrop-blur-sm text-foreground hover:border-green-500/50"}`}
              title="Debug Console"
            >
              <Bug className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Edge hover trigger */}
        {!pinned && !showSidebar && (
          <div className="absolute top-0 bottom-0 right-0 w-5 z-30 cursor-pointer flex items-center justify-center group" onMouseEnter={handleMouseEnterEdge}>
            <div className="w-1 h-20 rounded-full bg-primary/40 group-hover:bg-primary group-hover:h-28 transition-all duration-300" />
          </div>
        )}

        {/* Sidebar */}
        <aside
          className={`bg-card flex flex-col overflow-hidden shrink-0 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] z-20 ${showSidebar ? "w-[320px] opacity-100" : "w-0 opacity-0"} ${!pinned && showSidebar ? "absolute top-0 bottom-0 right-0 sidebar-shadow" : ""}`}
          style={showSidebar ? { borderLeft: '2px solid', borderImage: 'linear-gradient(180deg, hsl(43 80% 38%), hsl(43 74% 49%), hsl(43 60% 65%)) 1' } : { border: 'none' }}
          onMouseEnter={handleMouseEnterSidebar}
          onMouseLeave={handleMouseLeaveSidebar}
        >
          <div className="flex-1 overflow-y-auto scrollbar-gold w-[320px]">
            {/* Sidebar Header — Model selector + InfoBar */}
            <div className="px-3 py-2.5 border-b border-border/60 bg-gradient-to-l from-accent/50 to-transparent">
              <div className="flex gap-2 items-center">
                <select
                  value={currentModel.key}
                  onChange={(e) => handleModelChange(e.target.value)}
                  className="flex-1 bg-secondary border border-border rounded-lg px-2.5 py-2 text-xs text-foreground font-semibold focus:outline-none focus:ring-2 focus:ring-primary/40 transition-shadow"
                  dir="rtl"
                >
                  {MODELS.map((m) => (
                    <option key={m.key} value={m.key}>{isRtl ? m.labels.he : m.labels.en}</option>
                  ))}
                </select>
                <button onClick={() => setComposerOpen(true)} className="p-2 bg-secondary border border-border rounded-lg hover:bg-accent hover:border-primary/40 transition-all shrink-0" title={isRtl ? "קומפוזר" : "Composer"}>
                  <Puzzle className="w-4 h-4 text-primary" />
                </button>
              </div>
              <div className="mt-2">
                <InfoBar />
              </div>
            </div>

            {/* Tab Navigation */}
            <Tabs value={activeTab} onValueChange={setActiveTab} dir="rtl" className="w-full">
              <div className="px-2 pt-2 pb-0 sticky top-0 z-10 bg-card">
                <TabsList className="w-full h-9 bg-secondary/60 rounded-lg p-0.5 gap-0.5">
                  <TabsTrigger value="view" className="flex-1 text-[11px] font-semibold gap-1 data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-sm rounded-md py-1.5">
                    <Eye className="w-3.5 h-3.5" />
                    {isRtl ? "תצוגה" : "View"}
                  </TabsTrigger>
                  <TabsTrigger value="tools" className="flex-1 text-[11px] font-semibold gap-1 data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-sm rounded-md py-1.5">
                    <Wrench className="w-3.5 h-3.5" />
                    {isRtl ? "כלים" : "Tools"}
                  </TabsTrigger>
                  <TabsTrigger value="library" className="flex-1 text-[11px] font-semibold gap-1 data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-sm rounded-md py-1.5">
                    <Library className="w-3.5 h-3.5" />
                    {isRtl ? "ספריה" : "Library"}
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* VIEW TAB — most used: Structures first, then X-Ray */}
              <TabsContent value="view" className="mt-0">
                <Section title={isRtl ? "מבנים ושכבות" : "Structures"} icon={<Layers className="w-4 h-4" />} defaultOpen>
                  <StructurePanel />
                </Section>
                <Section title={isRtl ? "תצוגת רנטגן" : "X-Ray"} icon={<Eye className="w-4 h-4" />}>
                  <XRayPanel />
                </Section>
              </TabsContent>

              {/* TOOLS TAB — ordered by frequency: Pro → Analysis → Advanced → Move → XYZ → Study */}
              <TabsContent value="tools" className="mt-0">
                <Section title={isRtl ? "הדמיה מקצועית" : "Professional"} icon={<Stethoscope className="w-4 h-4" />} defaultOpen>
                  <ProToolsPanel />
                </Section>
                <Section title={isRtl ? "ניתוח ושכבות" : "Analysis"} icon={<Scan className="w-4 h-4" />}>
                  <AnalysisPanel />
                </Section>
                <Section title={isRtl ? "כלים מתקדמים" : "Advanced"} icon={<Wrench className="w-4 h-4" />}>
                  <AdvancedToolsPanel />
                </Section>
                <Section title={isRtl ? "הזזת מודל" : "Move Model"} icon={<Move className="w-4 h-4" />}>
                  <ModelPositionPanel />
                </Section>
                <Section title={isRtl ? "כיול XYZ" : "XYZ Calibration"} icon={<Move3D className="w-4 h-4" />}>
                  <XYZPanel />
                </Section>
                <Section title={isRtl ? "מצב לימוד" : "Study Mode"} icon={<BookOpen className="w-4 h-4" />}>
                  <StudyModePanel />
                </Section>
              </TabsContent>

              {/* LIBRARY TAB */}
              <TabsContent value="library" className="mt-0">
                <Section title={isRtl ? "ספריה ישירה" : "Quick Library"} icon={<Library className="w-4 h-4" />} defaultOpen>
                  <DirectLibraryPanel />
                </Section>
                <Section title={isRtl ? "השוואת מודלים" : "Compare"} icon={<GitCompare className="w-4 h-4" />}>
                  <CompareModelsPanel />
                </Section>
                <Section title={isRtl ? "עורך שכבות" : "Layer Editor"} icon={<FolderTree className="w-4 h-4" />}>
                  <LayerManagerPanel />
                </Section>
                <Section title={isRtl ? "פרופילי Workspace" : "Profiles"} icon={<Briefcase className="w-4 h-4" />}>
                  <WorkspaceProfiles />
                </Section>
              </TabsContent>
            </Tabs>
          </div>
        </aside>
      </div>

      {/* Footer removed — space saved */}

      {/* Dialogs */}
      {partDetailsOpen && <PartDetailsDialog onClose={() => setPartDetailsOpen(false)} />}
      {composerOpen && <ModelComposerDialog onClose={() => setComposerOpen(false)} />}
      {themeSettingsOpen && <ThemeSettingsDialog onClose={() => setThemeSettingsOpen(false)} />}
      {useViewerStore.getState().animGalleryOpen && <AnimationsGalleryDialog onClose={() => useViewerStore.getState().setAnimGalleryOpen(false)} />}
      {floatingXYZ && <FloatingXYZDialog onClose={() => setFloatingXYZ(false)} />}
      {debugConsole && <DebugConsole onClose={() => setDebugConsole(false)} />}
    </div>
  );
}
