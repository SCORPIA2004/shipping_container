// ==========================================
// Shipping Container Visualizer - Type Definitions
// ==========================================

// ---------- Input Types ----------

/**
 * Container dimensions (the shipping container)
 */
export interface Container {
  length: number; // in cm
  width: number; // in cm
  height: number; // in cm
}

/**
 * Box type definition - represents a category of boxes
 */
export interface BoxType {
  id: string;
  name: string; // Product type name (e.g., "Electronics")
  length: number; // in cm
  width: number; // in cm
  height: number; // in cm
  weight: number; // in kg
  isFragile: boolean; // If true, stacking is limited
  color: string; // Hex color code (e.g., "#FF6B6B")
  quantity: number; // Number of boxes of this type
}

/**
 * User input data structure
 */
export interface InputData {
  container: Container;
  boxTypes: BoxType[];
}

// ---------- Output Types (from packing algorithm) ----------

/**
 * 3D position coordinates
 */
export interface Position {
  x: number;
  y: number;
  z: number;
}

/**
 * 3D rotation (in radians, typically 0 or 90 degrees)
 */
export interface Rotation {
  x: number;
  y: number;
  z: number;
}

/**
 * A box that has been positioned by the packing algorithm
 */
export interface PackedBox {
  id: string;
  boxType: BoxType;
  position: Position; // Bottom-left-back corner position
  rotation: Rotation; // Rotation applied
  dimensions: {
    // Actual dimensions after rotation
    length: number;
    width: number;
    height: number;
  };
}

/**
 * Statistics about the packing result
 */
export interface PackingStats {
  totalBoxes: number;
  packedBoxes: number;
  unpackedBoxes: number;
  containerVolume: number; // in cm³
  usedVolume: number; // in cm³
  utilizationPercent: number; // 0-100
  totalWeight: number; // in kg
}

/**
 * Complete result from packing algorithm
 */
export interface PackingResult {
  success: boolean;
  boxes: PackedBox[];
  unpacked: BoxType[]; // Boxes that couldn't fit
  stats: PackingStats;
}

// ---------- App State ----------

export type AppView = "input" | "visualizer";

export interface AppState {
  currentView: AppView;
  inputData: InputData | null;
  packingResult: PackingResult | null;
  isLoading: boolean;
  error: string | null;
}
