import { useState } from "react";
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

  const [gridMode, setGridMode] = useState("all");
  const [gridStyle, setGridStyle] = useState("classic");
  const [gridSize, setGridSize] = useState(2.6);
  const [gridDivisions, setGridDivisions] = useState(26);
  const [posX, setPosX] = useState("");
  const [posY, setPosY] = useState("");
  const [posZ, setPosZ] = useState("");
  const [slot, setSlot] = useState("1");
  const [axisLock, setAxisLock] = useState({ x: false, y: false, z: false });

  const btn = "px-2 py-1 text-[10px] bg-secondary border border-border rounded hover:bg-accent transition-colors";
  const dirBtn = "px-2.5 py-1.5 text-[10px] font-mono bg-secondary border border-border rounded hover:bg-primary hover:text-primary-foreground transition-colors";
  const toggle = "flex items-center gap-2 cursor-pointer text-[10px]";
  const label = "text-[10px] text-muted-foreground font-medium";
  const input = "w-full bg-secondary border border-border rounded px-2 py-1 text-[10px] font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-gold/40";
  const select = "w-full bg-secondary border border-border rounded px-2 py-1 text-[10px] text-foreground focus:outline-none focus:ring-1 focus:ring-gold/40";
  const status = "text-[10px] text-muted-foreground bg-secondary/50 rounded px-2 py-1";

  const getMesh = () => selectedMesh ? meshes.find((m) => m.name === selectedMesh) : null;

  const moveMesh = (axis: "x" | "y" | "z", dir: number) => {
    const mesh = getMesh();
    if (!mesh || xyz.lockedParts.has(selectedMesh!) || axisLock[axis]) return;
    const step = xyz.moveStep * dir;
    mesh.object.position[axis] += step;
  };

  const rotateMesh = (axis: "x" | "y" | "z", dir: number) => {
    const mesh = getMesh();
    if (!mesh || xyz.lockedParts.has(selectedMesh!)) return;
    mesh.object.rotation[axis] += THREE.MathUtils.degToRad(xyz.rotateStep * dir);
  };

  const scaleMesh = (dir: number) => {
    const mesh = getMesh();
    if (!mesh || xyz.lockedParts.has(selectedMesh!)) return;
    mesh.object.scale.multiplyScalar(1 + xyz.scaleStep * dir);
  };

  const applyNumericXYZ = () => {
    const mesh = getMesh();
    if (!mesh) return;
    if (posX) mesh.object.position.x = parseFloat(posX);
    if (posY) mesh.object.position.y = parseFloat(posY);
    if (posZ) mesh.object.position.z = parseFloat(posZ);
  };

  const readPosition = () => {
    const mesh = getMesh();
    if (!mesh) return;
    setPosX(mesh.object.position.x.toFixed(4));
    setPosY(mesh.object.position.y.toFixed(4));
    setPosZ(mesh.object.position.z.toFixed(4));
  };

  if (!xyzEnabled) {
    return (
      <div className="flex flex-col gap-2">
        <button onClick={toggleXyz} className={`${btn} flex items-center gap-1.5`}>
          🧭 ▦ XYZ {lang === "he" ? "כבוי" : "OFF"}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center justify-between">
        <div className="text-xs font-semibold">🧭 XYZ {lang === "he" ? "כיול" : "Calibration"}</div>
        <button onClick={toggleXyz} className={btn}>✕</button>
      </div>

      {/* Steps */}
      <div className="grid grid-cols-3 gap-1.5">
        <div>
          <span className={label}>{lang === "he" ? "הזזה" : "Move"}</span>
          <input type="number" min="0.001" max="5" step="0.001" value={xyz.moveStep} onChange={(e) => setXyzMoveStep(parseFloat(e.target.value) || 0.02)} className={input} />
        </div>
        <div>
          <span className={label}>{lang === "he" ? "סיבוב°" : "Rot°"}</span>
          <input type="number" min="1" max="45" step="1" value={xyz.rotateStep} onChange={(e) => setXyzRotateStep(parseFloat(e.target.value) || 5)} className={input} />
        </div>
        <div>
          <span className={label}>{lang === "he" ? "סקייל" : "Scale"}</span>
          <input type="number" min="0.01" max="0.5" step="0.01" value={xyz.scaleStep} onChange={(e) => setXyzScaleStep(parseFloat(e.target.value) || 0.05)} className={input} />
        </div>
      </div>

      {/* Move buttons */}
      <div className="grid grid-cols-6 gap-1">
        {(["x", "y", "z"] as const).flatMap((axis) => [
          <button key={`+${axis}`} onClick={() => moveMesh(axis, 1)} className={`${dirBtn} ${axisLock[axis] ? "opacity-30" : ""}`}>+{axis.toUpperCase()}</button>,
          <button key={`-${axis}`} onClick={() => moveMesh(axis, -1)} className={`${dirBtn} ${axisLock[axis] ? "opacity-30" : ""}`}>-{axis.toUpperCase()}</button>,
        ])}
      </div>

      {/* Rotate buttons */}
      <div className="grid grid-cols-6 gap-1">
        {(["x", "y", "z"] as const).flatMap((axis) => [
          <button key={`+R${axis}`} onClick={() => rotateMesh(axis, 1)} className={dirBtn}>+R{axis.toUpperCase()}</button>,
          <button key={`-R${axis}`} onClick={() => rotateMesh(axis, -1)} className={dirBtn}>-R{axis.toUpperCase()}</button>,
        ])}
      </div>

      {/* Scale */}
      <div className="flex gap-1">
        <button onClick={() => scaleMesh(1)} className={dirBtn}>Scale +</button>
        <button onClick={() => scaleMesh(-1)} className={dirBtn}>Scale -</button>
      </div>

      {/* Toggles */}
      <div className="flex flex-wrap gap-2">
        <label className={toggle}><input type="checkbox" checked={xyz.snap} onChange={toggleXyzSnap} className="accent-primary w-3 h-3" />Snap</label>
        <label className={toggle}><input type="checkbox" checked={xyz.autoSave} onChange={toggleXyzAutoSave} className="accent-primary w-3 h-3" />Auto</label>
        <label className={toggle}><input type="checkbox" checked={xyz.symmetry} onChange={toggleXyzSymmetry} className="accent-primary w-3 h-3" />Sym</label>
      </div>

      {/* Axis locks */}
      <div className="flex gap-2">
        {(["x", "y", "z"] as const).map((axis) => (
          <label key={axis} className={toggle}>
            <input type="checkbox" checked={axisLock[axis]} onChange={() => setAxisLock({ ...axisLock, [axis]: !axisLock[axis] })} className="accent-destructive w-3 h-3" />
            Lock {axis.toUpperCase()}
          </label>
        ))}
      </div>

      {/* Lock part */}
      {selectedMesh && (
        <div className="flex gap-1">
          <button onClick={() => toggleXyzLock(selectedMesh)} className={btn}>
            {xyz.lockedParts.has(selectedMesh) ? "🔒 " : "🔓 "}{lang === "he" ? (xyz.lockedParts.has(selectedMesh) ? "נעול" : "נעל איבר") : "Lock"}
          </button>
          <button className={btn}>{lang === "he" ? "איבר קודם" : "Prev"}</button>
          <button className={btn}>{lang === "he" ? "איבר הבא" : "Next"}</button>
        </div>
      )}

      {/* Grid controls */}
      <div className="border-t border-border pt-2">
        <span className={`${label} font-semibold`}>▦ Grid</span>
        <div className="grid grid-cols-2 gap-1.5 mt-1">
          <select value={gridMode} onChange={(e) => setGridMode(e.target.value)} className={select}>
            <option value="all">All Planes</option>
            <option value="xy">XY Only</option>
            <option value="xz">XZ Only</option>
            <option value="yz">YZ Only</option>
            <option value="z-only">Z Axis Only</option>
          </select>
          <select value={gridStyle} onChange={(e) => setGridStyle(e.target.value)} className={select}>
            <option value="classic">Classic</option>
            <option value="surgical">Surgical</option>
            <option value="neon">Neon</option>
          </select>
        </div>
        <div className="flex items-center gap-2 mt-1.5">
          <span className={label}>Size</span>
          <input type="range" min="1.2" max="6" step="0.1" value={gridSize} onChange={(e) => setGridSize(parseFloat(e.target.value))} className="flex-1 accent-gold h-1" />
          <span className="text-[9px] text-muted-foreground w-6">{gridSize}</span>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <span className={label}>Div</span>
          <input type="range" min="8" max="80" step="2" value={gridDivisions} onChange={(e) => setGridDivisions(parseInt(e.target.value))} className="flex-1 accent-gold h-1" />
          <span className="text-[9px] text-muted-foreground w-6">{gridDivisions}</span>
        </div>
      </div>

      {/* Numeric XYZ */}
      <div className="border-t border-border pt-2">
        <div className="flex items-center justify-between mb-1">
          <span className={`${label} font-semibold`}>{lang === "he" ? "מיקום מספרי" : "Numeric XYZ"}</span>
          <button onClick={readPosition} className={btn}>{lang === "he" ? "קרא מיקום" : "Read"}</button>
        </div>
        <div className="grid grid-cols-3 gap-1">
          <div><span className={label}>X</span><input value={posX} onChange={(e) => setPosX(e.target.value)} className={input} /></div>
          <div><span className={label}>Y</span><input value={posY} onChange={(e) => setPosY(e.target.value)} className={input} /></div>
          <div><span className={label}>Z</span><input value={posZ} onChange={(e) => setPosZ(e.target.value)} className={input} /></div>
        </div>
        <button onClick={applyNumericXYZ} className={`${btn} mt-1 w-full`}>{lang === "he" ? "החל XYZ" : "Apply XYZ"}</button>
      </div>

      {/* Calibration Slots */}
      <div className="border-t border-border pt-2">
        <span className={`${label} font-semibold`}>{lang === "he" ? "סלוטים" : "Slots"}</span>
        <div className="flex gap-1 items-center mt-1">
          <select value={slot} onChange={(e) => setSlot(e.target.value)} className="w-12 bg-secondary border border-border rounded px-1 py-1 text-[10px]">
            <option value="1">1</option><option value="2">2</option><option value="3">3</option>
          </select>
          <button className={btn}>{lang === "he" ? "שמור" : "Save"}</button>
          <button className={btn}>{lang === "he" ? "טען" : "Load"}</button>
          <button className={btn}>{lang === "he" ? "נקה" : "Clear"}</button>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-1 flex-wrap">
        <button className={btn}>{lang === "he" ? "אפס מיקום" : "Reset"}</button>
        <button className={btn}>{lang === "he" ? "שחזור שמור" : "Restore"}</button>
        <button className={btn}>{lang === "he" ? "שמור כיול" : "Save Cal"}</button>
        <button className={btn}>{lang === "he" ? "יישור X" : "Align X"}</button>
      </div>
      <div className="flex gap-1 flex-wrap">
        <button className={btn}>Undo</button>
        <button className={btn}>Redo</button>
        <button className={btn}>{lang === "he" ? "ייצוא כיולים" : "Export"}</button>
        <button className={btn}>{lang === "he" ? "ייבוא כיולים" : "Import"}</button>
      </div>

      <div className="text-[9px] text-muted-foreground bg-secondary/30 rounded px-2 py-1 font-mono">
        Shortcuts: Ctrl+Z/Y, [/], Arrows, PgUp/Dn, +/-, L, S
      </div>

      <div className={status}>
        XYZ: {selectedMesh || (lang === "he" ? "בחר איבר להזזה" : "Select a part")}
      </div>
    </div>
  );
}
