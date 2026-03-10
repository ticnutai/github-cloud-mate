import { useRef, useCallback, useState, useEffect } from "react";
import { useViewerStore } from "@/lib/viewerStore";
import * as THREE from "three";

interface JoystickPadProps {
  mode: "move" | "rotate";
}

export default function JoystickPad({ mode }: JoystickPadProps) {
  const lang = useViewerStore((s) => s.lang);
  const selectedMesh = useViewerStore((s) => s.selectedMesh);
  const meshes = useViewerStore((s) => s.meshes);
  const xyz = useViewerStore((s) => s.xyz);

  const padRef = useRef<HTMLDivElement>(null);
  const knobRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const rafRef = useRef<number>(0);
  const deltaRef = useRef({ x: 0, y: 0 });
  const [knobPos, setKnobPos] = useState({ x: 0, y: 0 });
  const [active, setActive] = useState(false);

  const RADIUS = 44;

  const getMesh = useCallback(() => {
    if (!selectedMesh) return null;
    return meshes.find((m) => m.name === selectedMesh) ?? null;
  }, [selectedMesh, meshes]);

  const applyDelta = useCallback(() => {
    const mesh = getMesh();
    if (!mesh || !dragging.current) return;
    const { x, y } = deltaRef.current;
    const sensitivity = mode === "move" ? xyz.moveStep * 0.5 : xyz.rotateStep * 0.3;

    if (mode === "move") {
      mesh.object.position.x += x * sensitivity;
      mesh.object.position.y -= y * sensitivity;
    } else {
      mesh.object.rotation.y += x * THREE.MathUtils.degToRad(sensitivity);
      mesh.object.rotation.x += y * THREE.MathUtils.degToRad(sensitivity);
    }
    rafRef.current = requestAnimationFrame(applyDelta);
  }, [getMesh, mode, xyz.moveStep, xyz.rotateStep]);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    dragging.current = true;
    setActive(true);
    rafRef.current = requestAnimationFrame(applyDelta);
  }, [applyDelta]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging.current || !padRef.current) return;
    const rect = padRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    let dx = e.clientX - cx;
    let dy = e.clientY - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > RADIUS) {
      dx = (dx / dist) * RADIUS;
      dy = (dy / dist) * RADIUS;
    }
    deltaRef.current = { x: dx / RADIUS, y: dy / RADIUS };
    setKnobPos({ x: dx, y: dy });
  }, []);

  const handlePointerUp = useCallback(() => {
    dragging.current = false;
    setActive(false);
    deltaRef.current = { x: 0, y: 0 };
    setKnobPos({ x: 0, y: 0 });
    cancelAnimationFrame(rafRef.current);
  }, []);

  useEffect(() => {
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const label = mode === "move"
    ? (lang === "he" ? "הזזה" : "Move")
    : (lang === "he" ? "סיבוב" : "Rotate");

  return (
    <div className="flex flex-col items-center gap-1.5">
      <span className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">{label}</span>
      <div
        ref={padRef}
        className={`relative w-24 h-24 rounded-full border-2 transition-all duration-150 cursor-grab active:cursor-grabbing select-none ${
          active
            ? "border-gold bg-gold/10 shadow-[0_0_20px_hsl(43_74%_49%/0.3)]"
            : "border-border bg-secondary/50 hover:border-gold/50"
        }`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        {/* Crosshair */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-px h-full bg-border/40 absolute" />
          <div className="h-px w-full bg-border/40 absolute" />
        </div>
        {/* Axis labels */}
        <span className="absolute top-1 left-1/2 -translate-x-1/2 text-[7px] text-muted-foreground pointer-events-none">
          {mode === "move" ? "+Y" : "+RX"}
        </span>
        <span className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[7px] text-muted-foreground pointer-events-none">
          {mode === "move" ? "-Y" : "-RX"}
        </span>
        <span className="absolute left-1 top-1/2 -translate-y-1/2 text-[7px] text-muted-foreground pointer-events-none">
          {mode === "move" ? "-X" : "-RY"}
        </span>
        <span className="absolute right-1 top-1/2 -translate-y-1/2 text-[7px] text-muted-foreground pointer-events-none">
          {mode === "move" ? "+X" : "+RY"}
        </span>
        {/* Knob */}
        <div
          ref={knobRef}
          className={`absolute w-6 h-6 rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-shadow duration-100 pointer-events-none ${
            active
              ? "bg-gold shadow-[0_0_12px_hsl(43_74%_49%/0.6)]"
              : "bg-muted-foreground/60"
          }`}
          style={{
            transform: `translate(calc(-50% + ${knobPos.x}px), calc(-50% + ${knobPos.y}px))`,
          }}
        />
      </div>
      {!selectedMesh && (
        <span className="text-[8px] text-destructive">{lang === "he" ? "בחר איבר" : "Select part"}</span>
      )}
    </div>
  );
}
