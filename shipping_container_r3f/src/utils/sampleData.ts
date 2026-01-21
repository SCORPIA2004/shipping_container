import type { InputData } from '../types';

/**
 * Sample data for testing the visualizer
 * Container: Standard Euro pallet container size
 * Boxes: Mix of fragile and non-fragile items
 */
export const sampleData: InputData = {
  container: {
    length: 120, // cm
    width: 80,   // cm
    height: 80,  // cm
  },
  boxTypes: [
    {
      id: 'electronics',
      name: 'Electronics',
      length: 30,
      width: 20,
      height: 15,
      weight: 10,
      isFragile: true,
      color: '#FF6B6B', // Coral red
      quantity: 5,
    },
    {
      id: 'textiles',
      name: 'Textiles',
      length: 40,
      width: 30,
      height: 10,
      weight: 3,
      isFragile: false,
      color: '#4ECDC4', // Teal
      quantity: 8,
    },
    {
      id: 'books',
      name: 'Books',
      length: 25,
      width: 20,
      height: 20,
      weight: 8,
      isFragile: false,
      color: '#95E1D3', // Mint
      quantity: 6,
    },
    {
      id: 'ceramics',
      name: 'Ceramics',
      length: 20,
      width: 20,
      height: 25,
      weight: 5,
      isFragile: true,
      color: '#F38181', // Light coral
      quantity: 4,
    },
  ],
};

/**
 * Empty/default input data for starting fresh
 */
export const emptyInputData: InputData = {
  container: {
    length: 120,
    width: 80,
    height: 80,
  },
  boxTypes: [],
};

/**
 * Preset color palette for box types
 * Easy to distinguish, colorblind-friendly
 */
export const colorPalette = [
  '#FF6B6B', // Coral red
  '#4ECDC4', // Teal
  '#95E1D3', // Mint
  '#F38181', // Light coral
  '#FCE38A', // Yellow
  '#A8D8EA', // Light blue
  '#AA96DA', // Lavender
  '#FCBAD3', // Pink
  '#F9ED69', // Bright yellow
  '#6A0572', // Purple
];

/**
 * Get next available color from palette
 */
export const getNextColor = (usedColors: string[]): string => {
  const available = colorPalette.find(c => !usedColors.includes(c));
  return available || colorPalette[Math.floor(Math.random() * colorPalette.length)];
};

/**
 * Generate unique ID for new box types
 */
export const generateBoxId = (): string => {
  return `box_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};
