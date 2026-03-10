import { useViewerStore } from "@/lib/viewerStore";
import type { ProPreset, AnimationType, SystemDemo, PerformanceMode } from "@/lib/viewerStore";

const systemDemoKeywords: Record<string, string[]> = {
  heart: ["heart", "cardiac", "coronary", "ventricle", "atrium", "aorta", "valve"],
  respiratory: ["lung", "bronch", "trachea", "diaphragm", "respiratory", "alveol"],
  circulatory: ["artery", "vein", "vessel", "blood", "aorta", "carotid", "jugular", "capillary"],
  lymphatic: ["lymph", "spleen", "thymus", "tonsil", "node"],
  urinary: ["kidney", "ureter", "bladder", "urethra", "renal", "adrenal"],
  head: ["skull", "cranium", "mandible", "maxilla", "orbit", "nasal", "temporal", "frontal", "brain", "cerebr"],
};

export default function ProToolsPanel() {
  const lang = useViewerStore((s) => s.lang);
  const proPreset = useViewerStore((s) => s.proPreset);
  const setProPreset = useViewerStore((s) => s.setProPreset);
  const realisticMode = useViewerStore((s) => s.realisticMode);
  const toggleRealisticMode = useViewerStore((s) => s.toggleRealisticMode);
  const humanScale = useViewerStore((s) => s.humanScale);
  const toggleHumanScale = useViewerStore((s) => s.toggleHumanScale);
  const animationType = useViewerStore((s) => s.animationType);
  const setAnimationType = useViewerStore((s) => s.setAnimationType);
  const animationSpeed = useViewerStore((s) => s.animationSpeed);
  const setAnimationSpeed = useViewerStore((s) => s.setAnimationSpeed);
  const animationPlaying = useViewerStore((s) => s.animationPlaying);
  const setAnimationPlaying = useViewerStore((s) => s.setAnimationPlaying);
  const systemDemo = useViewerStore((s) => s.systemDemo);
  const setSystemDemo = useViewerStore((s) => s.setSystemDemo);
  const systemDemoActive = useViewerStore((s) => s.systemDemoActive);
  const setSystemDemoActive = useViewerStore((s) => s.setSystemDemoActive);
  const performanceMode = useViewerStore((s) => s.performanceMode);
  const setPerformanceMode = useViewerStore((s) => s.setPerformanceMode);
  const adaptiveQuality = useViewerStore((s) => s.adaptiveQuality);
  const toggleAdaptiveQuality = useViewerStore((s) => s.toggleAdaptiveQuality);
  const timelineActive = useViewerStore((s) => s.timelineActive);
  const setTimelineActive = useViewerStore((s) => s.setTimelineActive);
  const meshes = useViewerStore((s) => s.meshes);
  const showAll = useViewerStore((s) => s.showAll);

  const label = "text-xs text-muted-foreground font-medium";
  const select = "w-full bg-secondary border border-border rounded-lg px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40";
  const btn = "px-3 py-2 text-xs bg-secondary border border-border rounded-lg hover:bg-accent transition-colors font-medium";
  const toggle = "flex items-center gap-2.5 cursor-pointer text-xs";
  const status = "text-xs text-muted-foreground bg-secondary/50 rounded-lg px-3 py-2";

  const handleStartSystemDemo = () => {
    setSystemDemoActive(true);
    const keywords = systemDemoKeywords[systemDemo] || [];
    meshes.forEach((m) => {
      const match = keywords.some((kw) => m.name.toLowerCase().includes(kw));
      m.object.visible = match;
    });
    useViewerStore.setState({
      meshes: meshes.map((m) => ({
        ...m,
        visible: keywords.some((kw) => m.name.toLowerCase().includes(kw)),
      })),
    });
    setAnimationType("breathing");
    setAnimationPlaying(true);
  };

  const handleStopSystemDemo = () => {
    setSystemDemoActive(false);
    showAll();
    setAnimationType("none");
    setAnimationPlaying(false);
  };

  const applyPreset = (preset: ProPreset) => {
    setProPreset(preset);
    if (preset === "clinical") {
      if (!realisticMode) toggleRealisticMode();
      setAnimationType("none");
      setAnimationPlaying(false);
    } else if (preset === "teaching") {
      if (realisticMode) toggleRealisticMode();
      setAnimationType("none");
    } else if (preset === "presentation") {
      setAnimationType("presentation");
      setAnimationPlaying(true);
    }
  };

  return (
    <div className="flex flex-col gap-3.5">
      {/* Pro Preset */}
      <div className="flex flex-col gap-1.5">
        <span className={label}>{lang === "he" ? "פריסט" : "Preset"}</span>
        <select value={proPreset} onChange={(e) => applyPreset(e.target.value as ProPreset)} className={select}>
          <option value="custom">{lang === "he" ? "מותאם אישית" : "Custom"}</option>
          <option value="clinical">{lang === "he" ? "קליני" : "Clinical"}</option>
          <option value="teaching">{lang === "he" ? "לימודי" : "Teaching"}</option>
          <option value="presentation">{lang === "he" ? "הדגמה" : "Presentation"}</option>
        </select>
      </div>

      {/* Toggles */}
      <label className={toggle}>
        <input type="checkbox" checked={realisticMode} onChange={toggleRealisticMode} className="accent-primary w-4 h-4" />
        {lang === "he" ? "מצב ריאליסטי" : "Realistic Mode"}
      </label>
      <label className={toggle}>
        <input type="checkbox" checked={humanScale} onChange={toggleHumanScale} className="accent-primary w-4 h-4" />
        {lang === "he" ? "קנה מידה אנושי (1:1)" : "Human Scale (1:1)"}
      </label>

      {/* Animation */}
      <div className="flex flex-col gap-1.5">
        <span className={label}>{lang === "he" ? "אנימציית המחשה" : "Activity Animation"}</span>
        <select value={animationType} onChange={(e) => setAnimationType(e.target.value as AnimationType)} className={select}>
          <option value="none">{lang === "he" ? "ללא" : "None"}</option>
          <option value="breathing">{lang === "he" ? "נשימה" : "Breathing"}</option>
          <option value="heartbeat">{lang === "he" ? "פעימת לב" : "Heartbeat"}</option>
          <option value="bloodflow">{lang === "he" ? "זרימת דם" : "Blood Flow"}</option>
          <option value="gait">{lang === "he" ? "הליכה" : "Gait"}</option>
          <option value="presentation">{lang === "he" ? "תצוגה היקפית" : "Presentation"}</option>
          <option value="explode">{lang === "he" ? "פיצול שכבות" : "Explode"}</option>
        </select>
      </div>

      <div className="flex items-center gap-3">
        <span className={label}>{lang === "he" ? "מהירות" : "Speed"}</span>
        <input type="range" min="0.5" max="2.5" step="0.1" value={animationSpeed} onChange={(e) => setAnimationSpeed(parseFloat(e.target.value))} className="flex-1 accent-primary h-1.5" />
        <span className="text-xs text-muted-foreground font-mono">{animationSpeed.toFixed(1)}x</span>
      </div>

      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setAnimationPlaying(true)} className={btn}>{lang === "he" ? "▶ נגן" : "▶ Play"}</button>
        <button onClick={() => setAnimationPlaying(false)} className={btn}>{lang === "he" ? "⏸ השהה" : "⏸ Pause"}</button>
        <button onClick={() => { setAnimationPlaying(false); setAnimationType("none"); }} className={btn}>{lang === "he" ? "⏹ אפס" : "⏹ Reset"}</button>
      </div>

      {/* Timeline */}
      <div className="flex gap-2 flex-wrap">
        <button onClick={() => { setTimelineActive(true); setAnimationPlaying(true); }} className={btn}>{lang === "he" ? "התחל ציר זמן" : "Start Timeline"}</button>
        <button onClick={() => { setTimelineActive(false); setAnimationPlaying(false); }} className={btn}>{lang === "he" ? "עצור" : "Stop"}</button>
      </div>
      <div className={status}>{lang === "he" ? "ציר זמן:" : "Timeline:"} {timelineActive ? (lang === "he" ? "פעיל ▶" : "Active ▶") : (lang === "he" ? "מוכן" : "Ready")}</div>

      {/* System Demo */}
      <div className="flex flex-col gap-1.5 border-t border-border pt-3">
        <span className={label}>{lang === "he" ? "הדמיית מערכת" : "System Simulation"}</span>
        <select value={systemDemo} onChange={(e) => setSystemDemo(e.target.value as SystemDemo)} className={select}>
          <option value="heart">{lang === "he" ? "פעולת הלב" : "Heart Action"}</option>
          <option value="respiratory">{lang === "he" ? "איברי הנשימה" : "Respiratory"}</option>
          <option value="circulatory">{lang === "he" ? "מערכת הדם" : "Circulatory"}</option>
          <option value="lymphatic">{lang === "he" ? "מערכת הלימפה" : "Lymphatic"}</option>
          <option value="urinary">{lang === "he" ? "מערכת השתן" : "Urinary"}</option>
          <option value="head">{lang === "he" ? "הראש" : "Head"}</option>
        </select>
      </div>
      <div className="flex gap-2">
        <button onClick={handleStartSystemDemo} className={btn}>{lang === "he" ? "▶ התחל" : "▶ Start"}</button>
        <button onClick={handleStopSystemDemo} className={btn}>{lang === "he" ? "⏹ עצור" : "⏹ Stop"}</button>
      </div>
      <div className={status}>{lang === "he" ? "הדמיה:" : "Sim:"} {systemDemoActive ? `✅ ${systemDemo}` : (lang === "he" ? "מוכן" : "Ready")}</div>

      {/* Performance */}
      <div className="flex flex-col gap-1.5 border-t border-border pt-3">
        <span className={label}>{lang === "he" ? "מצב ביצועים" : "Performance"}</span>
        <select value={performanceMode} onChange={(e) => setPerformanceMode(e.target.value as PerformanceMode)} className={select}>
          <option value="balanced">{lang === "he" ? "מאוזן" : "Balanced"}</option>
          <option value="max">{lang === "he" ? "מהירות מקסימלית" : "Max Speed"}</option>
          <option value="quality">{lang === "he" ? "איכות מקסימלית" : "Max Quality"}</option>
        </select>
      </div>
      <label className={toggle}>
        <input type="checkbox" checked={adaptiveQuality} onChange={toggleAdaptiveQuality} className="accent-primary w-4 h-4" />
        {lang === "he" ? "איכות דינמית" : "Adaptive Quality"}
      </label>
    </div>
  );
}
