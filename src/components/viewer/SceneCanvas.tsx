import { useRef, useEffect, useCallback, Suspense, useState } from "react";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF, Html, GizmoHelper, GizmoViewport } from "@react-three/drei";
import * as THREE from "three";
import { useViewerStore } from "@/lib/viewerStore";
import type { ModelEntry } from "@/lib/models";
import { getModelUrl } from "@/lib/models";

// Module-level refs
let orbitControlsRef: any = null;
const originalEmissive = new Map<string, { color: THREE.Color; intensity: number }>();
const originalPositions = new Map<string, THREE.Vector3>();
const explodeDirections = new Map<string, THREE.Vector3>();

// ─── Model ───
interface ModelProps { model: ModelEntry; }

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
  const modelPosition = useViewerStore((s) => s.modelPosition);

  useEffect(() => {
    setLoading(false);
    const meshInfos: { name: string; visible: boolean; object: THREE.Object3D }[] = [];
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        meshInfos.push({ name: child.name || `mesh_${meshInfos.length}`, visible: child.visible, object: child });
        // Store original emissive
        const mat = (child as THREE.Mesh).material as THREE.MeshStandardMaterial;
        if (mat.emissive && !originalEmissive.has(child.uuid)) {
          originalEmissive.set(child.uuid, { color: mat.emissive.clone(), intensity: mat.emissiveIntensity });
        }
      }
    });
    setMeshes(meshInfos);
  }, [scene, setMeshes, setLoading]);

  // X-ray effect
  useEffect(() => {
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mat = (child as THREE.Mesh).material as THREE.MeshStandardMaterial;
        if (xrayEnabled) {
          mat.transparent = true;
          mat.opacity = child.name === selectedMesh ? 1 : xrayOpacity;
          mat.depthWrite = child.name === selectedMesh;
        } else {
          mat.transparent = false;
          mat.opacity = 1;
          mat.depthWrite = true;
        }
      }
    });
  }, [xrayEnabled, xrayOpacity, selectedMesh, scene]);

  const handleClick = useCallback((e: any) => {
    e.stopPropagation();
    if (e.object?.name) setSelectedMesh(e.object.name);
  }, [setSelectedMesh]);

  const handleDoubleClick = useCallback((e: any) => {
    e.stopPropagation();
    if (e.object?.name) {
      setSelectedMesh(e.object.name);
      useViewerStore.getState().setPartDetailsOpen(true);
    }
  }, [setSelectedMesh]);

  const handlePointerOver = useCallback((e: any) => {
    e.stopPropagation();
    if (e.object?.name) setHoveredMesh(e.object.name);
  }, [setHoveredMesh]);

  const handlePointerOut = useCallback(() => setHoveredMesh(null), [setHoveredMesh]);

  return (
    <group position={modelPosition}>
      <primitive
        ref={groupRef}
        object={scene}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      />
    </group>
  );
}

// ─── Highlight Controller ───
function HighlightController() {
  const { scene } = useThree();
  const selectedMesh = useViewerStore((s) => s.selectedMesh);
  const hoveredMesh = useViewerStore((s) => s.hoveredMesh);

  useEffect(() => {
    scene.traverse((child) => {
      if (!(child as THREE.Mesh).isMesh) return;
      const mat = (child as THREE.Mesh).material as THREE.MeshStandardMaterial;
      if (!mat.emissive) return;
      const orig = originalEmissive.get(child.uuid);

      if (child.name === selectedMesh) {
        mat.emissive.setHex(0xcc9900);
        mat.emissiveIntensity = 0.5;
      } else if (child.name === hoveredMesh) {
        mat.emissive.setHex(0x3388ff);
        mat.emissiveIntensity = 0.25;
      } else if (orig) {
        mat.emissive.copy(orig.color);
        mat.emissiveIntensity = orig.intensity;
      }
    });
  }, [selectedMesh, hoveredMesh, scene]);

  return null;
}

