# Shipping Container 3D Visualizer - POC Implementation Plan

## Project Overview
A lightweight POC web app that visualizes optimal box-to-container packing solutions for logistics staff. Users input container dimensions, box details (size, type, fragility, quantity), and the app renders an interactive 3D visualization of the optimized arrangement.

**Target Audience**: Logistics managers & warehouse staff  
**Deployment**: Browser-based React + Three.js  
**Performance**: Must run smoothly on 8GB RAM tablets/iPads  
**Timeline**: POC/Prototype phase

---

## Tech Stack
- **Frontend**: React 19 + TypeScript (already set up)
- **3D Rendering**: Three.js + React Three Fiber (already installed)
- **Packing Algorithm**: `bin-packing` or `3d-bin-packing` npm library (lightweight)
- **State Management**: React hooks (Context API if needed)
- **Styling**: CSS/Tailwind (lightweight, optional)
- **Data Format**: JSON

---

## Architecture & Components

### 1. **Input Form Component** (`InputForm.tsx`)
**Purpose**: Collect container and box parameters from user

**Responsibilities**:
- Container dimensions input (length × width × height)
- Box type management (add/remove/edit box types)
  - Product type name (text)
  - Dimensions (L × W × H)
  - Weight
  - Fragility flag (affects stacking limits)
  - Color code (for visualization)
  - Quantity
- Form validation
- Submit to pass data to visualizer

**UI Elements**:
- Simple form fields (number inputs, text)
- "Add Box Type" button
- "Visualize" button
- Clear/Reset button

### 2. **3D Visualizer Component** (`Visualizer3D.tsx`)
**Purpose**: Render optimized packing in 3D using R3F

**Responsibilities**:
- Render shipping container (wireframe/transparent)
- Render individual boxes with:
  - Color coding by product type
  - Labels (product type, dimensions, ID)
  - Proper positioning based on algorithm output
- Camera controls (orbit, zoom, pan)
- Display basic stats overlay (space utilization %, weight distribution)
- Performance optimization for many boxes

### 3. **Packing Algorithm Component** (`PackingAlgorithm.ts`)
**Purpose**: Calculate optimal box arrangement

**Responsibilities**:
- Accept container dimensions & box list
- Consider constraints:
  - Fragility stacking limits (e.g., fragile boxes can have max 2 boxes on top)
  - Weight distribution (basic check)
  - Volume optimization
- Return positioned box data with coordinates (x, y, z)
- Output: `PackedBox[]` array with position, type, and metadata

### 4. **Data Management/Store** (`types.ts`, Context if needed)
**Purpose**: Define and manage data structures across components

**Data Structures**:
```typescript
// Input
Container {
  length: number
  width: number
  height: number
}

BoxType {
  id: string
  name: string
  length: number
  width: number
  height: number
  weight: number
  isFragile: boolean
  color: string (hex code)
  quantity: number
}

// Output (from packing algorithm)
PackedBox {
  id: string
  type: BoxType
  position: { x, y, z }
  rotation?: { x, y, z }
}

ParkingResult {
  boxes: PackedBox[]
  stats: {
    utilization: number (%)
    totalWeight: number
    totalVolume: number
    usedVolume: number
  }
}
```

---

## Implementation Steps

### Phase 1: Setup & Data Flow
1. [ ] Install dependencies (`3d-bin-packing` or similar)
2. [ ] Create TypeScript interfaces/types
3. [ ] Set up basic component structure
4. [ ] Create sample JSON data for testing

### Phase 2: Input Form
1. [ ] Build form component with fields
2. [ ] Implement form state management (useState)
3. [ ] Add basic form validation
4. [ ] Create add/remove box type functionality
5. [ ] Add preset templates (for quick testing)

### Phase 3: Packing Algorithm
1. [ ] Research & integrate packing library
2. [ ] Implement wrapper function with:
   - Volume optimization
   - Fragility constraints
   - Weight distribution checks
3. [ ] Generate positioned box data
4. [ ] Test with sample data

### Phase 4: 3D Visualization
1. [ ] Create Canvas component (R3F setup)
2. [ ] Render container (wireframe box)
3. [ ] Render boxes (colored, labeled)
4. [ ] Implement camera controls (Orbit controls from R3F)
5. [ ] Add basic lighting & environment

### Phase 5: Stats & Polish
1. [ ] Display utilization %, weight stats
2. [ ] Add box details on hover/click (optional)
3. [ ] Performance testing & optimization
4. [ ] Responsive design tweaks
5. [ ] Styling refinement

---

## Key Technical Considerations

### Performance Optimization (Critical for tablets)
- **Box Limit**: Cap visualized boxes at 100-200 initially (reduce geometry complexity)
- **Level of Detail**: Use simpler geometries (BoxGeometry) rather than detailed models
- **Frustum Culling**: R3F handles this, but monitor draw calls
- **Lazy Loading**: Load packing algorithm only when needed
- **Memory**: Avoid creating hundreds of unique materials; reuse shaders
- **Canvas Size**: Scale with device (avoid max 1920×1080)

