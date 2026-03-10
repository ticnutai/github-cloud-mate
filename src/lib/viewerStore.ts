import { create } from "zustand";
import type { Object3D, Camera } from "three";
import * as THREE from "three";

export interface MeshInfo {
  name: string;
  visible: boolean;
  object: Object3D;
  favorite?: boolean;
}

export type AnimationType = "none" | "breathing" | "gait" | "presentation" | "explode";
export type SystemDemo = "heart" | "respiratory" | "circulatory" | "lymphatic" | "urinary" | "head";
export type PerformanceMode = "balanced" | "max" | "quality";
export type ProPreset = "custom" | "clinical" | "teaching" | "presentation";
export type AnalysisPart = "all" | "head" | "upper-limb" | "lower-limb" | "spine" | "thorax" | "internal-organs" | "abdomen-pelvis" | "vascular" | "nervous" | "other";
export type LayerPreset = "all" | "bone" | "muscle" | "nerve" | "vessel";
export type SearchMode = "contains" | "starts" | "exact" | "fuzzy";

export interface CameraBookmark {
  name: string;
  position: [number, number, number];
  target: [number, number, number];
}

export interface XYZState {
  moveStep: number;
  rotateStep: number;
  scaleStep: number;
  snap: boolean;
  autoSave: boolean;
  symmetry: boolean;
  lockedParts: Set<string>;
  undoStack: { name: string; pos: [number, number, number]; rot: [number, number, number]; scale: [number, number, number] }[];
  redoStack: { name: string; pos: [number, number, number]; rot: [number, number, number]; scale: [number, number, number] }[];
}

interface ViewerState {
  lang: "he" | "en";
  toggleLang: () => void;

  // Meshes
  meshes: MeshInfo[];
  setMeshes: (meshes: MeshInfo[]) => void;
  toggleMesh: (name: string) => void;
  showAll: () => void;
  hideAll: () => void;
  invertVisibility: () => void;
  toggleFavorite: (name: string) => void;
  favoritesOnly: boolean;
  toggleFavoritesOnly: () => void;

  // Selection
  selectedMesh: string | null;
  setSelectedMesh: (name: string | null) => void;
  hoveredMesh: string | null;
  setHoveredMesh: (name: string | null) => void;

  // X-Ray
  xrayEnabled: boolean;
  toggleXray: () => void;
  xrayOpacity: number;
  setXrayOpacity: (v: number) => void;

  // Filter
  filterText: string;
  setFilterText: (t: string) => void;
  searchMode: SearchMode;
  setSearchMode: (m: SearchMode) => void;

  // Loading
  loading: boolean;
  setLoading: (l: boolean) => void;

  // Pro tools
  realisticMode: boolean;
  toggleRealisticMode: () => void;
  humanScale: boolean;
  toggleHumanScale: () => void;
  proPreset: ProPreset;
  setProPreset: (p: ProPreset) => void;

  // Animations
  animationType: AnimationType;
  setAnimationType: (a: AnimationType) => void;
  animationSpeed: number;
  setAnimationSpeed: (s: number) => void;
  animationPlaying: boolean;
  setAnimationPlaying: (p: boolean) => void;

  // System demo
  systemDemo: SystemDemo;
  setSystemDemo: (d: SystemDemo) => void;
  systemDemoActive: boolean;
  setSystemDemoActive: (a: boolean) => void;

  // Performance
  performanceMode: PerformanceMode;
  setPerformanceMode: (m: PerformanceMode) => void;
  adaptiveQuality: boolean;
  toggleAdaptiveQuality: () => void;

  // Analysis
  analysisPart: AnalysisPart;
  setAnalysisPart: (p: AnalysisPart) => void;
  analysisResult: string;
  setAnalysisResult: (r: string) => void;
  isolated: boolean;
  setIsolated: (i: boolean) => void;

  // Layer preset
  layerPreset: LayerPreset;
  setLayerPreset: (p: LayerPreset) => void;

  // Camera bookmarks
  bookmarks: CameraBookmark[];
  addBookmark: (b: CameraBookmark) => void;
  selectedBookmark: number;
  setSelectedBookmark: (i: number) => void;

