import { useRef, useEffect, useCallback, Suspense, useState } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, useGLTF, Html } from "@react-three/drei";
import * as THREE from "three";
import { useViewerStore } from "@/lib/viewerStore";
import type { ModelEntry } from "@/lib/models";
import { getModelUrl } from "@/lib/models";

interface ModelProps {
  model: ModelEntry;
}

function Model({ model }: ModelProps) {
  const url = getModelUrl(model);
  const { scene } = useGLTF(url);
  const groupRef = useRef<THREE.Group>(null);
  const setMeshes = useViewerStore((s) => s.setMeshes);
  const setSelectedMesh = useViewerStore((s) => s.setSelectedMesh);
  const setHoveredMesh = useViewerStore((s) => s.setHoveredMesh);
  const xrayEnabled = useViewerStore((s) => s.xrayEnabled);
  const xrayOpacity = useViewerStore((s) => s.xrayOpacity);
  const selectedMesh = useViewerStore((s) => s.selectedMesh);
  const setLoading = useViewerStore((s) => s.setLoading);

  useEffect(() => {
    setLoading(false);
    const meshInfos: { name: string; visible: boolean; object: THREE.Object3D }[] = [];
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        meshInfos.push({ name: child.name || `mesh_${meshInfos.length}`, visible: child.visible, object: child });
      }
    });
    setMeshes(meshInfos);
  }, [scene, setMeshes, setLoading]);

  // Apply X-ray effect
  useEffect(() => {
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        const mat = mesh.material as THREE.MeshStandardMaterial;
        if (xrayEnabled) {
          mat.transparent = true;
          mat.opacity = mesh.name === selectedMesh ? 1 : xrayOpacity;
          mat.depthWrite = mesh.name === selectedMesh;
        } else {
          mat.transparent = false;
          mat.opacity = 1;
          mat.depthWrite = true;
        }
      }
    });
  }, [xrayEnabled, xrayOpacity, selectedMesh, scene]);

  const handleClick = useCallback(
    (e: any) => {
      e.stopPropagation();
      if (e.object?.name) {
        setSelectedMesh(e.object.name);
      }
    },
    [setSelectedMesh]
  );

  const handlePointerOver = useCallback(
    (e: any) => {
      e.stopPropagation();
      if (e.object?.name) setHoveredMesh(e.object.name);
    },
    [setHoveredMesh]
  );

  const handlePointerOut = useCallback(() => {
    setHoveredMesh(null);
  }, [setHoveredMesh]);

  return (
    <primitive
      ref={groupRef}
      object={scene}
      onClick={handleClick}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
    />
  );
}

function AutoFit() {
  const { camera, scene } = useThree();
  useEffect(() => {
    const box = new THREE.Box3().setFromObject(scene);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const fov = (camera as THREE.PerspectiveCamera).fov * (Math.PI / 180);
    const distance = maxDim / (2 * Math.tan(fov / 2)) * 1.5;
    camera.position.set(center.x + distance * 0.5, center.y + distance * 0.3, center.z + distance);
    camera.lookAt(center);
    (camera as THREE.PerspectiveCamera).near = distance / 100;
    (camera as THREE.PerspectiveCamera).far = distance * 100;
    camera.updateProjectionMatrix();
  }, [camera, scene]);
  return null;
}

function LoadingFallback() {
  return (
    <Html center>
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin" />
        <span className="text-sm text-muted-foreground">טוען מודל...</span>
      </div>
    </Html>
  );
}

interface SceneCanvasProps {
  model: ModelEntry;
}

export default function SceneCanvas({ model }: SceneCanvasProps) {
  const setLoading = useViewerStore((s) => s.setLoading);
  const [key, setKey] = useState(0);

  useEffect(() => {
    setLoading(true);
    setKey((k) => k + 1);
  }, [model, setLoading]);

  return (
    <div className="w-full h-full bg-black/90 rounded-lg overflow-hidden">
      <Canvas
        key={key}
        camera={{ position: [2, 1.5, 3], fov: 50 }}
        gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.2 }}
        onPointerMissed={() => useViewerStore.getState().setSelectedMesh(null)}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 8, 5]} intensity={1.2} castShadow />
        <directionalLight position={[-3, 4, -5]} intensity={0.5} />
        <hemisphereLight args={[0xffffff, 0x444444, 0.4]} />
        <Suspense fallback={<LoadingFallback />}>
          <Model model={model} />
          <AutoFit />
        </Suspense>
        <OrbitControls makeDefault enableDamping dampingFactor={0.1} />
      </Canvas>
    </div>
  );
}
