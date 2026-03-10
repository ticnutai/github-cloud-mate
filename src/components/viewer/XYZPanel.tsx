import { useViewerStore } from "@/lib/viewerStore";
import * as THREE from "three";

export default function XYZPanel() {
  const lang = useViewerStore((s) => s.lang);
  const xyz = useViewerStore((s) => s.xyz);
  const xyzEnabled = useViewerStore((s) => s.xyzEnabled);
  const toggleXyz = useViewerStore((s) => s.toggleXyz);
  const setXyzMoveStep = useViewerStore((s) => s.setXyzMoveStep);
  const setXyzRotateStep = useViewerStore((s) => s.setXyzRotateStep);
  const setXyzScaleStep = useViewerStore((s) => s.setXyzScaleStep);
  const toggleXyzSnap = useViewerStore((s) => s.toggleXyzSnap);
  const toggleXyzAutoSave = useViewerStore((s) => s.toggleXyzAutoSave);
  const toggleXyzSymmetry = useViewerStore((s) => s.toggleXyzSymmetry);
  const toggleXyzLock = useViewerStore((s) => s.toggleXyzLock);
  const selectedMesh = useViewerStore((s) => s.selectedMesh);
  const meshes = useViewerStore((s) => s.meshes);

  const btn = "px-2 py-1 text-[10px] bg-secondary border border-border rounded hover:bg-accent transition-colors";
  const dirBtn = "px-3 py-1.5 text-[10px] font-mono bg-secondary border border-border rounded hover:bg-primary hover:text-primary-foreground transition-colors";
  const toggle = "flex items-center gap-2 cursor-pointer text-[11px]";
  const label = "text-[10px] text-muted-foreground";
  const status = "text-[10px] text-muted-foreground bg-secondary/50 rounded px-2 py-1";

  const moveMesh = (axis: "x" | "y" | "z", dir: number) => {
    if (!selectedMesh) return;
    const mesh = meshes.find((m) => m.name === selectedMesh);
    if (!mesh || xyz.lockedParts.has(selectedMesh)) return;
    const step = xyz.moveStep * dir;
    if (axis === "x") mesh.object.position.x += step;
    if (axis === "y") mesh.object.position.y += step;
    if (axis === "z") mesh.object.position.z += step;
  };

  const rotateMesh = (axis: "x" | "y" | "z", dir: number) => {
    if (!selectedMesh) return;
    const mesh = meshes.find((m) => m.name === selectedMesh);
    if (!mesh || xyz.lockedParts.has(selectedMesh)) return;
    const step = THREE.MathUtils.degToRad(xyz.rotateStep * dir);
    if (axis === "x") mesh.object.rotation.x += step;
    if (axis === "y") mesh.object.rotation.y += step;
    if (axis === "z") mesh.object.rotation.z += step;
  };

  const scaleMesh = (dir: number) => {
    if (!selectedMesh) return;
    const mesh = meshes.find((m) => m.name === selectedMesh);
    if (!mesh || xyz.lockedParts.has(selectedMesh)) return;
    const factor = 1 + xyz.scaleStep * dir;
    mesh.object.scale.multiplyScalar(factor);
  };

  if (!xyzEnabled) {
    return (
      <div className="flex flex-col gap-2">
        <button onClick={toggleXyz} className={btn}>
          🧭 ▦ XYZ {lang === "he" ? "כבוי" : "OFF"}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="text-xs font-semibold">🧭 XYZ {lang === "he" ? "כיול" : "Calibration"}</div>
        <button onClick={toggleXyz} className={btn}>✕</button>
      </div>

      {/* Steps */}
      <div className="grid grid-cols-3 gap-2">
        <div>
          <span className={label}>{lang === "he" ? "צעד הזזה" : "Move"}</span>
          <input type="number" min="0.001" max="5" step="0.001" value={xyz.moveStep} onChange={(e) => setXyzMoveStep(parseFloat(e.target.value) || 0.02)} className="w-full bg-secondary border border-border rounded px-1.5 py-1 text-[10px] font-mono" />
        </div>
        <div>
          <span className={label}>{lang === "he" ? "סיבוב °" : "Rotate °"}</span>
          <input type="number" min="1" max="45" step="1" value={xyz.rotateStep} onChange={(e) => setXyzRotateStep(parseFloat(e.target.value) || 5)} className="w-full bg-secondary border border-border rounded px-1.5 py-1 text-[10px] font-mono" />
        </div>
        <div>
          <span className={label}>{lang === "he" ? "סקייל" : "Scale"}</span>
          <input type="number" min="0.01" max="0.5" step="0.01" value={xyz.scaleStep} onChange={(e) => setXyzScaleStep(parseFloat(e.target.value) || 0.05)} className="w-full bg-secondary border border-border rounded px-1.5 py-1 text-[10px] font-mono" />
        </div>
      </div>

      {/* Move buttons */}
      <div className="grid grid-cols-6 gap-1">
        <button onClick={() => moveMesh("x", 1)} className={dirBtn}>+X</button>
        <button onClick={() => moveMesh("x", -1)} className={dirBtn}>-X</button>
        <button onClick={() => moveMesh("y", 1)} className={dirBtn}>+Y</button>
        <button onClick={() => moveMesh("y", -1)} className={dirBtn}>-Y</button>
        <button onClick={() => moveMesh("z", 1)} className={dirBtn}>+Z</button>
        <button onClick={() => moveMesh("z", -1)} className={dirBtn}>-Z</button>
      </div>

      {/* Rotate buttons */}
      <div className="grid grid-cols-6 gap-1">
        <button onClick={() => rotateMesh("x", 1)} className={dirBtn}>+RX</button>
        <button onClick={() => rotateMesh("x", -1)} className={dirBtn}>-RX</button>
        <button onClick={() => rotateMesh("y", 1)} className={dirBtn}>+RY</button>
        <button onClick={() => rotateMesh("y", -1)} className={dirBtn}>-RY</button>
        <button onClick={() => rotateMesh("z", 1)} className={dirBtn}>+RZ</button>
        <button onClick={() => rotateMesh("z", -1)} className={dirBtn}>-RZ</button>
      </div>

      {/* Scale */}
      <div className="flex gap-1">
        <button onClick={() => scaleMesh(1)} className={dirBtn}>Scale +</button>
        <button onClick={() => scaleMesh(-1)} className={dirBtn}>Scale -</button>
      </div>

      {/* Toggles */}
      <div className="flex flex-wrap gap-3">
        <label className={toggle}>
          <input type="checkbox" checked={xyz.snap} onChange={toggleXyzSnap} className="accent-primary w-3 h-3" />
          Snap
        </label>
        <label className={toggle}>
          <input type="checkbox" checked={xyz.autoSave} onChange={toggleXyzAutoSave} className="accent-primary w-3 h-3" />
          Auto
        </label>
        <label className={toggle}>
          <input type="checkbox" checked={xyz.symmetry} onChange={toggleXyzSymmetry} className="accent-primary w-3 h-3" />
          Sym
        </label>
      </div>

      {/* Lock */}
      {selectedMesh && (
        <button onClick={() => toggleXyzLock(selectedMesh)} className={btn}>
          {xyz.lockedParts.has(selectedMesh) ? "🔒 " : "🔓 "}
          {lang === "he" ? (xyz.lockedParts.has(selectedMesh) ? "נעול" : "נעל איבר") : (xyz.lockedParts.has(selectedMesh) ? "Locked" : "Lock Part")}
        </button>
      )}

      {/* Actions */}
      <div className="flex gap-1 flex-wrap">
        <button className={btn}>Undo</button>
        <button className={btn}>Redo</button>
        <button className={btn}>{lang === "he" ? "אפס מיקום" : "Reset Position"}</button>
      </div>

      <div className={status}>
        XYZ: {selectedMesh ? selectedMesh : (lang === "he" ? "בחר איבר להזזה" : "Select a part")}
      </div>
    </div>
  );
}
