import { useState } from "react";
import { useViewerStore } from "@/lib/viewerStore";

export default function LayerManagerPanel() {
  const lang = useViewerStore((s) => s.lang);
  const selectedMesh = useViewerStore((s) => s.selectedMesh);
  const [layerName, setLayerName] = useState("");
  const [layerCategory, setLayerCategory] = useState("");
  const [categories, setCategories] = useState<string[]>(["עצמות", "שרירים", "עצבים", "כלי דם", "איברים"]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [newCategoryName, setNewCategoryName] = useState("");
  const [layerMeta, setLayerMeta] = useState<Record<string, { name?: string; category?: string }>>({});

  const btn = "px-3 py-2 text-xs bg-secondary border border-border rounded-lg hover:bg-accent transition-colors font-medium";
  const input = "w-full bg-secondary border border-border rounded-lg px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40";
  const label = "text-xs text-muted-foreground font-medium";

  const handleSaveMeta = () => {
    if (!selectedMesh) return;
    setLayerMeta((prev) => ({ ...prev, [selectedMesh]: { name: layerName || undefined, category: layerCategory || undefined } }));
  };

  const handleClearMeta = () => {
    if (!selectedMesh) return;
    setLayerMeta((prev) => { const n = { ...prev }; delete n[selectedMesh]; return n; });
    setLayerName("");
    setLayerCategory("");
  };

  const handleAddCategory = () => {
    if (newCategoryName && !categories.includes(newCategoryName)) {
      setCategories([...categories, newCategoryName]);
      setNewCategoryName("");
    }
  };

  const handleRenameCategory = () => {
    if (selectedCategory && newCategoryName) {
      setCategories(categories.map((c) => c === selectedCategory ? newCategoryName : c));
      setSelectedCategory(newCategoryName);
      setNewCategoryName("");
    }
  };

  const handleDeleteCategory = () => {
    if (selectedCategory) {
      setCategories(categories.filter((c) => c !== selectedCategory));
      setSelectedCategory("");
    }
  };

  return (
    <div className="flex flex-col gap-3.5">
      {/* Selected layer status */}
      <div className="text-xs text-muted-foreground bg-secondary/50 rounded-lg px-3 py-2">
        {selectedMesh ? `${lang === "he" ? "נבחר" : "Selected"}: ${selectedMesh}` : (lang === "he" ? "בחר שכבה לעריכה" : "Select a layer to edit")}
      </div>

      {/* Layer editor */}
      <div className="flex flex-col gap-2">
        <span className={label}>{lang === "he" ? "שם שכבה" : "Layer Name"}</span>
        <input value={layerName} onChange={(e) => setLayerName(e.target.value)} placeholder={lang === "he" ? "שם חדש לשכבה" : "New layer name"} className={input} />
        <span className={label}>{lang === "he" ? "קטגוריה" : "Category"}</span>
        <input value={layerCategory} onChange={(e) => setLayerCategory(e.target.value)} list="layer-categories" placeholder={lang === "he" ? "קטגוריה" : "Category"} className={input} />
        <datalist id="layer-categories">
          {categories.map((c) => <option key={c} value={c} />)}
        </datalist>
        <div className="flex gap-2">
          <button onClick={handleSaveMeta} disabled={!selectedMesh} className={`${btn} ${!selectedMesh ? "opacity-50" : ""}`}>{lang === "he" ? "שמור" : "Save"}</button>
          <button onClick={handleClearMeta} disabled={!selectedMesh} className={`${btn} ${!selectedMesh ? "opacity-50" : ""}`}>{lang === "he" ? "נקה" : "Clear"}</button>
        </div>
      </div>

      {/* Category Manager */}
      <div className="border-t border-border pt-3.5">
        <div className="text-xs font-semibold mb-2">{lang === "he" ? "מנהל קטגוריות" : "Category Manager"}</div>
        <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className={input}>
          <option value="">{lang === "he" ? "בחר קטגוריה" : "Select category"}</option>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <input value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} placeholder={lang === "he" ? "שם קטגוריה חדשה" : "New category name"} className={`${input} mt-2`} />
        <div className="flex gap-2 mt-2 flex-wrap">
          <button onClick={handleAddCategory} className={btn}>{lang === "he" ? "הוסף" : "Add"}</button>
          <button onClick={handleRenameCategory} disabled={!selectedCategory} className={`${btn} ${!selectedCategory ? "opacity-50" : ""}`}>{lang === "he" ? "ערוך" : "Rename"}</button>
          <button onClick={handleDeleteCategory} disabled={!selectedCategory} className={`${btn} ${!selectedCategory ? "opacity-50" : ""}`}>{lang === "he" ? "מחק" : "Delete"}</button>
        </div>
      </div>
    </div>
  );
}
