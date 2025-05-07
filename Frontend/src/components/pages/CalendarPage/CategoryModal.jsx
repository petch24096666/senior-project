import React from 'react';
import Modal from './Modal';

// Google Calendar default event palette (11 colors), ordered by hue/shade
const presetColors = [
  '#dc2127', // Red
  '#ff887c', // Salmon
  '#ffb878', // Tangerine
  '#fbd75b', // Banana Yellow
  '#51b749', // Green
  '#7ae7bf', // Light Green
  '#46d6db', // Turquoise
  '#5484ed', // Royal Blue
  '#a4bdfc', // Light Blue
  '#dbadff', // Lavender Purple
  '#e1e1e1'  // Light Grey
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

  const colorOptions = presetColors.map(color => ({ id: color, value: color }));

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
          <div
            className="preset-colors"
            style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}
          >
            {colorOptions.map(({ id, value }) => (
              <button
                key={id}
                type="button"
                className={`preset-color-button${categoryForm.color === value ? ' selected' : ''}`}
                style={{
                  backgroundColor: value,
                  width: '24px',
                  height: '24px',
                  border: categoryForm.color === value ? '2px solid #000' : '1px solid #ccc',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
                onClick={() => handleCategoryFormChange({ target: { name: 'color', value } })}
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