  // Study mode
  studyMode: boolean;
  toggleStudyMode: () => void;
  studyQuestion: string | null;
  setStudyQuestion: (q: string | null) => void;
  studyRevealed: boolean;
  setStudyRevealed: (r: boolean) => void;

  // XYZ
  xyzEnabled: boolean;
  toggleXyz: () => void;
  xyz: XYZState;
  setXyzMoveStep: (v: number) => void;
  setXyzRotateStep: (v: number) => void;
  setXyzScaleStep: (v: number) => void;
  toggleXyzSnap: () => void;
  toggleXyzAutoSave: () => void;
  toggleXyzSymmetry: () => void;
  toggleXyzLock: (name: string) => void;

  // Neighbors
  highlightedNeighbors: string[];
  setHighlightedNeighbors: (names: string[]) => void;

  // Dialogs
  partDetailsOpen: boolean;
  setPartDetailsOpen: (o: boolean) => void;
  themeSettingsOpen: boolean;
  setThemeSettingsOpen: (o: boolean) => void;
  composerOpen: boolean;
  setComposerOpen: (o: boolean) => void;
  animGalleryOpen: boolean;
  setAnimGalleryOpen: (o: boolean) => void;

  // Compare
  compareModelKey: string | null;
  setCompareModelKey: (k: string | null) => void;
  compareActive: boolean;
  setCompareActive: (a: boolean) => void;

  // Timeline
  timelineActive: boolean;
  setTimelineActive: (a: boolean) => void;

  // Clinical tour
  clinicalTourActive: boolean;
  setClinicalTourActive: (a: boolean) => void;

  // Model position
  modelPosition: [number, number, number];
  setModelPosition: (p: [number, number, number]) => void;
  resetModelPosition: () => void;
  dragMode: boolean;
  toggleDragMode: () => void;
}

