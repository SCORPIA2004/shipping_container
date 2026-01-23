import type { InputData } from '../types';

/**
 * Sample data for testing the visualizer
 * Container: Standard 40ft container size
 * Boxes: Mix of fragile and non-fragile items with realistic shipping dimensions
 */
export const sampleData: InputData = {
  container: {
    length: 1200, // cm (40ft container)
    width: 234,   // cm
    height: 226,  // cm
  },
  boxTypes: [
    {
      id: 'electronics',
      name: 'Electronics',
      length: 60,
      width: 40,
      height: 30,
      weight: 20,
      isFragile: true,
      color: '#FF6B6B', // Coral red
      quantity: 200,
    },
    {
      id: 'textiles',
      name: 'Textiles',
      length: 80,
      width: 60,
      height: 40,
      weight: 15,
      isFragile: false,
      color: '#5f4ecd', // Teal
      quantity: 50,
    },
    {
      id: 'books',
      name: 'Books',
      length: 50,
      width: 40,
      height: 50,
      weight: 25,
      isFragile: false,
      color: '#d6e195', // Mint
      quantity: 50,
    },
    {
      id: 'ceramics',
      name: 'Ceramics',
      length: 40,
      width: 40,
      height: 60,
      weight: 30,
      isFragile: true,
      color: '#a3f381', // Light coral
      quantity: 80,
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
