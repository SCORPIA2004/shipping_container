import { useRef, useState, useEffect, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import * as THREE from "three";
import {
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
  FiEdit3,
  FiRefreshCw,
} from "react-icons/fi";
import { LuWeight } from "react-icons/lu";
import type { PackingResult, Container, PackedBox, BoxType } from "../types";
import { packBoxes } from "../services/PackingAlgorithm";
import BoxMesh from "./BoxMesh";

interface Visualizer3DProps {
  container: Container;
  packingResult: PackingResult | null;
  initialBoxTypes: BoxType[];
}

/**
 * 3D Visualizer component using React Three Fiber
 */
function Visualizer3D({
  container,
  packingResult: initialPackingResult,
  initialBoxTypes,
}: Visualizer3DProps) {
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const canvasWrapperRef = useRef<HTMLDivElement>(null);
  const [hoveredBox, setHoveredBox] = useState<PackedBox | null>(null);
  const [selectedBoxTypeId, setSelectedBoxTypeId] = useState<string | null>(
    null,
  );
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isPanLocked, setIsPanLocked] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const [showQuantityEditor, setShowQuantityEditor] = useState(false);
  const [boxTypes, setBoxTypes] = useState<BoxType[]>(initialBoxTypes);
  const [packingResult, setPackingResult] = useState<PackingResult | null>(
    initialPackingResult,
  );
  const [isRecalculating, setIsRecalculating] = useState(false);

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
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
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

  // Calculate which boxes are topmost (not covered by other boxes above them)
  const topmostBoxIds = useMemo(() => {
    if (!packingResult?.boxes) return new Set<string>();

    const topmostBoxes = new Set<string>();

    // For each box, check if any other box is directly above it
    packingResult.boxes.forEach((box) => {
      const boxTop = box.position.y + box.dimensions.height;
      let isTopmost = true;

      // Check if any box covers this one from above
      for (const otherBox of packingResult.boxes) {
        if (box.id === otherBox.id) continue;

        const otherBoxBottom = otherBox.position.y;

        // Quick check: if other box is below this one's top, skip
        if (otherBoxBottom > boxTop + 0.1) continue;

        const xOverlap =
          box.position.x < otherBox.position.x + otherBox.dimensions.length &&
          box.position.x + box.dimensions.length > otherBox.position.x;
        const zOverlap =
          box.position.z < otherBox.position.z + otherBox.dimensions.width &&
          box.position.z + box.dimensions.width > otherBox.position.z;

        // If other box is directly above this one and overlaps in X and Z
        if (xOverlap && zOverlap && Math.abs(boxTop - otherBoxBottom) < 0.1) {
          isTopmost = false;
          break;
        }
      }

      if (isTopmost) {
        topmostBoxes.add(box.id);
      }
    });

    return topmostBoxes;
  }, [packingResult]);

  // Handle box click - toggle selection for all boxes of the same type
  const handleBoxClick = (box: PackedBox) => {
    if (selectedBoxTypeId === box.boxType.id) {
      setSelectedBoxTypeId(null); // Deselect if already selected
      setHoveredBox(null); // Clear tooltip
    } else {
      setSelectedBoxTypeId(box.boxType.id);
      setHoveredBox(box); // Show details for this box
    }
  };

  // Handle quantity change for a box type
  const handleQuantityChange = (boxTypeId: string, newQuantity: number) => {
    setBoxTypes((prev) =>
      prev.map((bt) =>
        bt.id === boxTypeId
          ? { ...bt, quantity: Math.max(0, newQuantity) }
          : bt,
      ),
    );
  };

  // Recalculate packing with updated quantities
  const handleRecalculate = () => {
    setIsRecalculating(true);

    // Small delay to show loading state
    setTimeout(() => {
      const result = packBoxes(container, boxTypes);
      setPackingResult(result);
      setIsRecalculating(false);
      setSelectedBoxTypeId(null);
      setHoveredBox(null);
    }, 100);
  };

  return (
    <div className="visualizer-container">
      <div className="visualizer-header">
        <div className="visualizer-header__controls">
          <button
            onClick={() => setIsPanLocked(!isPanLocked)}
            className={`control-button ${isPanLocked ? "active" : ""}`}
            title={isPanLocked ? "Unlock Panning" : "Lock Panning"}
          >
            {isPanLocked ? <FiLock /> : <FiUnlock />}
          </button>
          <button
            onClick={() => setShowQuantityEditor(!showQuantityEditor)}
            className={`control-button ${showQuantityEditor ? "active" : ""}`}
            title="Edit Quantities"
          >
            <FiEdit3 />
          </button>
          <button
            onClick={() => setShowStats(!showStats)}
            className={`control-button ${showStats ? "active" : ""}`}
            title="Toggle Stats"
          >
            {showStats ? <FiEye /> : <FiEyeOff />}
          </button>
          <button
            onClick={() => setShowInstructions(!showInstructions)}
            className={`control-button ${showInstructions ? "active" : ""}`}
            title="Toggle Instructions"
          >
            <FiInfo />
          </button>
          <button
            onClick={handleResetCamera}
            className="control-button"
            title="Reset Camera"
          >
            <FiRotateCcw />
          </button>
          <button
            onClick={toggleFullscreen}
            className="control-button"
            title="Fullscreen"
          >
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
          camera={{ position: [5, 5, 5], fov: 50 }}
        >
          {/* Lighting */}
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={0.8} />
          <directionalLight position={[-5, 5, -5]} intensity={0.3} />

          {/* Container wireframe */}
          <mesh position={[0, (container.height * scale) / 2, 0]}>
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
              container={container}
              scale={scale}
              onHover={handleBoxHover}
              onClick={handleBoxClick}
              isSelected={selectedBoxTypeId === box.boxType.id}
              isDimmed={
                selectedBoxTypeId !== null &&
                selectedBoxTypeId !== box.boxType.id
              }
              isTopmost={topmostBoxIds.has(box.id)}
            />
          ))}

          {/* Ground plane for reference */}
          <gridHelper args={[20, 30, "#666", "#444"]} position={[0, 0, 0]} />

          {/* Camera controls */}
          <OrbitControls
            ref={controlsRef}
            enablePan={!isPanLocked}
            enableZoom={true}
            enableRotate={true}
            zoomToCursor={true}
            minDistance={0.5}
            maxDistance={30}
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
                  <span className="visualizer__instructions-key">
                    Touch & Drag
                  </span>
                  <span>Rotate</span>
                </div>
                <div className="visualizer__instructions-item">
                  <span className="visualizer__instructions-key">Pinch</span>
                  <span>Zoom</span>
                </div>
                {!isPanLocked && (
                  <div className="visualizer__instructions-item">
                    <span className="visualizer__instructions-key">
                      2 Fingers
                    </span>
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
                    <span className="visualizer__instructions-key">
                      R-Click
                    </span>
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

        {/* Quantity Editor Panel */}
        {showQuantityEditor && (
          <div className="quantity-editor">
            <div className="quantity-editor__header">
              <h3 className="quantity-editor__title">Edit</h3>
              <button
                className="quantity-editor__close-btn"
                onClick={() => setShowQuantityEditor(false)}
                title="Close"
              >
                <FiChevronUp />
              </button>
            </div>

            <div className="quantity-editor__list">
              {boxTypes.map((boxType) => (
                <div key={boxType.id} className="quantity-editor__item">
                  <div className="quantity-editor__color">
                    <div
                      className="quantity-editor__color-swatch"
                      style={{ backgroundColor: boxType.color }}
                    />
                  </div>
                  <div className="quantity-editor__info">
                    <span className="quantity-editor__name">
                      {boxType.name}
                    </span>
                    <span className="quantity-editor__dims">
                      {boxType.length}×{boxType.width}×{boxType.height} cm
                      {boxType.isFragile && (
                        <span className="quantity-editor__fragile">
                          {" "}
                          • Fragile
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="quantity-editor__controls">
                    <button
                      className="quantity-editor__btn quantity-editor__btn--minus"
                      onClick={() =>
                        handleQuantityChange(boxType.id, boxType.quantity - 1)
                      }
                      disabled={boxType.quantity <= 0}
                      title="Decrease"
                    >
                      −
                    </button>
                    <input
                      type="number"
                      className="quantity-editor__input"
                      value={boxType.quantity}
                      onChange={(e) =>
                        handleQuantityChange(
                          boxType.id,
                          parseInt(e.target.value) || 0,
                        )
                      }
                      min="0"
                    />
                    <button
                      className="quantity-editor__btn quantity-editor__btn--plus"
                      onClick={() =>
                        handleQuantityChange(boxType.id, boxType.quantity + 1)
                      }
                      title="Increase"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="quantity-editor__actions">
              <button
                className="quantity-editor__recalc-btn"
                onClick={handleRecalculate}
                disabled={isRecalculating}
              >
                {isRecalculating ? (
                  <>
                    <FiRefreshCw className="quantity-editor__recalc-icon--spin" />
                    Calculating...
                  </>
                ) : (
                  <>
                    <FiRefreshCw />
                    Recalculate Packing
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Quantity Editor Toggle Button (when hidden) */}
        {!showQuantityEditor && (
          <button
            className="quantity-editor__toggle-btn"
            onClick={() => setShowQuantityEditor(true)}
            title="Edit Quantities"
          >
            Edit Quantities
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
                  {packingResult.stats.packedBoxes}/
                  {packingResult.stats.totalBoxes}
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
              {packingResult.stats.unpackedBoxes} box(es) could not fit in the
              container
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
