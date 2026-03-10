import { useState, useMemo } from "react";
import { useViewerStore } from "@/lib/viewerStore";
import * as THREE from "three";

interface PartDetailsDialogProps { onClose: () => void; }

// Hebrew anatomical descriptions dictionary
const anatomyDictionary: Record<string, { he: string; en: string; desc_he: string; desc_en: string; system_he: string; system_en: string }> = {
  "pectoralis": { he: "שריר חזה", en: "Pectoralis", desc_he: "שריר גדול בחזה הקדמי, אחראי על תנועות הזרוע כלפי פנים וסיבוב", desc_en: "Large chest muscle responsible for arm adduction and internal rotation", system_he: "מערכת השרירים", system_en: "Muscular System" },
  "deltoid": { he: "שריר דלתא", en: "Deltoid", desc_he: "שריר הכתף, אחראי על הרמת הזרוע לצדדים ולפנים", desc_en: "Shoulder muscle responsible for arm abduction and flexion", system_he: "מערכת השרירים", system_en: "Muscular System" },
  "bicep": { he: "שריר דו-ראשי", en: "Biceps", desc_he: "שריר בחלק הקדמי של הזרוע, אחראי על כיפוף המרפק", desc_en: "Anterior arm muscle responsible for elbow flexion", system_he: "מערכת השרירים", system_en: "Muscular System" },
  "tricep": { he: "שריר תלת-ראשי", en: "Triceps", desc_he: "שריר בחלק האחורי של הזרוע, אחראי על יישור המרפק", desc_en: "Posterior arm muscle responsible for elbow extension", system_he: "מערכת השרירים", system_en: "Muscular System" },
  "abdominal": { he: "שריר בטן", en: "Abdominal", desc_he: "שרירי דופן הבטן, תומכים בגו ומגנים על איברים פנימיים", desc_en: "Abdominal wall muscles supporting the trunk and protecting internal organs", system_he: "מערכת השרירים", system_en: "Muscular System" },
  "gluteal": { he: "שריר עכוז", en: "Gluteal", desc_he: "שרירי הישבן, אחראים על יציבות האגן ותנועת הירך", desc_en: "Buttock muscles responsible for hip stability and movement", system_he: "מערכת השרירים", system_en: "Muscular System" },
  "muscle": { he: "שריר", en: "Muscle", desc_he: "רקמת שריר המאפשרת תנועה של הגוף", desc_en: "Muscle tissue enabling body movement", system_he: "מערכת השרירים", system_en: "Muscular System" },
  "fascia": { he: "פשיה", en: "Fascia", desc_he: "רקמת חיבור העוטפת שרירים, עצבים וכלי דם", desc_en: "Connective tissue wrapping muscles, nerves, and blood vessels", system_he: "מערכת השרירים", system_en: "Muscular System" },
  "sternocostal": { he: "ראש סטרנוקוסטלי", en: "Sternocostal Head", desc_he: "חלק מהשריר הגדול של החזה, מתחבר לעצם החזה ולצלעות", desc_en: "Part of pectoralis major, attached to sternum and ribs", system_he: "מערכת השרירים", system_en: "Muscular System" },
  "serratus": { he: "שריר משונן", en: "Serratus", desc_he: "שריר בצד בית החזה, מסייע בתנועת השכמות", desc_en: "Muscle on side of chest, assists in scapula movement", system_he: "מערכת השרירים", system_en: "Muscular System" },
  "latissimus": { he: "שריר גב רחב", en: "Latissimus Dorsi", desc_he: "השריר הרחב בגב, אחראי על משיכת הזרוע כלפי מטה ולאחור", desc_en: "Broadest back muscle for arm pull-down and extension", system_he: "מערכת השרירים", system_en: "Muscular System" },
  "trapezius": { he: "שריר טרפז", en: "Trapezius", desc_he: "שריר גדול בגב העליון, תומך בתנועת הכתף והצוואר", desc_en: "Large upper back muscle supporting shoulder and neck movement", system_he: "מערכת השרירים", system_en: "Muscular System" },
  "intercostal": { he: "שריר בין-צלעי", en: "Intercostal", desc_he: "שרירים בין הצלעות, מסייעים בנשימה", desc_en: "Muscles between ribs, assisting in breathing", system_he: "מערכת השרירים", system_en: "Muscular System" },
  "oblique": { he: "שריר אלכסוני", en: "Oblique", desc_he: "שריר אלכסוני בדופן הבטן, מסייע בסיבוב הגו", desc_en: "Oblique muscle of abdominal wall, assists in trunk rotation", system_he: "מערכת השרירים", system_en: "Muscular System" },
  "rectus": { he: "שריר ישר", en: "Rectus", desc_he: "שריר ישר בבטן או בירך", desc_en: "Straight muscle of abdomen or thigh", system_he: "מערכת השרירים", system_en: "Muscular System" },
  // Bones
  "skull": { he: "גולגולת", en: "Skull", desc_he: "מבנה עצמי המגן על המוח", desc_en: "Bony structure protecting the brain", system_he: "מערכת השלד", system_en: "Skeletal System" },
  "vertebra": { he: "חוליה", en: "Vertebra", desc_he: "עצם בעמוד השדרה, מגנה על חוט השדרה", desc_en: "Spinal bone protecting the spinal cord", system_he: "מערכת השלד", system_en: "Skeletal System" },
  "rib": { he: "צלע", en: "Rib", desc_he: "עצם מעוקלת המגנה על הלב והריאות", desc_en: "Curved bone protecting heart and lungs", system_he: "מערכת השלד", system_en: "Skeletal System" },
  "sternum": { he: "עצם החזה", en: "Sternum", desc_he: "עצם שטוחה במרכז החזה, מחברת את הצלעות", desc_en: "Flat bone in center of chest connecting ribs", system_he: "מערכת השלד", system_en: "Skeletal System" },
  "scapula": { he: "שכמה", en: "Scapula", desc_he: "עצם שטוחה בגב העליון, בסיס לתנועת הכתף", desc_en: "Flat bone in upper back, base for shoulder movement", system_he: "מערכת השלד", system_en: "Skeletal System" },
  "clavicle": { he: "עצם הבריח", en: "Clavicle", desc_he: "עצם ארוכה המחברת את הכתף לבית החזה", desc_en: "Long bone connecting shoulder to chest", system_he: "מערכת השלד", system_en: "Skeletal System" },
  "humerus": { he: "עצם הזרוע", en: "Humerus", desc_he: "עצם ארוכה בזרוע העליונה", desc_en: "Long bone of the upper arm", system_he: "מערכת השלד", system_en: "Skeletal System" },
  "spine": { he: "עמוד שדרה", en: "Spine", desc_he: "עמוד השדרה תומך בגוף ומגן על חוט השדרה", desc_en: "Spinal column supporting the body and protecting spinal cord", system_he: "מערכת השלד", system_en: "Skeletal System" },
  "pelvis": { he: "אגן", en: "Pelvis", desc_he: "מבנה עצמי התומך בגו ומחבר את הגפיים התחתונות", desc_en: "Bony structure supporting trunk and connecting lower limbs", system_he: "מערכת השלד", system_en: "Skeletal System" },
  "femur": { he: "עצם הירך", en: "Femur", desc_he: "העצם הארוכה ביותר בגוף, בירך", desc_en: "Longest bone in the body, located in the thigh", system_he: "מערכת השלד", system_en: "Skeletal System" },
  "tibia": { he: "עצם השוקה", en: "Tibia", desc_he: "עצם ראשית בשוק, נושאת את משקל הגוף", desc_en: "Main bone of the lower leg, bearing body weight", system_he: "מערכת השלד", system_en: "Skeletal System" },
  // Vascular
  "artery": { he: "עורק", en: "Artery", desc_he: "כלי דם המוביל דם עשיר בחמצן מהלב לגוף", desc_en: "Blood vessel carrying oxygen-rich blood from heart to body", system_he: "מערכת הדם", system_en: "Cardiovascular System" },
  "vein": { he: "וריד", en: "Vein", desc_he: "כלי דם המחזיר דם דל בחמצן אל הלב", desc_en: "Blood vessel returning oxygen-poor blood to the heart", system_he: "מערכת הדם", system_en: "Cardiovascular System" },
  "aorta": { he: "אבי העורקים", en: "Aorta", desc_he: "העורק הגדול ביותר בגוף, יוצא מהלב ומספק דם לכל הגוף", desc_en: "Largest artery, exits heart and supplies blood to body", system_he: "מערכת הדם", system_en: "Cardiovascular System" },
  "cephalic": { he: "וריד צפלי", en: "Cephalic Vein", desc_he: "וריד שטחי בזרוע, עולה מהאמה לכתף", desc_en: "Superficial vein of the arm running from forearm to shoulder", system_he: "מערכת הדם", system_en: "Cardiovascular System" },
  "brachial": { he: "עורק/וריד זרועי", en: "Brachial", desc_he: "כלי דם ראשי בזרוע העליונה", desc_en: "Main blood vessel of the upper arm", system_he: "מערכת הדם", system_en: "Cardiovascular System" },
  "basilic": { he: "וריד בזילי", en: "Basilic Vein", desc_he: "וריד שטחי בצד הפנימי של הזרוע", desc_en: "Superficial vein on the medial side of the arm", system_he: "מערכת הדם", system_en: "Cardiovascular System" },
  // Organs
  "heart": { he: "לב", en: "Heart", desc_he: "האיבר המרכזי במערכת הדם, שואב ומזרים דם לכל הגוף", desc_en: "Central organ of cardiovascular system, pumping blood throughout body", system_he: "מערכת הדם", system_en: "Cardiovascular System" },
  "lung": { he: "ריאה", en: "Lung", desc_he: "איבר הנשימה, אחראי על חילופי גזים", desc_en: "Respiratory organ responsible for gas exchange", system_he: "מערכת הנשימה", system_en: "Respiratory System" },
  "liver": { he: "כבד", en: "Liver", desc_he: "איבר גדול האחראי על סינון רעלים, ייצור מרה ומטבוליזם", desc_en: "Large organ for detoxification, bile production, and metabolism", system_he: "מערכת העיכול", system_en: "Digestive System" },
  "kidney": { he: "כליה", en: "Kidney", desc_he: "איבר המסנן פסולת מהדם ומייצר שתן", desc_en: "Organ filtering waste from blood and producing urine", system_he: "מערכת השתן", system_en: "Urinary System" },
  // Nervous
  "nerve": { he: "עצב", en: "Nerve", desc_he: "סיב המעביר אותות חשמליים בין המוח לגוף", desc_en: "Fiber transmitting electrical signals between brain and body", system_he: "מערכת העצבים", system_en: "Nervous System" },
  "brain": { he: "מוח", en: "Brain", desc_he: "מרכז מערכת העצבים, שולט בכל פעולות הגוף", desc_en: "Center of nervous system, controlling all body functions", system_he: "מערכת העצבים", system_en: "Nervous System" },
  // Skin
  "skin": { he: "עור", en: "Skin", desc_he: "האיבר הגדול ביותר בגוף, מגן מפני גורמים חיצוניים", desc_en: "Largest organ, protecting from external factors", system_he: "מערכת האינטגומנטרית", system_en: "Integumentary System" },
  "nipple": { he: "פטמה", en: "Nipple", desc_he: "בליטה בחזה, חלק ממערכת בלוטות החלב", desc_en: "Chest protrusion, part of the mammary gland system", system_he: "מערכת האינטגומנטרית", system_en: "Integumentary System" },
};

