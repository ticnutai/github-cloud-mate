import { useViewerStore } from "@/lib/viewerStore";

export default function StudyModePanel() {
  const lang = useViewerStore((s) => s.lang);
  const studyMode = useViewerStore((s) => s.studyMode);
  const toggleStudyMode = useViewerStore((s) => s.toggleStudyMode);
  const studyQuestion = useViewerStore((s) => s.studyQuestion);
  const studyRevealed = useViewerStore((s) => s.studyRevealed);
  const setStudyRevealed = useViewerStore((s) => s.setStudyRevealed);
  const meshes = useViewerStore((s) => s.meshes);
  const setSelectedMesh = useViewerStore((s) => s.setSelectedMesh);

  const btn = "px-2 py-1 text-[10px] bg-secondary border border-border rounded hover:bg-accent transition-colors";
  const status = "text-[10px] text-muted-foreground bg-secondary/50 rounded px-2 py-1";

  const generateQuestion = () => {
    if (meshes.length === 0) return;
    const visibleMeshes = meshes.filter((m) => m.visible);
    const pool = visibleMeshes.length > 0 ? visibleMeshes : meshes;
    const randomMesh = pool[Math.floor(Math.random() * pool.length)];

    // Hide all, highlight the random one
    meshes.forEach((m) => {
      m.object.visible = false;
    });
    randomMesh.object.visible = true;

    useViewerStore.setState({
      meshes: meshes.map((m) => ({
        ...m,
        visible: m.name === randomMesh.name,
      })),
      studyQuestion: randomMesh.name,
      studyRevealed: false,
      selectedMesh: randomMesh.name,
    });
  };

  const revealAnswer = () => {
    setStudyRevealed(true);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="text-xs font-semibold">{lang === "he" ? "מצב לימוד" : "Study Mode"}</div>

      <div className="flex gap-1 flex-wrap">
        <button onClick={toggleStudyMode} className={btn}>
          {lang === "he" ? "מצב לימוד:" : "Study Mode:"} {studyMode ? (lang === "he" ? "פעיל" : "On") : (lang === "he" ? "כבוי" : "Off")}
        </button>
        {studyMode && (
          <>
            <button onClick={revealAnswer} className={btn}>{lang === "he" ? "חשוף תשובה" : "Reveal"}</button>
            <button onClick={generateQuestion} className={btn}>{lang === "he" ? "שאלה הבאה" : "Next"}</button>
          </>
        )}
      </div>

      <div className={status}>
        {studyMode
          ? studyQuestion
            ? studyRevealed
              ? `✅ ${studyQuestion}`
              : (lang === "he" ? "מהו החלק המסומן?" : "What is this part?")
            : (lang === "he" ? "לחץ 'שאלה הבאה' להתחלה" : "Click 'Next' to start")
          : (lang === "he" ? "מצב לימוד לא פעיל" : "Study mode inactive")}
      </div>
    </div>
  );
}
