import { useState, useMemo } from "react";
import { useViewerStore } from "@/lib/viewerStore";
import * as THREE from "three";

interface PartDetailsDialogProps { onClose: () => void; }

export default function PartDetailsDialog({ onClose }: PartDetailsDialogProps) {
  const lang = useViewerStore((s) => s.lang);
  const selectedMesh = useViewerStore((s) => s.selectedMesh);
  const meshes = useViewerStore((s) => s.meshes);
  const [activeTab, setActiveTab] = useState("info");
  const mesh = meshes.find((m) => m.name === selectedMesh);

  if (!mesh) return null;

  const pos = mesh.object.position;
  const rot = mesh.object.rotation;
  const scl = mesh.object.scale;
  const obj = mesh.object as THREE.Mesh;

  // Compute geometry stats
  const geoInfo = useMemo(() => {
    if (!obj.geometry) return null;
    const geo = obj.geometry as THREE.BufferGeometry;
    const posAttr = geo.getAttribute("position");
    return {
      vertices: posAttr ? posAttr.count : 0,
      triangles: geo.index ? geo.index.count / 3 : (posAttr ? posAttr.count / 3 : 0),
      hasNormals: !!geo.getAttribute("normal"),
      hasUV: !!geo.getAttribute("uv"),
      boundingBox: geo.boundingBox || new THREE.Box3().setFromBufferAttribute(posAttr as THREE.BufferAttribute),
    };
  }, [obj]);

  // Get material info
  const matInfo = useMemo(() => {
    const mat = obj.material as THREE.MeshStandardMaterial;
    if (!mat) return null;
    return {
      type: mat.type,
      color: mat.color ? `#${mat.color.getHexString()}` : "N/A",
      roughness: mat.roughness?.toFixed(2) ?? "N/A",
      metalness: mat.metalness?.toFixed(2) ?? "N/A",
      transparent: mat.transparent ? "Yes" : "No",
      opacity: mat.opacity?.toFixed(2) ?? "1",
      side: mat.side === THREE.DoubleSide ? "Double" : mat.side === THREE.BackSide ? "Back" : "Front",
    };
  }, [obj]);

  // Neighbor parts
  const neighbors = useMemo(() => {
    const idx = meshes.findIndex(m => m.name === selectedMesh);
    const result: string[] = [];
    if (idx > 0) result.push(meshes[idx - 1].name);
    if (idx < meshes.length - 1) result.push(meshes[idx + 1].name);
    return result;
  }, [meshes, selectedMesh]);

  const tabs = [
    { id: "info", label: lang === "he" ? "מידע" : "Info" },
    { id: "geometry", label: lang === "he" ? "גיאומטריה" : "Geometry" },
    { id: "material", label: lang === "he" ? "חומר" : "Material" },
    { id: "relations", label: lang === "he" ? "קשרים" : "Relations" },
  ];

  const btn = "px-3 py-1.5 text-[10px] bg-secondary border border-border rounded-lg hover:bg-accent transition-colors";
  const cell = "bg-secondary/50 rounded-lg p-2.5";
  const cellLabel = "text-[9px] text-muted-foreground block";
  const cellValue = "font-mono text-[10px]";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-card border-2 rounded-xl p-0 max-w-lg w-full mx-4 max-h-[80vh] overflow-hidden" style={{ borderColor: 'hsl(43 74% 49%)' }} dir="rtl" onClick={(e) => e.stopPropagation()}>
        <div className="px-5 pt-4 pb-2">
          <h3 className="text-sm font-bold">{lang === "he" ? "פרטי איבר" : "Part Details"}</h3>
          <p className="text-[11px] text-muted-foreground font-mono">{mesh.name}</p>
        </div>
        <div className="flex gap-0.5 px-5 border-b border-border">
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-3 py-1.5 text-[11px] font-medium rounded-t-lg border border-b-0 transition-colors ${activeTab === tab.id ? "bg-card text-foreground border-border" : "bg-secondary/50 text-muted-foreground border-transparent hover:bg-accent/50"}`}>{tab.label}</button>
          ))}
        </div>
        <div className="px-5 py-4 overflow-y-auto max-h-[50vh]">
          {activeTab === "info" && (
            <div className="grid grid-cols-2 gap-2">
              <div className={cell}><span className={cellLabel}>{lang === "he" ? "שם" : "Name"}</span><span className={cellValue}>{mesh.name}</span></div>
              <div className={cell}><span className={cellLabel}>{lang === "he" ? "נראות" : "Visible"}</span><span className={cellValue}>{mesh.visible ? "✓" : "✗"}</span></div>
              <div className={cell}><span className={cellLabel}>{lang === "he" ? "מיקום" : "Position"}</span><span className={cellValue}>{pos.x.toFixed(3)}, {pos.y.toFixed(3)}, {pos.z.toFixed(3)}</span></div>
              <div className={cell}><span className={cellLabel}>{lang === "he" ? "סיבוב" : "Rotation"}</span><span className={cellValue}>{(rot.x*180/Math.PI).toFixed(1)}°, {(rot.y*180/Math.PI).toFixed(1)}°, {(rot.z*180/Math.PI).toFixed(1)}°</span></div>
              <div className={cell}><span className={cellLabel}>{lang === "he" ? "סקייל" : "Scale"}</span><span className={cellValue}>{scl.x.toFixed(3)}</span></div>
              <div className={cell}><span className={cellLabel}>{lang === "he" ? "סוג" : "Type"}</span><span className={cellValue}>{mesh.object.type || "Mesh"}</span></div>
            </div>
          )}
          {activeTab === "geometry" && geoInfo && (
            <div className="grid grid-cols-2 gap-2">
              <div className={cell}><span className={cellLabel}>Vertices</span><span className={cellValue}>{geoInfo.vertices.toLocaleString()}</span></div>
              <div className={cell}><span className={cellLabel}>Triangles</span><span className={cellValue}>{Math.round(geoInfo.triangles).toLocaleString()}</span></div>
              <div className={cell}><span className={cellLabel}>Normals</span><span className={cellValue}>{geoInfo.hasNormals ? "✓" : "✗"}</span></div>
              <div className={cell}><span className={cellLabel}>UV</span><span className={cellValue}>{geoInfo.hasUV ? "✓" : "✗"}</span></div>
            </div>
          )}
          {activeTab === "material" && matInfo && (
            <div className="grid grid-cols-2 gap-2">
              <div className={cell}><span className={cellLabel}>Type</span><span className={cellValue}>{matInfo.type}</span></div>
              <div className={cell}>
                <span className={cellLabel}>Color</span>
                <span className={cellValue} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span className="w-4 h-4 rounded border border-border inline-block" style={{ backgroundColor: matInfo.color }} />
                  {matInfo.color}
                </span>
              </div>
              <div className={cell}><span className={cellLabel}>Roughness</span><span className={cellValue}>{matInfo.roughness}</span></div>
              <div className={cell}><span className={cellLabel}>Metalness</span><span className={cellValue}>{matInfo.metalness}</span></div>
              <div className={cell}><span className={cellLabel}>Transparent</span><span className={cellValue}>{matInfo.transparent}</span></div>
              <div className={cell}><span className={cellLabel}>Opacity</span><span className={cellValue}>{matInfo.opacity}</span></div>
              <div className={cell}><span className={cellLabel}>Side</span><span className={cellValue}>{matInfo.side}</span></div>
            </div>
          )}
          {activeTab === "relations" && (
            <div className="flex flex-col gap-2">
              <div className="text-[11px] font-semibold">{lang === "he" ? "חלקים סמוכים" : "Neighboring Parts"}</div>
              {neighbors.length === 0 ? (
                <p className="text-[11px] text-muted-foreground">{lang === "he" ? "אין שכנים" : "No neighbors"}</p>
              ) : (
                neighbors.map(n => (
                  <div
                    key={n}
                    onClick={() => useViewerStore.getState().setSelectedMesh(n)}
                    className="text-[10px] px-2 py-1.5 bg-secondary/50 rounded-lg hover:bg-accent cursor-pointer font-mono transition-colors"
                  >
                    {n}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
        <div className="px-5 py-3 border-t border-border flex gap-2 flex-wrap">
          <button onClick={() => { useViewerStore.getState().toggleXyz(); onClose(); }} className={btn}>{lang === "he" ? "פתח XYZ" : "Open XYZ"}</button>
          <button onClick={() => { useViewerStore.getState().toggleXyz(); useViewerStore.getState().toggleXyzLock(mesh.name); onClose(); }} className={btn}>{lang === "he" ? "XYZ + נעילה" : "XYZ + Lock"}</button>
          <button onClick={() => useViewerStore.getState().dispatchCamera("focus")} className={btn}>{lang === "he" ? "מיקוד" : "Focus"}</button>
          <button onClick={onClose} className="px-3 py-1.5 text-[10px] bg-primary text-primary-foreground rounded-lg hover:opacity-90 mr-auto">{lang === "he" ? "סגור" : "Close"}</button>
        </div>
      </div>
    </div>
  );
}
