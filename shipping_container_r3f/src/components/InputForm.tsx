import { useState } from "react";
import { FiPackage, FiPlus, FiX } from "react-icons/fi";
import type { InputData, BoxType, Container } from "../types";
import { generateBoxId, getNextColor, sampleData } from "../utils/sampleData";

interface InputFormProps {
  onSubmit: (data: InputData) => void;
}

/**
 * Input form component for container and box configuration
 */
function InputForm({ onSubmit }: InputFormProps) {
  const [container, setContainer] = useState<Container>(sampleData.container);
  const [boxTypes, setBoxTypes] = useState<BoxType[]>(sampleData.boxTypes);

  // Handle container dimension changes
  const handleContainerChange = (field: keyof Container, value: string) => {
    const numValue = parseFloat(value) || 0;
    setContainer((prev) => ({ ...prev, [field]: numValue }));
  };

  // Handle box type field changes
  const handleBoxChange = (
    id: string,
    field: keyof BoxType,
    value: string | boolean
  ) => {
    setBoxTypes((prev) =>
      prev.map((box) => {
        if (box.id === id) {
          if (field === "isFragile") {
            return { ...box, [field]: value as boolean };
          }
          if (
            field === "length" ||
            field === "width" ||
            field === "height" ||
            field === "weight" ||
            field === "quantity"
          ) {
            return { ...box, [field]: parseFloat(value as string) || 0 };
          }
          return { ...box, [field]: value };
        }
        return box;
      })
    );
  };

  // Add new box type
  const handleAddBox = () => {
    const usedColors = boxTypes.map((b) => b.color);
    const newBox: BoxType = {
      id: generateBoxId(),
      name: `Box Type ${boxTypes.length + 1}`,
      length: 30,
      width: 20,
      height: 15,
      weight: 5,
      isFragile: false,
      color: getNextColor(usedColors),
      quantity: 1,
    };
    setBoxTypes((prev) => [...prev, newBox]);
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
    if (container.length <= 0 || container.width <= 0 || container.height <= 0) {
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
        <div className="input-form__grid">
          <div className="input-form__field">
            <label className="input-form__label">Length</label>
            <input
              type="number"
              className="input-form__input"
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
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
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
              <div key={box.id} className="input-form__box-card">
                <div className="input-form__box-header">
                  <div className="input-form__box-title">
                    <div
                      className="input-form__color-indicator"
                      style={{ backgroundColor: box.color }}
                    />
                    {box.name}
                  </div>
                  <button
                    onClick={() => handleRemoveBox(box.id)}
                    className="input-form__remove-btn"
                  >
                    <FiX /> Remove
                  </button>
                </div>

                <div className="input-form__grid">
                  <div className="input-form__field">
                    <label className="input-form__label">Name</label>
                    <input
                      type="text"
                      className="input-form__input"
                      value={box.name}
                      onChange={(e) =>
                        handleBoxChange(box.id, "name", e.target.value)
                      }
                    />
                  </div>
                  <div className="input-form__field">
                    <label className="input-form__label">Color</label>
                    <input
                      type="color"
                      className="input-form__input input-form__input--color"
                      value={box.color}
                      onChange={(e) =>
                        handleBoxChange(box.id, "color", e.target.value)
                      }
                    />
                  </div>
                  <div className="input-form__field">
                    <label className="input-form__label">Quantity</label>
                    <input
                      type="number"
                      className="input-form__input"
                      value={box.quantity}
                      onChange={(e) =>
                        handleBoxChange(box.id, "quantity", e.target.value)
                      }
                      min="1"
                      step="1"
                    />
                  </div>
                  <div className="input-form__field">
                    <label className="input-form__label">Length (cm)</label>
                    <input
                      type="number"
                      className="input-form__input"
                      value={box.length}
                      onChange={(e) =>
                        handleBoxChange(box.id, "length", e.target.value)
                      }
                      min="1"
                      step="1"
                    />
                  </div>
                  <div className="input-form__field">
                    <label className="input-form__label">Width (cm)</label>
                    <input
                      type="number"
                      className="input-form__input"
                      value={box.width}
                      onChange={(e) =>
                        handleBoxChange(box.id, "width", e.target.value)
                      }
                      min="1"
                      step="1"
                    />
                  </div>
                  <div className="input-form__field">
                    <label className="input-form__label">Height (cm)</label>
                    <input
                      type="number"
                      className="input-form__input"
                      value={box.height}
                      onChange={(e) =>
                        handleBoxChange(box.id, "height", e.target.value)
                      }
                      min="1"
                      step="1"
                    />
                  </div>
                  <div className="input-form__field">
                    <label className="input-form__label">Weight (kg)</label>
                    <input
                      type="number"
                      className="input-form__input"
                      value={box.weight}
                      onChange={(e) =>
                        handleBoxChange(box.id, "weight", e.target.value)
                      }
                      min="0"
                      step="0.1"
                    />
                  </div>
                  <div className="input-form__field">
                    <label className="input-form__checkbox-wrapper">
                      <input
                        type="checkbox"
                        className="input-form__checkbox"
                        checked={box.isFragile}
                        onChange={(e) =>
                          handleBoxChange(box.id, "isFragile", e.target.checked)
                        }
                      />
                      <span className="input-form__label" style={{ margin: 0 }}>
                        Fragile
                      </span>
                    </label>
                  </div>
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
          Load Sample Data
        </button>
        <button onClick={handleClear} className="secondary-button">
          Clear All Boxes
        </button>
      </div>
    </div>
  );
}

export default InputForm;
