import { useState } from "react";
import { useViewerStore } from "@/lib/viewerStore";
import { Eye, EyeOff, Search, Star, StarOff, FolderOpen, FolderClosed } from "lucide-react";

// Group meshes by prefix (before first underscore or common anatomical grouping)
function groupMeshes(meshes: { name: string; visible: boolean; object: any; favorite?: boolean }[]) {
  const groups: Record<string, typeof meshes> = {};
  meshes.forEach((m) => {
    const parts = m.name.split("_");
    const group = parts.length > 1 ? parts[0] : "other";
    if (!groups[group]) groups[group] = [];
    groups[group].push(m);
  });
  return groups;
}

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
  const searchMode = useViewerStore((s) => s.searchMode);
  const setSearchMode = useViewerStore((s) => s.setSearchMode);
  const toggleFavorite = useViewerStore((s) => s.toggleFavorite);
  const favoritesOnly = useViewerStore((s) => s.favoritesOnly);
  const toggleFavoritesOnly = useViewerStore((s) => s.toggleFavoritesOnly);
  const lang = useViewerStore((s) => s.lang);

  const [groupView, setGroupView] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  const matchFilter = (name: string) => {
    const n = name.toLowerCase();
    const f = filterText.toLowerCase();
    if (!f) return true;
    if (searchMode === "contains") return n.includes(f);
    if (searchMode === "starts") return n.startsWith(f);
    if (searchMode === "exact") return n === f;
    if (searchMode === "fuzzy") {
      let fi = 0;
      for (let i = 0; i < n.length && fi < f.length; i++) {
        if (n[i] === f[fi]) fi++;
      }
      return fi === f.length;
    }
    return n.includes(f);
  };

  let filtered = meshes.filter((m) => matchFilter(m.name));
  if (favoritesOnly) filtered = filtered.filter((m) => m.favorite);

  const visibleCount = meshes.filter((m) => m.visible).length;
  const selectedCount = selectedMesh ? 1 : 0;
  const groups = groupView ? groupMeshes(filtered) : null;

  const toggleGroup = (group: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      next.has(group) ? next.delete(group) : next.add(group);
      return next;
    });
  };

  const expandAll = () => {
    if (groups) setExpandedGroups(new Set(Object.keys(groups)));
  };
  const collapseAll = () => setExpandedGroups(new Set());

  const btn = "px-2 py-1 text-[10px] bg-secondary border border-border rounded hover:bg-accent transition-colors";
  const searchModeBtn = (mode: string, active: boolean) =>
    `px-1.5 py-0.5 text-[9px] rounded border transition-colors ${active ? "bg-primary text-primary-foreground border-primary" : "bg-secondary border-border hover:bg-accent"}`;

  const renderMeshRow = (mesh: typeof meshes[0]) => (
    <div
      key={mesh.name}
      onClick={() => setSelectedMesh(mesh.name === selectedMesh ? null : mesh.name)}
      className={`flex items-center gap-1.5 px-2 py-1.5 rounded text-right transition-colors cursor-pointer ${
        mesh.name === selectedMesh
          ? "bg-primary/15 border border-gold/40"
          : "hover:bg-accent/50 border border-transparent"
      }`}
    >
      <button onClick={(e) => { e.stopPropagation(); toggleMesh(mesh.name); }} className="flex-shrink-0" title={mesh.visible ? "Hide" : "Show"}>
        {mesh.visible ? <Eye className="w-3.5 h-3.5 text-gold-dark" /> : <EyeOff className="w-3.5 h-3.5 text-muted-foreground" />}
      </button>
      <button onClick={(e) => { e.stopPropagation(); toggleFavorite(mesh.name); }} className="flex-shrink-0" title="Favorite">
        {mesh.favorite ? <Star className="w-3 h-3 text-gold fill-gold" /> : <StarOff className="w-3 h-3 text-muted-foreground/40" />}
      </button>
      <span className="text-[10px] font-mono truncate flex-1">{mesh.name}</span>
    </div>
  );

  return (
    <div className="flex flex-col gap-2">
      {/* Search modes */}
      <div className="flex gap-1">
        {(["contains", "starts", "exact", "fuzzy"] as const).map((mode) => (
          <button key={mode} onClick={() => setSearchMode(mode)} className={searchModeBtn(mode, searchMode === mode)}>
            {mode === "contains" ? "מכיל" : mode === "starts" ? "מתחיל" : mode === "exact" ? "מדויק" : "חכם"}
          </button>
        ))}
      </div>

      {/* Filter */}
      <div className="relative">
        <Search className="absolute right-3 top-2.5 w-3.5 h-3.5 text-muted-foreground" />
        <input
          type="text"
          dir="ltr"
          placeholder={lang === "he" ? "סנן שכבות..." : "Filter structures..."}
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
          className="w-full bg-secondary border border-border rounded-lg px-3 py-2 pr-9 text-xs font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold/40"
        />
      </div>

      {/* Actions */}
      <div className="flex gap-1 flex-wrap">
        <button onClick={showAll} className={btn}>{lang === "he" ? "הצג הכל" : "Show All"}</button>
        <button onClick={hideAll} className={btn}>{lang === "he" ? "הסתר הכל" : "Hide All"}</button>
        <button onClick={invertVisibility} className={btn}>{lang === "he" ? "הפוך" : "Invert"}</button>
        <button onClick={() => setSelectedMesh(null)} className={btn}>{lang === "he" ? "נקה בחירה" : "Clear"}</button>
      </div>
      <div className="flex gap-1 flex-wrap">
        <button onClick={toggleFavoritesOnly} className={`${btn} ${favoritesOnly ? "bg-gold/15 border-gold/40 text-gold-dark" : ""}`}>
          ⭐ {favoritesOnly ? (lang === "he" ? "מועדפים בלבד" : "Favorites") : (lang === "he" ? "מועדפים: כבוי" : "Favorites: Off")}
        </button>
        <button onClick={() => setGroupView(!groupView)} className={`${btn} ${groupView ? "bg-gold/15 border-gold/40" : ""}`}>
          📁 {groupView ? (lang === "he" ? "תיקיות" : "Folders") : (lang === "he" ? "רשימה" : "List")}
        </button>
        {groupView && (
          <>
            <button onClick={expandAll} className={btn}>{lang === "he" ? "פתח הכל" : "Expand"}</button>
            <button onClick={collapseAll} className={btn}>{lang === "he" ? "סגור הכל" : "Collapse"}</button>
          </>
        )}
      </div>

      {/* Status */}
      <div className="flex gap-3 text-[10px] text-muted-foreground px-1">
        <span>{lang === "he" ? "סה״כ" : "Total"}: {meshes.length}</span>
        <span>{lang === "he" ? "גלויים" : "Visible"}: {visibleCount}</span>
        <span>{lang === "he" ? "נבחרו" : "Selected"}: {selectedCount}</span>
      </div>

      {/* Structure list */}
      <div className="flex flex-col gap-0.5 max-h-[40vh] overflow-y-auto scrollbar-gold">
        {filtered.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-4">
            {meshes.length === 0 ? (lang === "he" ? "טוען מודל..." : "Loading model...") : (lang === "he" ? "לא נמצאו שכבות" : "No structures found")}
          </p>
        )}
        {groupView && groups ? (
          Object.entries(groups).sort(([a], [b]) => a.localeCompare(b)).map(([group, items]) => (
            <div key={group}>
              <button onClick={() => toggleGroup(group)} className="flex items-center gap-1.5 w-full px-2 py-1.5 text-[10px] font-semibold text-foreground hover:bg-accent/50 rounded transition-colors">
                {expandedGroups.has(group) ? <FolderOpen className="w-3.5 h-3.5 text-gold-dark" /> : <FolderClosed className="w-3.5 h-3.5 text-muted-foreground" />}
                <span className="flex-1 text-right">{group}</span>
                <span className="text-muted-foreground text-[9px]">({items.length})</span>
              </button>
              {expandedGroups.has(group) && (
                <div className="mr-3 border-r border-border/40 pr-1">
                  {items.map(renderMeshRow)}
                </div>
              )}
            </div>
          ))
        ) : (
          filtered.map(renderMeshRow)
        )}
      </div>
    </div>
  );
}
