import { useState, useMemo, useEffect } from "react";
import { useViewerStore } from "@/lib/viewerStore";
import * as THREE from "three";

interface PartDetailsDialogProps { onClose: () => void; }

// ─── Anatomy utilities (ported from GitHub modules/anatomy-utils.js) ───

function formatStructureName(rawName: string): string {
  if (!rawName?.trim()) return "Unnamed mesh";
  return rawName.replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim();
}

function classifyBodyPart(name: string): string {
  const n = (name || "").toLowerCase();
  if (/(heart|cardiac|atrium|atria|ventricle|myocard|pericard|lung|lungs|bronch|trachea|kidney|kidneys|renal|ureter|bladder|urinary|liver|hepatic|spleen|pancreas|stomach|intestin|colon)/.test(n)) return "internal-organs";
  if (/(skull|crani|mandible|maxilla|nasal|vomer|zygomatic|ethmoid|lacrimal|teeth|tooth|brain|eye|orbital)/.test(n)) return "head";
  if (/(humerus|radius|ulna|carpal|metacarp|phalanx|hand|wrist|forearm|arm|clavicle|scapula|shoulder)/.test(n)) return "upper-limb";
  if (/(femur|tibia|fibula|patella|foot|ankle|metatars|toe|calcane|talus|thigh|leg|hip)/.test(n)) return "lower-limb";
  if (/(vertebra|spine|sacrum|coccyx|intervertebral|annulus fibrosus)/.test(n)) return "spine";
  if (/(rib|sternum|thorax|costal|pectoral|diaphragm)/.test(n)) return "thorax";
  if (/(pelvis|pelvic|ilium|ischium|pubis|abdomen|abdominal|perineum)/.test(n)) return "abdomen-pelvis";
  if (/(artery|vein|vascular|aorta)/.test(n)) return "vascular";
  if (/(nerve|plexus|neural)/.test(n)) return "nervous";
  return "other";
}

function detectSystemByName(name: string, lang: string): string {
  const n = (name || "").toLowerCase();
  if (/(heart|cardiac|atrium|ventricle|myocard|pericard|lung|lungs|bronch|trachea|kidney|kidneys|renal|ureter|bladder|urinary|liver|hepatic|spleen|pancreas|stomach|intestin|colon)/.test(n)) return lang === "he" ? "איברים פנימיים" : "Internal organs";
  if (/(artery|vein|aorta|vascular)/.test(n)) return lang === "he" ? "כלי דם" : "Vascular";
  if (/(nerve|plexus|neural)/.test(n)) return lang === "he" ? "עצבים" : "Nervous";
  if (/(muscle|tendon|fascia)/.test(n)) return lang === "he" ? "שריר/רקמה רכה" : "Muscular/Soft tissue";
  if (/(bone|vertebra|skull|rib|sternum|mandible|maxilla|phalanx|metacarp|metatars|femur|tibia|fibula|humerus|radius|ulna)/.test(n)) return lang === "he" ? "שלד ועצמות" : "Skeletal";
  if (/(ligament|capsule|disc|cart|meniscus)/.test(n)) return lang === "he" ? "מפרקים ורצועות" : "Joints/Ligaments";
  return lang === "he" ? "אנטומיה כללית" : "General anatomy";
}

function detectSideFromName(name: string): string {
  const n = (name || "").toLowerCase();
  if (/(mirrored|\(mirrored\)| left|\bl\b| left\b)/.test(n)) return "שמאל";
  if (/(\br\b| right|\bright\b|\sr$|\br$)/.test(n)) return "ימין";
  return "קו אמצע / לא מוגדר";
}

const categoryLabels: Record<string, Record<string, string>> = {
  he: {
    head: "ראש", "upper-limb": "גפה עליונה", "lower-limb": "גפה תחתונה",
    spine: "עמוד שדרה", thorax: "בית חזה", "internal-organs": "איברים פנימיים",
    "abdomen-pelvis": "בטן ואגן", vascular: "מערכת כלי דם", nervous: "מערכת עצבים", other: "כללי/אחר",
  },
  en: {
    head: "Head", "upper-limb": "Upper limb", "lower-limb": "Lower limb",
    spine: "Spine", thorax: "Thorax", "internal-organs": "Internal organs",
    "abdomen-pelvis": "Abdomen/Pelvis", vascular: "Vascular system", nervous: "Nervous system", other: "Other/General",
  },
};

