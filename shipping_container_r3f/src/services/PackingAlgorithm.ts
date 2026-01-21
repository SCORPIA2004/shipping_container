/**
 * 3D Bin Packing Algorithm
 * 
 * A simple first-fit decreasing algorithm that places boxes into the container
 * with consideration for fragility constraints.
 */

import type {
  Container,
  BoxType,
  PackedBox,
  PackingResult,
  PackingStats,
  Position,
  Rotation,
} from "../types";

/**
 * Internal representation of a box during packing
 */
interface BoxToPlace {
  boxType: BoxType;
  index: number; // Which instance of this box type
}

/**
 * Represents an available space in the container
 */
interface Space {
  x: number;
  y: number;
  z: number;
  length: number;
  width: number;
  height: number;
}

/**
 * Check if a box fits in a given space
 */
function boxFitsInSpace(
  boxL: number,
  boxW: number,
  boxH: number,
  space: Space
): boolean {
  return boxL <= space.length && boxW <= space.width && boxH <= space.height;
}

/**
 * Get all rotation permutations for a box
 * Returns [length, width, height] for each rotation
 */
function getRotations(box: BoxType): [number, number, number][] {
  const { length: l, width: w, height: h } = box;
  
  // For fragile boxes, only allow rotations that keep height as-is
  // (don't flip fragile boxes on their side)
  if (box.isFragile) {
    return [
      [l, w, h],
      [w, l, h],
    ];
  }
  
  // All 6 rotations for non-fragile boxes
  return [
    [l, w, h],
    [l, h, w],
    [w, l, h],
    [w, h, l],
    [h, l, w],
    [h, w, l],
  ];
}

/**
 * Calculate rotation values based on dimension mapping
 */
function getRotationFromDimensions(
  original: BoxType,
  rotated: [number, number, number]
): Rotation {
  // Simplified rotation - just track if dimensions changed
  const [rl, rw, rh] = rotated;
  
  if (rl === original.length && rw === original.width && rh === original.height) {
    return { x: 0, y: 0, z: 0 };
  }
  if (rl === original.width && rw === original.length && rh === original.height) {
    return { x: 0, y: Math.PI / 2, z: 0 };
  }
  // For other rotations, approximate
  return { x: 0, y: 0, z: 0 };
}

/**
 * Check if placing a box at position would cause fragility violation
 * Fragile boxes shouldn't have too many boxes stacked on top
 */
function checkFragilityConstraint(
  packedBoxes: PackedBox[],
  newBox: BoxType,
  position: Position,
  dimensions: { length: number; width: number; height: number }
): boolean {
  // Find fragile boxes that would be below this new box
  for (const packed of packedBoxes) {
    if (!packed.boxType.isFragile) continue;
    
    // Check if new box is directly above this fragile box
    const fragileTop = packed.position.y + packed.dimensions.height;
    
    // If new box starts at or near the top of fragile box
    if (Math.abs(position.y - fragileTop) < 0.1) {
      // Check horizontal overlap
      const overlapX =
        position.x < packed.position.x + packed.dimensions.length &&
        position.x + dimensions.length > packed.position.x;
      const overlapZ =
        position.z < packed.position.z + packed.dimensions.width &&
        position.z + dimensions.width > packed.position.z;
      
      if (overlapX && overlapZ) {
        // Count how many boxes are already stacked on this fragile box
        const stackCount = packedBoxes.filter((b) => {
          const bTop = b.position.y;
          return (
            Math.abs(bTop - fragileTop) < 0.1 &&
            b.position.x < packed.position.x + packed.dimensions.length &&
            b.position.x + b.dimensions.length > packed.position.x &&
            b.position.z < packed.position.z + packed.dimensions.width &&
            b.position.z + b.dimensions.width > packed.position.z
          );
        }).length;
        
        // Allow max 2 boxes on top of fragile items
        if (stackCount >= 2) {
          return false;
        }
      }
    }
  }
  
  return true;
}

/**
 * Split a space into smaller spaces after placing a box
 * Uses the "guillotine" split method
 */
function splitSpace(
  space: Space,
  boxL: number,
  boxW: number,
  boxH: number
): Space[] {
  const newSpaces: Space[] = [];
  
  // Space to the right (along x-axis)
  if (space.length - boxL > 0) {
    newSpaces.push({
      x: space.x + boxL,
      y: space.y,
      z: space.z,
      length: space.length - boxL,
      width: space.width,
      height: space.height,
    });
  }
  
  // Space in front (along z-axis)
  if (space.width - boxW > 0) {
    newSpaces.push({
      x: space.x,
      y: space.y,
      z: space.z + boxW,
      length: boxL,
      width: space.width - boxW,
      height: space.height,
    });
  }
  
  // Space above (along y-axis)
  if (space.height - boxH > 0) {
    newSpaces.push({
      x: space.x,
      y: space.y + boxH,
      z: space.z,
      length: boxL,
      width: boxW,
      height: space.height - boxH,
    });
  }
  
  return newSpaces;
}

