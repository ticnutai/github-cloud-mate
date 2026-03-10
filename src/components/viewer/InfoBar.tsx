import { useViewerStore } from "@/lib/viewerStore";

export default function InfoBar() {
  const selectedMesh = useViewerStore((s) => s.selectedMesh);
  const hoveredMesh = useViewerStore((s) => s.hoveredMesh);
  const lang = useViewerStore((s) => s.lang);

  return (
    <div className="flex gap-3 p-2 bg-secondary/50 rounded-lg border border-border text-xs">
      <div className="flex items-center gap-1.5 flex-1 min-w-0">
        <span className="text-muted-foreground shrink-0">
          {lang === "he" ? "נבחר:" : "Selected:"}
        </span>
        <span className="font-mono text-primary truncate text-[11px]">
          {selectedMesh || (lang === "he" ? "—" : "none")}
        </span>
      </div>
      <div className="flex items-center gap-1.5 flex-1 min-w-0">
        <span className="text-muted-foreground shrink-0">
          {lang === "he" ? "ריחוף:" : "Hover:"}
        </span>
        <span className="font-mono truncate text-[11px]">
          {hoveredMesh || (lang === "he" ? "—" : "none")}
        </span>
      </div>
    </div>
  );
}