// ─── Clinical insights (ported from GitHub) ───
function getClinicalInsights(category: string, system: string, lang: string) {
  const sysKey = system.toLowerCase();
  const catKey = category.toLowerCase();

  const he: Record<string, { function: string; clinical: string; diagnostics: string }> = {
    defaults: {
      function: "האיבר תומך במבנה, תנועה או בקרה פיזיולוגית בהתאם למיקומו האנטומי.",
      clinical: "בהערכה קלינית מתייחסים לכאב מקומי, הגבלת תנועה, ודפוסי הקרנה רלוונטיים.",
      diagnostics: "כלים שכיחים: בדיקה גופנית, אולטרסאונד/CT/MRI לפי הצורך.",
    },
    nervous: {
      function: "רכיב במערכת עצבים המעורב בהולכה, אינטגרציה או בקרה מוטורית/תחושתית.",
      clinical: "חשוב במצבי נוירולוגיה כגון חולשה, נימול, פגיעה עצבית או כאב נוירופתי.",
      diagnostics: "בדיקות נפוצות: בדיקה נוירולוגית, MRI, ולעיתים EMG/NCV.",
    },
    vascular: {
      function: "חלק ממסלול זרימת הדם, אספקת חמצן ופינוי תוצרי מטבוליזם.",
      clinical: "רלוונטי במחלות כלי דם, פקקת, איסכמיה או דימום.",
      diagnostics: "בדיקות נפוצות: דופלר, CT אנגיו, אולטרסאונד כלי דם.",
    },
    head: {
      function: "מרכיב באזור הראש התומך בהגנה, חישה, לעיסה או הולכה עצבית.",
      clinical: "חשוב בטראומה, סינוסיטיס, כאבי ראש, הפרעות ראייה/שמיעה ולסת.",
      diagnostics: "בדיקות נפוצות: CT ראש/פנים, MRI, בדיקת ENT/נוירולוגיה.",
    },
    thorax: {
      function: "מעורב בהגנה על לב/ריאות ובמכניקת נשימה.",
      clinical: "רלוונטי בכאב חזה, טראומה, בעיות נשימה או פתולוגיה לבבית/ריאתית.",
      diagnostics: "בדיקות נפוצות: צילום חזה, CT חזה, אקו/תפקודי נשימה.",
    },
    "internal-organs": {
      function: "איבר פנימי עם תפקוד פיזיולוגי ספציפי חיוני לתפקוד הגוף.",
      clinical: "רלוונטי בהערכת כאבי בטן, הפרעות מטבוליות או מחלות פנימיות.",
      diagnostics: "בדיקות נפוצות: US בטן, CT, בדיקות דם ותפקודי איברים.",
    },
  };

  const en: Record<string, { function: string; clinical: string; diagnostics: string }> = {
    defaults: {
      function: "This structure supports anatomy, motion, or physiologic control based on its location.",
      clinical: "Clinical assessment focuses on local pain, mobility limits, and related referral patterns.",
      diagnostics: "Common tools: physical exam, ultrasound/CT/MRI as indicated.",
    },
    nervous: {
      function: "Part of the nervous system involved in signaling, integration, or motor/sensory control.",
      clinical: "Relevant in weakness, paresthesia, nerve injury, or neuropathic pain syndromes.",
      diagnostics: "Common tests: neurologic exam, MRI, and in selected cases EMG/NCV.",
    },
    vascular: {
      function: "Component of blood flow pathways for oxygen delivery and metabolic waste clearance.",
      clinical: "Relevant in vascular disease, thrombosis, ischemia, or bleeding scenarios.",
      diagnostics: "Common tests: Doppler, CT angiography, and vascular ultrasound.",
    },
    head: {
      function: "Head-region structure supporting protection, sensing, chewing, or neural pathways.",
      clinical: "Relevant in trauma, sinus disease, headache, vision/hearing issues, and jaw disorders.",
      diagnostics: "Common tests: head/facial CT, MRI, and targeted ENT/neurology evaluation.",
    },
    thorax: {
      function: "Involved in heart/lung protection and respiratory mechanics.",
      clinical: "Relevant in chest pain, trauma, dyspnea, and cardio-pulmonary pathology.",
      diagnostics: "Common tests: chest X-ray, chest CT, echo, and pulmonary function tests.",
    },
    "internal-organs": {
      function: "Internal organ with specific physiologic function essential for body operation.",
      clinical: "Relevant in abdominal pain assessment, metabolic disorders, or internal diseases.",
      diagnostics: "Common tests: abdominal US, CT, blood tests and organ function panels.",
    },
  };

  const dict = lang === "he" ? he : en;
  return dict[sysKey] || dict[catKey] || dict.defaults;
}

