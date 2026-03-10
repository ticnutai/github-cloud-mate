import { useViewerStore } from "@/lib/viewerStore";

export default function AnimationsGalleryDialog({ onClose }: { onClose: () => void }) {
  const lang = useViewerStore((s) => s.lang);
  const setAnimationType = useViewerStore((s) => s.setAnimationType);
  const setAnimationPlaying = useViewerStore((s) => s.setAnimationPlaying);

  const animations = [
    { key: "breathing", he: "נשימה", en: "Breathing", desc: "פעימת נשימה עדינה על כל המודל" },
    { key: "gait", he: "הליכה", en: "Gait", desc: "סימולציית הליכה בסיסית" },
    { key: "presentation", he: "תצוגה היקפית", en: "Presentation", desc: "סיבוב אוטומטי של המצלמה" },
    { key: "explode", he: "פיצול שכבות", en: "Explode", desc: "פריצת שכבות כלפי חוץ" },
    { key: "heartbeat", he: "פעימת לב", en: "Heartbeat", desc: "סימולציית פעימת לב" },
    { key: "bloodflow", he: "זרימת דם", en: "Blood Flow", desc: "הדמיית זרימת דם" },
    { key: "nervous", he: "מערכת עצבים", en: "Nervous", desc: "הדמיית אותות עצביים" },
    { key: "lymph", he: "מערכת הלימפה", en: "Lymphatic", desc: "זרימה לימפטית" },
  ];

  const playAnim = (key: string) => {
    setAnimationType(key as any);
    setAnimationPlaying(true);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-card border-2 rounded-xl p-6 max-w-xl w-full mx-4 max-h-[80vh] overflow-y-auto"
        style={{ borderColor: 'hsl(43 74% 49%)' }}
        dir="rtl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-base font-bold mb-1">{lang === "he" ? "גלריית אנימציות מלאה" : "Full Animations Gallery"}</h3>
        <p className="text-[11px] text-muted-foreground mb-4">{lang === "he" ? "כל האנימציות הזמינות מוצגות כאן לצפייה ישירה." : "All available animations are shown here."}</p>

        <div className="grid grid-cols-2 gap-2.5">
          {animations.map((a) => (
            <button
              key={a.key}
              onClick={() => playAnim(a.key)}
              className="flex flex-col items-start gap-1 p-3 bg-secondary rounded-lg border border-border hover:border-gold/50 hover:bg-accent/50 transition-all text-right"
            >
              <span className="text-[11px] font-semibold">{lang === "he" ? a.he : a.en}</span>
              <span className="text-[9px] text-muted-foreground">{a.desc}</span>
            </button>
          ))}
        </div>

        <div className="mt-4 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 text-[11px] font-medium bg-primary text-primary-foreground rounded-lg hover:opacity-90">
            {lang === "he" ? "סגור" : "Close"}
          </button>
        </div>
      </div>
    </div>
  );
}
