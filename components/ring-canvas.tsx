"use client";

import { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer, OrbitControls } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import * as THREE from "three";

type MotionRef = { current: { progress: number } };
type RingCanvasProps = {
  mode: "story" | "interactive";
  progressRef?: MotionRef;
  anchorX?: number;
  controlsRef?: React.RefObject<OrbitControlsImpl | null>;
  label?: string;
};

type StoryFrame = { at: number; x: number; y: number; z: number; targetY: number };

const STORY_FRAMES: StoryFrame[] = [
  { at: 0, x: 0, y: 0.18, z: 5.8, targetY: 0.02 },
  { at: 0.17, x: -0.03, y: 0.2, z: 4.85, targetY: 0.12 },
  { at: 0.33, x: 0.18, y: 0.45, z: 3.75, targetY: 0.42 },
  { at: 0.5, x: 0.04, y: 0.92, z: 2.22, targetY: 1.0 },
  { at: 0.62, x: -0.08, y: 0.88, z: 2.55, targetY: 0.82 },
  { at: 0.72, x: 0.48, y: 0.36, z: 3.18, targetY: 0.25 },
  { at: 0.81, x: -0.78, y: 0.3, z: 3.22, targetY: 0.24 },
  { at: 0.9, x: 0.54, y: 0.23, z: 4.1, targetY: 0.15 },
  { at: 1, x: 0, y: 0.14, z: 5.35, targetY: 0.02 },
];

function storyFrame(progress: number, anchorX: number, mobile: boolean) {
  const lateral = mobile ? 0.48 : 1;
  const depth = mobile ? 1.08 : 1;
  const p = THREE.MathUtils.clamp(progress, 0, 1);
  let index = STORY_FRAMES.findIndex((frame, i) => i < STORY_FRAMES.length - 1 && p >= frame.at && p <= STORY_FRAMES[i + 1].at);
  if (index < 0) index = STORY_FRAMES.length - 2;
  const from = STORY_FRAMES[index];
  const to = STORY_FRAMES[index + 1];
  const linear = (p - from.at) / (to.at - from.at);
  const amount = THREE.MathUtils.smoothstep(linear, 0, 1);
  return {
    x: anchorX + THREE.MathUtils.lerp(from.x, to.x, amount) * lateral,
    y: THREE.MathUtils.lerp(from.y, to.y, amount),
    z: THREE.MathUtils.lerp(from.z, to.z, amount) * depth,
    targetY: THREE.MathUtils.lerp(from.targetY, to.targetY, amount),
  };
}

