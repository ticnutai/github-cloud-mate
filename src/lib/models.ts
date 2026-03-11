export const REPO_BASE = "https://raw.githubusercontent.com/ticnutai/open3d_website/main";

export type ModelCategory = "anatomy" | "khronos" | "objects" | "external" | "uploaded";

export interface ModelEntry {
  key: string;
  path: string;
  labels: { he: string; en: string };
  mirror: boolean;
  category: ModelCategory;
  /** If set, use this URL directly instead of REPO_BASE/path */
  directUrl?: string;
}

export const MODEL_CATEGORIES: Record<ModelCategory, { he: string; en: string }> = {
  anatomy: { he: "🫀 אנטומיה", en: "🫀 Anatomy" },
  khronos: { he: "🎭 Khronos / הדגמה", en: "🎭 Khronos / Demo" },
  objects: { he: "🚗 רכבים ואובייקטים", en: "🚗 Vehicles & Objects" },
  external: { he: "🌐 מודלים חיצוניים", en: "🌐 External Models" },
  uploaded: { he: "📁 הועלו על ידך", en: "📁 Your Uploads" },
};

export const MODELS: ModelEntry[] = [
  // ── אנטומיה ──
  { key: "open3dmodel", path: "models/open3dmodel.glb", labels: { he: "מודל אנטומי מלא", en: "Open3DModel Full" }, mirror: false, category: "anatomy" },
  { key: "overview-skeleton", path: "models/overview-skeleton.glb", labels: { he: "שלד כללי", en: "Overview Skeleton" }, mirror: false, category: "anatomy" },
  { key: "overview-colored-skull", path: "models/overview-colored-skull.glb", labels: { he: "גולגולת צבעונית", en: "Overview Colored Skull" }, mirror: false, category: "anatomy" },
  { key: "exploded-skull", path: "models/exploded-skull.glb", labels: { he: "גולגולת מפורקת", en: "Exploded Skull" }, mirror: false, category: "anatomy" },
  { key: "colored-skull-base", path: "models/colored-skull-base.glb", labels: { he: "בסיס גולגולת צבעוני", en: "Colored Skull Base" }, mirror: false, category: "anatomy" },
  { key: "heart-human-organ3d", path: "models/heart-human-organ3d.glb", labels: { he: "לב", en: "Heart" }, mirror: false, category: "anatomy" },
  { key: "lungs-human-organ3d", path: "models/lungs-human-organ3d.glb", labels: { he: "ריאות", en: "Lungs" }, mirror: false, category: "anatomy" },
  { key: "kidneys-human-organ3d", path: "models/kidneys-human-organ3d.glb", labels: { he: "כליות", en: "Kidneys" }, mirror: false, category: "anatomy" },
  { key: "liver-human-organ3d", path: "models/liver-human-organ3d.glb", labels: { he: "כבד", en: "Liver" }, mirror: false, category: "anatomy" },
  { key: "hand", path: "models/hand.glb", labels: { he: "כף יד", en: "Hand" }, mirror: false, category: "anatomy" },
  { key: "lower-limb", path: "models/lower-limb.glb", labels: { he: "גפה תחתונה", en: "Lower Limb" }, mirror: false, category: "anatomy" },
  { key: "upper-limb", path: "models/upper-limb.glb", labels: { he: "גפה עליונה", en: "Upper Limb" }, mirror: false, category: "anatomy" },
  { key: "vertebrae", path: "models/vertebrae.glb", labels: { he: "חוליות", en: "Vertebrae" }, mirror: false, category: "anatomy" },
  // ── Khronos / הדגמה ──
  { key: "brainstem-khronos", path: "models/brainstem-khronos.glb", labels: { he: "גזע המוח (Khronos)", en: "Brainstem (Khronos)" }, mirror: false, category: "khronos" },
  { key: "scattering-skull-khronos", path: "models/scattering-skull-khronos.glb", labels: { he: "גולגולת פיזור אור (Khronos)", en: "Scattering Skull (Khronos)" }, mirror: false, category: "khronos" },
  { key: "recursive-skeletons-khronos", path: "models/recursive-skeletons-khronos.glb", labels: { he: "שלדים רקורסיביים (Khronos)", en: "Recursive Skeletons (Khronos)" }, mirror: false, category: "khronos" },
  { key: "rigged-figure-khronos", path: "models/rigged-figure-khronos.glb", labels: { he: "דמות ממורגת (Khronos)", en: "Rigged Figure (Khronos)" }, mirror: false, category: "khronos" },
  { key: "rigged-simple-khronos", path: "models/rigged-simple-khronos.glb", labels: { he: "ריג פשוט (Khronos)", en: "Rigged Simple (Khronos)" }, mirror: false, category: "khronos" },
  { key: "cesiumman-khronos", path: "models/cesiumman-khronos.glb", labels: { he: "אדם הדגמה (Khronos)", en: "Cesium Man (Khronos)" }, mirror: false, category: "khronos" },
  { key: "fox-khronos", path: "models/fox-khronos.glb", labels: { he: "שועל (Khronos)", en: "Fox (Khronos)" }, mirror: false, category: "khronos" },
  { key: "damaged-helmet-khronos", path: "models/damaged-helmet-khronos.glb", labels: { he: "קסדה פגומה (Khronos)", en: "Damaged Helmet (Khronos)" }, mirror: false, category: "khronos" },
  { key: "dragonattenuation-khronos", path: "models/dragonattenuation-khronos.glb", labels: { he: "דרקון מתקדם (Khronos)", en: "Dragon Attenuation (Khronos)" }, mirror: false, category: "khronos" },
  { key: "chronograph-watch-khronos", path: "models/chronograph-watch-khronos.glb", labels: { he: "שעון כרונוגרף (Khronos)", en: "Chronograph Watch (Khronos)" }, mirror: false, category: "khronos" },
  { key: "corset-khronos", path: "models/corset-khronos.glb", labels: { he: "דגם מחוך (Khronos)", en: "Corset (Khronos)" }, mirror: false, category: "khronos" },
  { key: "antique-camera-khronos", path: "models/antique-camera-khronos.glb", labels: { he: "מצלמה עתיקה (Khronos)", en: "Antique Camera (Khronos)" }, mirror: false, category: "khronos" },
  { key: "waterbottle-khronos", path: "models/waterbottle-khronos.glb", labels: { he: "בקבוק מים (Khronos)", en: "Water Bottle (Khronos)" }, mirror: false, category: "khronos" },
  // ── רכבים / אובייקטים ──
  { key: "ground-vehicle", path: "models/ground-vehicle.glb", labels: { he: "רכב קרקעי", en: "Ground Vehicle" }, mirror: false, category: "objects" },
  { key: "cesium-drone", path: "models/cesium-drone.glb", labels: { he: "רחפן", en: "Drone" }, mirror: false, category: "objects" },
  { key: "cesium-air", path: "models/cesium-air.glb", labels: { he: "מטוס Cesium", en: "Cesium Air" }, mirror: false, category: "objects" },
  { key: "boombox-khronos", path: "models/boombox-khronos.glb", labels: { he: "בומבוקס (Khronos)", en: "BoomBox (Khronos)" }, mirror: false, category: "objects" },
  { key: "carconcept-khronos", path: "models/carconcept-khronos.glb", labels: { he: "רכב קונספט (Khronos)", en: "Car Concept (Khronos)" }, mirror: false, category: "objects" },
  { key: "glam-velvet-sofa-khronos", path: "models/glam-velvet-sofa-khronos.glb", labels: { he: "ספת קטיפה יוקרתית (Khronos)", en: "Glam Velvet Sofa (Khronos)" }, mirror: false, category: "objects" },
  { key: "glass-vase-flowers-khronos", path: "models/glass-vase-flowers-khronos.glb", labels: { he: "אגרטל זכוכית עם פרחים (Khronos)", en: "Glass Vase Flowers (Khronos)" }, mirror: false, category: "objects" },
  // ── מודלים חיצוניים חינמיים ──
  { key: "ext-duck", path: "", labels: { he: "ברווז (Khronos Sample)", en: "Duck (Khronos Sample)" }, mirror: false, category: "external", directUrl: "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/Duck/glTF-Binary/Duck.glb" },
  { key: "ext-avocado", path: "", labels: { he: "אבוקדו תלת-ממד", en: "Avocado 3D" }, mirror: false, category: "external", directUrl: "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/Avocado/glTF-Binary/Avocado.glb" },
  { key: "ext-lantern", path: "", labels: { he: "פנס עתיק", en: "Lantern" }, mirror: false, category: "external", directUrl: "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/Lantern/glTF-Binary/Lantern.glb" },
  { key: "ext-brain", path: "", labels: { he: "מוח (אבוקדו דמו)", en: "Brain (Avocado Demo)" }, mirror: false, category: "external", directUrl: "https://raw.githubusercontent.com/AlaSQL/alasql.github.io/master/demo/003gltf/avocado/Avocado.glb" },
  { key: "ext-box-animated", path: "", labels: { he: "קוביה מונפשת", en: "Animated Box" }, mirror: false, category: "external", directUrl: "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/BoxAnimated/glTF-Binary/BoxAnimated.glb" },
  { key: "ext-animated-cube", path: "", labels: { he: "משולש מסתובב", en: "Animated Triangle" }, mirror: false, category: "external", directUrl: "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/AnimatedTriangle/glTF-Embedded/AnimatedTriangle.gltf" },
];

export function getModelUrl(model: ModelEntry): string {
  if (model.directUrl) return model.directUrl;
  return `${REPO_BASE}/${model.path}`;
}
