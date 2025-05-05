import React from 'react';
import Modal from './Modal';

// Preset colors for quick selection
const presetColors = [
  '#3366FF', // Blue
  '#33CC66', // Green
  '#FF6633', // Orange
  '#FF3366'  // Pink
];

const CategoryModal = ({
  showCategoryModal,
  onClose,
  categoryForm,
  handleCategoryFormChange,
  handleCategorySubmit,
  editingCategory,
  handleDeleteCategory
}) => {
  if (!showCategoryModal) return null;

  return (
    <Modal onClose={onClose} className="category-modal">
      <div className="modal-header">
        <h2 className="modal-title">
          {editingCategory ? 'Edit Category' : 'New Category'}
        </h2>
      </div>
      <form onSubmit={handleCategorySubmit}>
        <div className="form-group">
          <label className="form-label">Category Name</label>
          <input
            type="text"
            name="name"
            value={categoryForm.name}
            onChange={handleCategoryFormChange}
            required
            className="form-input"
            placeholder="Category name"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Color</label>
          <div className="preset-colors" style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
            {presetColors.map(color => (
              <button
                key={color}
                type="button"
                className={`preset-color-button${categoryForm.color === color ? ' selected' : ''}`}
                style={{
                  backgroundColor: color,
                  width: '24px',
                  height: '24px',
                  border: categoryForm.color === color ? '2px solid #000' : '1px solid #ccc',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
                onClick={() => handleCategoryFormChange({ target: { name: 'color', value: color } })}
              />
            ))}
          </div>
          <input
            type="color"
            name="color"
            value={categoryForm.color}
            onChange={handleCategoryFormChange}
            className="color-picker"
          />
        </div>

        <div className="form-actions">
          {editingCategory && (
            <button
              type="button"
              className="delete-button"
              onClick={handleDeleteCategory}
            >
              Delete
            </button>
          )}
          <div className="form-buttons">
            <button
              type="button"
              className="cancel-button"
              onClick={onClose}
            >
              Cancel
            </button>
            <button type="submit" className="submit-button">
              {editingCategory ? 'Save' : 'Create'}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default CategoryModal;