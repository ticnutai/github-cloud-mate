import { useViewerStore } from "@/lib/viewerStore";

export default function AdvancedToolsPanel() {
  const lang = useViewerStore((s) => s.lang);
  const selectedMesh = useViewerStore((s) => s.selectedMesh);
  const meshes = useViewerStore((s) => s.meshes);
  const highlightedNeighbors = useViewerStore((s) => s.highlightedNeighbors);
  const setHighlightedNeighbors = useViewerStore((s) => s.setHighlightedNeighbors);
  const setPartDetailsOpen = useViewerStore((s) => s.setPartDetailsOpen);
  const clinicalTourActive = useViewerStore((s) => s.clinicalTourActive);
  const setClinicalTourActive = useViewerStore((s) => s.setClinicalTourActive);
  const bookmarks = useViewerStore((s) => s.bookmarks);
  const addBookmark = useViewerStore((s) => s.addBookmark);
  const selectedBookmark = useViewerStore((s) => s.selectedBookmark);
  const setSelectedBookmark = useViewerStore((s) => s.setSelectedBookmark);

  const btn = "px-2 py-1 text-[10px] bg-secondary border border-border rounded hover:bg-accent transition-colors";
  const select = "w-full bg-secondary border border-border rounded px-2 py-1 text-[11px] text-foreground focus:outline-none focus:ring-1 focus:ring-ring";
  const label = "text-[10px] text-muted-foreground";
  const status = "text-[10px] text-muted-foreground bg-secondary/50 rounded px-2 py-1";

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
    addBookmark({
      name: `${lang === "he" ? "סימניה" : "Bookmark"} ${bookmarks.length + 1}`,
      position: [0, 0, 0],
      target: [0, 0, 0],
    });
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="text-xs font-semibold">{lang === "he" ? "כלים מתקדמים" : "Advanced Tools"}</div>

      {/* Part Details */}
      <button
        onClick={() => setPartDetailsOpen(true)}
        disabled={!selectedMesh}
        className={`${btn} ${!selectedMesh ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        {lang === "he" ? "פרטים מלאים על האיבר הנבחר" : "Full Part Details"}
      </button>

      {/* Neighbors */}
      <div className="flex gap-1 flex-wrap">
        <button onClick={handleHighlightNeighbors} className={btn}>
          {lang === "he" ? "הדגש שכנים" : "Highlight Neighbors"}
        </button>
        <button onClick={() => setHighlightedNeighbors([])} className={btn}>
          {lang === "he" ? "נקה שכנים" : "Clear Neighbors"}
        </button>
      </div>

      {/* Bookmarks */}
      <div>
        <span className={label}>{lang === "he" ? "סימניות מצלמה" : "Camera Bookmarks"}</span>
        {bookmarks.length > 0 && (
          <select
            value={selectedBookmark}
            onChange={(e) => setSelectedBookmark(parseInt(e.target.value))}
            className={select}
          >
            {bookmarks.map((b, i) => (
              <option key={i} value={i}>{b.name}</option>
            ))}
          </select>
        )}
        <div className="flex gap-1 mt-1">
          <button onClick={handleSaveBookmark} className={btn}>{lang === "he" ? "שמור סימניה" : "Save"}</button>
          <button className={btn}>{lang === "he" ? "עבור לסימניה" : "Go To"}</button>
        </div>
      </div>

      {/* Clinical Tour */}
      <div className="flex gap-1 flex-wrap">
        <button onClick={() => setClinicalTourActive(true)} className={btn}>
          {lang === "he" ? "התחל רצף קליני" : "Start Clinical Tour"}
        </button>
        <button onClick={() => setClinicalTourActive(false)} className={btn}>
          {lang === "he" ? "עצור רצף קליני" : "Stop Clinical Tour"}
        </button>
      </div>
      <div className={status}>
        {lang === "he" ? "רצף קליני:" : "Clinical Tour:"} {clinicalTourActive ? (lang === "he" ? "פעיל" : "Active") : (lang === "he" ? "מוכן" : "Ready")}
      </div>

      {/* Export */}
      <div className="flex gap-1 flex-wrap">
        <button className={btn}>{lang === "he" ? "ייצוא תמונה" : "Export Image"}</button>
        <button className={btn}>{lang === "he" ? "הקלטת 8 שניות" : "Record 8s"}</button>
        <button className={btn}>{lang === "he" ? "ייצוא GLB" : "Export GLB"}</button>
      </div>
    </div>
  );
}
