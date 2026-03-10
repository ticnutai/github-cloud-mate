import { useViewerStore } from "@/lib/viewerStore";

export default function AdvancedToolsPanel() {
  const lang = useViewerStore((s) => s.lang);
  const selectedMesh = useViewerStore((s) => s.selectedMesh);
  const meshes = useViewerStore((s) => s.meshes);
  const setHighlightedNeighbors = useViewerStore((s) => s.setHighlightedNeighbors);
  const setPartDetailsOpen = useViewerStore((s) => s.setPartDetailsOpen);
  const clinicalTourActive = useViewerStore((s) => s.clinicalTourActive);
  const setClinicalTourActive = useViewerStore((s) => s.setClinicalTourActive);
  const bookmarks = useViewerStore((s) => s.bookmarks);
  const selectedBookmark = useViewerStore((s) => s.selectedBookmark);
  const setSelectedBookmark = useViewerStore((s) => s.setSelectedBookmark);
  const dispatchCamera = useViewerStore((s) => s.dispatchCamera);
  const setExportAction = useViewerStore((s) => s.setExportAction);
  const gridVisible = useViewerStore((s) => s.gridVisible);
  const toggleGrid = useViewerStore((s) => s.toggleGrid);
  const setSelectedMesh = useViewerStore((s) => s.setSelectedMesh);

  const btn = "px-3 py-2 text-xs bg-secondary border border-border rounded-lg hover:bg-accent transition-colors font-medium";
  const select = "w-full bg-secondary border border-border rounded-lg px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40";
  const label = "text-xs text-muted-foreground font-medium";
  const status = "text-xs text-muted-foreground bg-secondary/50 rounded-lg px-3 py-2";

  const handleHighlightNeighbors = () => {
    if (!selectedMesh) return;
    const idx = meshes.findIndex((m) => m.name === selectedMesh);
    if (idx < 0) return;
    const neighbors: string[] = [];
    if (idx > 0) neighbors.push(meshes[idx - 1].name);
    if (idx < meshes.length - 1) neighbors.push(meshes[idx + 1].name);
    setHighlightedNeighbors(neighbors);
  };

  const handleSaveBookmark = () => {
    dispatchCamera("saveBookmark", { name: `${lang === "he" ? "סימניה" : "Bookmark"} ${bookmarks.length + 1}` });
  };

  const handleGoToBookmark = () => {
    if (bookmarks.length > 0 && bookmarks[selectedBookmark]) {
      dispatchCamera("goToBookmark", bookmarks[selectedBookmark]);
    }
  };

  const handleStartClinicalTour = () => {
    setClinicalTourActive(true);
    const visibleMeshes = meshes.filter(m => m.visible);
    if (visibleMeshes.length === 0) return;
    let i = 0;
    const next = () => {
      if (i >= visibleMeshes.length || !useViewerStore.getState().clinicalTourActive) {
        setClinicalTourActive(false);
        return;
      }
      setSelectedMesh(visibleMeshes[i].name);
      dispatchCamera("focus");
      i++;
      setTimeout(next, 3000);
    };
    next();
  };

  return (
    <div className="flex flex-col gap-3.5">
      {/* Part Details */}
      <button
        onClick={() => setPartDetailsOpen(true)}
        disabled={!selectedMesh}
        className={`${btn} w-full ${!selectedMesh ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        {lang === "he" ? "פרטים מלאים על האיבר הנבחר" : "Full Part Details"}
      </button>

      {/* Neighbors */}
      <div className="flex gap-2 flex-wrap">
        <button onClick={handleHighlightNeighbors} className={btn}>{lang === "he" ? "הדגש שכנים" : "Highlight Neighbors"}</button>
        <button onClick={() => setHighlightedNeighbors([])} className={btn}>{lang === "he" ? "נקה" : "Clear"}</button>
      </div>

      {/* Grid */}
      <button onClick={toggleGrid} className={`${btn} ${gridVisible ? "bg-primary/15 border-primary/40" : ""}`}>
        ▦ {lang === "he" ? (gridVisible ? "הסתר גריד" : "הצג גריד") : (gridVisible ? "Hide Grid" : "Show Grid")}
      </button>

      {/* Bookmarks */}
      <div className="flex flex-col gap-2 border-t border-border pt-3">
        <span className={label}>{lang === "he" ? "סימניות מצלמה" : "Camera Bookmarks"}</span>
        {bookmarks.length > 0 && (
          <select value={selectedBookmark} onChange={(e) => setSelectedBookmark(parseInt(e.target.value))} className={select}>
            {bookmarks.map((b, i) => (<option key={i} value={i}>{b.name}</option>))}
          </select>
        )}
        <div className="flex gap-2">
          <button onClick={handleSaveBookmark} className={btn}>{lang === "he" ? "שמור" : "Save"}</button>
          <button onClick={handleGoToBookmark} disabled={bookmarks.length === 0} className={`${btn} ${bookmarks.length === 0 ? "opacity-50" : ""}`}>{lang === "he" ? "עבור" : "Go To"}</button>
        </div>
      </div>

      {/* Clinical Tour */}
      <div className="flex flex-col gap-2 border-t border-border pt-3">
        <div className="flex gap-2 flex-wrap">
          <button onClick={handleStartClinicalTour} className={btn}>{lang === "he" ? "▶ רצף קליני" : "▶ Clinical Tour"}</button>
          <button onClick={() => setClinicalTourActive(false)} className={btn}>{lang === "he" ? "⏹ עצור" : "⏹ Stop"}</button>
        </div>
        <div className={status}>{clinicalTourActive ? (lang === "he" ? "✅ רצף קליני פעיל" : "✅ Tour Active") : (lang === "he" ? "מוכן" : "Ready")}</div>
      </div>

      {/* Export */}
      <div className="flex flex-col gap-2 border-t border-border pt-3">
        <span className={label}>{lang === "he" ? "ייצוא" : "Export"}</span>
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setExportAction("image")} className={btn}>{lang === "he" ? "📷 תמונה" : "📷 Image"}</button>
          <button onClick={() => setExportAction("record")} className={btn}>{lang === "he" ? "🎥 הקלטה" : "🎥 Record"}</button>
          <button onClick={() => setExportAction("glb")} className={btn}>{lang === "he" ? "📦 GLB" : "📦 GLB"}</button>
        </div>
      </div>
    </div>
  );
}
