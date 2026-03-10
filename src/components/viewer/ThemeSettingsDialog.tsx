import { useState } from "react";
import { useViewerStore } from "@/lib/viewerStore";

interface ThemeSettingsDialogProps {
  onClose: () => void;
}

const THEMES = [
  { key: "ocean-pro", label: "Ocean Pro" },
  { key: "light-gold", label: "Light Gold Navy" },
  { key: "graphite-dark", label: "Graphite Dark" },
  { key: "mint-clinic", label: "Mint Clinic" },
];

export default function ThemeSettingsDialog({ onClose }: ThemeSettingsDialogProps) {
  const lang = useViewerStore((s) => s.lang);
  const [activeTheme, setActiveTheme] = useState("ocean-pro");
  const [colors, setColors] = useState({
    frameBorder: "#d4af37",
    modelBg: "#000000",
    modelBgSecondary: "#101820",
    controlBg: "#ffffff",
    controlBorder: "#c7d6eb",
    controlText: "#0a2e6e",
    tabActiveBg: "#1a73e8",
    tabActiveText: "#ffffff",
  });
  const [bgMode, setBgMode] = useState("solid");
  const [bgAngle, setBgAngle] = useState(135);

  const btn = "px-3 py-1.5 text-[11px] bg-secondary border border-border rounded hover:bg-accent transition-colors";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
      <div
        className="bg-card border border-border rounded-lg p-5 max-w-lg w-full mx-4 max-h-[80vh] overflow-y-auto shadow-2xl"
        dir={lang === "he" ? "rtl" : "ltr"}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-sm font-semibold mb-3">
          {lang === "he" ? "הגדרות תצוגה וערכות נושא" : "Display & Theme Settings"}
        </h3>

        {/* Theme presets */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          {THEMES.map((theme) => (
            <button
              key={theme.key}
              onClick={() => setActiveTheme(theme.key)}
              className={`px-3 py-2 text-[11px] rounded border transition-colors ${
                activeTheme === theme.key
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-secondary border-border hover:bg-accent"
              }`}
            >
              {theme.label}
            </button>
          ))}
        </div>

        {/* Color customization */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {Object.entries({
            frameBorder: lang === "he" ? "מסגרת מרכזית" : "Frame Border",
            modelBg: lang === "he" ? "רקע מודל" : "Model Background",
            modelBgSecondary: lang === "he" ? "צבע שני לרקע" : "Secondary BG",
            controlBg: lang === "he" ? "רקע שדות" : "Control BG",
            controlBorder: lang === "he" ? "מסגרת שדות" : "Control Border",
            controlText: lang === "he" ? "טקסט כללי" : "General Text",
            tabActiveBg: lang === "he" ? "רקע טאב פעיל" : "Active Tab BG",
            tabActiveText: lang === "he" ? "טקסט טאב פעיל" : "Active Tab Text",
          }).map(([key, labelText]) => (
            <div key={key} className="flex items-center gap-2">
              <input
                type="color"
                value={(colors as any)[key]}
                onChange={(e) => setColors({ ...colors, [key]: e.target.value })}
                className="w-6 h-6 rounded border border-border cursor-pointer"
              />
              <span className="text-[10px] text-muted-foreground">{labelText}</span>
            </div>
          ))}
        </div>

        {/* BG mode */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[10px] text-muted-foreground">{lang === "he" ? "סוג רקע" : "BG Mode"}</span>
          <select value={bgMode} onChange={(e) => setBgMode(e.target.value)} className="bg-secondary border border-border rounded px-2 py-1 text-[10px]">
            <option value="solid">{lang === "he" ? "אחיד" : "Solid"}</option>
            <option value="linear">{lang === "he" ? "ליניארי" : "Linear"}</option>
            <option value="radial">{lang === "he" ? "רדיאלי" : "Radial"}</option>
          </select>
          {bgMode !== "solid" && (
            <>
              <span className="text-[10px] text-muted-foreground">{lang === "he" ? "זווית" : "Angle"}</span>
              <input type="number" min="0" max="360" value={bgAngle} onChange={(e) => setBgAngle(parseInt(e.target.value))} className="w-14 bg-secondary border border-border rounded px-1.5 py-1 text-[10px] font-mono" />
            </>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 flex-wrap">
          <button className={btn}>{lang === "he" ? "איפוס צבעים" : "Reset Colors"}</button>
          <button className={btn}>{lang === "he" ? "ייצוא ערכה" : "Export Theme"}</button>
          <button className={btn}>{lang === "he" ? "ייבוא ערכה" : "Import Theme"}</button>
          <button onClick={onClose} className={`${btn} bg-primary text-primary-foreground`}>
            {lang === "he" ? "סגור" : "Close"}
          </button>
        </div>
      </div>
    </div>
  );
}