// ─── Wikipedia fetching ───
interface WikiSummary { title: string; text: string; sourceUrl: string; sourceLabel: string; }

async function fetchWikipediaSummary(meshName: string, lang: string): Promise<WikiSummary | null> {
  const term = formatStructureName(meshName).replace(/\(mirrored\)/gi, "").trim();
  const suffix = lang === "he" ? " אנטומיה" : " anatomy";
  const langCode = lang === "he" ? "he" : "en";

  try {
    const searchUrl = `https://${langCode}.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(term + suffix)}&srlimit=1&format=json&origin=*`;
    const searchRes = await fetch(searchUrl, { signal: AbortSignal.timeout(5000) });
    const searchData = await searchRes.json();
    const pageTitle = searchData?.query?.search?.[0]?.title;
    if (!pageTitle) return null;

    const summaryUrl = `https://${langCode}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(pageTitle)}`;
    const summaryRes = await fetch(summaryUrl, { signal: AbortSignal.timeout(5000) });
    const summary = await summaryRes.json();
    const text = (summary?.extract || "").trim();
    if (!text) return null;

    return {
      title: summary?.title || pageTitle,
      text,
      sourceUrl: summary?.content_urls?.desktop?.page || `https://${langCode}.wikipedia.org/wiki/${encodeURIComponent(pageTitle).replace(/%20/g, "_")}`,
      sourceLabel: langCode === "he" ? "ויקיפדיה (עברית)" : "Wikipedia (English)",
    };
  } catch {
    return null;
  }
}

