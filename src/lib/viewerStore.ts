import { create } from "zustand";
import type { Object3D } from "three";

export interface MeshInfo {
  name: string;
  visible: boolean;
  object: Object3D;
}

interface ViewerState {
  lang: "he" | "en";
  toggleLang: () => void;
  meshes: MeshInfo[];
  setMeshes: (meshes: MeshInfo[]) => void;
  toggleMesh: (name: string) => void;
  showAll: () => void;
  hideAll: () => void;
  invertVisibility: () => void;
  selectedMesh: string | null;
  setSelectedMesh: (name: string | null) => void;
  hoveredMesh: string | null;
  setHoveredMesh: (name: string | null) => void;
  xrayEnabled: boolean;
  toggleXray: () => void;
  xrayOpacity: number;
  setXrayOpacity: (v: number) => void;
  filterText: string;
  setFilterText: (t: string) => void;
  loading: boolean;
  setLoading: (l: boolean) => void;
}

export const useViewerStore = create<ViewerState>((set) => ({
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
  loading: false,
  setLoading: (l) => set({ loading: l }),
}));
