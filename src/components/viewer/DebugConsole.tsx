import { useState, useEffect, useRef } from "react";
import { X, GripHorizontal, Minimize2, Maximize2, Trash2 } from "lucide-react";
import { useViewerStore } from "@/lib/viewerStore";

interface LogEntry {
  time: string;
  type: "info" | "warn" | "action" | "mesh";
  msg: string;
}

export default function DebugConsole({ onClose }: { onClose: () => void }) {
  const lang = useViewerStore((s) => s.lang);
  const selectedMesh = useViewerStore((s) => s.selectedMesh);
  const hoveredMesh = useViewerStore((s) => s.hoveredMesh);
  const meshes = useViewerStore((s) => s.meshes);
  const xrayEnabled = useViewerStore((s) => s.xrayEnabled);
  const animationType = useViewerStore((s) => s.animationType);
  const loading = useViewerStore((s) => s.loading);

  const [minimized, setMinimized] = useState(false);
  const [pos, setPos] = useState({ x: 60, y: 400 });
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [fps, setFps] = useState(0);
  const [tab, setTab] = useState<"log" | "scene" | "state">("log");
  const dragRef = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);
  const fpsFrames = useRef(0);
  const fpsTime = useRef(performance.now());

  const addLog = (type: LogEntry["type"], msg: string) => {
    const time = new Date().toLocaleTimeString("en", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" });
    setLogs((prev) => [...prev.slice(-99), { time, type, msg }]);
  };

  // Track state changes
  useEffect(() => { addLog("action", `Selected: ${selectedMesh || "none"}`); }, [selectedMesh]);
  useEffect(() => { if (xrayEnabled) addLog("info", "X-Ray ON"); else addLog("info", "X-Ray OFF"); }, [xrayEnabled]);
  useEffect(() => { addLog("info", `Animation: ${animationType}`); }, [animationType]);
  useEffect(() => { addLog("info", loading ? "Loading model..." : "Model loaded"); }, [loading]);

  // FPS counter
  useEffect(() => {
    let running = true;
    const tick = () => {
      if (!running) return;
      fpsFrames.current++;
      const now = performance.now();
      if (now - fpsTime.current >= 1000) {
        setFps(fpsFrames.current);
        fpsFrames.current = 0;
        fpsTime.current = now;
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    return () => { running = false; };
  }, []);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const handleDragStart = (e: React.PointerEvent) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = { startX: e.clientX, startY: e.clientY, origX: pos.x, origY: pos.y };
  };
  const handleDragMove = (e: React.PointerEvent) => {
    if (!dragRef.current) return;
    setPos({
      x: dragRef.current.origX + (e.clientX - dragRef.current.startX),
      y: dragRef.current.origY + (e.clientY - dragRef.current.startY),
    });
  };
  const handleDragEnd = () => { dragRef.current = null; };

  const mesh = selectedMesh ? meshes.find((m) => m.name === selectedMesh) : null;
  const isRtl = lang === "he";

  const typeColor: Record<LogEntry["type"], string> = {
    info: "text-blue-400",
    warn: "text-yellow-400",
    action: "text-green-400",
    mesh: "text-purple-400",
  };

  return (
    <div
      className="fixed z-50 shadow-2xl rounded-xl overflow-hidden border border-border bg-[hsl(220_20%_10%/0.95)] backdrop-blur-md select-none font-mono"
      style={{ left: pos.x, top: pos.y, width: minimized ? 200 : 380 }}
    >
      {/* Title bar */}
      <div
        className="flex items-center justify-between px-3 py-1.5 bg-[hsl(220_15%_15%)] cursor-grab active:cursor-grabbing"
        onPointerDown={handleDragStart}
        onPointerMove={handleDragMove}
        onPointerUp={handleDragEnd}
        onPointerCancel={handleDragEnd}
      >
        <div className="flex items-center gap-2">
          <GripHorizontal className="w-3 h-3 text-muted-foreground" />
          <span className="text-[10px] font-bold text-green-400">⚡ Debug Console</span>
          <span className="text-[9px] text-yellow-300 bg-yellow-900/30 px-1.5 rounded">{fps} FPS</span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setMinimized(!minimized)} className="p-1 rounded hover:bg-white/10 transition-colors">
            {minimized ? <Maximize2 className="w-3 h-3 text-white/70" /> : <Minimize2 className="w-3 h-3 text-white/70" />}
          </button>
          <button onClick={onClose} className="p-1 rounded hover:bg-red-500/30 transition-colors">
            <X className="w-3 h-3 text-white/70" />
          </button>
        </div>
      </div>

      {!minimized && (
        <>
          {/* Tabs */}
          <div className="flex border-b border-white/10">
            {(["log", "scene", "state"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 text-[9px] py-1.5 transition-colors ${tab === t ? "text-green-400 bg-white/5 border-b border-green-400" : "text-white/50 hover:text-white/70"}`}
              >
                {t === "log" ? "📋 Log" : t === "scene" ? "🎬 Scene" : "🔧 State"}
              </button>
            ))}
          </div>

          <div className="h-48 overflow-y-auto p-2 text-[9px] leading-relaxed" style={{ scrollbarWidth: "thin" }}>
            {tab === "log" && (
              <>
                {logs.map((l, i) => (
                  <div key={i} className="flex gap-2">
                    <span className="text-white/30 shrink-0">{l.time}</span>
                    <span className={`${typeColor[l.type]} shrink-0`}>[{l.type}]</span>
                    <span className="text-white/80">{l.msg}</span>
                  </div>
                ))}
                <div ref={logsEndRef} />
              </>
            )}

            {tab === "scene" && (
              <div className="space-y-1 text-white/70">
                <div>Meshes: <span className="text-green-400">{meshes.length}</span></div>
                <div>Visible: <span className="text-green-400">{meshes.filter((m) => m.visible).length}</span></div>
                <div>Hidden: <span className="text-yellow-400">{meshes.filter((m) => !m.visible).length}</span></div>
                <div>Favorites: <span className="text-purple-400">{meshes.filter((m) => m.favorite).length}</span></div>
                <div>Selected: <span className="text-blue-400">{selectedMesh || "—"}</span></div>
                <div>Hovered: <span className="text-blue-300">{hoveredMesh || "—"}</span></div>
                {mesh && (
                  <div className="mt-2 border-t border-white/10 pt-2 space-y-0.5">
                    <div className="text-green-400 font-bold mb-1">{mesh.name}</div>
                    <div>Pos: ({mesh.object.position.x.toFixed(3)}, {mesh.object.position.y.toFixed(3)}, {mesh.object.position.z.toFixed(3)})</div>
                    <div>Rot: ({mesh.object.rotation.x.toFixed(2)}, {mesh.object.rotation.y.toFixed(2)}, {mesh.object.rotation.z.toFixed(2)})</div>
                    <div>Scale: ({mesh.object.scale.x.toFixed(3)}, {mesh.object.scale.y.toFixed(3)}, {mesh.object.scale.z.toFixed(3)})</div>
                    <div>Visible: {mesh.visible ? "✅" : "❌"}</div>
                  </div>
                )}
              </div>
            )}

            {tab === "state" && (
              <div className="space-y-1 text-white/70">
                <div>X-Ray: <span className={xrayEnabled ? "text-green-400" : "text-red-400"}>{xrayEnabled ? "ON" : "OFF"}</span></div>
                <div>Animation: <span className="text-blue-400">{animationType}</span></div>
                <div>Loading: <span className={loading ? "text-yellow-400" : "text-green-400"}>{loading ? "Yes" : "No"}</span></div>
                <div>Language: <span className="text-purple-400">{lang}</span></div>
              </div>
            )}
          </div>

          {/* Bottom bar */}
          <div className="flex items-center justify-between px-2 py-1 bg-[hsl(220_15%_12%)] border-t border-white/10">
            <span className="text-[8px] text-white/30">{meshes.length} meshes | {logs.length} logs</span>
            <button onClick={() => setLogs([])} className="p-1 rounded hover:bg-white/10 transition-colors">
              <Trash2 className="w-2.5 h-2.5 text-white/40" />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
