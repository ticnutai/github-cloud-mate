import { useViewerStore } from "@/lib/viewerStore";

interface PartDetailsDialogProps {
  onClose: () => void;
}

export default function PartDetailsDialog({ onClose }: PartDetailsDialogProps) {
  const lang = useViewerStore((s) => s.lang);
  const selectedMesh = useViewerStore((s) => s.selectedMesh);
  const meshes = useViewerStore((s) => s.meshes);
  const toggleXyz = useViewerStore((s) => s.toggleXyz);

  const mesh = meshes.find((m) => m.name === selectedMesh);

  if (!mesh) return null;

  const pos = mesh.object.position;
  const rot = mesh.object.rotation;
  const scl = mesh.object.scale;

  const tabs = [
    { id: "info", label: lang === "he" ? "מידע" : "Info" },
    { id: "animations", label: lang === "he" ? "אנימציות" : "Animations" },
    { id: "images", label: lang === "he" ? "תמונות" : "Images" },
    { id: "videos", label: lang === "he" ? "וידאו" : "Videos" },
  ];

  const btn = "px-3 py-1.5 text-[11px] bg-secondary border border-border rounded hover:bg-accent transition-colors";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
      <div
        className="bg-card border border-border rounded-lg p-5 max-w-lg w-full mx-4 max-h-[80vh] overflow-y-auto shadow-2xl"
        dir={lang === "he" ? "rtl" : "ltr"}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-sm font-semibold mb-3">{lang === "he" ? "פרטי איבר" : "Part Details"}: {mesh.name}</h3>

        {/* Tabs */}
        <div className="flex gap-1 mb-4 border-b border-border pb-2">
          {tabs.map((tab) => (
            <button key={tab.id} className={`px-3 py-1 text-[11px] rounded-t ${tab.id === "info" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:bg-accent"}`}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Info tab */}
        <div className="space-y-2 text-xs">
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-secondary/50 rounded p-2">
              <span className="text-muted-foreground block">{lang === "he" ? "שם" : "Name"}</span>
              <span className="font-mono">{mesh.name}</span>
            </div>
            <div className="bg-secondary/50 rounded p-2">
              <span className="text-muted-foreground block">{lang === "he" ? "נראה" : "Visible"}</span>
              <span>{mesh.visible ? "✅" : "❌"}</span>
            </div>
          </div>
          <div className="bg-secondary/50 rounded p-2">
            <span className="text-muted-foreground block mb-1">Position</span>
            <span className="font-mono text-[10px]">X: {pos.x.toFixed(4)} Y: {pos.y.toFixed(4)} Z: {pos.z.toFixed(4)}</span>
          </div>
          <div className="bg-secondary/50 rounded p-2">
            <span className="text-muted-foreground block mb-1">Rotation</span>
            <span className="font-mono text-[10px]">X: {rot.x.toFixed(4)} Y: {rot.y.toFixed(4)} Z: {rot.z.toFixed(4)}</span>
          </div>
          <div className="bg-secondary/50 rounded p-2">
            <span className="text-muted-foreground block mb-1">Scale</span>
            <span className="font-mono text-[10px]">X: {scl.x.toFixed(4)} Y: {scl.y.toFixed(4)} Z: {scl.z.toFixed(4)}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-4 flex-wrap">
          <button onClick={() => { toggleXyz(); onClose(); }} className={btn}>
            {lang === "he" ? "פתח כלי XYZ" : "Open XYZ"}
          </button>
          <button onClick={onClose} className={`${btn} bg-primary text-primary-foreground`}>
            {lang === "he" ? "סגור" : "Close"}
          </button>
        </div>
      </div>
    </div>
  );
}