export const useViewerStore = create<ViewerState>((set, get) => ({
  lang: "he",
  toggleLang: () => set((s) => ({ lang: s.lang === "he" ? "en" : "he" })),

  meshes: [],
  setMeshes: (meshes) => set({ meshes }),
  toggleMesh: (name) =>
    set((s) => ({
      meshes: s.meshes.map((m) => {
        if (m.name === name) {
          m.object.visible = !m.visible;
          return { ...m, visible: !m.visible };
        }
        return m;
      }),
    })),
  showAll: () =>
    set((s) => ({
      meshes: s.meshes.map((m) => {
        m.object.visible = true;
        return { ...m, visible: true };
      }),
    })),
  hideAll: () =>
    set((s) => ({
      meshes: s.meshes.map((m) => {
        m.object.visible = false;
        return { ...m, visible: false };
      }),
    })),
  invertVisibility: () =>
    set((s) => ({
      meshes: s.meshes.map((m) => {
        m.object.visible = !m.visible;
        return { ...m, visible: !m.visible };
      }),
    })),
  toggleFavorite: (name) =>
    set((s) => ({
      meshes: s.meshes.map((m) =>
        m.name === name ? { ...m, favorite: !m.favorite } : m
      ),
    })),
  favoritesOnly: false,
  toggleFavoritesOnly: () => set((s) => ({ favoritesOnly: !s.favoritesOnly })),

  selectedMesh: null,
  setSelectedMesh: (name) => set({ selectedMesh: name }),
  hoveredMesh: null,
  setHoveredMesh: (name) => set({ hoveredMesh: name }),

  xrayEnabled: false,
  toggleXray: () => set((s) => ({ xrayEnabled: !s.xrayEnabled })),
  xrayOpacity: 0.35,
  setXrayOpacity: (v) => set({ xrayOpacity: v }),

  filterText: "",
  setFilterText: (t) => set({ filterText: t }),
  searchMode: "contains",
  setSearchMode: (m) => set({ searchMode: m }),

  loading: false,
  setLoading: (l) => set({ loading: l }),

  realisticMode: false,
  toggleRealisticMode: () => set((s) => ({ realisticMode: !s.realisticMode })),
  humanScale: false,
  toggleHumanScale: () => set((s) => ({ humanScale: !s.humanScale })),
  proPreset: "custom",
  setProPreset: (p) => set({ proPreset: p }),

  animationType: "none",
  setAnimationType: (a) => set({ animationType: a }),
  animationSpeed: 1,
  setAnimationSpeed: (s) => set({ animationSpeed: s }),
  animationPlaying: false,
  setAnimationPlaying: (p) => set({ animationPlaying: p }),

  systemDemo: "heart",
  setSystemDemo: (d) => set({ systemDemo: d }),
  systemDemoActive: false,
  setSystemDemoActive: (a) => set({ systemDemoActive: a }),

  performanceMode: "balanced",
  setPerformanceMode: (m) => set({ performanceMode: m }),
  adaptiveQuality: true,
  toggleAdaptiveQuality: () => set((s) => ({ adaptiveQuality: !s.adaptiveQuality })),

  analysisPart: "all",
  setAnalysisPart: (p) => set({ analysisPart: p }),
  analysisResult: "",
  setAnalysisResult: (r) => set({ analysisResult: r }),
  isolated: false,
  setIsolated: (i) => set({ isolated: i }),

  layerPreset: "all",
  setLayerPreset: (p) => set({ layerPreset: p }),

  bookmarks: [],
  addBookmark: (b) => set((s) => ({ bookmarks: [...s.bookmarks, b] })),
  selectedBookmark: 0,
  setSelectedBookmark: (i) => set({ selectedBookmark: i }),

  studyMode: false,
  toggleStudyMode: () => set((s) => ({ studyMode: !s.studyMode, studyQuestion: null, studyRevealed: false })),
  studyQuestion: null,
  setStudyQuestion: (q) => set({ studyQuestion: q }),
  studyRevealed: false,
  setStudyRevealed: (r) => set({ studyRevealed: r }),

  xyzEnabled: false,
  toggleXyz: () => set((s) => ({ xyzEnabled: !s.xyzEnabled })),
  xyz: {
    moveStep: 0.02,
    rotateStep: 5,
    scaleStep: 0.05,
    snap: true,
    autoSave: true,
    symmetry: false,
    lockedParts: new Set(),
    undoStack: [],
    redoStack: [],
  },
  setXyzMoveStep: (v) => set((s) => ({ xyz: { ...s.xyz, moveStep: v } })),
  setXyzRotateStep: (v) => set((s) => ({ xyz: { ...s.xyz, rotateStep: v } })),
  setXyzScaleStep: (v) => set((s) => ({ xyz: { ...s.xyz, scaleStep: v } })),
  toggleXyzSnap: () => set((s) => ({ xyz: { ...s.xyz, snap: !s.xyz.snap } })),
  toggleXyzAutoSave: () => set((s) => ({ xyz: { ...s.xyz, autoSave: !s.xyz.autoSave } })),
  toggleXyzSymmetry: () => set((s) => ({ xyz: { ...s.xyz, symmetry: !s.xyz.symmetry } })),
  toggleXyzLock: (name) =>
    set((s) => {
      const newLocked = new Set(s.xyz.lockedParts);
      if (newLocked.has(name)) newLocked.delete(name);
      else newLocked.add(name);
      return { xyz: { ...s.xyz, lockedParts: newLocked } };
    }),

  highlightedNeighbors: [],
  setHighlightedNeighbors: (names) => set({ highlightedNeighbors: names }),

  partDetailsOpen: false,
  setPartDetailsOpen: (o) => set({ partDetailsOpen: o }),
  themeSettingsOpen: false,
  setThemeSettingsOpen: (o) => set({ themeSettingsOpen: o }),
  composerOpen: false,
  setComposerOpen: (o) => set({ composerOpen: o }),
  animGalleryOpen: false,
  setAnimGalleryOpen: (o) => set({ animGalleryOpen: o }),

  compareModelKey: null,
  setCompareModelKey: (k) => set({ compareModelKey: k }),
  compareActive: false,
  setCompareActive: (a) => set({ compareActive: a }),

  timelineActive: false,
  setTimelineActive: (a) => set({ timelineActive: a }),

  clinicalTourActive: false,
  setClinicalTourActive: (a) => set({ clinicalTourActive: a }),

  modelPosition: [0, 0, 0] as [number, number, number],
  setModelPosition: (p: [number, number, number]) => set({ modelPosition: p }),
  resetModelPosition: () => set({ modelPosition: [0, 0, 0] }),
  dragMode: false,
  toggleDragMode: () => set((s) => ({ dragMode: !s.dragMode })),
}));
