import { useState } from "react";
import { useViewerStore } from "@/lib/viewerStore";
import { MODELS } from "@/lib/models";

export default function DirectLibraryPanel() {
  const lang = useViewerStore((s) => s.lang);
  const [refreshKey, setRefreshKey] = useState(0);

  const animations = [
    { name: lang === "he" ? "נשימה" : "Breathing", key: "breathing" },
    { name: lang === "he" ? "הליכה" : "Gait", key: "gait" },
    { name: lang === "he" ? "תצוגה היקפית" : "Presentation", key: "presentation" },
    { name: lang === "he" ? "פיצול שכבות" : "Explode", key: "explode" },
    { name: lang === "he" ? "פעימת לב" : "Heartbeat", key: "heartbeat" },
    { name: lang === "he" ? "זרימת דם" : "Blood Flow", key: "bloodflow" },
  ];

  const btn = "px-2 py-1 text-[10px] bg-secondary border border-border rounded hover:bg-accent transition-colors";

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold">{lang === "he" ? "ספריה ישירה" : "Quick Library"}</span>
        <div className="flex gap-1">
          <button onClick={() => useViewerStore.getState().setAnimGalleryOpen(true)} className={btn}>
            {lang === "he" ? "גלריה מלאה" : "Full Gallery"}
          </button>
          <button onClick={() => setRefreshKey(k => k + 1)} className={btn}>
            {lang === "he" ? "רענן" : "Refresh"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Models column */}
        <div>
          <h4 className="text-[10px] font-semibold text-muted-foreground mb-1.5">{lang === "he" ? "מודלים" : "Models"}</h4>
          <div className="flex flex-col gap-1 max-h-32 overflow-y-auto scrollbar-gold">
            {MODELS.slice(0, 8).map((m) => (
              <div key={m.key} className="text-[9px] px-2 py-1 bg-secondary/50 rounded hover:bg-accent/50 cursor-pointer transition-colors truncate">
                {lang === "he" ? m.labels.he : m.labels.en}
              </div>
            ))}
          </div>
        </div>

        {/* Animations column */}
        <div>
          <h4 className="text-[10px] font-semibold text-muted-foreground mb-1.5">{lang === "he" ? "אנימציות" : "Animations"}</h4>
          <div className="flex flex-col gap-1 max-h-32 overflow-y-auto scrollbar-gold">
            {animations.map((a) => (
              <div
                key={a.key}
                onClick={() => {
                  useViewerStore.getState().setAnimationType(a.key as any);
                  useViewerStore.getState().setAnimationPlaying(true);
                }}
                className="text-[9px] px-2 py-1 bg-secondary/50 rounded hover:bg-accent/50 cursor-pointer transition-colors"
              >
                ▶ {a.name}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
