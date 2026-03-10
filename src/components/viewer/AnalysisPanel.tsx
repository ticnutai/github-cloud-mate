import { useViewerStore } from "@/lib/viewerStore";
import type { AnalysisPart, LayerPreset } from "@/lib/viewerStore";

export default function AnalysisPanel() {
  const lang = useViewerStore((s) => s.lang);
  const analysisPart = useViewerStore((s) => s.analysisPart);
  const setAnalysisPart = useViewerStore((s) => s.setAnalysisPart);
  const analysisResult = useViewerStore((s) => s.analysisResult);
  const setAnalysisResult = useViewerStore((s) => s.setAnalysisResult);
  const meshes = useViewerStore((s) => s.meshes);
  const setIsolated = useViewerStore((s) => s.setIsolated);
  const showAll = useViewerStore((s) => s.showAll);
  const layerPreset = useViewerStore((s) => s.layerPreset);
  const setLayerPreset = useViewerStore((s) => s.setLayerPreset);

  const select = "w-full bg-secondary border border-border rounded px-2 py-1 text-[11px] text-foreground focus:outline-none focus:ring-1 focus:ring-ring";
  const btn = "px-2 py-1 text-[10px] bg-secondary border border-border rounded hover:bg-accent transition-colors";
  const label = "text-[10px] text-muted-foreground";

  const analyzePartKeywords: Record<string, string[]> = {
    "head": ["skull", "cranium", "head", "mandible", "maxilla", "orbit", "nasal", "zygomatic", "temporal", "frontal", "parietal", "occipital", "sphenoid", "ethmoid"],
    "upper-limb": ["humerus", "radius", "ulna", "carpal", "metacarpal", "phalanx", "scapula", "clavicle", "hand", "arm", "shoulder", "wrist", "finger", "upper"],
    "lower-limb": ["femur", "tibia", "fibula", "patella", "tarsal", "metatarsal", "foot", "leg", "hip", "knee", "ankle", "toe", "lower", "limb"],
    "spine": ["vertebra", "spine", "cervical", "thoracic", "lumbar", "sacrum", "coccyx", "disc"],
    "thorax": ["rib", "sternum", "thorax", "chest"],
    "internal-organs": ["heart", "lung", "liver", "kidney", "spleen", "stomach", "intestine", "pancreas", "organ"],
    "abdomen-pelvis": ["pelvis", "ilium", "ischium", "pubis", "sacroiliac", "abdomen", "bladder"],
    "vascular": ["artery", "vein", "aorta", "vascular", "vessel", "blood", "carotid", "jugular"],
    "nervous": ["nerve", "brain", "spinal cord", "cerebral", "cerebellum", "medulla", "neural"],
  };

  const handleAnalyze = () => {
    if (analysisPart === "all") {
      setAnalysisResult(`${lang === "he" ? "סה״כ" : "Total"}: ${meshes.length} ${lang === "he" ? "חלקים" : "parts"}`);
      return;
    }
    const keywords = analyzePartKeywords[analysisPart] || [];
    const matched = meshes.filter((m) =>
      keywords.some((kw) => m.name.toLowerCase().includes(kw))
    );
    setAnalysisResult(
      `${lang === "he" ? "נמצאו" : "Found"} ${matched.length} ${lang === "he" ? "חלקים ב" : "parts in"} ${analysisPart}`
    );
  };

  const handleIsolate = () => {
    if (analysisPart === "all") return;
    const keywords = analyzePartKeywords[analysisPart] || [];
    meshes.forEach((m) => {
      const match = keywords.some((kw) => m.name.toLowerCase().includes(kw));
      m.object.visible = match;
    });
    useViewerStore.setState({
      meshes: meshes.map((m) => {
        const match = keywords.some((kw) => m.name.toLowerCase().includes(kw));
        return { ...m, visible: match };
      }),
      isolated: true,
    });
  };

  const handleReset = () => {
    showAll();
    setIsolated(false);
  };

  const handleApplyLayerPreset = () => {
    if (layerPreset === "all") {
      showAll();
      return;
    }
    const keywords: Record<string, string[]> = {
      bone: ["bone", "skeletal", "skull", "vertebra", "rib", "femur", "tibia", "humerus", "radius", "ulna", "pelvis", "scapula", "clavicle", "patella", "sternum", "mandible", "maxilla"],
      muscle: ["muscle", "muscular", "bicep", "tricep", "deltoid", "pectoral", "gluteal", "quad", "hamstring"],
      nerve: ["nerve", "neural", "brain", "spinal", "cerebral"],
      vessel: ["artery", "vein", "vessel", "aorta", "vascular", "blood", "carotid"],
    };
    const kws = keywords[layerPreset] || [];
    meshes.forEach((m) => {
      const match = kws.some((kw) => m.name.toLowerCase().includes(kw));
      m.object.visible = match;
    });
    useViewerStore.setState({
      meshes: meshes.map((m) => {
        const match = kws.some((kw) => m.name.toLowerCase().includes(kw));
        return { ...m, visible: match };
      }),
    });
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="text-xs font-semibold">{lang === "he" ? "ניתוח חלקים" : "Part Analysis"}</div>

      <select value={analysisPart} onChange={(e) => setAnalysisPart(e.target.value as AnalysisPart)} className={select}>
        <option value="all">{lang === "he" ? "כל החלקים" : "All Parts"}</option>
        <option value="head">{lang === "he" ? "ראש" : "Head"}</option>
        <option value="upper-limb">{lang === "he" ? "גפה עליונה" : "Upper Limb"}</option>
        <option value="lower-limb">{lang === "he" ? "גפה תחתונה" : "Lower Limb"}</option>
        <option value="spine">{lang === "he" ? "עמוד שדרה" : "Spine"}</option>
        <option value="thorax">{lang === "he" ? "בית החזה" : "Thorax"}</option>
        <option value="internal-organs">{lang === "he" ? "איברים פנימיים" : "Internal Organs"}</option>
        <option value="abdomen-pelvis">{lang === "he" ? "בטן/אגן" : "Abdomen/Pelvis"}</option>
        <option value="vascular">{lang === "he" ? "כלי דם" : "Vascular"}</option>
        <option value="nervous">{lang === "he" ? "מערכת עצבים" : "Nervous"}</option>
      </select>

      <div className="flex gap-1 flex-wrap">
        <button onClick={handleAnalyze} className={btn}>{lang === "he" ? "נתח" : "Analyze"}</button>
        <button onClick={handleIsolate} className={btn}>{lang === "he" ? "בודד" : "Isolate"}</button>
        <button onClick={handleReset} className={btn}>{lang === "he" ? "אפס" : "Reset"}</button>
      </div>

      {analysisResult && (
        <div className="text-[10px] text-muted-foreground bg-secondary/50 rounded px-2 py-1">{analysisResult}</div>
      )}

      <div className="border-t border-border pt-3">
        <div className="text-xs font-semibold mb-2">{lang === "he" ? "שכבות מערכת" : "System Layers"}</div>
        <select value={layerPreset} onChange={(e) => setLayerPreset(e.target.value as LayerPreset)} className={select}>
          <option value="all">{lang === "he" ? "הכול" : "All"}</option>
          <option value="bone">{lang === "he" ? "עצמות בלבד" : "Bones Only"}</option>
          <option value="muscle">{lang === "he" ? "שרירים בלבד" : "Muscles Only"}</option>
          <option value="nerve">{lang === "he" ? "עצבים בלבד" : "Nerves Only"}</option>
          <option value="vessel">{lang === "he" ? "כלי דם בלבד" : "Vessels Only"}</option>
        </select>
        <div className="flex gap-1 mt-2">
          <button onClick={handleApplyLayerPreset} className={btn}>{lang === "he" ? "החל שכבה" : "Apply"}</button>
          <button onClick={handleReset} className={btn}>{lang === "he" ? "שחזור מלא" : "Reset Full"}</button>
        </div>
      </div>
    </div>
  );
}