// ─── Camera Controller ───
function CameraController() {
  const { camera, scene } = useThree();
  const cameraAction = useViewerStore((s) => s.cameraAction);

  useEffect(() => {
    if (!cameraAction) return;
    const { type, payload } = cameraAction;
    const controls = orbitControlsRef;

    const getSceneInfo = () => {
      const box = new THREE.Box3().setFromObject(scene);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);
      const fov = (camera as THREE.PerspectiveCamera).fov * (Math.PI / 180);
      const dist = maxDim / (2 * Math.tan(fov / 2)) * 1.5;
      return { center, size, maxDim, dist };
    };

    const animateTo = (pos: THREE.Vector3, target: THREE.Vector3) => {
      const startPos = camera.position.clone();
      const startTarget = controls?.target?.clone() || new THREE.Vector3();
      let t = 0;
      const animate = () => {
        t += 0.05;
        if (t > 1) t = 1;
        const ease = t * (2 - t); // ease-out
        camera.position.lerpVectors(startPos, pos, ease);
        if (controls) {
          controls.target.lerpVectors(startTarget, target, ease);
          controls.update();
        }
        camera.lookAt(target);
        if (t < 1) requestAnimationFrame(animate);
      };
      animate();
    };

    switch (type) {
      case "zoomIn": {
        const dir = new THREE.Vector3().subVectors(
          controls?.target || new THREE.Vector3(), camera.position
        ).normalize();
        camera.position.addScaledVector(dir, 0.5);
        controls?.update();
        break;
      }
      case "zoomOut": {
        const dir2 = new THREE.Vector3().subVectors(
          controls?.target || new THREE.Vector3(), camera.position
        ).normalize();
        camera.position.addScaledVector(dir2, -0.5);
        controls?.update();
        break;
      }
      case "reset": {
        const { center, dist } = getSceneInfo();
        animateTo(
          new THREE.Vector3(center.x + dist * 0.5, center.y + dist * 0.3, center.z + dist),
          center
        );
        break;
      }
      case "focus": {
        const meshName = useViewerStore.getState().selectedMesh;
        if (!meshName) break;
        const meshes = useViewerStore.getState().meshes;
        const mesh = meshes.find(m => m.name === meshName);
        if (!mesh) break;
        const meshBox = new THREE.Box3().setFromObject(mesh.object);
        const meshCenter = meshBox.getCenter(new THREE.Vector3());
        const meshSize = meshBox.getSize(new THREE.Vector3());
        const maxDim = Math.max(meshSize.x, meshSize.y, meshSize.z) || 0.5;
        const fov = (camera as THREE.PerspectiveCamera).fov * (Math.PI / 180);
        const focusDist = maxDim / (2 * Math.tan(fov / 2)) * 2.5;
        const offset = camera.position.clone().sub(controls?.target || new THREE.Vector3()).normalize().multiplyScalar(focusDist);
        animateTo(meshCenter.clone().add(offset), meshCenter);
        break;
      }
      case "front": {
        const { center, dist } = getSceneInfo();
        animateTo(new THREE.Vector3(center.x, center.y, center.z + dist), center);
        break;
      }
      case "side": {
        const { center, dist } = getSceneInfo();
        animateTo(new THREE.Vector3(center.x + dist, center.y, center.z), center);
        break;
      }
      case "top": {
        const { center, dist } = getSceneInfo();
        animateTo(new THREE.Vector3(center.x, center.y + dist, center.z + 0.01), center);
        break;
      }
      case "goToBookmark": {
        if (payload) {
          const pos = new THREE.Vector3(...payload.position);
          const target = new THREE.Vector3(...payload.target);
          animateTo(pos, target);
        }
        break;
      }
      case "saveBookmark": {
        const pos = camera.position.toArray() as [number, number, number];
        const target = (controls?.target?.toArray() || [0, 0, 0]) as [number, number, number];
        useViewerStore.getState().addBookmark({
          name: payload?.name || `Bookmark ${useViewerStore.getState().bookmarks.length + 1}`,
          position: pos,
          target: target,
        });
        break;
      }
    }

    // Clear the action
    useViewerStore.setState({ cameraAction: null });
  }, [cameraAction, camera, scene]);

  return null;
}

