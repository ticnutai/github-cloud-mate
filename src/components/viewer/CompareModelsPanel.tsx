import { useViewerStore } from "@/lib/viewerStore";
import { MODELS } from "@/lib/models";

export default function CompareModelsPanel() {
  const lang = useViewerStore((s) => s.lang);
  const compareModelKey = useViewerStore((s) => s.compareModelKey);
  const setCompareModelKey = useViewerStore((s) => s.setCompareModelKey);
  const compareActive = useViewerStore((s) => s.compareActive);
  const setCompareActive = useViewerStore((s) => s.setCompareActive);

  const btn = "px-3 py-2 text-xs bg-secondary border border-border rounded-lg hover:bg-accent transition-colors font-medium";
  const select = "w-full bg-secondary border border-border rounded-lg px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40";

  return (
    <div className="flex flex-col gap-3">
      <select
        value={compareModelKey || ""}
        onChange={(e) => setCompareModelKey(e.target.value || null)}
        className={select}
      >
        <option value="">{lang === "he" ? "בחר מודל להשוואה" : "Select model to compare"}</option>
        {MODELS.map((m) => (
          <option key={m.key} value={m.key}>
            {lang === "he" ? m.labels.he : m.labels.en}
          </option>
        ))}
      </select>
      <div className="flex gap-2">
        <button
          onClick={() => setCompareActive(true)}
          disabled={!compareModelKey}
          className={`${btn} ${!compareModelKey ? "opacity-50" : ""}`}
        >
          {lang === "he" ? "הפעל השוואה" : "Compare"}
        </button>
        <button onClick={() => { setCompareActive(false); setCompareModelKey(null); }} className={btn}>
          {lang === "he" ? "נקה" : "Clear"}
        </button>
      </div>
      {compareActive && (
        <div className="text-xs text-muted-foreground bg-secondary/50 rounded-lg px-3 py-2">
          {lang === "he" ? "השוואה פעילה" : "Compare active"}: {compareModelKey}
        </div>
      )}
    </div>
  );
}
