import { useState, useRef, useCallback } from "react";
import { useViewerStore } from "@/lib/viewerStore";
import * as THREE from "three";

const XYZ_SLOTS_KEY = "open3d-xyz-slots";

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
  const setSelectedMesh = useViewerStore((s) => s.setSelectedMesh);
  const gridVisible = useViewerStore((s) => s.gridVisible);
  const toggleGrid = useViewerStore((s) => s.toggleGrid);

  const [gridMode, setGridMode] = useState("all");
  const [gridStyle, setGridStyle] = useState("classic");
  const [gridSize, setGridSize] = useState(2.6);
  const [gridDivisions, setGridDivisions] = useState(26);
  const [posX, setPosX] = useState("");
  const [posY, setPosY] = useState("");
  const [posZ, setPosZ] = useState("");
  const [slot, setSlot] = useState("1");
  const [axisLock, setAxisLock] = useState({ x: false, y: false, z: false });

  // Undo/Redo stacks (local)
  const undoStack = useRef<{ name: string; pos: [number,number,number]; rot: [number,number,number]; scale: number }[]>([]);
  const redoStack = useRef<{ name: string; pos: [number,number,number]; rot: [number,number,number]; scale: number }[]>([]);

  const btn = "px-2 py-1 text-[10px] bg-secondary border border-border rounded hover:bg-accent transition-colors";
  const dirBtn = "px-2.5 py-1.5 text-[10px] font-mono bg-secondary border border-border rounded hover:bg-primary hover:text-primary-foreground transition-colors";
  const toggle = "flex items-center gap-2 cursor-pointer text-[10px]";
  const label = "text-[10px] text-muted-foreground font-medium";
  const input = "w-full bg-secondary border border-border rounded px-2 py-1 text-[10px] font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-gold/40";
  const select = "w-full bg-secondary border border-border rounded px-2 py-1 text-[10px] text-foreground focus:outline-none focus:ring-1 focus:ring-gold/40";
  const status = "text-[10px] text-muted-foreground bg-secondary/50 rounded px-2 py-1";

  const getMesh = () => selectedMesh ? meshes.find((m) => m.name === selectedMesh) : null;

  const saveUndoState = () => {
    const mesh = getMesh();
    if (!mesh) return;
    const obj = mesh.object;
    undoStack.current.push({
      name: mesh.name,
      pos: [obj.position.x, obj.position.y, obj.position.z],
      rot: [obj.rotation.x, obj.rotation.y, obj.rotation.z],
      scale: obj.scale.x,
    });
    redoStack.current = [];
  };

  const moveMesh = (axis: "x" | "y" | "z", dir: number) => {
    const mesh = getMesh();
    if (!mesh || xyz.lockedParts.has(selectedMesh!) || axisLock[axis]) return;
    saveUndoState();
    mesh.object.position[axis] += xyz.moveStep * dir;
  };

  const rotateMesh = (axis: "x" | "y" | "z", dir: number) => {
    const mesh = getMesh();
    if (!mesh || xyz.lockedParts.has(selectedMesh!)) return;
    saveUndoState();
    mesh.object.rotation[axis] += THREE.MathUtils.degToRad(xyz.rotateStep * dir);
  };

  const scaleMesh = (dir: number) => {
    const mesh = getMesh();
    if (!mesh || xyz.lockedParts.has(selectedMesh!)) return;
    saveUndoState();
    mesh.object.scale.multiplyScalar(1 + xyz.scaleStep * dir);
  };

  const handleUndo = () => {
    if (undoStack.current.length === 0) return;
    const state = undoStack.current.pop()!;
    const mesh = meshes.find(m => m.name === state.name);
    if (!mesh) return;
    const obj = mesh.object;
    redoStack.current.push({
      name: state.name,
      pos: [obj.position.x, obj.position.y, obj.position.z],
      rot: [obj.rotation.x, obj.rotation.y, obj.rotation.z],
      scale: obj.scale.x,
    });
    obj.position.set(...state.pos);
    obj.rotation.set(...state.rot);
    obj.scale.setScalar(state.scale);
  };

  const handleRedo = () => {
    if (redoStack.current.length === 0) return;
    const state = redoStack.current.pop()!;
    const mesh = meshes.find(m => m.name === state.name);
    if (!mesh) return;
    const obj = mesh.object;
    undoStack.current.push({
      name: state.name,
      pos: [obj.position.x, obj.position.y, obj.position.z],
      rot: [obj.rotation.x, obj.rotation.y, obj.rotation.z],
      scale: obj.scale.x,
    });
    obj.position.set(...state.pos);
    obj.rotation.set(...state.rot);
    obj.scale.setScalar(state.scale);
  };

  const applyNumericXYZ = () => {
    const mesh = getMesh();
    if (!mesh) return;
    saveUndoState();
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

  const handleResetMesh = () => {
    const mesh = getMesh();
    if (!mesh) return;
    saveUndoState();
    mesh.object.position.set(0, 0, 0);
    mesh.object.rotation.set(0, 0, 0);
    mesh.object.scale.set(1, 1, 1);
  };

  const handleAlignX = () => {
    const mesh = getMesh();
    if (!mesh) return;
    saveUndoState();
    mesh.object.position.x = 0;
    mesh.object.rotation.y = 0;
    mesh.object.rotation.z = 0;
  };

  // Navigate prev/next mesh
  const handlePrev = () => {
    if (!selectedMesh) return;
    const idx = meshes.findIndex(m => m.name === selectedMesh);
    if (idx > 0) setSelectedMesh(meshes[idx - 1].name);
  };
  const handleNext = () => {
    if (!selectedMesh) return;
    const idx = meshes.findIndex(m => m.name === selectedMesh);
    if (idx < meshes.length - 1) setSelectedMesh(meshes[idx + 1].name);
  };

  // Slots (localStorage)
  const handleSaveSlot = () => {
    const mesh = getMesh();
    if (!mesh) return;
    const obj = mesh.object;
    try {
      const slots = JSON.parse(localStorage.getItem(XYZ_SLOTS_KEY) || "{}");
      slots[slot] = {
        name: mesh.name,
        pos: [obj.position.x, obj.position.y, obj.position.z],
        rot: [obj.rotation.x, obj.rotation.y, obj.rotation.z],
        scale: obj.scale.x,
      };
      localStorage.setItem(XYZ_SLOTS_KEY, JSON.stringify(slots));
    } catch {}
  };

  const handleLoadSlot = () => {
    try {
      const slots = JSON.parse(localStorage.getItem(XYZ_SLOTS_KEY) || "{}");
      const data = slots[slot];
      if (!data) return;
      const mesh = meshes.find(m => m.name === data.name);
      if (!mesh) return;
      saveUndoState();
      mesh.object.position.set(...(data.pos as [number,number,number]));
      mesh.object.rotation.set(...(data.rot as [number,number,number]));
      mesh.object.scale.setScalar(data.scale);
      setSelectedMesh(data.name);
    } catch {}
  };

  const handleClearSlot = () => {
    try {
      const slots = JSON.parse(localStorage.getItem(XYZ_SLOTS_KEY) || "{}");
      delete slots[slot];
      localStorage.setItem(XYZ_SLOTS_KEY, JSON.stringify(slots));
    } catch {}
  };

  const handleExportCalibrations = () => {
    const data: Record<string, any> = {};
    meshes.forEach(m => {
      const obj = m.object;
      data[m.name] = {
        pos: [obj.position.x, obj.position.y, obj.position.z],
        rot: [obj.rotation.x, obj.rotation.y, obj.rotation.z],
        scale: obj.scale.x,
      };
    });
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const link = document.createElement("a");
    link.download = "xyz-calibrations.json";
    link.href = URL.createObjectURL(blob);
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const handleImportCalibrations = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const data = JSON.parse(reader.result as string);
          Object.entries(data).forEach(([name, val]: [string, any]) => {
            const mesh = meshes.find(m => m.name === name);
            if (mesh) {
              mesh.object.position.set(...(val.pos as [number,number,number]));
              mesh.object.rotation.set(...(val.rot as [number,number,number]));
              mesh.object.scale.setScalar(val.scale);
            }
          });
        } catch {}
      };
      reader.readAsText(file);
    };
    input.click();
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
        <label className={toggle}><input type="checkbox" checked={gridVisible} onChange={toggleGrid} className="accent-primary w-3 h-3" />Grid</label>
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

      {/* Lock part + navigate */}
      {selectedMesh && (
        <div className="flex gap-1">
          <button onClick={() => toggleXyzLock(selectedMesh)} className={btn}>
            {xyz.lockedParts.has(selectedMesh) ? "🔒 " : "🔓 "}{lang === "he" ? (xyz.lockedParts.has(selectedMesh) ? "נעול" : "נעל איבר") : "Lock"}
          </button>
          <button onClick={handlePrev} className={btn}>{lang === "he" ? "איבר קודם" : "Prev"}</button>
          <button onClick={handleNext} className={btn}>{lang === "he" ? "איבר הבא" : "Next"}</button>
        </div>
      )}

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
          <button onClick={handleSaveSlot} className={btn}>{lang === "he" ? "שמור" : "Save"}</button>
          <button onClick={handleLoadSlot} className={btn}>{lang === "he" ? "טען" : "Load"}</button>
          <button onClick={handleClearSlot} className={btn}>{lang === "he" ? "נקה" : "Clear"}</button>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-1 flex-wrap">
        <button onClick={handleResetMesh} className={btn}>{lang === "he" ? "אפס מיקום" : "Reset"}</button>
        <button onClick={handleAlignX} className={btn}>{lang === "he" ? "יישור X" : "Align X"}</button>
      </div>
      <div className="flex gap-1 flex-wrap">
        <button onClick={handleUndo} disabled={undoStack.current.length === 0} className={`${btn} ${undoStack.current.length === 0 ? "opacity-50" : ""}`}>Undo</button>
        <button onClick={handleRedo} disabled={redoStack.current.length === 0} className={`${btn} ${redoStack.current.length === 0 ? "opacity-50" : ""}`}>Redo</button>
        <button onClick={handleExportCalibrations} className={btn}>{lang === "he" ? "ייצוא כיולים" : "Export"}</button>
        <button onClick={handleImportCalibrations} className={btn}>{lang === "he" ? "ייבוא כיולים" : "Import"}</button>
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
