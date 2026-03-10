import { useViewerStore } from "@/lib/viewerStore";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { RotateCcw, Hand } from "lucide-react";

const AXES = [
  { idx: 0, label: "X", color: "text-destructive" },
  { idx: 1, label: "Y", color: "text-green-500" },
  { idx: 2, label: "Z", color: "text-blue-500" },
] as const;

const STEP = 0.1;
const RANGE = 5;

export default function ModelPositionPanel() {
  const lang = useViewerStore((s) => s.lang);
  const pos = useViewerStore((s) => s.modelPosition);
  const setPos = useViewerStore((s) => s.setModelPosition);
  const reset = useViewerStore((s) => s.resetModelPosition);
  const dragMode = useViewerStore((s) => s.dragMode);
  const toggleDrag = useViewerStore((s) => s.toggleDragMode);
  const isRtl = lang === "he";

  const update = (idx: number, val: number) => {
    const next: [number, number, number] = [...pos];
    next[idx] = Math.round(val * 100) / 100;
    setPos(next);
  };

  return (
    <div className="space-y-3">
      {/* Drag toggle */}
      <Button
        variant={dragMode ? "default" : "outline"}
        size="sm"
        className="w-full text-xs gap-1.5"
        onClick={toggleDrag}
      >
        <Hand className="w-3.5 h-3.5" />
        {isRtl
          ? dragMode ? "גרירה פעילה — לחץ לכבות" : "הפעל גרירה בעכבר"
          : dragMode ? "Drag Active — Click to Disable" : "Enable Mouse Drag"}
      </Button>

      {dragMode && (
        <p className="text-[10px] text-muted-foreground text-center">
          {isRtl ? "גרור את המודל בסצנה על משטח XZ" : "Drag model on the XZ plane"}
        </p>
      )}

      {AXES.map(({ idx, label, color }) => (
        <div key={label} className="space-y-1">
          <div className="flex items-center justify-between gap-2">
            <span className={`text-xs font-bold ${color}`}>{label}</span>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-6 w-6 text-xs"
                onClick={() => update(idx, pos[idx] - STEP)}
              >
                −
              </Button>
              <input
                type="number"
                step={STEP}
                value={pos[idx]}
                onChange={(e) => update(idx, parseFloat(e.target.value) || 0)}
                className="w-16 h-6 text-center text-[11px] bg-secondary border border-border rounded px-1 focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <Button
                variant="outline"
                size="icon"
                className="h-6 w-6 text-xs"
                onClick={() => update(idx, pos[idx] + STEP)}
              >
                +
              </Button>
            </div>
          </div>
          <Slider
            min={-RANGE}
            max={RANGE}
            step={0.01}
            value={[pos[idx]]}
            onValueChange={([v]) => update(idx, v)}
            className="w-full"
          />
        </div>
      ))}

      <Button
        variant="secondary"
        size="sm"
        className="w-full text-xs gap-1.5"
        onClick={reset}
      >
        <RotateCcw className="w-3 h-3" />
        {isRtl ? "מרכז מודל" : "Center Model"}
      </Button>
    </div>
  );
}
