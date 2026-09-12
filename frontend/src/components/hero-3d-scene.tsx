"use client";

import * as React from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

/* -------------------------------------------------------------------------- */
/*                               Neural Network                               */
/* -------------------------------------------------------------------------- */

function generateSpherePoints(count: number, radius: number) {
  const points: THREE.Vector3[] = [];

  const phi = (1 + Math.sqrt(5)) / 2;

  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2;
    const rAtY = Math.sqrt(Math.max(0, 1 - y * y));

    const theta = (2 * Math.PI * i) / phi;

    const x = Math.cos(theta) * rAtY;
    const z = Math.sin(theta) * rAtY;

    points.push(
      new THREE.Vector3(
        x * radius,
        y * radius,
        z * radius
      )
    );
  }

  return points;
}

function buildNetworkLines(
  points: THREE.Vector3[],
  maxDistance: number
) {
  const linePositions: number[] = [];

  for (let i = 0; i < points.length; i++) {
    for (let j = i + 1; j < points.length; j++) {
      const distance = points[i].distanceTo(points[j]);

      if (distance < maxDistance) {
        linePositions.push(
          points[i].x,
          points[i].y,
          points[i].z,
          points[j].x,
          points[j].y,
          points[j].z
        );
      }
    }
  }

  const geometry = new THREE.BufferGeometry();

  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(linePositions, 3)
  );

  return geometry;
}

interface NeuralSphereProps {
  reducedMotion: boolean;
}

function NeuralSphere({
  reducedMotion,
}: NeuralSphereProps) {
  const groupRef = React.useRef<THREE.Group>(null);
  const pointsRef = React.useRef<THREE.Points>(null);

  const POINT_COUNT = 160;
  const SPHERE_RADIUS = 1.05;
  const MAX_CONNECT_DIST = 0.58;

  const basePoints = React.useMemo(
    () =>
      generateSpherePoints(
        POINT_COUNT,
        SPHERE_RADIUS
      ),
    []
  );

  const currentPositions = React.useMemo(() => {
    const positions = new Float32Array(
      POINT_COUNT * 3
    );

    basePoints.forEach((point, index) => {
      positions[index * 3] = point.x;
      positions[index * 3 + 1] = point.y;
      positions[index * 3 + 2] = point.z;
    });

    return positions;
  }, [basePoints]);

  const pointsGeometry = React.useMemo(() => {
    const geometry = new THREE.BufferGeometry();

    geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(
        currentPositions,
        3
      )
    );

    return geometry;
  }, [currentPositions]);

  const linesGeometry = React.useMemo(
    () =>
      buildNetworkLines(
        basePoints,
        MAX_CONNECT_DIST
      ),
    [basePoints]
  );

  const { pointer } = useThree();

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    const time = state.clock.elapsedTime;

    if (!reducedMotion) {
      // Slow continuous rotation
      groupRef.current.rotation.y += delta * 0.12;

      // Very subtle tilt
      groupRef.current.rotation.x =
        Math.sin(time * 0.35) * 0.035;

      // Subtle breathing
      const pulse =
        1 + Math.sin(time * 1.6) * 0.02;

      groupRef.current.scale.setScalar(pulse);
    }

    // Subtle mouse interaction
    if (
      pointsRef.current &&
      !reducedMotion
    ) {
      const positions =
        pointsRef.current.geometry.attributes
          .position as THREE.BufferAttribute;

      const targetMouse = new THREE.Vector3(
        pointer.x * 1.2,
        pointer.y * 1.2,
        0
      );

      basePoints.forEach((basePoint, index) => {
        const currentX = positions.getX(index);
        const currentY = positions.getY(index);
        const currentZ = positions.getZ(index);

        const current = new THREE.Vector3(
          currentX,
          currentY,
          currentZ
        );

        const distance =
          current.distanceTo(targetMouse);

        let pullFactor = 0;

        if (distance < 2) {
          pullFactor =
            (1 - distance / 2) * 0.08;
        }

        const direction =
          targetMouse.clone().sub(basePoint);

        if (direction.lengthSq() > 0) {
          direction.normalize();
        }

        const target = basePoint
          .clone()
          .add(
            direction.multiplyScalar(
              pullFactor
            )
          );

        positions.setXYZ(
          index,
          THREE.MathUtils.lerp(
            currentX,
            target.x,
            0.04
          ),
          THREE.MathUtils.lerp(
            currentY,
            target.y,
            0.04
          ),
          THREE.MathUtils.lerp(
            currentZ,
            target.z,
            0.04
          )
        );
      });

      positions.needsUpdate = true;
    }
  });

  return (
    <group
      ref={groupRef}
      position={[0, 0, 0]}
    >
      {/* Neural network points */}
      <points
        ref={pointsRef}
        geometry={pointsGeometry}
      >
        <pointsMaterial
          size={0.04}
          color="#d8b4fe"
          transparent
          opacity={0.9}
          sizeAttenuation
          depthWrite={false}
        />
      </points>

      {/* Neural network connections */}
      <lineSegments
        geometry={linesGeometry}
      >
        <lineBasicMaterial
          color="#a855f7"
          transparent
          opacity={0.24}
          depthWrite={false}
        />
      </lineSegments>

      {/* Inner glowing AI core */}
      <mesh>
        <sphereGeometry
          args={[0.28, 24, 24]}
        />

        <meshBasicMaterial
          color="#c084fc"
          transparent
          opacity={0.14}
        />
      </mesh>

      {/* Core light */}
      <pointLight
        color="#c084fc"
        intensity={1.5}
        distance={3}
        decay={2}
      />
    </group>
  );
}

/* -------------------------------------------------------------------------- */
/*                                Main Scene                                  */
/* -------------------------------------------------------------------------- */

export default function Hero3DScene() {
  const [reducedMotion, setReducedMotion] =
    React.useState(false);

  React.useEffect(() => {
    const mediaQuery =
      window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      );

    setReducedMotion(mediaQuery.matches);

    const handleChange = (
      event: MediaQueryListEvent
    ) => {
      setReducedMotion(event.matches);
    };

    mediaQuery.addEventListener(
      "change",
      handleChange
    );

    return () =>
      mediaQuery.removeEventListener(
        "change",
        handleChange
      );
  }, []);

  return (
    <div className="w-full h-[400px] sm:h-[480px] relative select-none">
      <Canvas
        camera={{
          position: [0, 0, 4.8],
          fov: 42,
          near: 0.1,
          far: 100,
        }}
        dpr={[1, 2]}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        }}
      >
        {/* Background */}
        <color
          attach="background"
          args={["#09090b"]}
        />

        {/* Ambient lighting */}
        <ambientLight
          intensity={0.3}
          color="#a1a1aa"
        />

        {/* Soft directional light */}
        <directionalLight
          position={[3, 5, 4]}
          intensity={0.45}
          color="#e4e4e7"
        />

        {/* Purple AI glow */}
        <pointLight
          position={[0, 0, 0]}
          color="#a855f7"
          intensity={2.2}
          distance={4}
          decay={2}
        />

        {/* Subtle front light */}
        <pointLight
          position={[0, 0, 3]}
          color="#ffffff"
          intensity={0.2}
          distance={5}
          decay={2}
        />

        {/* ONLY THE NEURAL GLOBE */}
        <NeuralSphere
          reducedMotion={reducedMotion}
        />
      </Canvas>
    </div>
  );
}