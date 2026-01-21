import { useRef, useState, useMemo } from "react";
import { Text } from "@react-three/drei";
import * as THREE from "three";
import type { PackedBox } from "../types";

interface BoxMeshProps {
  box: PackedBox;
  scale: number;
  onHover?: (box: PackedBox | null) => void;
  onClick?: (box: PackedBox) => void;
}

/**
 * Individual box mesh component for 3D visualization
 * Renders a colored box with label
 */
function BoxMesh({ box, scale, onHover, onClick }: BoxMeshProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  // Calculate center position (algorithm gives bottom-left-back corner)
  const centerX = (box.position.x + box.dimensions.length / 2) * scale;
  const centerY = (box.position.y + box.dimensions.height / 2) * scale;
  const centerZ = (box.position.z + box.dimensions.width / 2) * scale;

  // Scaled dimensions
  const sizeX = box.dimensions.length * scale;
  const sizeY = box.dimensions.height * scale;
  const sizeZ = box.dimensions.width * scale;

  const handlePointerOver = () => {
    setHovered(true);
    if (onHover) onHover(box);
    document.body.style.cursor = "pointer";
  };

  const handlePointerOut = () => {
    setHovered(false);
    if (onHover) onHover(null);
    document.body.style.cursor = "auto";
  };

  const handleClick = () => {
    if (onClick) onClick(box);
  };

  // Memoize geometry for edges
  const edgesGeometry = useMemo(() => {
    const boxGeo = new THREE.BoxGeometry(sizeX, sizeY, sizeZ);
    return new THREE.EdgesGeometry(boxGeo);
  }, [sizeX, sizeY, sizeZ]);

  // Colors
  const baseColor = box.boxType.color;
  const edgeColor = "#222";

  return (
    <group position={[centerX, centerY, centerZ]}>
      {/* Main box */}
      <mesh
        ref={meshRef}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        onClick={handleClick}
      >
        <boxGeometry args={[sizeX, sizeY, sizeZ]} />
        <meshStandardMaterial
          color={hovered ? "#ffffff" : baseColor}
          opacity={hovered ? 0.9 : 0.85}
          transparent
        />
      </mesh>

      {/* Box edges for better visibility */}
      <lineSegments geometry={edgesGeometry}>
        <lineBasicMaterial color={edgeColor} />
      </lineSegments>

      {/* Label on top face */}
      <Text
        position={[0, sizeY / 2 + 0.02, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={Math.min(sizeX, sizeZ) * 0.15}
        color="#000"
        anchorX="center"
        anchorY="middle"
        maxWidth={sizeX * 0.9}
      >
        {box.boxType.name}
      </Text>

      {/* Fragile indicator */}
      {box.boxType.isFragile && (
        <Text
          position={[0, sizeY / 2 + 0.02, sizeZ * 0.3]}
          rotation={[-Math.PI / 2, 0, 0]}
          fontSize={Math.min(sizeX, sizeZ) * 0.15}
          color="#cc0000"
          anchorX="center"
          anchorY="middle"
        >
          FRAGILE
        </Text>
      )}
    </group>
  );
}

export default BoxMesh;
