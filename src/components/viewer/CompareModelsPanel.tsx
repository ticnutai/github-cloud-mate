import { useState } from "react";
import { useViewerStore } from "@/lib/viewerStore";
import { MODELS } from "@/lib/models";

interface CompareModelsPanelProps {}

export default function CompareModelsPanel() {
  const lang = useViewerStore((s) => s.lang);
  const compareModelKey = useViewerStore((s) => s.compareModelKey);
  const setCompareModelKey = useViewerStore((s) => s.setCompareModelKey);
  const compareActive = useViewerStore((s) => s.compareActive);
  const setCompareActive = useViewerStore((s) => s.setCompareActive);

  const btn = "px-2 py-1 text-[10px] bg-secondary border border-border rounded hover:bg-accent transition-colors";
  const select = "w-full bg-secondary border border-border rounded-lg px-2 py-1.5 text-[11px] text-foreground focus:outline-none focus:ring-2 focus:ring-gold/40";

  return (
    <div className="flex flex-col gap-2">
      <div className="text-xs font-semibold">{lang === "he" ? "השוואת מודלים" : "Compare Models"}</div>
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
      <div className="flex gap-1">
        <button
          onClick={() => setCompareActive(true)}
          disabled={!compareModelKey}
          className={`${btn} ${!compareModelKey ? "opacity-50" : ""}`}
        >
          {lang === "he" ? "הפעל השוואה" : "Compare"}
        </button>
        <button onClick={() => { setCompareActive(false); setCompareModelKey(null); }} className={btn}>
          {lang === "he" ? "נקה השוואה" : "Clear"}
        </button>
      </div>
      {compareActive && (
        <div className="text-[10px] text-muted-foreground bg-secondary/50 rounded px-2 py-1">
          {lang === "he" ? "השוואה פעילה" : "Compare active"}: {compareModelKey}
        </div>
      )}
    </div>
  );
}