// ─── Grid Display ───
function GridDisplay() {
  const gridVisible = useViewerStore((s) => s.gridVisible);
  if (!gridVisible) return null;
  return (
    <>
      <gridHelper args={[10, 40, 0x888888, 0xcccccc]} position={[0, -0.01, 0]} />
      <axesHelper args={[2]} />
    </>
  );
}

// ─── Export Controller ───
function ExportController() {
  const { gl, scene, camera } = useThree();
  const exportAction = useViewerStore((s) => s.exportAction);

  useEffect(() => {
    if (!exportAction) return;

    if (exportAction === "image") {
      gl.render(scene, camera);
      const dataUrl = gl.domElement.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = "model-screenshot.png";
      link.href = dataUrl;
      link.click();
    }

    if (exportAction === "glb") {
      import("three/examples/jsm/exporters/GLTFExporter.js").then(({ GLTFExporter }) => {
        const exporter = new GLTFExporter();
        exporter.parse(scene, (result) => {
          const blob = new Blob([result as ArrayBuffer], { type: "application/octet-stream" });
          const link = document.createElement("a");
          link.download = "model-export.glb";
          link.href = URL.createObjectURL(blob);
          link.click();
          URL.revokeObjectURL(link.href);
        }, (error) => console.error("GLB export error:", error), { binary: true });
      });
    }

    if (exportAction === "record") {
      // Simple recording: capture frames for 8 seconds
      const frames: string[] = [];
      const fps = 15;
      const duration = 8;
      let frame = 0;
      const totalFrames = fps * duration;
      const interval = setInterval(() => {
        gl.render(scene, camera);
        frames.push(gl.domElement.toDataURL("image/webp", 0.8));
        frame++;
        if (frame >= totalFrames) {
          clearInterval(interval);
          // Download first and last frame as images (full video would need MediaRecorder)
          const link = document.createElement("a");
          link.download = "recording-frame.png";
          link.href = frames[frames.length - 1];
          link.click();
          console.log(`Recorded ${frames.length} frames`);
        }
      }, 1000 / fps);
    }

    useViewerStore.setState({ exportAction: null });
  }, [exportAction, gl, scene, camera]);

  return null;
}

// ─── Realistic Lighting ───
function RealisticLighting() {
  const realisticMode = useViewerStore((s) => s.realisticMode);
  const { scene } = useThree();

  useEffect(() => {
    if (realisticMode) {
      scene.environment = null; // Could add an HDR environment here
      scene.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mat = (child as THREE.Mesh).material as THREE.MeshStandardMaterial;
          if (mat.roughness !== undefined) {
            mat.roughness = 0.4;
            mat.metalness = 0.1;
          }
        }
      });
    } else {
      scene.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mat = (child as THREE.Mesh).material as THREE.MeshStandardMaterial;
          if (mat.roughness !== undefined) {
            mat.roughness = 1;
            mat.metalness = 0;
          }
        }
      });
    }
  }, [realisticMode, scene]);

  return realisticMode ? (
    <>
      <spotLight position={[5, 10, 5]} intensity={1.5} angle={0.4} penumbra={0.5} castShadow />
      <spotLight position={[-5, 8, -5]} intensity={0.8} angle={0.3} penumbra={0.7} />
    </>
  ) : null;
}

