import { useState } from "react";
import { useViewerStore } from "@/lib/viewerStore";
import { MODELS } from "@/lib/models";

export default function DirectLibraryPanel() {
  const lang = useViewerStore((s) => s.lang);
  const setCurrentModelKey = useViewerStore((s) => s.setCurrentModelKey);
  const currentModelKey = useViewerStore((s) => s.currentModelKey);
  const [refreshKey, setRefreshKey] = useState(0);

  const animations = [
    { name: lang === "he" ? "נשימה" : "Breathing", key: "breathing" },
    { name: lang === "he" ? "פעימת לב" : "Heartbeat", key: "heartbeat" },
    { name: lang === "he" ? "זרימת דם" : "Blood Flow", key: "bloodflow" },
    { name: lang === "he" ? "הליכה" : "Gait", key: "gait" },
    { name: lang === "he" ? "תצוגה היקפית" : "Presentation", key: "presentation" },
    { name: lang === "he" ? "פיצול שכבות" : "Explode", key: "explode" },
  ];

  const btn = "px-3 py-2 text-xs bg-secondary border border-border rounded-lg hover:bg-accent transition-colors font-medium";

  return (
    <div className="flex flex-col gap-3.5">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <button onClick={() => useViewerStore.getState().setAnimGalleryOpen(true)} className={btn}>
            {lang === "he" ? "גלריה מלאה" : "Full Gallery"}
          </button>
          <button onClick={() => setRefreshKey(k => k + 1)} className={btn}>
            {lang === "he" ? "רענן" : "Refresh"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Models column */}
        <div>
          <h4 className="text-xs font-semibold text-muted-foreground mb-2">{lang === "he" ? "מודלים" : "Models"}</h4>
          <div className="flex flex-col gap-1.5 max-h-40 overflow-y-auto scrollbar-gold">
            {MODELS.map((m) => (
              <div
                key={m.key}
                onClick={() => setCurrentModelKey(m.key)}
                className={`text-xs px-3 py-2 rounded-lg cursor-pointer transition-colors truncate ${
                  currentModelKey === m.key ? "bg-primary/15 border border-primary/40 text-foreground font-medium" : "bg-secondary/50 hover:bg-accent/50"
                }`}
              >
                {lang === "he" ? m.labels.he : m.labels.en}
              </div>
            ))}
          </div>
        </div>

        {/* Animations column */}
        <div>
          <h4 className="text-xs font-semibold text-muted-foreground mb-2">{lang === "he" ? "אנימציות" : "Animations"}</h4>
          <div className="flex flex-col gap-1.5 max-h-40 overflow-y-auto scrollbar-gold">
            {animations.map((a) => (
              <div
                key={a.key}
                onClick={() => {
                  useViewerStore.getState().setAnimationType(a.key as any);
                  useViewerStore.getState().setAnimationPlaying(true);
                }}
                className="text-xs px-3 py-2 bg-secondary/50 rounded-lg hover:bg-accent/50 cursor-pointer transition-colors"
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