function lookupAnatomy(meshName: string) {
  const lower = meshName.toLowerCase().replace(/[_\-]/g, " ");
  for (const [keyword, info] of Object.entries(anatomyDictionary)) {
    if (lower.includes(keyword)) return info;
  }
  return null;
}

export default function PartDetailsDialog({ onClose }: PartDetailsDialogProps) {
  const lang = useViewerStore((s) => s.lang);
  const selectedMesh = useViewerStore((s) => s.selectedMesh);
  const meshes = useViewerStore((s) => s.meshes);
  const [activeTab, setActiveTab] = useState("info");
  const mesh = meshes.find((m) => m.name === selectedMesh);

  const pos = mesh?.object.position;
  const rot = mesh?.object.rotation;
  const scl = mesh?.object.scale;
  const obj = mesh?.object as THREE.Mesh | undefined;

  const anatomyInfo = useMemo(() => mesh ? lookupAnatomy(mesh.name) : null, [mesh]);

  const geoInfo = useMemo(() => {
    if (!obj?.geometry) return null;
    const geo = obj.geometry as THREE.BufferGeometry;
    const posAttr = geo.getAttribute("position");
    return {
      vertices: posAttr ? posAttr.count : 0,
      triangles: geo.index ? geo.index.count / 3 : (posAttr ? posAttr.count / 3 : 0),
      hasNormals: !!geo.getAttribute("normal"),
      hasUV: !!geo.getAttribute("uv"),
    };
  }, [obj]);

  const matInfo = useMemo(() => {
    if (!obj) return null;
    const mat = obj.material as THREE.MeshStandardMaterial;
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

  const neighbors = useMemo(() => {
    const idx = meshes.findIndex(m => m.name === selectedMesh);
    const result: string[] = [];
    if (idx > 0) result.push(meshes[idx - 1].name);
    if (idx < meshes.length - 1) result.push(meshes[idx + 1].name);
    return result;
  }, [meshes, selectedMesh]);

  const tabs = [
    { id: "info", label: lang === "he" ? "מידע אנטומי" : "Anatomy" },
    { id: "geometry", label: lang === "he" ? "גיאומטריה" : "Geometry" },
    { id: "material", label: lang === "he" ? "חומר" : "Material" },
    { id: "relations", label: lang === "he" ? "קשרים" : "Relations" },
  ];

  if (!mesh || !pos || !rot || !scl) return null;

  const btn = "px-3 py-1.5 text-[10px] bg-secondary border border-border rounded-lg hover:bg-accent transition-colors";
  const cell = "bg-secondary/50 rounded-lg p-2.5";
  const cellLabel = "text-[9px] text-muted-foreground block";
  const cellValue = "font-mono text-[10px]";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-card border-2 rounded-xl p-0 max-w-lg w-full mx-4 max-h-[80vh] overflow-hidden" style={{ borderColor: 'hsl(43 74% 49%)' }} dir={lang === "he" ? "rtl" : "ltr"} onClick={(e) => e.stopPropagation()}>
        <div className="px-5 pt-4 pb-2">
          <h3 className="text-sm font-bold">
            {anatomyInfo
              ? (lang === "he" ? anatomyInfo.he : anatomyInfo.en)
              : (lang === "he" ? "פרטי איבר" : "Part Details")}
          </h3>
          <p className="text-[11px] text-muted-foreground font-mono">{mesh.name}</p>
          {anatomyInfo && (
            <span className="inline-block mt-1 text-[10px] bg-primary/15 text-primary px-2 py-0.5 rounded-full font-medium">
              {lang === "he" ? anatomyInfo.system_he : anatomyInfo.system_en}
            </span>
          )}
        </div>
        <div className="flex gap-0.5 px-5 border-b border-border">
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-3 py-1.5 text-[11px] font-medium rounded-t-lg border border-b-0 transition-colors ${activeTab === tab.id ? "bg-card text-foreground border-border" : "bg-secondary/50 text-muted-foreground border-transparent hover:bg-accent/50"}`}>{tab.label}</button>
          ))}
        </div>
        <div className="px-5 py-4 overflow-y-auto max-h-[50vh]">
          {activeTab === "info" && (
            <div className="flex flex-col gap-3">
              {anatomyInfo ? (
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
                  <div className="text-[11px] font-semibold mb-1">
                    {lang === "he" ? "תיאור אנטומי" : "Anatomical Description"}
                  </div>
                  <p className="text-[11px] leading-relaxed text-foreground">
                    {lang === "he" ? anatomyInfo.desc_he : anatomyInfo.desc_en}
                  </p>
                </div>
              ) : (
                <div className="bg-secondary/50 rounded-lg p-3 text-[11px] text-muted-foreground">
                  {lang === "he" ? "לא נמצא מידע אנטומי עבור חלק זה" : "No anatomical data found for this part"}
                </div>
              )}
              <div className="grid grid-cols-2 gap-2">
                <div className={cell}><span className={cellLabel}>{lang === "he" ? "שם" : "Name"}</span><span className={cellValue}>{mesh.name}</span></div>
                <div className={cell}><span className={cellLabel}>{lang === "he" ? "נראות" : "Visible"}</span><span className={cellValue}>{mesh.visible ? "✓" : "✗"}</span></div>
                <div className={cell}><span className={cellLabel}>{lang === "he" ? "מיקום" : "Position"}</span><span className={cellValue}>{pos.x.toFixed(3)}, {pos.y.toFixed(3)}, {pos.z.toFixed(3)}</span></div>
                <div className={cell}><span className={cellLabel}>{lang === "he" ? "סיבוב" : "Rotation"}</span><span className={cellValue}>{(rot.x*180/Math.PI).toFixed(1)}°, {(rot.y*180/Math.PI).toFixed(1)}°, {(rot.z*180/Math.PI).toFixed(1)}°</span></div>
                <div className={cell}><span className={cellLabel}>{lang === "he" ? "סקייל" : "Scale"}</span><span className={cellValue}>{scl.x.toFixed(3)}</span></div>
                <div className={cell}><span className={cellLabel}>{lang === "he" ? "סוג" : "Type"}</span><span className={cellValue}>{mesh.object.type || "Mesh"}</span></div>
              </div>
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
                neighbors.map(n => {
                  const nInfo = lookupAnatomy(n);
                  return (
                    <div
                      key={n}
                      onClick={() => useViewerStore.getState().setSelectedMesh(n)}
                      className="text-[10px] px-2 py-1.5 bg-secondary/50 rounded-lg hover:bg-accent cursor-pointer font-mono transition-colors flex items-center gap-2"
                    >
                      <span>{n}</span>
                      {nInfo && <span className="text-muted-foreground">({lang === "he" ? nInfo.he : nInfo.en})</span>}
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
        <div className="px-5 py-3 border-t border-border flex gap-2 flex-wrap">
          <button onClick={() => { useViewerStore.getState().toggleXyz(); onClose(); }} className={btn}>{lang === "he" ? "פתח XYZ" : "Open XYZ"}</button>
          <button onClick={() => { useViewerStore.getState().dispatchCamera("focus"); }} className={btn}>{lang === "he" ? "מיקוד" : "Focus"}</button>
          <button onClick={onClose} className="px-3 py-1.5 text-[10px] bg-primary text-primary-foreground rounded-lg hover:opacity-90 mr-auto">{lang === "he" ? "סגור" : "Close"}</button>
        </div>
      </div>
    </div>
  );
}
