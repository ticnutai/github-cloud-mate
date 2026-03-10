import { useRef, useEffect, useCallback, Suspense, useState } from "react";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
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

/** Stores original positions for explode animation */
const originalPositions = new Map<string, THREE.Vector3>();
const explodeDirections = new Map<string, THREE.Vector3>();

function AnimationController() {
  const { scene, camera } = useThree();
  const animationType = useViewerStore((s) => s.animationType);
  const animationPlaying = useViewerStore((s) => s.animationPlaying);
  const animationSpeed = useViewerStore((s) => s.animationSpeed);
  const timeRef = useRef(0);
  const explodeInitialized = useRef(false);
  const orbitAngleRef = useRef(0);
  const originalScaleRef = useRef<THREE.Vector3 | null>(null);

  // Store original positions on first encounter
  useEffect(() => {
    if (animationType === "explode" && !explodeInitialized.current) {
      const center = new THREE.Vector3();
      const box = new THREE.Box3().setFromObject(scene);
      box.getCenter(center);

      scene.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          if (!originalPositions.has(child.uuid)) {
            originalPositions.set(child.uuid, child.position.clone());
          }
          // Direction from center to mesh
          const meshCenter = new THREE.Vector3();
          new THREE.Box3().setFromObject(child).getCenter(meshCenter);
          const dir = meshCenter.sub(center).normalize();
          if (dir.length() < 0.01) dir.set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize();
          explodeDirections.set(child.uuid, dir);
        }
      });
      explodeInitialized.current = true;
    }

    if (animationType !== "explode") {
      explodeInitialized.current = false;
    }
  }, [animationType, scene]);

  // Store original scale
  useEffect(() => {
    if (!originalScaleRef.current) {
      originalScaleRef.current = scene.scale.clone();
    }
  }, [scene]);

  // Reset everything when animation type changes to "none"
  useEffect(() => {
    if (animationType === "none") {
      // Reset scale
      if (originalScaleRef.current) {
        scene.scale.copy(originalScaleRef.current);
      }
      // Reset explode positions
      scene.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const orig = originalPositions.get(child.uuid);
          if (orig) child.position.copy(orig);
        }
      });
      timeRef.current = 0;
      orbitAngleRef.current = 0;
    }
  }, [animationType, scene]);

  useFrame((_, delta) => {
    if (!animationPlaying || animationType === "none") return;

    const speed = animationSpeed;
    timeRef.current += delta * speed;
    const t = timeRef.current;

    if (animationType === "breathing") {
      // Subtle scale pulse — breathing effect
      const breathScale = 1 + Math.sin(t * 2) * 0.03;
      const base = originalScaleRef.current || new THREE.Vector3(1, 1, 1);
      scene.scale.set(
        base.x * breathScale,
        base.y * (1 + Math.sin(t * 2) * 0.05), // more Y movement for breathing
        base.z * breathScale
      );
    }

    if (animationType === "presentation") {
      // Orbit camera around the model
      orbitAngleRef.current += delta * speed * 0.5;
      const angle = orbitAngleRef.current;
      const box = new THREE.Box3().setFromObject(scene);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);
      const fov = (camera as THREE.PerspectiveCamera).fov * (Math.PI / 180);
      const dist = maxDim / (2 * Math.tan(fov / 2)) * 1.5;

      camera.position.set(
        center.x + Math.sin(angle) * dist,
        center.y + dist * 0.3,
        center.z + Math.cos(angle) * dist
      );
      camera.lookAt(center);
    }

    if (animationType === "explode") {
      // Explode meshes outward from center
      const explodeFactor = (Math.sin(t * 0.8) * 0.5 + 0.5) * 0.15; // oscillate 0→0.15
      scene.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const orig = originalPositions.get(child.uuid);
          const dir = explodeDirections.get(child.uuid);
          if (orig && dir) {
            child.position.set(
              orig.x + dir.x * explodeFactor,
              orig.y + dir.y * explodeFactor,
              orig.z + dir.z * explodeFactor
            );
          }
        }
      });
    }
  });

  return null;
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
  const animationType = useViewerStore((s) => s.animationType);
  const [key, setKey] = useState(0);

  useEffect(() => {
    setLoading(true);
    // Clear stored positions when model changes
    originalPositions.clear();
    explodeDirections.clear();
    setKey((k) => k + 1);
  }, [model, setLoading]);

  // Disable OrbitControls during presentation animation
  const disableOrbit = animationType === "presentation" && useViewerStore.getState().animationPlaying;

  return (
    <div className="w-full h-full bg-gradient-to-br from-slate-50 via-white to-amber-50/30 overflow-hidden">
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
          <AnimationController />
        </Suspense>
        <OrbitControls makeDefault enableDamping dampingFactor={0.1} enabled={!disableOrbit} />
      </Canvas>
    </div>
  );
}
