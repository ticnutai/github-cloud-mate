import { useViewerStore } from "@/lib/viewerStore";

export default function XRayPanel() {
  const xrayEnabled = useViewerStore((s) => s.xrayEnabled);
  const toggleXray = useViewerStore((s) => s.toggleXray);
  const xrayOpacity = useViewerStore((s) => s.xrayOpacity);
  const setXrayOpacity = useViewerStore((s) => s.setXrayOpacity);
  const lang = useViewerStore((s) => s.lang);

  return (
    <div className="flex flex-col gap-2 p-3 bg-secondary/50 rounded-lg border border-border">
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={xrayEnabled}
          onChange={toggleXray}
          className="accent-primary w-3.5 h-3.5"
        />
        <span className="text-xs font-semibold">
          {lang === "he" ? "תצוגת רנטגן" : "X-Ray Mode"}
        </span>
      </label>
      {xrayEnabled && (
        <div className="flex items-center gap-2">
          <label className="text-[10px] text-muted-foreground whitespace-nowrap">
            {lang === "he" ? "שקיפות" : "Opacity"}
          </label>
          <input
            type="range"
            min="0.05"
            max="1"
            step="0.05"
            value={xrayOpacity}
            onChange={(e) => setXrayOpacity(parseFloat(e.target.value))}
            className="flex-1 accent-primary h-1"
          />
          <span className="text-[10px] text-muted-foreground w-8 text-left">
            {Math.round(xrayOpacity * 100)}%
          </span>
        </div>
      )}
    </div>
  );
}
