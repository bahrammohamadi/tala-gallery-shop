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

function createBandGeometry() {
  const around = 160;
  const section = 32;
  const positions: number[] = [];
  const indices: number[] = [];
  const majorRadius = 0.83;

  for (let i = 0; i <= around; i += 1) {
    const theta = (i / around) * Math.PI * 2;
    const topNarrowing = Math.exp(-Math.pow((Math.sin(theta) - 1) / 0.31, 2));
    const lowerFullness = Math.exp(-Math.pow((Math.sin(theta) + 1) / 0.7, 2));
    const radialHalf = 0.112 - topNarrowing * 0.024 + lowerFullness * 0.006;
    const depthHalf = 0.055 - topNarrowing * 0.008;

    for (let j = 0; j <= section; j += 1) {
      const phi = (j / section) * Math.PI * 2;
      const ringRadius = majorRadius + Math.sin(phi) * radialHalf;
      positions.push(
        Math.cos(theta) * ringRadius,
        Math.sin(theta) * ringRadius,
        Math.cos(phi) * depthHalf,
      );
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
  const slices = 16;
  const profile = [
    { radius: 0.025, z: -0.19 },
    { radius: 0.285, z: -0.025 },
    { radius: 0.285, z: 0.015 },
    { radius: 0.205, z: 0.105 },
    { radius: 0.12, z: 0.16 },
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
  positions.push(0, 0, profile[profile.length - 1].z + 0.004);
  for (let i = 0; i < slices; i += 1) {
    indices.push(tableIndex + i, tableIndex + ((i + 1) % slices), centerIndex);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
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
      <meshStandardMaterial color="#c7a56a" metalness={0.97} roughness={0.21} />
    </mesh>
  );
}

function RingModel({ mode, progressRef, anchorX }: { mode: RingCanvasProps["mode"]; progressRef?: MotionRef; anchorX: number }) {
  const group = useRef<THREE.Group>(null);
  const bandGeometry = useMemo(createBandGeometry, []);
  const diamondGeometry = useMemo(createDiamondGeometry, []);

  useFrame(({ size }) => {
    if (!group.current || mode !== "story" || !progressRef) return;
    const p = progressRef.current.progress;
    const orbit = THREE.MathUtils.smoothstep(p, 0.66, 0.83);
    const returnToFront = THREE.MathUtils.smoothstep(p, 0.83, 0.92);
    const cameraScale = size.width < 760 ? 0.58 : 1;
    group.current.rotation.y = (orbit - returnToFront) * 0.16 * cameraScale;
    group.current.rotation.x = Math.sin(orbit * Math.PI) * 0.035 * cameraScale;
  });

  const prongs: Array<[number, number, number]> = [
    [-0.21, 1.22, 0.12], [0.21, 1.22, 0.12],
    [-0.21, 0.99, 0.12], [0.21, 0.99, 0.12],
  ];

  return (
    <group ref={group} position={[mode === "story" ? anchorX : 0, 0, 0]}>
      <mesh geometry={bandGeometry} castShadow receiveShadow>
        <meshPhysicalMaterial color="#c7a56a" metalness={1} roughness={0.2} clearcoat={0.9} clearcoatRoughness={0.14} envMapIntensity={1.25} />
      </mesh>
      <SupportRod start={[-0.42, 0.73, 0]} end={[-0.2, 1.02, 0.025]} />
      <SupportRod start={[0.42, 0.73, 0]} end={[0.2, 1.02, 0.025]} />
      <mesh position={[0, 1.105, -0.015]} rotation={[0, 0, 0]} castShadow>
        <torusGeometry args={[0.292, 0.027, 12, 64]} />
        <meshStandardMaterial color="#d8b677" metalness={1} roughness={0.17} />
      </mesh>
      <mesh position={[0, 1.105, 0.09]} castShadow>
        <torusGeometry args={[0.252, 0.014, 10, 64]} />
        <meshStandardMaterial color="#e5c58c" metalness={1} roughness={0.16} />
      </mesh>
      <mesh geometry={diamondGeometry} position={[0, 1.105, 0.092]} castShadow>
        <meshPhysicalMaterial color="#fff8e9" metalness={0.02} roughness={0.045} transmission={0.18} thickness={0.42} ior={2.25} clearcoat={1} clearcoatRoughness={0.035} side={THREE.DoubleSide} envMapIntensity={1.7} />
      </mesh>
      {prongs.map(([x, y, z], index) => (
        <group key={index} position={[x, y, z]}>
          <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.018, 0.026, 0.16, 10]} />
            <meshStandardMaterial color="#dfbd82" metalness={1} roughness={0.2} />
          </mesh>
          <mesh position={[0, 0.01, 0.078]} castShadow>
            <sphereGeometry args={[0.026, 12, 10]} />
            <meshStandardMaterial color="#ebcf9a" metalness={1} roughness={0.18} />
          </mesh>
        </group>
      ))}
      <mesh position={[0, 0.975, 0.055]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <torusGeometry args={[0.085, 0.017, 8, 32, Math.PI]} />
        <meshStandardMaterial color="#c7a56a" metalness={1} roughness={0.2} />
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
    <div className="ring-canvas" role="img" aria-label={label ?? "A concept solitaire ring in a dark studio"}>
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