// ─── Animation Controller ───
function AnimationController() {
  const { scene, camera } = useThree();
  const animationType = useViewerStore((s) => s.animationType);
  const animationPlaying = useViewerStore((s) => s.animationPlaying);
  const animationSpeed = useViewerStore((s) => s.animationSpeed);
  const timeRef = useRef(0);
  const explodeInitialized = useRef(false);
  const orbitAngleRef = useRef(0);
  const originalScaleRef = useRef<THREE.Vector3 | null>(null);

  useEffect(() => {
    if (animationType === "explode" && !explodeInitialized.current) {
      const center = new THREE.Vector3();
      const box = new THREE.Box3().setFromObject(scene);
      box.getCenter(center);
      scene.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          if (!originalPositions.has(child.uuid)) originalPositions.set(child.uuid, child.position.clone());
          const meshCenter = new THREE.Vector3();
          new THREE.Box3().setFromObject(child).getCenter(meshCenter);
          const dir = meshCenter.sub(center).normalize();
          if (dir.length() < 0.01) dir.set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize();
          explodeDirections.set(child.uuid, dir);
        }
      });
      explodeInitialized.current = true;
    }
    if (animationType !== "explode") explodeInitialized.current = false;
  }, [animationType, scene]);

  useEffect(() => {
    if (!originalScaleRef.current) originalScaleRef.current = scene.scale.clone();
  }, [scene]);

  useEffect(() => {
    if (animationType === "none") {
      if (originalScaleRef.current) scene.scale.copy(originalScaleRef.current);
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

    if (animationType === "breathing" || animationType === "heartbeat") {
      const rate = animationType === "heartbeat" ? 4 : 2;
      const intensity = animationType === "heartbeat" ? 0.05 : 0.03;
      const breathScale = 1 + Math.sin(t * rate) * intensity;
      const base = originalScaleRef.current || new THREE.Vector3(1, 1, 1);
      scene.scale.set(base.x * breathScale, base.y * (1 + Math.sin(t * rate) * intensity * 1.6), base.z * breathScale);
    }

    if (animationType === "presentation") {
      orbitAngleRef.current += delta * speed * 0.5;
      const angle = orbitAngleRef.current;
      const box = new THREE.Box3().setFromObject(scene);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);
      const fov = (camera as THREE.PerspectiveCamera).fov * (Math.PI / 180);
      const dist = maxDim / (2 * Math.tan(fov / 2)) * 1.5;
      camera.position.set(center.x + Math.sin(angle) * dist, center.y + dist * 0.3, center.z + Math.cos(angle) * dist);
      camera.lookAt(center);
    }

    if (animationType === "explode") {
      const explodeFactor = (Math.sin(t * 0.8) * 0.5 + 0.5) * 0.15;
      scene.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const orig = originalPositions.get(child.uuid);
          const dir = explodeDirections.get(child.uuid);
          if (orig && dir) {
            child.position.set(orig.x + dir.x * explodeFactor, orig.y + dir.y * explodeFactor, orig.z + dir.z * explodeFactor);
          }
        }
      });
    }

    if (animationType === "bloodflow") {
      // Pulse emissive on vascular meshes
      const pulse = (Math.sin(t * 3) * 0.5 + 0.5) * 0.6;
      scene.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const name = child.name.toLowerCase();
          if (name.includes("artery") || name.includes("vein") || name.includes("vessel") || name.includes("aorta") || name.includes("blood") || name.includes("carotid")) {
            const mat = (child as THREE.Mesh).material as THREE.MeshStandardMaterial;
            mat.emissive.setHex(0xff2222);
            mat.emissiveIntensity = pulse;
          }
        }
      });
    }

    if (animationType === "gait") {
      // Simple Y-axis bob
      const base = originalScaleRef.current || new THREE.Vector3(1, 1, 1);
      scene.position.y = Math.sin(t * 3) * 0.02;
      scene.rotation.z = Math.sin(t * 1.5) * 0.02;
    }
  });

  return null;
}

