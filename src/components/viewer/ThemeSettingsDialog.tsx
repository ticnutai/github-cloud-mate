import { useState, useCallback } from "react";
import { useViewerStore } from "@/lib/viewerStore";

interface ThemeSettingsDialogProps {
  onClose: () => void;
}

interface ThemeColors {
  background: string;
  card: string;
  foreground: string;
  primary: string;
  gold: string;
  border: string;
  accent: string;
}

const THEMES: { key: string; labelHe: string; label: string; colors: ThemeColors }[] = [
  {
    key: "white-gold",
    labelHe: "לבן-זהב (ברירת מחדל)",
    label: "White Gold (Default)",
    colors: { background: "#f8f6f1", card: "#ffffff", foreground: "#1a2e52", primary: "#1a2e52", gold: "#c89520", border: "#c9a84c", accent: "#f0ead6" },
  },
  {
    key: "navy-gold",
    labelHe: "כחול נייבי-זהב",
    label: "Navy Gold",
    colors: { background: "#0f1a2e", card: "#162240", foreground: "#e8e0d0", primary: "#c89520", gold: "#c89520", border: "#2a3d60", accent: "#1c2d4e" },
  },
  {
    key: "cream-classic",
    labelHe: "קרם קלאסי",
    label: "Cream Classic",
    colors: { background: "#faf8f3", card: "#ffffff", foreground: "#2c1810", primary: "#8b4513", gold: "#b8860b", border: "#d4c4a0", accent: "#f5eed6" },
  },
  {
    key: "slate-modern",
    labelHe: "מודרני אפור",
    label: "Slate Modern",
    colors: { background: "#f1f5f9", card: "#ffffff", foreground: "#0f172a", primary: "#334155", gold: "#a3873c", border: "#cbd5e1", accent: "#e2e8f0" },
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
  root.style.setProperty("--secondary", hexToHsl(colors.accent));
  root.style.setProperty("--secondary-foreground", hexToHsl(colors.foreground));
  root.style.setProperty("--muted", hexToHsl(colors.accent));
  root.style.setProperty("--muted-foreground", hexToHsl(colors.foreground + "88").replace("88", ""));
  root.style.setProperty("--accent", hexToHsl(colors.accent));
  root.style.setProperty("--accent-foreground", hexToHsl(colors.foreground));
  root.style.setProperty("--border", hexToHsl(colors.border));
  root.style.setProperty("--input", hexToHsl(colors.border));
  root.style.setProperty("--ring", hexToHsl(colors.gold));
  root.style.setProperty("--gold", hexToHsl(colors.gold));
  root.style.setProperty("--sidebar-background", hexToHsl(colors.card));
  root.style.setProperty("--sidebar-foreground", hexToHsl(colors.foreground));
  root.style.setProperty("--sidebar-primary", hexToHsl(colors.primary));
  root.style.setProperty("--sidebar-accent", hexToHsl(colors.accent));
  root.style.setProperty("--sidebar-border", hexToHsl(colors.border));
  root.style.setProperty("--sidebar-ring", hexToHsl(colors.gold));
}

export default function ThemeSettingsDialog({ onClose }: ThemeSettingsDialogProps) {
  const lang = useViewerStore((s) => s.lang);
  const [activeTheme, setActiveTheme] = useState("white-gold");
  const isRtl = lang === "he";

  const activeColors = THEMES.find((t) => t.key === activeTheme)?.colors || THEMES[0].colors;

  const handleSelectTheme = useCallback((key: string) => {
    setActiveTheme(key);
    const theme = THEMES.find((t) => t.key === key);
    if (theme) applyTheme(theme.colors);
  }, []);

  const handleReset = useCallback(() => {
    handleSelectTheme("white-gold");
  }, [handleSelectTheme]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-card border-2 rounded-xl p-6 max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto gold-glow"
        style={{ borderColor: 'hsl(43 74% 49%)' }}
        dir="rtl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-base font-bold mb-4 text-foreground flex items-center gap-2">
          <span className="w-6 h-6 rounded-md bg-primary flex items-center justify-center">
            <span className="text-primary-foreground text-[10px] font-bold">🎨</span>
          </span>
          {isRtl ? "ערכות נושא" : "Theme Settings"}
        </h3>

        {/* Theme presets */}
        <div className="grid grid-cols-2 gap-2.5 mb-5">
          {THEMES.map((theme) => (
            <button
              key={theme.key}
              onClick={() => handleSelectTheme(theme.key)}
              className={`px-3 py-3 text-[11px] font-medium rounded-lg border-2 transition-all duration-200 ${
                activeTheme === theme.key
                  ? "border-gold bg-gold/10 text-foreground shadow-md"
                  : "border-border bg-secondary hover:bg-accent hover:border-gold/40"
              }`}
            >
              {isRtl ? theme.labelHe : theme.label}
            </button>
          ))}
        </div>

        {/* Preview strip */}
        <div className="mb-5 rounded-lg border-2 border-border overflow-hidden h-10 flex shadow-inner">
          <div className="flex-1 transition-colors duration-300" style={{ background: activeColors.background }} />
          <div className="flex-1 transition-colors duration-300" style={{ background: activeColors.card }} />
          <div className="flex-1 transition-colors duration-300" style={{ background: activeColors.primary }} />
          <div className="flex-1 transition-colors duration-300" style={{ background: activeColors.gold }} />
          <div className="flex-1 transition-colors duration-300" style={{ background: activeColors.border }} />
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button onClick={handleReset} className="flex-1 px-3 py-2 text-[11px] font-medium bg-secondary border border-border rounded-lg hover:bg-accent transition-colors">
            {isRtl ? "איפוס" : "Reset"}
          </button>
          <button onClick={onClose} className="flex-1 px-3 py-2 text-[11px] font-medium bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity">
            {isRtl ? "סגור" : "Close"}
          </button>
        </div>
      </div>
    </div>
  );
}