/**
 * Main packing algorithm
 * Uses First Fit Decreasing (FFD) with 3D bin packing
 */
export function packBoxes(
  container: Container,
  boxTypes: BoxType[]
): PackingResult {
  // Expand box types into individual boxes
  const boxesToPlace: BoxToPlace[] = [];
  for (const boxType of boxTypes) {
    for (let i = 0; i < boxType.quantity; i++) {
      boxesToPlace.push({ boxType, index: i });
    }
  }
  
  // Sort by volume (largest first) - First Fit Decreasing
  boxesToPlace.sort((a, b) => {
    const volA = a.boxType.length * a.boxType.width * a.boxType.height;
    const volB = b.boxType.length * b.boxType.width * b.boxType.height;
    return volB - volA;
  });
  
  // Initialize available spaces with the entire container
  let spaces: Space[] = [
    {
      x: 0,
      y: 0,
      z: 0,
      length: container.length,
      width: container.width,
      height: container.height,
    },
  ];
  
  const packedBoxes: PackedBox[] = [];
  const unpacked: BoxType[] = [];
  const unpackedCounts: Map<string, number> = new Map();
  
  // Try to place each box
  for (const boxToPlace of boxesToPlace) {
    const { boxType, index } = boxToPlace;
    let placed = false;
    
    // Try each available space
    for (let spaceIdx = 0; spaceIdx < spaces.length && !placed; spaceIdx++) {
      const space = spaces[spaceIdx];
      
      // Try each rotation
      const rotations = getRotations(boxType);
      
      for (const [rotL, rotW, rotH] of rotations) {
        if (!boxFitsInSpace(rotL, rotW, rotH, space)) {
          continue;
        }
        
        const position: Position = { x: space.x, y: space.y, z: space.z };
        const dimensions = { length: rotL, width: rotW, height: rotH };
        
        // Check fragility constraint
        if (!checkFragilityConstraint(packedBoxes, boxType, position, dimensions)) {
          continue;
        }
        
        // Place the box
        const packedBox: PackedBox = {
          id: `${boxType.id}_${index}`,
          boxType,
          position,
          rotation: getRotationFromDimensions(boxType, [rotL, rotW, rotH]),
          dimensions,
        };
        
        packedBoxes.push(packedBox);
        
        // Split the space
        const newSpaces = splitSpace(space, rotL, rotW, rotH);
        
        // Remove used space and add new spaces
        spaces.splice(spaceIdx, 1, ...newSpaces);
        
        // Sort spaces by y, then x, then z (bottom-left-back first)
        spaces.sort((a, b) => {
          if (a.y !== b.y) return a.y - b.y;
          if (a.x !== b.x) return a.x - b.x;
          return a.z - b.z;
        });
        
        // Remove very small spaces
        spaces = spaces.filter(
          (s) => s.length > 1 && s.width > 1 && s.height > 1
        );
        
        placed = true;
        break;
      }
    }
    
    if (!placed) {
      // Track unpacked boxes
      const count = unpackedCounts.get(boxType.id) || 0;
      unpackedCounts.set(boxType.id, count + 1);
    }
  }
  
  // Build unpacked list
  for (const [id, count] of unpackedCounts) {
    const boxType = boxTypes.find((b) => b.id === id);
    if (boxType) {
      unpacked.push({ ...boxType, quantity: count });
    }
  }
  
  // Calculate statistics
  const containerVolume = container.length * container.width * container.height;
  const usedVolume = packedBoxes.reduce((sum, box) => {
    return sum + box.dimensions.length * box.dimensions.width * box.dimensions.height;
  }, 0);
  const totalWeight = packedBoxes.reduce((sum, box) => sum + box.boxType.weight, 0);
  const totalBoxes = boxesToPlace.length;
  
  const stats: PackingStats = {
    totalBoxes,
    packedBoxes: packedBoxes.length,
    unpackedBoxes: totalBoxes - packedBoxes.length,
    containerVolume,
    usedVolume,
    utilizationPercent: Math.round((usedVolume / containerVolume) * 100 * 10) / 10,
    totalWeight,
  };
  
  return {
    success: packedBoxes.length > 0,
    boxes: packedBoxes,
    unpacked,
    stats,
  };
}
