import React from 'react';
import Modal from './Modal';

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
            <button type="button" className="delete-button" onClick={handleDeleteCategory}>
              Delete
            </button>
          )}
          <div className="form-buttons">
            <button type="button" className="cancel-button" onClick={onClose}>
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
