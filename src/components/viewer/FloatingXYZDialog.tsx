import { useRef, useState, useCallback } from "react";
import { X, GripHorizontal, Minimize2, Maximize2 } from "lucide-react";
import { useViewerStore } from "@/lib/viewerStore";
import JoystickPad from "./JoystickPad";

export default function FloatingXYZDialog({ onClose }: { onClose: () => void }) {
  const lang = useViewerStore((s) => s.lang);
  const selectedMesh = useViewerStore((s) => s.selectedMesh);
  const meshes = useViewerStore((s) => s.meshes);
  const xyz = useViewerStore((s) => s.xyz);
  const setXyzMoveStep = useViewerStore((s) => s.setXyzMoveStep);
  const setXyzRotateStep = useViewerStore((s) => s.setXyzRotateStep);

  const [minimized, setMinimized] = useState(false);
  const [pos, setPos] = useState({ x: 60, y: 80 });
  const dragRef = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  const mesh = selectedMesh ? meshes.find((m) => m.name === selectedMesh) : null;

  const handleDragStart = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = { startX: e.clientX, startY: e.clientY, origX: pos.x, origY: pos.y };
  }, [pos]);

  const handleDragMove = useCallback((e: React.PointerEvent) => {
    if (!dragRef.current) return;
    setPos({
      x: dragRef.current.origX + (e.clientX - dragRef.current.startX),
      y: dragRef.current.origY + (e.clientY - dragRef.current.startY),
    });
  }, []);

  const handleDragEnd = useCallback(() => {
    dragRef.current = null;
  }, []);

  const isRtl = lang === "he";

  return (
    <div
      ref={dialogRef}
      className="fixed z-50 shadow-2xl rounded-xl overflow-hidden border-2 border-gold/60 bg-card/95 backdrop-blur-md select-none"
      style={{ left: pos.x, top: pos.y, width: minimized ? 200 : 320 }}
    >
      {/* Title bar */}
      <div
        className="flex items-center justify-between px-3 py-2 bg-gradient-to-r from-primary/10 to-gold/10 cursor-grab active:cursor-grabbing"
        onPointerDown={handleDragStart}
        onPointerMove={handleDragMove}
        onPointerUp={handleDragEnd}
        onPointerCancel={handleDragEnd}
      >
        <div className="flex items-center gap-2">
          <GripHorizontal className="w-3.5 h-3.5 text-gold" />
          <span className="text-[11px] font-bold text-foreground">🧭 XYZ {isRtl ? "ג'ויסטיק" : "Joystick"}</span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setMinimized(!minimized)} className="p-1 rounded hover:bg-accent transition-colors">
            {minimized ? <Maximize2 className="w-3 h-3 text-foreground" /> : <Minimize2 className="w-3 h-3 text-foreground" />}
          </button>
          <button onClick={onClose} className="p-1 rounded hover:bg-destructive/20 transition-colors">
            <X className="w-3 h-3 text-foreground" />
          </button>
        </div>
      </div>

      {!minimized && (
        <div className="p-3 space-y-3">
          {/* Selected part */}
          <div className="text-[10px] text-center font-mono bg-secondary/60 rounded-lg px-2 py-1.5 border border-border/60">
            {selectedMesh || (isRtl ? "— בחר איבר —" : "— Select part —")}
          </div>

          {/* Joysticks */}
          <div className="flex justify-center gap-4">
            <JoystickPad mode="move" />
            <JoystickPad mode="rotate" />
          </div>

          {/* Sensitivity */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-[9px] text-muted-foreground">{isRtl ? "רגישות הזזה" : "Move sens."}</span>
              <input
                type="range" min="0.005" max="0.2" step="0.005"
                value={xyz.moveStep}
                onChange={(e) => setXyzMoveStep(parseFloat(e.target.value))}
                className="w-full accent-gold h-1"
              />
            </div>
            <div>
              <span className="text-[9px] text-muted-foreground">{isRtl ? "רגישות סיבוב" : "Rot. sens."}</span>
              <input
                type="range" min="1" max="30" step="1"
                value={xyz.rotateStep}
                onChange={(e) => setXyzRotateStep(parseFloat(e.target.value))}
                className="w-full accent-gold h-1"
              />
            </div>
          </div>

          {/* Live position readout */}
          {mesh && (
            <div className="grid grid-cols-3 gap-1 text-[9px] font-mono text-muted-foreground bg-secondary/40 rounded-lg px-2 py-1.5">
              <span>X: {mesh.object.position.x.toFixed(3)}</span>
              <span>Y: {mesh.object.position.y.toFixed(3)}</span>
              <span>Z: {mesh.object.position.z.toFixed(3)}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
