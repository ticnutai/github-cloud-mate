import { useViewerStore } from "@/lib/viewerStore";

export default function XRayPanel() {
  const xrayEnabled = useViewerStore((s) => s.xrayEnabled);
  const toggleXray = useViewerStore((s) => s.toggleXray);
  const xrayOpacity = useViewerStore((s) => s.xrayOpacity);
  const setXrayOpacity = useViewerStore((s) => s.setXrayOpacity);
  const lang = useViewerStore((s) => s.lang);

  return (
    <div className="flex flex-col gap-3 p-3 bg-secondary/50 rounded-lg border border-border">
      <label className="flex items-center gap-2.5 cursor-pointer">
        <input
          type="checkbox"
          checked={xrayEnabled}
          onChange={toggleXray}
          className="accent-primary w-4 h-4"
        />
        <span className="text-xs font-semibold">
          {lang === "he" ? "תצוגת רנטגן" : "X-Ray Mode"}
        </span>
      </label>
      {xrayEnabled && (
        <div className="flex items-center gap-3">
          <label className="text-xs text-muted-foreground whitespace-nowrap">
            {lang === "he" ? "שקיפות" : "Opacity"}
          </label>
          <input
            type="range"
            min="0.05"
            max="1"
            step="0.05"
            value={xrayOpacity}
            onChange={(e) => setXrayOpacity(parseFloat(e.target.value))}
            className="flex-1 accent-primary h-1.5"
          />
          <span className="text-xs text-muted-foreground w-10 text-left font-mono">
            {Math.round(xrayOpacity * 100)}%
          </span>
        </div>
      )}
    </div>
  );
}
