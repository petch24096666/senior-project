import React from 'react';

const ActiveFilterChips = ({ filters, onRemoveFilter }) => {
  // Inline styles
  const styles = {
    container: {
      marginBottom: '16px',
      width: '100%',
    },
    activeFilters: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '8px',
      alignItems: 'center',
    },
    filterChip: {
      display: 'inline-flex',
      alignItems: 'center',
      backgroundColor: '#f0f0f0',
      borderRadius: '16px',
      padding: '4px 8px',
      margin: '2px',
      fontSize: '0.875rem',
      maxHeight: '32px',
      transition: 'background-color 0.2s ease, box-shadow 0.2s ease',
    },
    filterChipHover: {
      backgroundColor: '#e0e0e0',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    },
    filterChipLabel: {
      color: '#666',
      marginRight: '4px',
      fontWeight: '500',
    },
    filterChipValue: {
      marginRight: '6px',
      fontWeight: '600',
      color: '#333',
    },
    filterChipRemove: {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      padding: '0 4px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      opacity: '0.7',
      transition: 'opacity 0.2s ease',
    },
    filterChipRemoveHover: {
      opacity: '1',
    },
    chipVariants: {
      priority: {
        backgroundColor: 'rgba(255, 193, 7, 0.1)',
      },
      status: {
        backgroundColor: 'rgba(23, 162, 184, 0.1)',
      },
      dueDate: {
        backgroundColor: 'rgba(220, 53, 69, 0.1)',
      },
      assignee: {
        backgroundColor: 'rgba(40, 167, 69, 0.1)',
      }
    },
    clearAllFilters: {
      background: 'none',
      border: 'none',
      color: '#007bff',
      cursor: 'pointer',
      fontSize: '0.75rem',
      textDecoration: 'underline',
      padding: '4px 8px',
      marginLeft: '8px',
      transition: 'color 0.2s ease',
    },
    clearAllFiltersHover: {
      color: '#0056b3',
      textDecoration: 'none',
    }
  };

  const renderFilterChips = () => {
    const chips = [];

    // Priority chips
    filters.priority.forEach(priority => {
      chips.push(
        <div 
          key={`priority-${priority}`} 
          style={{
            ...styles.filterChip,
            ...styles.chipVariants.priority
          }}
        >
          <span style={styles.filterChipLabel}>Priority:</span>
          <strong style={styles.filterChipValue}>
            {priority.charAt(0).toUpperCase() + priority.slice(1)}
          </strong>
          <button 
            style={styles.filterChipRemove}
            onClick={() => onRemoveFilter('priority', priority)}
            aria-label={`Remove ${priority} priority filter`}
          >
            ✖️
          </button>
        </div>
      );
    });

    // Status chips
    filters.status.forEach(status => {
      const statusLabels = {
        todo: 'To Do',
        inprogress: 'In Progress',
        review: 'Review',
        done: 'Done'
      };
      chips.push(
        <div 
          key={`status-${status}`} 
          style={{
            ...styles.filterChip,
            ...styles.chipVariants.status
          }}
        >
          <span style={styles.filterChipLabel}>Status:</span>
          <strong style={styles.filterChipValue}>
            {statusLabels[status] || status}
          </strong>
          <button 
            style={styles.filterChipRemove}
            onClick={() => onRemoveFilter('status', status)}
            aria-label={`Remove ${status} status filter`}
          >
            ✖️
          </button>
        </div>
      );
    });

    // Due date chip
    if (filters.dueDate !== 'all') {
      const dueDateLabels = {
        overdue: 'Overdue',
        today: 'Due Today',
        week: 'Due This Week',
        future: 'Future'
      };
      chips.push(
        <div 
          key="dueDate" 
          style={{
            ...styles.filterChip,
            ...styles.chipVariants.dueDate
          }}
        >
          <span style={styles.filterChipLabel}>Due:</span>
          <strong style={styles.filterChipValue}>
            {dueDateLabels[filters.dueDate] || filters.dueDate}
          </strong>
          <button 
            style={styles.filterChipRemove}
            onClick={() => onRemoveFilter('dueDate', 'all')}
            aria-label="Remove due date filter"
          >
            ✖️
          </button>
        </div>
      );
    }

    // Assignee chips
    filters.assignees.forEach(assignee => {
      chips.push(
        <div 
          key={`assignee-${assignee}`} 
          style={{
            ...styles.filterChip,
            ...styles.chipVariants.assignee
          }}
        >
          <span style={styles.filterChipLabel}>Assignee:</span>
          <strong style={styles.filterChipValue}>{assignee}</strong>
          <button 
            style={styles.filterChipRemove}
            onClick={() => onRemoveFilter('assignees', assignee)}
            aria-label={`Remove ${assignee} assignee filter`}
          >
            ✖️
          </button>
        </div>
      );
    });

    return chips;
  };

  const hasActiveFilters =
    filters.priority.length > 0 ||
    filters.status.length > 0 ||
    filters.dueDate !== 'all' ||
    filters.assignees.length > 0;

  if (!hasActiveFilters) return null;

  return (
    <div style={styles.container}>
      <div style={styles.activeFilters}>
        {renderFilterChips()}
        {hasActiveFilters && (
          <button
            style={styles.clearAllFilters}
            onClick={() => onRemoveFilter('all')}
            aria-label="Clear all filters"
          >
            Clear all filters
          </button>
        )}
      </div>
    </div>
  );
};

export default ActiveFilterChips;