### Data Validation
- Container must have positive dimensions
- Box dimensions must be ≤ container dimensions (individual)
- Fragility constraints must be logically sound
- Quantity validation (positive integers)

### Constraints Implementation
- **Fragility**: If box is fragile, limit stacking height
  - Example: Max 2 boxes stacked on a fragile box
- **Weight Distribution**: Warn if center of gravity is off (optional for POC)
- **Rotation**: Allow 90° rotations for better packing (algorithm dependent)

### Camera & Interaction
- Default view: Isometric or perspective angle
- Orbit controls: Mouse drag to rotate
- Zoom: Mouse wheel
- Pan: Right-click drag or two-finger (mobile)
- Reset view button

---

## Testing Data / Sample JSON

```json
{
  "container": {
    "length": 1200,
    "width": 800,
    "height": 800,
    "unit": "mm"
  },
  "boxTypes": [
    {
      "id": "type1",
      "name": "Electronics",
      "length": 300,
      "width": 200,
      "height": 150,
      "weight": 10,
      "isFragile": true,
      "color": "#FF6B6B",
      "quantity": 5
    },
    {
      "id": "type2",
      "name": "Textiles",
      "length": 400,
      "width": 300,
      "height": 100,
      "weight": 5,
      "isFragile": false,
      "color": "#4ECDC4",
      "quantity": 8
    }
  ]
}
```

---

## Packing Algorithm Options

### Option 1: `3d-bin-packing` (npm)
- **Pros**: Simple, JavaScript-based, no external dependencies
- **Cons**: May not handle constraints well out-of-box
- **Effort**: Low (wrapper around library)

### Option 2: Custom Simple Algorithm
- **Pros**: Full control, can bake in constraints
- **Cons**: Time-intensive to build & test
- **Effort**: Medium-High

### Recommendation**: Use `3d-bin-packing` for POC, extend with custom constraint logic (fragility, weight) as needed.

---

## Component Structure

```
src/
├── App.tsx                    (Main layout)
├── components/
│   ├── InputForm.tsx          (Form for container & boxes)
│   ├── Visualizer3D.tsx       (R3F Canvas component)
│   ├── BoxMesh.tsx            (Individual box 3D model)
│   └── StatsOverlay.tsx       (Display stats)
├── services/
│   └── PackingAlgorithm.ts    (Packing logic & constraints)
├── types/
│   └── index.ts               (TypeScript interfaces)
├── utils/
│   └── sampleData.ts          (Test data)
└── styles/
    └── App.css
```

---

## Performance Targets

| Metric | Target |
|--------|--------|
| Initial Load | < 2s |
| Algorithm Time | < 1s for 100 boxes |
| Frame Rate | 30+ FPS on iPad Air 2 (8GB) |
| Memory Usage | < 200MB |
| Canvas Size | 1024×768 (responsive) |

---

## MVP Feature Checklist

- [ ] Input form for container & box types
- [ ] Packing algorithm that considers constraints
- [ ] 3D visualization with labeled, color-coded boxes
- [ ] Orbit camera controls
- [ ] Stats display (utilization %, total weight)
- [ ] Responsive design (works on tablet)
- [ ] Error handling & validation

---

## Optional Enhancements (Post-MVP)

1. Multiple packing strategies (user selects algorithm)
2. Weight distribution visualization (heatmap)
3. Box details modal on click
4. Undo/redo for manual adjustments (requires enabling editing)
5. Export 3D view as image
6. Dark mode
7. Keyboard shortcuts for camera control

---

## Risks & Mitigation

| Risk | Mitigation |
|------|-----------|
| Algorithm too slow for large datasets | Pre-calculate samples, limit box count, async computation |
| Low FPS on older tablets | Use lower LOD, reduce box count, optimize shaders |
| Memory leaks in R3F | Properly dispose geometries, use useEffect cleanup |
| Packing looks unrealistic | Use proven library, add manual tweaks for POC |
| UX confusion | Clear labels, tooltips, preset examples |

---

## Success Criteria for POC

1. ✅ App loads and runs on 8GB iPad without lag
2. ✅ Form accepts user input and validates
3. ✅ Packing algorithm produces reasonable arrangements
4. ✅ 3D visualization clearly shows container & boxes
5. ✅ User can interact (rotate, zoom) smoothly
6. ✅ Stats accurately reflect packing result
7. ✅ UI is intuitive enough for warehouse staff

---

## Next Steps

1. **Clarify packing algorithm requirements** (any specific constraints beyond fragility?)
2. **Finalize design mockups** (form layout, 3D view layout)
3. **Set up project structure** (create component files)
4. **Implement Phase 1 & 2** (setup, input form)
5. **Test packing library** (spike/POC the algorithm)
6. **Build Phase 3 & 4** (algorithm, visualization)
