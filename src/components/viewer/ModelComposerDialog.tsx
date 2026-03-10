import { useState } from "react";
import { useViewerStore } from "@/lib/viewerStore";
import { MODELS, type ModelEntry } from "@/lib/models";

interface ModelComposerDialogProps {
  onClose: () => void;
}

export default function ModelComposerDialog({ onClose }: ModelComposerDialogProps) {
  const lang = useViewerStore((s) => s.lang);
  const [selectedModels, setSelectedModels] = useState<Set<string>>(new Set());
  const [composerName, setComposerName] = useState("");

  const btn = "px-3 py-1.5 text-[11px] bg-secondary border border-border rounded hover:bg-accent transition-colors";

  const toggleModel = (key: string) => {
    const next = new Set(selectedModels);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    setSelectedModels(next);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
      <div
        className="bg-card border border-border rounded-lg p-5 max-w-lg w-full mx-4 max-h-[80vh] overflow-y-auto shadow-2xl"
        dir={lang === "he" ? "rtl" : "ltr"}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-sm font-semibold mb-3">🧩 Model Composer</h3>

        <div className="mb-3">
          <label className="text-[10px] text-muted-foreground block mb-1">
            {lang === "he" ? "שם מודל מורכב" : "Composite Model Name"}
          </label>
          <input
            type="text"
            value={composerName}
            onChange={(e) => setComposerName(e.target.value)}
            placeholder={lang === "he" ? "לדוגמה: לב בתוך שלד" : "e.g. Heart inside skeleton"}
            className="w-full bg-secondary border border-border rounded px-2 py-1.5 text-[11px] font-mono"
          />
        </div>

        <div className="flex gap-1 mb-3">
          <button onClick={() => setSelectedModels(new Set(MODELS.map((m) => m.key)))} className={btn}>
            {lang === "he" ? "בחר הכל" : "Select All"}
          </button>
          <button onClick={() => setSelectedModels(new Set())} className={btn}>
            {lang === "he" ? "נקה בחירה" : "Clear All"}
          </button>
        </div>

        <div className="flex flex-col gap-1 max-h-[40vh] overflow-y-auto">
          {MODELS.map((model) => (
            <label key={model.key} className="flex items-center gap-2 px-2 py-1.5 hover:bg-accent rounded cursor-pointer text-[11px]">
              <input
                type="checkbox"
                checked={selectedModels.has(model.key)}
                onChange={() => toggleModel(model.key)}
                className="accent-primary w-3 h-3"
              />
              <span>{lang === "he" ? model.labels.he : model.labels.en}</span>
            </label>
          ))}
        </div>

        <div className="flex gap-2 mt-4 flex-wrap">
          <button className={`${btn} bg-primary text-primary-foreground`}>
            {lang === "he" ? "בנה והוסף" : "Build & Add"}
          </button>
          <button className={btn}>{lang === "he" ? "ייצא GLB" : "Export GLB"}</button>
          <button onClick={onClose} className={btn}>{lang === "he" ? "סגור" : "Close"}</button>
        </div>
      </div>
    </div>
  );
}
