import { useViewerStore } from "@/lib/viewerStore";
import { ZoomIn, ZoomOut, RotateCcw, Crosshair, Star, StarOff } from "lucide-react";

interface CameraControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetView: () => void;
  onFocusSelected: () => void;
  onSetAngle: (angle: "front" | "side" | "top") => void;
}

export default function CameraControls({ onZoomIn, onZoomOut, onResetView, onFocusSelected, onSetAngle }: CameraControlsProps) {
  const lang = useViewerStore((s) => s.lang);

  const btn = "px-2 py-1.5 text-[10px] bg-secondary border border-border rounded hover:bg-accent transition-colors";

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-1 flex-wrap">
        <button onClick={onZoomIn} className={btn} title="Zoom In">
          <ZoomIn className="w-3.5 h-3.5 inline" /> +
        </button>
        <button onClick={onZoomOut} className={btn} title="Zoom Out">
          <ZoomOut className="w-3.5 h-3.5 inline" /> -
        </button>
        <button onClick={onFocusSelected} className={btn}>
          <Crosshair className="w-3.5 h-3.5 inline mr-1" />
          {lang === "he" ? "מיקוד" : "Focus"}
        </button>
        <button onClick={onResetView} className={btn}>
          <RotateCcw className="w-3.5 h-3.5 inline mr-1" />
          {lang === "he" ? "איפוס" : "Reset"}
        </button>
      </div>
      <div className="flex gap-1 flex-wrap">
        <button onClick={() => onSetAngle("front")} className={btn}>
          {lang === "he" ? "חזית" : "Front"}
        </button>
        <button onClick={() => onSetAngle("side")} className={btn}>
          {lang === "he" ? "צד" : "Side"}
        </button>
        <button onClick={() => onSetAngle("top")} className={btn}>
          {lang === "he" ? "מלמעלה" : "Top"}
        </button>
      </div>
    </div>
  );
}
