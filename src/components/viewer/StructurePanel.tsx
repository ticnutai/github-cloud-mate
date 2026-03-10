import { useViewerStore } from "@/lib/viewerStore";
import { Eye, EyeOff, Search } from "lucide-react";

export default function StructurePanel() {
  const meshes = useViewerStore((s) => s.meshes);
  const toggleMesh = useViewerStore((s) => s.toggleMesh);
  const showAll = useViewerStore((s) => s.showAll);
  const hideAll = useViewerStore((s) => s.hideAll);
  const invertVisibility = useViewerStore((s) => s.invertVisibility);
  const selectedMesh = useViewerStore((s) => s.selectedMesh);
  const setSelectedMesh = useViewerStore((s) => s.setSelectedMesh);
  const filterText = useViewerStore((s) => s.filterText);
  const setFilterText = useViewerStore((s) => s.setFilterText);
  const lang = useViewerStore((s) => s.lang);

  const filtered = meshes.filter((m) =>
    m.name.toLowerCase().includes(filterText.toLowerCase())
  );

  const visibleCount = meshes.filter((m) => m.visible).length;

  return (
    <div className="flex flex-col gap-2">
      {/* Filter */}
      <div className="relative">
        <Search className="absolute right-3 top-2.5 w-3.5 h-3.5 text-muted-foreground" />
        <input
          type="text"
          dir="ltr"
          placeholder={lang === "he" ? "סנן שכבות..." : "Filter structures..."}
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
          className="w-full bg-secondary border border-border rounded px-3 py-2 pr-9 text-xs font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
        />
      </div>

      {/* Actions */}
      <div className="flex gap-1 flex-wrap">
        <button onClick={showAll} className="px-2 py-1 text-[10px] bg-secondary border border-border rounded hover:bg-accent transition-colors">
          {lang === "he" ? "הצג הכל" : "Show All"}
        </button>
        <button onClick={hideAll} className="px-2 py-1 text-[10px] bg-secondary border border-border rounded hover:bg-accent transition-colors">
          {lang === "he" ? "הסתר הכל" : "Hide All"}
        </button>
        <button onClick={invertVisibility} className="px-2 py-1 text-[10px] bg-secondary border border-border rounded hover:bg-accent transition-colors">
          {lang === "he" ? "הפוך" : "Invert"}
        </button>
      </div>

      {/* Status */}
      <div className="flex gap-3 text-[10px] text-muted-foreground px-1">
        <span>{lang === "he" ? "סה״כ" : "Total"}: {meshes.length}</span>
        <span>{lang === "he" ? "גלויים" : "Visible"}: {visibleCount}</span>
      </div>

      {/* Structure list */}
      <div className="flex flex-col gap-0.5 max-h-[45vh] overflow-y-auto scrollbar-thin">
        {filtered.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-4">
            {meshes.length === 0
              ? (lang === "he" ? "טוען מודל..." : "Loading model...")
              : (lang === "he" ? "לא נמצאו שכבות" : "No structures found")}
          </p>
        )}
        {filtered.map((mesh) => (
          <button
            key={mesh.name}
            onClick={() => setSelectedMesh(mesh.name === selectedMesh ? null : mesh.name)}
            className={`flex items-center gap-2 px-2 py-1.5 rounded text-right transition-colors ${
              mesh.name === selectedMesh
                ? "bg-primary/20 border border-primary/40"
                : "hover:bg-accent border border-transparent"
            }`}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleMesh(mesh.name);
              }}
              className="flex-shrink-0"
              title={mesh.visible ? "Hide" : "Show"}
            >
              {mesh.visible ? (
                <Eye className="w-3.5 h-3.5 text-primary" />
              ) : (
                <EyeOff className="w-3.5 h-3.5 text-muted-foreground" />
              )}
            </button>
            <span className="text-[11px] font-mono truncate">{mesh.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
