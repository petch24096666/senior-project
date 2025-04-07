import React, { useState, useEffect } from 'react';
import AssigneeDropdown from './AssigneeDropdown';

const TaskModal = ({ onClose, onSave, task, isEdit, projectId, modalMode }) => {
  // readOnly เป็น true เมื่อ modalMode เป็น "view"
  const readOnly = modalMode === "view";
  const [formData, setFormData] = useState({
    id: task?.id || null,
    title: '',
    description: '',
    priority: 'low',
    dueDate: '',
    assignees: [],
    column: 'todo',
    project_id: projectId || ''
  });

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081';

  const formatDate = (dateString) => {
    if (!dateString) return 'Just now';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    });
  };

  useEffect(() => {
    if (task) {
      let dateOnly = '';
      if (typeof task.due_date === 'string') {
        dateOnly = task.due_date;
      } else if (task.due_date) {
        dateOnly = new Date(task.due_date).toISOString().split('T')[0];
      }
      const assigneeArray =
        Array.isArray(task.assignees)
          ? task.assignees
          : typeof task.assignee === 'string'
            ? task.assignee.split(',').map(s => s.trim()).filter(Boolean)
            : [];
      setFormData({
        id: task.id,
        title: task.title || '',
        description: task.description || '',
        priority: task.priority || 'low',
        dueDate: dateOnly,
        assignees: assigneeArray,
        column: task.column || task.column_status || 'todo',
        project_id: projectId || task.project_id || '',
        created_at: task.created_at,
        updated_at: task.updated_at
      });
    }
  }, [task, projectId]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData({
      ...formData,
      [id.replace('task-', '')]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // หากเป็นโหมด view-only ไม่ควรส่งข้อมูลกลับไปแก้ไข
    if (readOnly) return;
    const apiPayload = {
      ...formData,
      assignee: formData.assignees.length > 0 ? formData.assignees.join(',') : ''
    };
    onSave(apiPayload);
  };

  const handleAssigneesChange = (assigneesArray) => {
    setFormData(prev => ({
      ...prev,
      assignees: assigneesArray
    }));
  };

  const PriorityBadge = ({ priority }) => {
    const colors = {
      high: '#DE350B',
      medium: '#F5A623',
      low: '#36B37E'
    };
    return (
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        color: colors[priority],
        fontWeight: 500
      }}>
        <span style={{
          display: 'inline-block',
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          backgroundColor: colors[priority],
          marginRight: '6px'
        }}></span>
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </div>
    );
  };

  return (
    <div className="modal-body">
      <div className="modal-main">
        <form id="task-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="task-title">Title</label>
            <input
              type="text"
              id="task-title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter task title"
              required
              disabled={readOnly}
            />
          </div>
          <div className="form-group">
            <label htmlFor="task-description">Description</label>
            <textarea
              id="task-description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Add a description..."
              rows="5"
              disabled={readOnly}
            ></textarea>
          </div>
          {isEdit && (
            <div style={{ marginBottom: '20px', color: '#6B778C', fontSize: '12px' }}>
              {formData.created_at && (
                <div>Created {formatDate(formData.created_at)}</div>
              )}
              {formData.updated_at && formData.updated_at !== formData.created_at && (
                <div>Updated {formatDate(formData.updated_at)}</div>
              )}
            </div>
          )}
        </form>
      </div>
      <div className="modal-sidebar">
        <div className="modal-section">
          <div className="modal-section-title">Status</div>
          <select
            id="task-column"
            value={formData.column}
            onChange={handleChange}
            style={{ width: '100%', marginBottom: '16px' }}
            disabled={readOnly}
          >
            <option value="todo">To Do</option>
            <option value="inprogress">In Progress</option>
            <option value="review">Review</option>
            <option value="done">Done</option>
          </select>
        </div>
        <div className="modal-section">
          <div className="modal-section-title">Priority</div>
          <select
            id="task-priority"
            value={formData.priority}
            onChange={handleChange}
            style={{ width: '100%', marginBottom: '16px' }}
            disabled={readOnly}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          <PriorityBadge priority={formData.priority} />
        </div>
        <div className="modal-section">
          <div className="modal-section-title">Assignees</div>
          <AssigneeDropdown
            projectId={projectId}
            selectedAssignees={formData.assignees}
            onAssigneeChange={handleAssigneesChange}
            API_BASE_URL={API_BASE_URL}
            disabled={readOnly}
          />
        </div>
        <div className="modal-section">
          <div className="modal-section-title">Due Date</div>
          <input
            type="date"
            id="task-dueDate"
            value={formData.dueDate}
            onChange={handleChange}
            style={{ width: '100%' }}
            disabled={readOnly}
          />
        </div>
        <input
          type="hidden"
          id="task-project_id"
          value={formData.project_id}
        />
      </div>
    </div>
  );
};

export default TaskModal;
