import { useState } from "react";
import { useViewerStore } from "@/lib/viewerStore";

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
  const tabs = [
    { id: "info", label: lang === "he" ? "מידע" : "Info" },
    { id: "animations", label: lang === "he" ? "אנימציות" : "Animations" },
    { id: "images", label: lang === "he" ? "תמונות" : "Images" },
    { id: "videos", label: lang === "he" ? "וידאו" : "Videos" },
  ];
  const btn = "px-3 py-1.5 text-[10px] bg-secondary border border-border rounded-lg hover:bg-accent transition-colors";
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
              {[[lang==="he"?"שם":"Name", mesh.name],[lang==="he"?"נראות":"Visible", mesh.visible?"✓":"✗"],[lang==="he"?"מיקום":"Position",`${pos.x.toFixed(3)}, ${pos.y.toFixed(3)}, ${pos.z.toFixed(3)}`],[lang==="he"?"סיבוב":"Rotation",`${(rot.x*180/Math.PI).toFixed(1)}°, ${(rot.y*180/Math.PI).toFixed(1)}°, ${(rot.z*180/Math.PI).toFixed(1)}°`],[lang==="he"?"סקייל":"Scale",scl.x.toFixed(3)],[lang==="he"?"סוג":"Type",mesh.object.type||"Mesh"]].map(([l,v])=>(
                <div key={String(l)} className="bg-secondary/50 rounded-lg p-2.5"><span className="text-[9px] text-muted-foreground block">{l}</span><span className="font-mono text-[10px]">{v}</span></div>
              ))}
            </div>
          )}
          {activeTab === "animations" && <p className="text-[11px] text-muted-foreground text-center py-8">{lang==="he"?"אנימציות ספציפיות יופיעו כאן":"Part animations here"}</p>}
          {activeTab === "images" && <p className="text-[11px] text-muted-foreground text-center py-8">{lang==="he"?"תמונות ריאליסטיות יופיעו כאן":"Realistic images here"}</p>}
          {activeTab === "videos" && <p className="text-[11px] text-muted-foreground text-center py-8">{lang==="he"?"קטעי וידאו יופיעו כאן":"Videos here"}</p>}
        </div>
        <div className="px-5 py-3 border-t border-border flex gap-2 flex-wrap">
          <button onClick={() => { useViewerStore.getState().toggleXyz(); onClose(); }} className={btn}>{lang==="he"?"פתח XYZ":"Open XYZ"}</button>
          <button className={btn}>{lang==="he"?"XYZ + נעילה":"XYZ + Lock"}</button>
          <button onClick={onClose} className="px-3 py-1.5 text-[10px] bg-primary text-primary-foreground rounded-lg hover:opacity-90 mr-auto">{lang==="he"?"סגור":"Close"}</button>
        </div>
      </div>
    </div>
  );
}