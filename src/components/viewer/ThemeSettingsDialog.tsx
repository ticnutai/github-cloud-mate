import { useState, useEffect, useCallback } from "react";
import { useViewerStore } from "@/lib/viewerStore";

interface ThemeSettingsDialogProps {
  onClose: () => void;
}

interface ThemeColors {
  background: string;
  backgroundSecondary: string;
  foreground: string;
  card: string;
  primary: string;
  border: string;
  accent: string;
  muted: string;
}

const THEMES: { key: string; label: string; labelHe: string; colors: ThemeColors }[] = [
  {
    key: "ocean-pro",
    label: "Ocean Pro",
    labelHe: "אוקיינוס מקצועי",
    colors: {
      background: "#111827",
      backgroundSecondary: "#101820",
      foreground: "#c9d1d9",
      card: "#1a2332",
      primary: "#3b82f6",
      border: "#2a3441",
      accent: "#2d3a4a",
      muted: "#2a3441",
    },
  },
  {
    key: "light-gold",
    label: "Light Gold Navy",
    labelHe: "זהב-כחול בהיר",
    colors: {
      background: "#0a1628",
      backgroundSecondary: "#0d1e36",
      foreground: "#e0d8c8",
      card: "#0f1f33",
      primary: "#d4af37",
      border: "#1e3050",
      accent: "#1a2d4a",
      muted: "#1e3050",
    },
  },
  {
    key: "graphite-dark",
    label: "Graphite Dark",
    labelHe: "גרפיט כהה",
    colors: {
      background: "#1a1a1a",
      backgroundSecondary: "#222222",
      foreground: "#b0b0b0",
      card: "#242424",
      primary: "#6b7280",
      border: "#333333",
      accent: "#2e2e2e",
      muted: "#333333",
    },
  },
  {
    key: "mint-clinic",
    label: "Mint Clinic",
    labelHe: "מנטה קליני",
    colors: {
      background: "#0d1f1a",
      backgroundSecondary: "#102820",
      foreground: "#c8e0d8",
      card: "#132a22",
      primary: "#34d399",
      border: "#1e3d30",
      accent: "#1a3528",
      muted: "#1e3d30",
    },
  },
];

function hexToHsl(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

function applyTheme(colors: ThemeColors) {
  const root = document.documentElement;
  root.style.setProperty("--background", hexToHsl(colors.background));
  root.style.setProperty("--foreground", hexToHsl(colors.foreground));
  root.style.setProperty("--card", hexToHsl(colors.card));
  root.style.setProperty("--card-foreground", hexToHsl(colors.foreground));
  root.style.setProperty("--popover", hexToHsl(colors.card));
  root.style.setProperty("--popover-foreground", hexToHsl(colors.foreground));
  root.style.setProperty("--primary", hexToHsl(colors.primary));
  root.style.setProperty("--secondary", hexToHsl(colors.backgroundSecondary));
  root.style.setProperty("--secondary-foreground", hexToHsl(colors.foreground));
  root.style.setProperty("--muted", hexToHsl(colors.muted));
  root.style.setProperty("--accent", hexToHsl(colors.accent));
  root.style.setProperty("--accent-foreground", hexToHsl(colors.foreground));
  root.style.setProperty("--border", hexToHsl(colors.border));
  root.style.setProperty("--input", hexToHsl(colors.border));
  root.style.setProperty("--ring", hexToHsl(colors.primary));
  root.style.setProperty("--sidebar-background", hexToHsl(colors.background));
  root.style.setProperty("--sidebar-foreground", hexToHsl(colors.foreground));
  root.style.setProperty("--sidebar-primary", hexToHsl(colors.primary));
  root.style.setProperty("--sidebar-accent", hexToHsl(colors.accent));
  root.style.setProperty("--sidebar-border", hexToHsl(colors.border));
  root.style.setProperty("--sidebar-ring", hexToHsl(colors.primary));
}

const DEFAULT_THEME = THEMES[0];

export default function ThemeSettingsDialog({ onClose }: ThemeSettingsDialogProps) {
  const lang = useViewerStore((s) => s.lang);
  const [activeTheme, setActiveTheme] = useState("ocean-pro");
  const [bgMode, setBgMode] = useState("solid");
  const [bgAngle, setBgAngle] = useState(135);

  const activeColors = THEMES.find((t) => t.key === activeTheme)?.colors || DEFAULT_THEME.colors;

  const handleSelectTheme = useCallback((key: string) => {
    setActiveTheme(key);
    const theme = THEMES.find((t) => t.key === key);
    if (theme) applyTheme(theme.colors);
  }, []);

  const handleReset = useCallback(() => {
    handleSelectTheme("ocean-pro");
  }, [handleSelectTheme]);

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
              onClick={() => handleSelectTheme(theme.key)}
              className={`px-3 py-2 text-[11px] rounded border transition-colors ${
                activeTheme === theme.key
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-secondary border-border hover:bg-accent"
              }`}
            >
              {lang === "he" ? theme.labelHe : theme.label}
            </button>
          ))}
        </div>

        {/* Preview strip */}
        <div className="mb-4 rounded border border-border overflow-hidden h-12 flex">
          <div className="flex-1" style={{ background: activeColors.background }} />
          <div className="flex-1" style={{ background: activeColors.card }} />
          <div className="flex-1" style={{ background: activeColors.primary }} />
          <div className="flex-1" style={{ background: activeColors.accent }} />
          <div className="flex-1" style={{ background: activeColors.border }} />
        </div>

        {/* BG mode */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[10px] text-muted-foreground">{lang === "he" ? "סוג רקע" : "BG Mode"}</span>
          <select value={bgMode} onChange={(e) => setBgMode(e.target.value)} className="bg-secondary border border-border rounded px-2 py-1 text-[10px] text-foreground">
            <option value="solid">{lang === "he" ? "אחיד" : "Solid"}</option>
            <option value="linear">{lang === "he" ? "ליניארי" : "Linear"}</option>
            <option value="radial">{lang === "he" ? "רדיאלי" : "Radial"}</option>
          </select>
          {bgMode !== "solid" && (
            <>
              <span className="text-[10px] text-muted-foreground">{lang === "he" ? "זווית" : "Angle"}</span>
              <input type="number" min="0" max="360" value={bgAngle} onChange={(e) => setBgAngle(parseInt(e.target.value))} className="w-14 bg-secondary border border-border rounded px-1.5 py-1 text-[10px] font-mono text-foreground" />
            </>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 flex-wrap">
          <button onClick={handleReset} className={btn}>{lang === "he" ? "איפוס צבעים" : "Reset Colors"}</button>
          <button onClick={onClose} className={`${btn} bg-primary text-primary-foreground hover:bg-primary/90`}>
            {lang === "he" ? "סגור" : "Close"}
          </button>
        </div>
      </div>
    </div>
  );
}
