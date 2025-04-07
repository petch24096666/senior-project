import React from 'react';
import './KanbanBoard.css';

const SearchInput = ({ value, onChange, onClear }) => {
  const icons = {
    search: '🔍',
    clear: '✖️'
  };

  return (
    <div className="search-container">
      <span className="search-icon">{icons.search}</span>
      <input
        type="text"
        className="search-input"
        placeholder="Search tasks..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {value && (
        <button
          className="clear-search-button"
          onClick={onClear}
        >
          {icons.clear}
        </button>
      )}
    </div>
  );
};

export default SearchInput;