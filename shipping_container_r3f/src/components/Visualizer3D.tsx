import { useRef, useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import * as THREE from "three";
import {
  FiArrowLeft,
  FiRotateCcw,
  FiBox,
  FiPercent,
  FiPackage,
  FiMaximize,
  FiMinimize,
  FiZoomIn,
  FiZoomOut,
  FiRotateCw,
  FiLock,
  FiUnlock,
  FiEye,
  FiEyeOff,
  FiInfo,
  FiChevronUp,
  FiChevronDown,
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
  const canvasWrapperRef = useRef<HTMLDivElement>(null);
  const [hoveredBox, setHoveredBox] = useState<PackedBox | null>(null);
  const [selectedBoxTypeId, setSelectedBoxTypeId] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isPanLocked, setIsPanLocked] = useState(false);
  const [showStats, setShowStats] = useState(true);
  const [showInstructions, setShowInstructions] = useState(true);

  // Scale factor to make container fit nicely in view
  const scale = 0.01; // Convert cm to a reasonable 3D unit

  // Detect mobile/tablet on mount
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // Reset camera to initial position
  const handleResetCamera = () => {
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
  };

  // Toggle fullscreen
  const toggleFullscreen = async () => {
    if (!canvasWrapperRef.current) return;

    try {
      if (!document.fullscreenElement) {
        await canvasWrapperRef.current.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (err) {
      console.error("Fullscreen error:", err);
    }
  };

  // Touch control handlers
  const handleZoomIn = () => {
    if (controlsRef.current) {
      const camera = controlsRef.current.object;
      const target = controlsRef.current.target;
      const direction = camera.position.clone().sub(target).normalize();
      camera.position.sub(direction.multiplyScalar(0.5));
      controlsRef.current.update();
    }
  };

  const handleZoomOut = () => {
    if (controlsRef.current) {
      const camera = controlsRef.current.object;
      const target = controlsRef.current.target;
      const direction = camera.position.clone().sub(target).normalize();
      camera.position.add(direction.multiplyScalar(0.5));
      controlsRef.current.update();
    }
  };

  const handleRotateLeft = () => {
    if (controlsRef.current) {
      const camera = controlsRef.current.object;
      const target = controlsRef.current.target;
      const offset = camera.position.clone().sub(target);
      const spherical = new THREE.Spherical().setFromVector3(offset);
      spherical.theta -= Math.PI / 8;
      offset.setFromSpherical(spherical);
      camera.position.copy(target).add(offset);
      controlsRef.current.update();
    }
  };

  const handleRotateRight = () => {
    if (controlsRef.current) {
      const camera = controlsRef.current.object;
      const target = controlsRef.current.target;
      const offset = camera.position.clone().sub(target);
      const spherical = new THREE.Spherical().setFromVector3(offset);
      spherical.theta += Math.PI / 8;
      offset.setFromSpherical(spherical);
      camera.position.copy(target).add(offset);
      controlsRef.current.update();
    }
  };

  // Handle box hover
  const handleBoxHover = (box: PackedBox | null) => {
    setHoveredBox(box);
  };

  // Handle box click - toggle selection for all boxes of the same type
  const handleBoxClick = (box: PackedBox) => {
    if (selectedBoxTypeId === box.boxType.id) {
      setSelectedBoxTypeId(null); // Deselect if already selected
    } else {
      setSelectedBoxTypeId(box.boxType.id);
    }
  };

  return (
    <div className="visualizer-container">
      <div className="visualizer-header">
        <button onClick={onBack} className="back-button">
          <FiArrowLeft className="back-button__icon" />
          Back
        </button>
        <div className="visualizer-header__title">
          <LuShip className="visualizer-header__icon" />
          <h2>3D View</h2>
        </div>
        <div className="visualizer-header__controls">
          <button 
            onClick={() => setIsPanLocked(!isPanLocked)} 
            className={`control-button ${isPanLocked ? 'active' : ''}`}
            title={isPanLocked ? "Unlock Panning" : "Lock Panning"}
          >
            {isPanLocked ? <FiLock /> : <FiUnlock />}
          </button>
          <button 
            onClick={() => setShowStats(!showStats)} 
            className={`control-button ${showStats ? 'active' : ''}`}
            title="Toggle Stats"
          >
            {showStats ? <FiEye /> : <FiEyeOff />}
          </button>
          <button 
            onClick={() => setShowInstructions(!showInstructions)} 
            className={`control-button ${showInstructions ? 'active' : ''}`}
            title="Toggle Instructions"
          >
            <FiInfo />
          </button>
          <button onClick={handleResetCamera} className="control-button" title="Reset Camera">
            <FiRotateCcw />
          </button>
          <button onClick={toggleFullscreen} className="control-button" title="Fullscreen">
            {isFullscreen ? <FiMinimize /> : <FiMaximize />}
          </button>
        </div>
      </div>

      <div 
        ref={canvasWrapperRef}
        className={`canvas-wrapper ${isFullscreen ? "canvas-wrapper--fullscreen" : ""}`}
      >
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
              onClick={handleBoxClick}
              isSelected={selectedBoxTypeId === box.boxType.id}
              isDimmed={selectedBoxTypeId !== null && selectedBoxTypeId !== box.boxType.id}
            />
          ))}

          {/* Ground plane for reference */}
          <gridHelper args={[5, 20, "#666", "#444"]} position={[1, 0, 1]} />

          {/* Camera controls */}
          <OrbitControls
            ref={controlsRef}
            enablePan={!isPanLocked}
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

        {/* Instructions overlay */}
        {showInstructions && (
          <div className="visualizer__instructions">
            {/* <button 
              className="visualizer__instructions-close" 
              onClick={() => setShowInstructions(false)}
            >
              <FiChevronDown />
            </button> */}
            {isMobile ? (
              <>
                <div className="visualizer__instructions-item">
                  <span className="visualizer__instructions-key">Touch & Drag</span>
                  <span>Rotate</span>
                </div>
                <div className="visualizer__instructions-item">
                  <span className="visualizer__instructions-key">Pinch</span>
                  <span>Zoom</span>
                </div>
                {!isPanLocked && (
                  <div className="visualizer__instructions-item">
                    <span className="visualizer__instructions-key">2 Fingers</span>
                    <span>Pan</span>
                  </div>
                )}
                <div className="visualizer__instructions-item">
                  <span className="visualizer__instructions-key">Tap</span>
                  <span>Details</span>
                </div>
              </>
            ) : (
              <>
                <div className="visualizer__instructions-item">
                  <span className="visualizer__instructions-key">Drag</span>
                  <span>Rotate</span>
                </div>
                <div className="visualizer__instructions-item">
                  <span className="visualizer__instructions-key">Scroll</span>
                  <span>Zoom</span>
                </div>
                {!isPanLocked && (
                  <div className="visualizer__instructions-item">
                    <span className="visualizer__instructions-key">R-Click</span>
                    <span>Pan</span>
                  </div>
                )}
                <div className="visualizer__instructions-item">
                  <span className="visualizer__instructions-key">Hover</span>
                  <span>Details</span>
                </div>
              </>
            )}
          </div>
        )}


        {/* Touch controls for mobile/tablet */}
        {isMobile && (
          <div className="visualizer__touch-controls">
            <div className="visualizer__touch-controls-row">
              <button
                onClick={handleRotateLeft}
                className="visualizer__touch-btn"
                title="Rotate left"
              >
                <FiRotateCw style={{ transform: "scaleX(-1)" }} />
              </button>
              <button
                onClick={handleZoomIn}
                className="visualizer__touch-btn"
                title="Zoom in"
              >
                <FiZoomIn />
              </button>
              <button
                onClick={handleZoomOut}
                className="visualizer__touch-btn"
                title="Zoom out"
              >
                <FiZoomOut />
              </button>
              <button
                onClick={handleRotateRight}
                className="visualizer__touch-btn"
                title="Rotate right"
              >
                <FiRotateCw />
              </button>
            </div>
          </div>
        )}

        {/* Fullscreen exit button */}
        {isFullscreen && (
          <button
            onClick={toggleFullscreen}
            className="visualizer__fullscreen-exit"
            title="Exit fullscreen"
          >
            <FiMinimize /> Exit Fullscreen
          </button>
        )}
      </div>

      {/* {(isMobile || !showInstructions) && !showInstructions && (
        <button 
          className="visualizer__instructions-toggle-btn"
          onClick={() => setShowInstructions(true)}
          title="Show Instructions"
        >
          <FiInfo />
        </button>
      )} */}

      {/* Stats Panel */}
      {packingResult && showStats && (
        <div className="stats-panel">
          <div className="stats-panel__header">
            <h3 className="stats-panel__title">Packing Summary</h3>
            <button 
              className="stats-panel__close-btn" 
              onClick={() => setShowStats(false)}
              title="Close Stats"
            >
              <FiChevronDown />
            </button>
          </div>

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

          {/* Stacking constraints info */}
          {!isMobile && (
            <div className="stats-panel__info">
              <strong>Packing Constraints:</strong>
              <ul>
                <li>Fragile boxes: max 2 boxes stacked on top</li>
                <li>All boxes support optimal rotation</li>
                <li>First-fit decreasing algorithm for efficiency</li>
              </ul>
            </div>
          )}
        </div>
      )}
      {/* Stats Toggle Button (when hidden) */}
      {packingResult && !showStats && (
        <button 
          className="stats-panel__toggle-btn" 
          onClick={() => setShowStats(true)}
          title="Show Stats"
        >
          <FiChevronUp /> Show Stats
        </button>
      )}
    </div>
  );
}

export default Visualizer3D;
