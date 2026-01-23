import { useRef, useState, useMemo } from "react";
import { Text } from "@react-three/drei";
import * as THREE from "three";
import type { PackedBox, Container } from "../types";

interface BoxMeshProps {
  box: PackedBox;
  container: Container;
  scale: number;
  onHover?: (box: PackedBox | null) => void;
  onClick?: (box: PackedBox) => void;
  isSelected?: boolean;
  isDimmed?: boolean;
  isTopmost?: boolean;
}

/**
 * Individual box mesh component for 3D visualization
 * Renders a colored box with label
 */
function BoxMesh({ box, container, scale, onHover, onClick, isSelected, isDimmed, isTopmost = true }: BoxMeshProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  // Calculate center position (algorithm gives bottom-left-back corner)
  // Offset X and Z to center container at origin, Y starts from base at 0
  const centerX = (box.position.x + box.dimensions.length / 2 - container.length / 2) * scale;
  const centerY = (box.position.y + box.dimensions.height / 2) * scale;
  const centerZ = (box.position.z + box.dimensions.width / 2 - container.width / 2) * scale;

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

  // Colors - handle selection/dimming states
  const baseColor = box.boxType.color;
  const edgeColor = isSelected ? "#ffff00" : "#222";
  
  // Determine visual state
  const getColor = () => {
    if (isSelected) return "#ffffff";
    if (hovered) return "#ffffff";
    return baseColor;
  };
  
  const getOpacity = () => {
    if (isDimmed) return 0.25;
    if (isSelected) return 0.95;
    if (hovered) return 0.9;
    return 0.85;
  };

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
          color={getColor()}
          opacity={getOpacity()}
          transparent
        />
      </mesh>

      {/* Selection outline */}
      {isSelected && (
        <mesh>
          <boxGeometry args={[sizeX + 0.02, sizeY + 0.02, sizeZ + 0.02]} />
          <meshBasicMaterial color="#ffff00" wireframe opacity={0.8} transparent />
        </mesh>
      )}

      {/* Box edges for better visibility */}
      <lineSegments geometry={edgesGeometry}>
        <lineBasicMaterial color={edgeColor} linewidth={isSelected ? 2 : 1} />
      </lineSegments>

      {/* Label on top face - only show for topmost boxes */}
      {isTopmost && (
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
      )}

      {/* Fragile indicator - only show for topmost boxes */}
      {isTopmost && box.boxType.isFragile && (
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
