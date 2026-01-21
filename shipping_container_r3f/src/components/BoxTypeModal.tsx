import { useState, useEffect } from "react";
import { FiX, FiPackage, FiCheck } from "react-icons/fi";
import type { BoxType } from "../types";
import { generateBoxId, getNextColor } from "../utils/sampleData";

interface BoxTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (box: BoxType) => void;
  existingBox?: BoxType | null;
  usedColors: string[];
}

/**
 * Common box type presets
 */
const BOX_PRESETS = [
  {
    name: "Small Box (Electronics)",
    box: { length: 30, width: 20, height: 15, weight: 2, isFragile: true },
  },
  {
    name: "Medium Box (Books/Media)",
    box: { length: 40, width: 30, height: 25, weight: 5, isFragile: false },
  },
  {
    name: "Large Box (Textiles)",
    box: { length: 60, width: 40, height: 40, weight: 8, isFragile: false },
  },
  {
    name: "XL Box (Mixed)",
    box: { length: 80, width: 60, height: 50, weight: 15, isFragile: false },
  },
  {
    name: "Fragile Items",
    box: { length: 35, width: 25, height: 20, weight: 3, isFragile: true },
  },
  {
    name: "Pallet Box",
    box: { length: 120, width: 80, height: 100, weight: 50, isFragile: false },
  },
];

/**
 * Modal for adding/editing box types
 */
function BoxTypeModal({
  isOpen,
  onClose,
  onSave,
  existingBox,
  usedColors,
}: BoxTypeModalProps) {
  const isEditing = !!existingBox;

  const [formData, setFormData] = useState<BoxType>(() => ({
    id: "",
    name: "New Box Type",
    length: 30,
    width: 20,
    height: 15,
    weight: 5,
    isFragile: false,
    color: "#4a7dfc",
    quantity: 1,
  }));

  // Reset form when modal opens
  useEffect(() => {
    if (!isOpen) return;
    
    if (existingBox) {
      setFormData({ ...existingBox });
    } else {
      setFormData({
        id: generateBoxId(),
        name: "New Box Type",
        length: 30,
        width: 20,
        height: 15,
        weight: 5,
        isFragile: false,
        color: getNextColor(usedColors),
        quantity: 1,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, existingBox?.id]);

  const handleChange = (field: keyof BoxType, value: string | number | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePresetSelect = (preset: (typeof BOX_PRESETS)[0]) => {
    setFormData((prev) => ({
      ...prev,
      name: preset.name,
      ...preset.box,
    }));
  };

  const handleSubmit = () => {
    if (formData.length <= 0 || formData.width <= 0 || formData.height <= 0) {
      alert("Dimensions must be positive numbers");
      return;
    }
    if (formData.quantity <= 0) {
      alert("Quantity must be at least 1");
      return;
    }
    onSave(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <h3 className="modal__title">
            <FiPackage />
            {isEditing ? "Edit Box Type" : "Add Box Type"}
          </h3>
          <button className="modal__close" onClick={onClose}>
            <FiX />
          </button>
        </div>

        <div className="modal__body">
          {/* Presets Section - only show for new boxes */}
          {!isEditing && (
            <div className="modal__section">
              <label className="modal__label">Quick Presets</label>
              <div className="modal__presets">
                {BOX_PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    className="modal__preset-btn"
                    onClick={() => handlePresetSelect(preset)}
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Custom Configuration */}
          <div className="modal__section">
            <label className="modal__label">Box Configuration</label>
            
            <div className="modal__form-grid">
              <div className="modal__field modal__field--full">
                <label className="modal__field-label">Name</label>
                <input
                  type="text"
                  className="modal__input"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                />
              </div>

              <div className="modal__field">
                <label className="modal__field-label">Color</label>
                <input
                  type="color"
                  className="modal__input modal__input--color"
                  value={formData.color}
                  onChange={(e) => handleChange("color", e.target.value)}
                />
              </div>

              <div className="modal__field">
                <label className="modal__field-label">Quantity</label>
                <input
                  type="number"
                  className="modal__input"
                  value={formData.quantity}
                  onChange={(e) => handleChange("quantity", parseInt(e.target.value) || 1)}
                  min="1"
                />
              </div>

              <div className="modal__field">
                <label className="modal__field-label">Length (cm)</label>
                <input
                  type="number"
                  className="modal__input"
                  value={formData.length}
                  onChange={(e) => handleChange("length", parseFloat(e.target.value) || 0)}
                  min="1"
                />
              </div>

              <div className="modal__field">
                <label className="modal__field-label">Width (cm)</label>
                <input
                  type="number"
                  className="modal__input"
                  value={formData.width}
                  onChange={(e) => handleChange("width", parseFloat(e.target.value) || 0)}
                  min="1"
                />
              </div>

              <div className="modal__field">
                <label className="modal__field-label">Height (cm)</label>
                <input
                  type="number"
                  className="modal__input"
                  value={formData.height}
                  onChange={(e) => handleChange("height", parseFloat(e.target.value) || 0)}
                  min="1"
                />
              </div>

              <div className="modal__field">
                <label className="modal__field-label">Weight (kg)</label>
                <input
                  type="number"
                  className="modal__input"
                  value={formData.weight}
                  onChange={(e) => handleChange("weight", parseFloat(e.target.value) || 0)}
                  min="0"
                  step="0.1"
                />
              </div>

              <div className="modal__field modal__field--checkbox">
                <label className="modal__checkbox-wrapper">
                  <input
                    type="checkbox"
                    className="modal__checkbox"
                    checked={formData.isFragile}
                    onChange={(e) => handleChange("isFragile", e.target.checked)}
                  />
                  <span>Fragile</span>
                </label>
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="modal__preview">
            <div
              className="modal__preview-box"
              style={{ backgroundColor: formData.color }}
            />
            <div className="modal__preview-info">
              <strong>{formData.name}</strong>
              <span>
                {formData.length} × {formData.width} × {formData.height} cm
              </span>
              <span>{formData.weight} kg {formData.isFragile && "• Fragile"}</span>
            </div>
          </div>
        </div>

        <div className="modal__footer">
          <button className="secondary-button" onClick={onClose}>
            Cancel
          </button>
          <button className="primary-button" onClick={handleSubmit}>
            <FiCheck /> {isEditing ? "Save Changes" : "Add Box Type"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default BoxTypeModal;
