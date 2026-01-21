import { useState } from "react";
import { FiPackage, FiPlus, FiX, FiEdit2 } from "react-icons/fi";
import type { InputData, BoxType, Container } from "../types";
import { sampleData } from "../utils/sampleData";
import BoxTypeModal from "./BoxTypeModal";

interface InputFormProps {
  onSubmit: (data: InputData) => void;
}

/**
 * Common shipping container presets (internal dimensions in cm)
 */
const CONTAINER_PRESETS = [
  {
    name: "20ft Standard",
    dimensions: { length: 589, width: 234, height: 226 },
  },
  {
    name: "40ft Standard",
    dimensions: { length: 1200, width: 234, height: 226 },
  },
  {
    name: "40ft High Cube",
    dimensions: { length: 1200, width: 234, height: 256 },
  },
  {
    name: "Custom",
    dimensions: { length: 600, width: 300, height: 300 },
  },
];

/**
 * Input form component for container and box configuration
 */
function InputForm({ onSubmit }: InputFormProps) {
  const [container, setContainer] = useState<Container>(sampleData.container);
  const [boxTypes, setBoxTypes] = useState<BoxType[]>(sampleData.boxTypes);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBox, setEditingBox] = useState<BoxType | null>(null);

  // Handle container dimension changes
  const handleContainerChange = (field: keyof Container, value: string) => {
    const numValue = parseFloat(value) || 0;
    setContainer((prev) => ({ ...prev, [field]: numValue }));
  };

  // Handle preset selection
  const handlePresetSelect = (preset: (typeof CONTAINER_PRESETS)[0]) => {
    setContainer(preset.dimensions);
  };

  // Handle quantity change inline
  const handleQuantityChange = (id: string, value: string) => {
    const numValue = parseInt(value) || 1;
    setBoxTypes((prev) =>
      prev.map((box) => (box.id === id ? { ...box, quantity: numValue } : box)),
    );
  };

  // Open modal to add new box
  const handleAddBox = () => {
    setEditingBox(null);
    setIsModalOpen(true);
  };

  // Open modal to edit existing box
  const handleEditBox = (box: BoxType) => {
    setEditingBox(box);
    setIsModalOpen(true);
  };

  // Save box from modal
  const handleSaveBox = (box: BoxType) => {
    if (editingBox) {
      setBoxTypes((prev) => prev.map((b) => (b.id === box.id ? box : b)));
    } else {
      setBoxTypes((prev) => [...prev, box]);
    }
  };

  // Remove box type
  const handleRemoveBox = (id: string) => {
    setBoxTypes((prev) => prev.filter((box) => box.id !== id));
  };

  // Load sample data
  const handleLoadSample = () => {
    setContainer(sampleData.container);
    setBoxTypes(sampleData.boxTypes);
  };

  // Clear all box types
  const handleClear = () => {
    setBoxTypes([]);
  };

  // Validate and submit
  const handleSubmit = () => {
    // Basic validation
    if (
      container.length <= 0 ||
      container.width <= 0 ||
      container.height <= 0
    ) {
      alert("Container dimensions must be positive numbers");
      return;
    }

    if (boxTypes.length === 0) {
      alert("Please add at least one box type");
      return;
    }

    // Validate box types
    for (const box of boxTypes) {
      if (box.length <= 0 || box.width <= 0 || box.height <= 0) {
        alert(`Box "${box.name}" has invalid dimensions`);
        return;
      }
      if (box.quantity <= 0) {
        alert(`Box "${box.name}" must have at least 1 quantity`);
        return;
      }
    }

    onSubmit({ container, boxTypes });
  };

  return (
    <div className="input-form">
      <h2>
        <FiPackage className="input-form__icon" />
        Configure Shipment
      </h2>

      {/* Container Section */}
      <div className="input-form__section">
        <h3 className="input-form__section-title">Container Dimensions (cm)</h3>

        {/* Quick Presets */}
        <div className="input-form__preset-select-wrapper">
          <select
            className="input-form__select"
            onChange={(e) => {
              const preset = CONTAINER_PRESETS.find(
                (p) => p.name === e.target.value,
              );
              if (preset) handlePresetSelect(preset);
            }}
            defaultValue=""
          >
            <option value="" disabled>
              Load Container Preset...
            </option>
            {CONTAINER_PRESETS.map((preset) => (
              <option key={preset.name} value={preset.name}>
                {preset.name} ({preset.dimensions.length}x
                {preset.dimensions.width}x{preset.dimensions.height})
              </option>
            ))}
          </select>
        </div>

        <div className="input-form__grid">
          <div className="input-form__field">
            <label className="input-form__label">Length</label>
            <input
              type="number"
              className="input-form__input"
              style={{ maxWidth: "4rem" }}
              value={container.length}
              onChange={(e) => handleContainerChange("length", e.target.value)}
              min="1"
              step="1"
            />
          </div>
          <div className="input-form__field">
            <label className="input-form__label">Width</label>
            <input
              type="number"
              className="input-form__input"
              style={{ maxWidth: "4rem" }}
              value={container.width}
              onChange={(e) => handleContainerChange("width", e.target.value)}
              min="1"
              step="1"
            />
          </div>
          <div className="input-form__field">
            <label className="input-form__label">Height</label>
            <input
              type="number"
              className="input-form__input"
              style={{ maxWidth: "4rem" }}
              value={container.height}
              onChange={(e) => handleContainerChange("height", e.target.value)}
              min="1"
              step="1"
            />
          </div>
        </div>
      </div>

      {/* Box Types Section */}
      <div className="input-form__section">
        <div className="input-form__section-header">
          <h3 className="input-form__section-title" style={{ margin: 0 }}>
            Box Types
          </h3>
          <button onClick={handleAddBox} className="secondary-button">
            <FiPlus /> Add Box Type
          </button>
        </div>

        {boxTypes.length === 0 ? (
          <div className="input-form__empty">
            No box types added. Click "Add Box Type" to start.
          </div>
        ) : (
          <div className="input-form__box-list">
            {boxTypes.map((box) => (
              <div key={box.id} className="box-card-compact">
                <div
                  className="box-card-compact__color"
                  style={{ backgroundColor: box.color }}
                />
                <div className="box-card-compact__info">
                  <span className="box-card-compact__name">{box.name}</span>
                  <span className="box-card-compact__dims">
                    {box.length}×{box.width}×{box.height} cm • {box.weight}kg
                    {box.isFragile && (
                      <span className="box-card-compact__fragile">
                        {" "}
                        • Fragile
                      </span>
                    )}
                  </span>
                </div>
                <div className="box-card-compact__quantity">
                  <label className="box-card-compact__qty-label">Qty</label>
                  <input
                    type="number"
                    className="box-card-compact__qty-input"
                    value={box.quantity}
                    onChange={(e) =>
                      handleQuantityChange(box.id, e.target.value)
                    }
                    min="1"
                  />
                </div>
                <div className="box-card-compact__actions">
                  <button
                    onClick={() => handleEditBox(box)}
                    className="box-card-compact__btn box-card-compact__btn--edit"
                    title="Edit"
                  >
                    <FiEdit2 />
                  </button>
                  <button
                    onClick={() => handleRemoveBox(box.id)}
                    className="box-card-compact__btn box-card-compact__btn--remove"
                    title="Remove"
                  >
                    <FiX />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="input-form__actions">
        <button onClick={handleSubmit} className="primary-button">
          Visualize Packing
        </button>
        <button onClick={handleLoadSample} className="secondary-button">
          Load Sample
        </button>
        <button onClick={handleClear} className="secondary-button">
          Clear All
        </button>
      </div>

      {/* Modal */}
      <BoxTypeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveBox}
        existingBox={editingBox}
        usedColors={boxTypes.map((b) => b.color)}
      />
    </div>
  );
}

export default InputForm;