function createBandGeometry(majorRadius = 0.83, profileScale = 1) {
  const around = 192;
  const section = 40;
  const positions: number[] = [];
  const indices: number[] = [];

  for (let i = 0; i <= around; i += 1) {
    const theta = (i / around) * Math.PI * 2;
    const topNarrowing = Math.exp(-Math.pow((Math.sin(theta) - 1) / 0.31, 2));
    const lowerFullness = Math.exp(-Math.pow((Math.sin(theta) + 1) / 0.7, 2));
    const radialHalf = (0.112 - topNarrowing * 0.024 + lowerFullness * 0.006) * profileScale;
    const depthHalf = (0.055 - topNarrowing * 0.008) * profileScale;

    for (let j = 0; j <= section; j += 1) {
      const phi = (j / section) * Math.PI * 2;
      const ringRadius = majorRadius + Math.sin(phi) * radialHalf;
      positions.push(Math.cos(theta) * ringRadius, Math.sin(theta) * ringRadius, Math.cos(phi) * depthHalf);
    }
  }

  for (let i = 0; i < around; i += 1) {
    for (let j = 0; j < section; j += 1) {
      const a = i * (section + 1) + j;
      const b = (i + 1) * (section + 1) + j;
      const c = (i + 1) * (section + 1) + j + 1;
      const d = i * (section + 1) + j + 1;
      indices.push(a, d, b, b, d, c);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

function createDiamondGeometry() {
  const slices = 32;
  const profile = [
    { radius: 0.018, z: -0.235 },
    { radius: 0.135, z: -0.17 },
    { radius: 0.275, z: -0.085 },
    { radius: 0.35, z: -0.018 },
    { radius: 0.365, z: -0.005 },
    { radius: 0.34, z: 0.037 },
    { radius: 0.28, z: 0.098 },
    { radius: 0.19, z: 0.15 },
  ];
  const positions: number[] = [];
  const indices: number[] = [];

  for (const ring of profile) {
    for (let i = 0; i < slices; i += 1) {
      const angle = (i / slices) * Math.PI * 2;
      positions.push(Math.cos(angle) * ring.radius, Math.sin(angle) * ring.radius, ring.z);
    }
  }

  for (let layer = 0; layer < profile.length - 1; layer += 1) {
    for (let i = 0; i < slices; i += 1) {
      const next = (i + 1) % slices;
      const a = layer * slices + i;
      const b = layer * slices + next;
      const c = (layer + 1) * slices + next;
      const d = (layer + 1) * slices + i;
      indices.push(a, b, d, b, c, d);
    }
  }

  const tableIndex = (profile.length - 1) * slices;
  const centerIndex = positions.length / 3;
  positions.push(0, 0, profile[profile.length - 1].z + 0.002);
  for (let i = 0; i < slices; i += 1) {
    indices.push(tableIndex + i, tableIndex + ((i + 1) % slices), centerIndex);
  }

  const indexed = new THREE.BufferGeometry();
  indexed.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  indexed.setIndex(indices);
  const faceted = indexed.toNonIndexed();
  indexed.dispose();
  faceted.computeVertexNormals();
  return faceted;
}

function SupportRod({ start, end, radius = 0.022 }: { start: [number, number, number]; end: [number, number, number]; radius?: number }) {
  const { center, length, quaternion } = useMemo(() => {
    const a = new THREE.Vector3(...start);
    const b = new THREE.Vector3(...end);
    const direction = b.clone().sub(a);
    return {
      center: a.add(b).multiplyScalar(0.5),
      length: direction.length(),
      quaternion: new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize()),
    };
  }, [start, end]);

  return (
    <mesh position={center} quaternion={quaternion} castShadow>
      <cylinderGeometry args={[radius * 0.82, radius, length, 12]} />
      <meshStandardMaterial color="#d2ad68" metalness={0.98} roughness={0.16} />
    </mesh>
  );
}

function GalleryClaw({ angle }: { angle: number }) {
  const geometry = useMemo(() => {
    const point = (radius: number, z: number) => new THREE.Vector3(Math.cos(angle) * radius, 1.105 + Math.sin(angle) * radius, z);
    const curve = new THREE.CatmullRomCurve3([
      point(0.33, -0.035),
      point(0.32, 0.025),
      point(0.275, 0.1),
      point(0.215, 0.165),
    ]);
    return new THREE.TubeGeometry(curve, 22, 0.023, 8, false);
  }, [angle]);

  return (
    <mesh geometry={geometry} castShadow>
      <meshStandardMaterial color="#dbb976" metalness={0.98} roughness={0.16} />
    </mesh>
  );
}

function RingModel({ mode, progressRef, anchorX }: { mode: RingCanvasProps["mode"]; progressRef?: MotionRef; anchorX: number }) {
  const group = useRef<THREE.Group>(null);
  const bandGeometry = useMemo(createBandGeometry, []);
  const diamondGeometry = useMemo(createDiamondGeometry, []);
  const galleryAngles = useMemo(() => Array.from({ length: 8 }, (_, index) => (index / 8) * Math.PI * 2), []);
  const paveStones = useMemo(() => {
    const points: Array<{ x: number; y: number; angle: number; size: number }> = [];
    const count = 13;
    for (let index = 0; index < count; index += 1) {
      const degrees = 20 + (53 * index) / (count - 1);
      const radians = ((180 - degrees) * Math.PI) / 180;
      const radius = 0.861 + Math.sin((index / (count - 1)) * Math.PI) * 0.005;
      points.push({ x: Math.cos(radians) * radius, y: Math.sin(radians) * radius, angle: radians, size: index > 9 ? 0.023 : 0.025 });
    }
    return points;
  }, []);

  useFrame(({ size }) => {
    if (!group.current || mode !== "story" || !progressRef) return;
    const p = progressRef.current.progress;
    const orbit = THREE.MathUtils.smoothstep(p, 0.66, 0.83);
    const returnToFront = THREE.MathUtils.smoothstep(p, 0.83, 0.92);
    const cameraScale = size.width < 760 ? 0.58 : 1;
    group.current.rotation.y = 0.24 + (orbit - returnToFront) * 0.34 * cameraScale;
    group.current.rotation.x = Math.sin(orbit * Math.PI) * 0.05 * cameraScale;
  });

  return (
    <group ref={group} position={[mode === "story" ? anchorX : 0, 0, 0]} rotation={[0, 0.24, 0]}>
      <mesh geometry={bandGeometry} castShadow receiveShadow>
        <meshPhysicalMaterial color="#deded9" metalness={0.97} roughness={0.17} clearcoat={0.95} clearcoatRoughness={0.11} envMapIntensity={1.45} />
      </mesh>
      <mesh>
        <torusGeometry args={[0.735, 0.021, 10, 192]} />
        <meshStandardMaterial color="#c7a56a" metalness={1} roughness={0.2} />
      </mesh>
      <SupportRod start={[-0.43, 0.71, -0.005]} end={[-0.235, 1.005, 0.015]} radius={0.027} />
      <SupportRod start={[0.43, 0.71, -0.005]} end={[0.235, 1.005, 0.015]} radius={0.027} />

      {paveStones.map((stone, index) => (
        <group key={index} position={[stone.x, stone.y, 0.058]} rotation={[0, 0, stone.angle + Math.PI / 2]}>
          <mesh castShadow>
            <octahedronGeometry args={[stone.size, 0]} />
            <meshPhysicalMaterial color="#f7f7f4" metalness={0.02} roughness={0.065} transmission={0.1} thickness={0.06} ior={2.05} clearcoat={1} clearcoatRoughness={0.04} />
          </mesh>
          <mesh position={[0, 0, -0.01]}>
            <torusGeometry args={[stone.size * 1.09, 0.003, 6, 18]} />
            <meshStandardMaterial color="#f1f0eb" metalness={0.95} roughness={0.18} />
          </mesh>
        </group>
      ))}

      <mesh position={[0, 1.105, -0.045]} castShadow>
        <torusGeometry args={[0.278, 0.019, 10, 72]} />
        <meshStandardMaterial color="#b98c4c" metalness={1} roughness={0.2} />
      </mesh>
      {galleryAngles.map((angle) => (
        <mesh
          key={`petal-${angle}`}
          position={[Math.cos(angle) * 0.335, 1.105 + Math.sin(angle) * 0.335, 0.052]}
          rotation={[0, 0, angle + Math.PI / 2]}
          scale={[0.054, 0.122, 0.029]}
          castShadow
        >
          <sphereGeometry args={[1, 24, 14]} />
          <meshStandardMaterial color="#d6b16d" metalness={0.98} roughness={0.18} />
        </mesh>
      ))}
      {galleryAngles.map((angle) => <GalleryClaw key={`claw-${angle}`} angle={angle} />)}
      <mesh geometry={diamondGeometry} position={[0, 1.105, 0.105]} castShadow>
        <meshPhysicalMaterial color="#fffdf8" metalness={0.015} roughness={0.035} transmission={0.22} thickness={0.48} ior={2.22} clearcoat={1} clearcoatRoughness={0.025} side={THREE.DoubleSide} flatShading envMapIntensity={1.9} />
      </mesh>
    </group>
  );
}

function Scene({ mode, progressRef, anchorX, controlsRef }: RingCanvasProps) {
  const target = useRef(new THREE.Vector3());
  const sweepLight = useRef<THREE.PointLight>(null);

  useFrame(({ camera, size }) => {
    if (mode !== "story" || !progressRef) return;
    const progress = progressRef.current.progress;
    const frame = storyFrame(progress, anchorX ?? 0, size.width < 760);
    camera.position.set(frame.x, frame.y, frame.z);
    target.current.set(anchorX ?? 0, frame.targetY, 0);
    camera.lookAt(target.current);
    if (sweepLight.current) {
      const travel = THREE.MathUtils.smoothstep(progress, 0.08, 0.62) - THREE.MathUtils.smoothstep(progress, 0.68, 0.96);
      const mobileScale = size.width < 760 ? 0.58 : 1;
      sweepLight.current.position.set((anchorX ?? 0) - 2.2 * mobileScale + travel * 4.4 * mobileScale, 2.8, 2.35);
      sweepLight.current.intensity = 3.5 + Math.sin(progress * Math.PI) ** 2 * 5.5;
    }
  });

  return (
    <>
      <ambientLight intensity={0.34} />
      <spotLight position={[-3.6, 4.8, 4.5]} intensity={42} angle={0.38} penumbra={0.9} color="#fff0d4" castShadow />
      <spotLight position={[3.8, 1.3, -2.4]} intensity={28} angle={0.5} penumbra={1} color="#bf9450" />
      <pointLight position={[anchorX ?? 0, -1.7, 2.6]} intensity={5} color="#f9d89a" />
      <pointLight ref={sweepLight} position={[(anchorX ?? 0) - 2.2, 2.8, 2.35]} intensity={3.5} distance={9} decay={2} color="#f4d7a5" />
      <Environment resolution={128} background={false}>
        <Lightformer form="rect" intensity={5.2} color="#fff5e1" position={[-4, 3.5, 3]} rotation={[0, 0.4, 0]} scale={[2.8, 5, 1]} />
        <Lightformer form="rect" intensity={3.5} color="#fffdf8" position={[3.5, 1.8, 4]} rotation={[0, -0.36, 0]} scale={[1.15, 4, 1]} />
        <Lightformer form="rect" intensity={2.1} color="#b7833e" position={[0, -3, 2]} rotation={[0, 0, 0]} scale={[4.5, 0.7, 1]} />
        <Lightformer form="rect" intensity={1.3} color="#faf4e6" position={[2.5, 3, -2]} rotation={[0, 0.7, 0]} scale={[1.5, 3.5, 1]} />
      </Environment>
      <RingModel mode={mode} progressRef={progressRef} anchorX={anchorX ?? 0} />
      <ContactShadows position={[anchorX ?? 0, -1.1, 0]} scale={5.8} opacity={0.25} blur={2.8} far={3.2} resolution={256} color="#090807" />
      {mode === "interactive" && (
        <OrbitControls
          ref={controlsRef}
          makeDefault
          target={[0, 0.12, 0]}
          enablePan={false}
          enableDamping
          dampingFactor={0.065}
          minDistance={3.25}
          maxDistance={8}
          minPolarAngle={0.35}
          maxPolarAngle={Math.PI - 0.35}
          rotateSpeed={0.7}
          zoomSpeed={0.7}
        />
      )}
    </>
  );
}

export default function RingCanvas({ mode, progressRef, anchorX = 0, controlsRef, label }: RingCanvasProps) {
  const cameraPosition: [number, number, number] = mode === "story" ? [anchorX, 0.16, 5.8] : [0, 0.25, 5.4];
  return (
    <div className="ring-canvas" role="img" aria-label={label ?? "A two-tone concept ring with a raised petal setting, faceted center stone and one pavé-style shoulder"}>
      <Canvas
        camera={{ position: cameraPosition, fov: 32, near: 0.1, far: 60 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        shadows
        fallback={<div className="canvas-fallback">{label ?? "Interactive 3D view is not available in this browser."}</div>}
        aria-hidden="true"
      >
        <Suspense fallback={null}>
          <Scene mode={mode} progressRef={progressRef} anchorX={anchorX} controlsRef={controlsRef} />
        </Suspense>
      </Canvas>
      <span className="ring-canvas__sr-only">{label ?? "Concept ring, modelled for this preview."}</span>
    </div>
  );
}