// ─── Component ───
export default function PartDetailsDialog({ onClose }: PartDetailsDialogProps) {
  const lang = useViewerStore((s) => s.lang);
  const selectedMesh = useViewerStore((s) => s.selectedMesh);
  const meshes = useViewerStore((s) => s.meshes);
  const [activeTab, setActiveTab] = useState("info");
  const [wikiData, setWikiData] = useState<WikiSummary | null>(null);
  const [wikiLoading, setWikiLoading] = useState(false);
  const mesh = meshes.find((m) => m.name === selectedMesh);

  const pos = mesh?.object.position;
  const rot = mesh?.object.rotation;
  const scl = mesh?.object.scale;
  const obj = mesh?.object as THREE.Mesh | undefined;

  const displayName = useMemo(() => mesh ? formatStructureName(mesh.name) : "", [mesh]);
  const category = useMemo(() => classifyBodyPart(displayName), [displayName]);
  const system = useMemo(() => detectSystemByName(displayName, lang), [displayName, lang]);
  const side = useMemo(() => detectSideFromName(displayName), [displayName]);
  const categoryLabel = useMemo(() => (categoryLabels[lang] || categoryLabels.en)[category] || category, [category, lang]);
  const clinical = useMemo(() => getClinicalInsights(category, system, lang), [category, system, lang]);

  // Fetch Wikipedia summary
  useEffect(() => {
    if (!mesh) return;
    setWikiData(null);
    setWikiLoading(true);
    fetchWikipediaSummary(mesh.name, lang).then((data) => {
      setWikiData(data);
      setWikiLoading(false);
    });
  }, [mesh?.name, lang]);

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
    const raw = obj.material;
    const mat = (Array.isArray(raw) ? raw[0] : raw) as THREE.MeshStandardMaterial;
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

  const neighbors = useMemo(() => {
    const idx = meshes.findIndex(m => m.name === selectedMesh);
    const result: string[] = [];
    if (idx > 0) result.push(meshes[idx - 1].name);
    if (idx < meshes.length - 1) result.push(meshes[idx + 1].name);
    return result;
  }, [meshes, selectedMesh]);

  const tabs = [
    { id: "info", label: lang === "he" ? "מידע" : "Info" },
    { id: "clinical", label: lang === "he" ? "קליני" : "Clinical" },
    { id: "geometry", label: lang === "he" ? "גיאומטריה" : "Geometry" },
    { id: "relations", label: lang === "he" ? "קשרים" : "Relations" },
  ];

  if (!mesh || !pos || !rot || !scl) return null;

  const btn = "px-3 py-1.5 text-[10px] bg-secondary border border-border rounded-lg hover:bg-accent transition-colors";
  const cell = "bg-secondary/50 rounded-lg p-2.5";
  const cellLabel = "text-[9px] text-muted-foreground block";
  const cellValue = "font-mono text-[10px]";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-card border-2 rounded-xl p-0 max-w-lg w-full mx-4 max-h-[80vh] overflow-hidden" style={{ borderColor: "hsl(43 74% 49%)" }} dir={lang === "he" ? "rtl" : "ltr"} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="px-5 pt-4 pb-2">
          <h3 className="text-sm font-bold">{displayName}</h3>
          <p className="text-[11px] text-muted-foreground font-mono">{mesh.name}</p>
          <div className="flex gap-1.5 mt-1.5 flex-wrap">
            <span className="text-[10px] bg-primary/15 text-primary px-2 py-0.5 rounded-full font-medium">{system}</span>
            <span className="text-[10px] bg-accent px-2 py-0.5 rounded-full">{categoryLabel}</span>
            <span className="text-[10px] bg-secondary px-2 py-0.5 rounded-full">{side}</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-0.5 px-5 border-b border-border">
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-3 py-1.5 text-[11px] font-medium rounded-t-lg border border-b-0 transition-colors ${activeTab === tab.id ? "bg-card text-foreground border-border" : "bg-secondary/50 text-muted-foreground border-transparent hover:bg-accent/50"}`}>{tab.label}</button>
          ))}
        </div>

        {/* Content */}
        <div className="px-5 py-4 overflow-y-auto max-h-[50vh]">
          {activeTab === "info" && (
            <div className="flex flex-col gap-3">
              {/* Wikipedia summary */}
              {wikiLoading ? (
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 text-center">
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-1" />
                  <span className="text-[10px] text-muted-foreground">
                    {lang === "he" ? "טוען מידע מוויקיפדיה..." : "Loading Wikipedia data..."}
                  </span>
                </div>
              ) : wikiData ? (
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
                  <div className="text-[11px] font-semibold mb-1">{wikiData.title}</div>
                  <p className="text-[11px] leading-relaxed text-foreground mb-2">
                    {wikiData.text.length > 400 ? wikiData.text.slice(0, 400) + "..." : wikiData.text}
                  </p>
                  <a href={wikiData.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] text-primary hover:underline">
                    {wikiData.sourceLabel} →
                  </a>
                </div>
              ) : (
                <div className="bg-secondary/50 rounded-lg p-3 text-[11px] text-muted-foreground">
                  {lang === "he" ? "לא נמצא מידע בוויקיפדיה עבור איבר זה" : "No Wikipedia data found for this part"}
                </div>
              )}

              {/* Basic info grid */}
              <div className="grid grid-cols-2 gap-2">
                <div className={cell}><span className={cellLabel}>{lang === "he" ? "נראות" : "Visible"}</span><span className={cellValue}>{mesh.visible ? "✓" : "✗"}</span></div>
                <div className={cell}><span className={cellLabel}>{lang === "he" ? "מיקום" : "Position"}</span><span className={cellValue}>{pos.x.toFixed(3)}, {pos.y.toFixed(3)}, {pos.z.toFixed(3)}</span></div>
                <div className={cell}><span className={cellLabel}>{lang === "he" ? "סיבוב" : "Rotation"}</span><span className={cellValue}>{(rot.x * 180 / Math.PI).toFixed(1)}°, {(rot.y * 180 / Math.PI).toFixed(1)}°, {(rot.z * 180 / Math.PI).toFixed(1)}°</span></div>
                <div className={cell}><span className={cellLabel}>{lang === "he" ? "סקייל" : "Scale"}</span><span className={cellValue}>{scl.x.toFixed(3)}</span></div>
              </div>
            </div>
          )}

          {activeTab === "clinical" && (
            <div className="flex flex-col gap-3">
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
                <div className="text-[11px] font-semibold mb-2">{lang === "he" ? "תובנות קליניות" : "Clinical Insights"}</div>
                <div className="flex flex-col gap-2.5">
                  <div>
                    <span className="text-[10px] font-semibold text-primary block mb-0.5">{lang === "he" ? "⚙️ תפקוד" : "⚙️ Function"}</span>
                    <p className="text-[11px] leading-relaxed">{clinical.function}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold text-primary block mb-0.5">{lang === "he" ? "🩺 משמעות קלינית" : "🩺 Clinical Relevance"}</span>
                    <p className="text-[11px] leading-relaxed">{clinical.clinical}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold text-primary block mb-0.5">{lang === "he" ? "🔬 אבחון" : "🔬 Diagnostics"}</span>
                    <p className="text-[11px] leading-relaxed">{clinical.diagnostics}</p>
                  </div>
                </div>
              </div>

              {/* Material info */}
              {matInfo && (
                <div className="grid grid-cols-2 gap-2">
                  <div className={cell}><span className={cellLabel}>Type</span><span className={cellValue}>{matInfo.type}</span></div>
                  <div className={cell}>
                    <span className={cellLabel}>Color</span>
                    <span className={cellValue} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span className="w-4 h-4 rounded border border-border inline-block" style={{ backgroundColor: matInfo.color }} />
                      {matInfo.color}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "geometry" && geoInfo && (
            <div className="grid grid-cols-2 gap-2">
              <div className={cell}><span className={cellLabel}>Vertices</span><span className={cellValue}>{geoInfo.vertices.toLocaleString()}</span></div>
              <div className={cell}><span className={cellLabel}>Triangles</span><span className={cellValue}>{Math.round(geoInfo.triangles).toLocaleString()}</span></div>
              <div className={cell}><span className={cellLabel}>Normals</span><span className={cellValue}>{geoInfo.hasNormals ? "✓" : "✗"}</span></div>
              <div className={cell}><span className={cellLabel}>UV</span><span className={cellValue}>{geoInfo.hasUV ? "✓" : "✗"}</span></div>
              {matInfo && (
                <>
                  <div className={cell}><span className={cellLabel}>Roughness</span><span className={cellValue}>{matInfo.roughness}</span></div>
                  <div className={cell}><span className={cellLabel}>Metalness</span><span className={cellValue}>{matInfo.metalness}</span></div>
                  <div className={cell}><span className={cellLabel}>Opacity</span><span className={cellValue}>{matInfo.opacity}</span></div>
                  <div className={cell}><span className={cellLabel}>Side</span><span className={cellValue}>{matInfo.side}</span></div>
                </>
              )}
            </div>
          )}

          {activeTab === "relations" && (
            <div className="flex flex-col gap-2">
              <div className="text-[11px] font-semibold">{lang === "he" ? "חלקים סמוכים" : "Neighboring Parts"}</div>
              {neighbors.length === 0 ? (
                <p className="text-[11px] text-muted-foreground">{lang === "he" ? "אין שכנים" : "No neighbors"}</p>
              ) : (
                neighbors.map((n) => {
                  const nSystem = detectSystemByName(n, lang);
                  return (
                    <div
                      key={n}
                      onClick={() => useViewerStore.getState().setSelectedMesh(n)}
                      className="text-[10px] px-2 py-1.5 bg-secondary/50 rounded-lg hover:bg-accent cursor-pointer transition-colors flex items-center gap-2"
                    >
                      <span className="font-mono flex-1 truncate">{formatStructureName(n)}</span>
                      <span className="text-muted-foreground shrink-0">({nSystem})</span>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="px-5 py-3 border-t border-border flex gap-2 flex-wrap">
          <button onClick={() => useViewerStore.getState().dispatchCamera("focus")} className={btn}>{lang === "he" ? "מיקוד" : "Focus"}</button>
          <button onClick={() => { useViewerStore.getState().toggleXyz(); onClose(); }} className={btn}>{lang === "he" ? "פתח XYZ" : "Open XYZ"}</button>
          <button onClick={onClose} className="px-3 py-1.5 text-[10px] bg-primary text-primary-foreground rounded-lg hover:opacity-90 mr-auto">{lang === "he" ? "סגור" : "Close"}</button>
        </div>
      </div>
    </div>
  );
}
