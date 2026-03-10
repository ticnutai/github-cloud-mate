export const REPO_BASE = "https://raw.githubusercontent.com/ticnutai/open3d_website/main";

export interface ModelEntry {
  key: string;
  path: string;
  labels: { he: string; en: string };
  mirror: boolean;
}

export const MODELS: ModelEntry[] = [
  { key: "open3dmodel", path: "models/open3dmodel.glb", labels: { he: "מודל אנטומי מלא", en: "Open3DModel Full" }, mirror: false },
  { key: "overview-skeleton", path: "models/overview-skeleton.glb", labels: { he: "שלד כללי", en: "Overview Skeleton" }, mirror: false },
  { key: "overview-colored-skull", path: "models/overview-colored-skull.glb", labels: { he: "גולגולת צבעונית", en: "Overview Colored Skull" }, mirror: false },
  { key: "exploded-skull", path: "models/exploded-skull.glb", labels: { he: "גולגולת מפורקת", en: "Exploded Skull" }, mirror: false },
  { key: "colored-skull-base", path: "models/colored-skull-base.glb", labels: { he: "בסיס גולגולת צבעוני", en: "Colored Skull Base" }, mirror: false },
  { key: "heart-human-organ3d", path: "models/heart-human-organ3d.glb", labels: { he: "לב", en: "Heart" }, mirror: false },
  { key: "lungs-human-organ3d", path: "models/lungs-human-organ3d.glb", labels: { he: "ריאות", en: "Lungs" }, mirror: false },
  { key: "kidneys-human-organ3d", path: "models/kidneys-human-organ3d.glb", labels: { he: "כליות", en: "Kidneys" }, mirror: false },
  { key: "liver-human-organ3d", path: "models/liver-human-organ3d.glb", labels: { he: "כבד", en: "Liver" }, mirror: false },
  { key: "hand", path: "models/hand.glb", labels: { he: "כף יד", en: "Hand" }, mirror: false },
  { key: "lower-limb", path: "models/lower-limb.glb", labels: { he: "גפה תחתונה", en: "Lower Limb" }, mirror: false },
  { key: "upper-limb", path: "models/upper-limb.glb", labels: { he: "גפה עליונה", en: "Upper Limb" }, mirror: false },
  { key: "vertebrae", path: "models/vertebrae.glb", labels: { he: "חוליות", en: "Vertebrae" }, mirror: false },
  { key: "brainstem-khronos", path: "models/brainstem-khronos.glb", labels: { he: "גזע המוח", en: "Brainstem" }, mirror: false },
  { key: "fox-khronos", path: "models/fox-khronos.glb", labels: { he: "שועל", en: "Fox" }, mirror: false },
  { key: "damaged-helmet-khronos", path: "models/damaged-helmet-khronos.glb", labels: { he: "קסדה פגומה", en: "Damaged Helmet" }, mirror: false },
  { key: "ground-vehicle", path: "models/ground-vehicle.glb", labels: { he: "רכב קרקעי", en: "Ground Vehicle" }, mirror: false },
  { key: "cesium-drone", path: "models/cesium-drone.glb", labels: { he: "רחפן", en: "Drone" }, mirror: false },
];

export function getModelUrl(model: ModelEntry): string {
  return `${REPO_BASE}/${model.path}`;
}
