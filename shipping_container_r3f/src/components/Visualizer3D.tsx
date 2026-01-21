import { useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import {
  FiArrowLeft,
  FiRotateCcw,
  FiBox,
  FiPercent,
  FiPackage,
} from "react-icons/fi";
import { LuWeight, LuShip } from "react-icons/lu";
import type { PackingResult, Container, PackedBox } from "../types";
import BoxMesh from "./BoxMesh";

interface Visualizer3DProps {
  container: Container;
  packingResult: PackingResult | null;
  onBack: () => void;
}

/**
 * 3D Visualizer component using React Three Fiber
 */
function Visualizer3D({ container, packingResult, onBack }: Visualizer3DProps) {
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const [hoveredBox, setHoveredBox] = useState<PackedBox | null>(null);

  // Scale factor to make container fit nicely in view
  const scale = 0.01; // Convert cm to a reasonable 3D unit

  // Reset camera to initial position
  const handleResetCamera = () => {
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
  };

  // Handle box hover
  const handleBoxHover = (box: PackedBox | null) => {
    setHoveredBox(box);
  };

  return (
    <div className="visualizer-container">
      <div className="visualizer-header">
        <button onClick={onBack} className="back-button">
          <FiArrowLeft className="back-button__icon" />
          Back to Input
        </button>
        <h2>
          <LuShip className="visualizer-header__icon" />
          Container Visualization
        </h2>
        <button onClick={handleResetCamera} className="reset-button">
          <FiRotateCcw /> Reset View
        </button>
      </div>

      <div className="canvas-wrapper">
        <Canvas
          className="r3f-canvas"
          camera={{ position: [3, 3, 3], fov: 50 }}
        >
          {/* Lighting */}
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={0.8} />
          <directionalLight position={[-5, 5, -5]} intensity={0.3} />

          {/* Container wireframe */}
          <mesh
            position={[
              (container.length * scale) / 2,
              (container.height * scale) / 2,
              (container.width * scale) / 2,
            ]}
          >
            <boxGeometry
              args={[
                container.length * scale,
                container.height * scale,
                container.width * scale,
              ]}
            />
            <meshBasicMaterial color="#555" wireframe />
          </mesh>

          {/* Render packed boxes */}
          {packingResult?.boxes.map((box) => (
            <BoxMesh
              key={box.id}
              box={box}
              scale={scale}
              onHover={handleBoxHover}
            />
          ))}

          {/* Ground plane for reference */}
          <gridHelper args={[5, 20, "#666", "#444"]} position={[1, 0, 1]} />

          {/* Camera controls */}
          <OrbitControls
            ref={controlsRef}
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={1}
            maxDistance={10}
          />
        </Canvas>

        {/* Hover tooltip */}
        {hoveredBox && (
          <div className="visualizer__tooltip">
            <strong>{hoveredBox.boxType.name}</strong>
            <span>
              {hoveredBox.dimensions.length} x {hoveredBox.dimensions.width} x{" "}
              {hoveredBox.dimensions.height} cm
            </span>
            <span>Weight: {hoveredBox.boxType.weight} kg</span>
            {hoveredBox.boxType.isFragile && (
              <span className="visualizer__tooltip-fragile">Fragile</span>
            )}
          </div>
        )}
      </div>

      {/* Stats Panel */}
      {packingResult && (
        <div className="stats-panel">
          <h3 className="stats-panel__title">Packing Summary</h3>

          <div className="stats-panel__grid">
            <div className="stats-panel__item">
              <FiPercent className="stats-panel__icon" />
              <div className="stats-panel__content">
                <span className="stats-panel__value">
                  {packingResult.stats.utilizationPercent}%
                </span>
                <span className="stats-panel__label">Space Used</span>
              </div>
            </div>

            <div className="stats-panel__item">
              <FiBox className="stats-panel__icon" />
              <div className="stats-panel__content">
                <span className="stats-panel__value">
                  {packingResult.stats.packedBoxes}/{packingResult.stats.totalBoxes}
                </span>
                <span className="stats-panel__label">Boxes Packed</span>
              </div>
            </div>

            <div className="stats-panel__item">
              <LuWeight className="stats-panel__icon" />
              <div className="stats-panel__content">
                <span className="stats-panel__value">
                  {packingResult.stats.totalWeight} kg
                </span>
                <span className="stats-panel__label">Total Weight</span>
              </div>
            </div>

            <div className="stats-panel__item">
              <FiPackage className="stats-panel__icon" />
              <div className="stats-panel__content">
                <span className="stats-panel__value">
                  {(packingResult.stats.usedVolume / 1000).toFixed(1)} L
                </span>
                <span className="stats-panel__label">Volume Used</span>
              </div>
            </div>
          </div>

          {packingResult.unpacked.length > 0 && (
            <div className="stats-panel__warning">
              {packingResult.stats.unpackedBoxes} box(es) could not fit in the container
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Visualizer3D;