// ─── Drag Controller ───
function DragController() {
  const { camera, gl, raycaster } = useThree();
  const dragMode = useViewerStore((s) => s.dragMode);
  const isDragging = useRef(false);
  const prevPoint = useRef<THREE.Vector3 | null>(null);
  const plane = useRef(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0));

  useEffect(() => {
    if (!dragMode) return;
    const canvas = gl.domElement;
    const getWorldPoint = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1
      );
      raycaster.setFromCamera(mouse, camera);
      const pt = new THREE.Vector3();
      raycaster.ray.intersectPlane(plane.current, pt);
      return pt;
    };
    const onDown = (e: PointerEvent) => {
      isDragging.current = true;
      const pos = useViewerStore.getState().modelPosition;
      plane.current.set(new THREE.Vector3(0, 1, 0), -pos[1]);
      prevPoint.current = getWorldPoint(e);
      canvas.style.cursor = "grabbing";
    };
    const onMove = (e: PointerEvent) => {
      if (!isDragging.current || !prevPoint.current) return;
      const curr = getWorldPoint(e);
      if (!curr) return;
      const delta = curr.clone().sub(prevPoint.current);
      const pos = useViewerStore.getState().modelPosition;
      useViewerStore.getState().setModelPosition([
        Math.round((pos[0] + delta.x) * 100) / 100,
        pos[1],
        Math.round((pos[2] + delta.z) * 100) / 100,
      ]);
      prevPoint.current = getWorldPoint(e);
    };
    const onUp = () => { isDragging.current = false; prevPoint.current = null; canvas.style.cursor = "grab"; };
    canvas.style.cursor = "grab";
    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerup", onUp);
    canvas.addEventListener("pointerleave", onUp);
    return () => {
      canvas.style.cursor = "";
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointerleave", onUp);
    };
  }, [dragMode, camera, gl, raycaster]);

  return null;
}

// ─── Auto Fit ───
function AutoFit() {
  const { camera, scene } = useThree();
  useEffect(() => {
    const box = new THREE.Box3().setFromObject(scene);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const fov = (camera as THREE.PerspectiveCamera).fov * (Math.PI / 180);
    const distance = maxDim / (2 * Math.tan(fov / 2)) * 2.2;
    camera.position.set(center.x + distance * 0.4, center.y + distance * 0.15, center.z + distance * 0.8);
    camera.lookAt(center);
    (camera as THREE.PerspectiveCamera).near = distance / 100;
    (camera as THREE.PerspectiveCamera).far = distance * 100;
    camera.updateProjectionMatrix();
    // Update orbit target to model center
    if (orbitControlsRef) {
      orbitControlsRef.target.copy(center);
      orbitControlsRef.update();
    }
  }, [camera, scene]);
  return null;
}

// ─── Loading Fallback ───
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

// ─── Main Scene ───
interface SceneCanvasProps { model: ModelEntry; }

export default function SceneCanvas({ model }: SceneCanvasProps) {
  const setLoading = useViewerStore((s) => s.setLoading);
  const animationType = useViewerStore((s) => s.animationType);
  const dragMode = useViewerStore((s) => s.dragMode);
  const [key, setKey] = useState(0);

  useEffect(() => {
    setLoading(true);
    originalPositions.clear();
    explodeDirections.clear();
    originalEmissive.clear();
    setKey((k) => k + 1);
  }, [model, setLoading]);

  const disableOrbit = dragMode || (animationType === "presentation" && useViewerStore.getState().animationPlaying);

  return (
    <div className="w-full h-full bg-gradient-to-br from-background via-background to-accent/10 overflow-hidden">
      <Canvas
        key={key}
        camera={{ position: [2, 1.5, 3], fov: 50 }}
        gl={{ antialias: true, preserveDrawingBuffer: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.2 }}
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
          <HighlightController />
          <CameraController />
          <ExportController />
          <RealisticLighting />
          <DragController />
        </Suspense>
        <GridDisplay />
        <OrbitControls
          ref={(ref) => { orbitControlsRef = ref; }}
          makeDefault
          enableDamping
          dampingFactor={0.1}
          enabled={!disableOrbit}
        />
      </Canvas>
    </div>
  );
}
