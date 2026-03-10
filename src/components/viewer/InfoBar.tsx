import { useViewerStore } from "@/lib/viewerStore";

export default function InfoBar() {
  const selectedMesh = useViewerStore((s) => s.selectedMesh);
  const hoveredMesh = useViewerStore((s) => s.hoveredMesh);
  const lang = useViewerStore((s) => s.lang);

  return (
    <div className="flex flex-col gap-1 p-2 bg-secondary/50 rounded border border-border text-[11px]">
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground">
          {lang === "he" ? "נבחר:" : "Selected:"}
        </span>
        <span className="font-mono text-primary truncate">
          {selectedMesh || (lang === "he" ? "אין" : "none")}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground">
          {lang === "he" ? "ריחוף:" : "Hover:"}
        </span>
        <span className="font-mono truncate">
          {hoveredMesh || (lang === "he" ? "אין" : "none")}
        </span>
      </div>
    </div>
  );
}
