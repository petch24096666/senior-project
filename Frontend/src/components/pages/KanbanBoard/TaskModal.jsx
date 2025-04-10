import React, { useState, useEffect } from 'react';
import AssigneeDropdown from './AssigneeDropdown';
import { FiMessageSquare, FiEdit2, FiTrash2 } from 'react-icons/fi';

const TaskModal = ({ onClose, onSave, task, isEdit, projectId, modalMode, currentUser }) => {
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
  
  // Add state for comments
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [commentSuccess, setCommentSuccess] = useState('');
  const [isEditing, setIsEditing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
      
      // Fetch comments when task loads
      if (task.id) {
        fetchComments(task.id);
      }
    }
  }, [task, projectId]);

  // Function to fetch comments
  const fetchComments = async (taskId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/tasks/${taskId}/comments`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch comments');
      }
      
      const data = await response.json();
      setComments(data);
    } catch (error) {
      console.error('Error fetching comments:', error);
      setError('Failed to load comments. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Function to add a new comment
  const addComment = async () => {
    if (!newComment.trim() || !formData.id) return;
    
    // Check if current user exists
    if (!currentUser || !currentUser.user_id) {
      setError('You must be logged in to add comments');
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      console.log("Sending comment with payload:", {
        content: newComment,
        task_id: formData.id,
        user_id: currentUser.user_id
      });
      
      const response = await fetch(`${API_BASE_URL}/api/tasks/${formData.id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content: newComment,
          task_id: formData.id,
          user_id: currentUser.user_id
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add comment');
      }
      
      const newCommentData = await response.json();
      setComments([...comments, newCommentData]);
      setNewComment('');
      setCommentSuccess('Comment added successfully');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setCommentSuccess('');
      }, 3000);
    } catch (error) {
      console.error('Error adding comment:', error);
      setError(error.message || 'Failed to add comment. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Function to delete a comment
  const deleteComment = async (commentId) => {
    if (!commentId) return;
    
    // Check if current user exists
    if (!currentUser || !currentUser.user_id) {
      setError('You must be logged in to delete comments');
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/comments/${commentId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user_id: currentUser.user_id
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete comment');
      }
      
      setComments(comments.filter(comment => comment.id !== commentId));
      setCommentSuccess('Comment deleted successfully');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setCommentSuccess('');
      }, 3000);
    } catch (error) {
      console.error('Error deleting comment:', error);
      setError(error.message || 'Failed to delete comment. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Function to update a comment
  const updateComment = async (commentId, content) => {
    if (!commentId || !content.trim()) return;
    
    // Check if current user exists
    if (!currentUser || !currentUser.user_id) {
      setError('You must be logged in to update comments');
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/comments/${commentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content: content,
          user_id: currentUser.user_id
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update comment');
      }
      
      const updatedComment = await response.json();
      setComments(comments.map(comment => 
        comment.id === commentId ? updatedComment : comment
      ));
      setIsEditing(null);
      setCommentSuccess('Comment updated successfully');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setCommentSuccess('');
      }, 3000);
    } catch (error) {
      console.error('Error updating comment:', error);
      setError(error.message || 'Failed to update comment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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

  const handleCommentChange = (e) => {
    setNewComment(e.target.value);
  };

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    addComment();
  };

  // Check if current user is the owner of the comment
  const isCommentOwner = (comment) => {
    if (!currentUser) return false;
    return comment.user?.id === currentUser.user_id;
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

  // Comment component
  const Comment = ({ comment }) => {
    const userInitial = comment.user?.email  ? comment.user.email.charAt(0).toUpperCase() : 'A';
    const [editContent, setEditContent] = useState(comment.content);
    const canModify = isCommentOwner(comment);
    
    return (
      <div className="comment-item">
        <div className="comment-header">
          <div className="comment-author">
            <div className="comment-avatar">{userInitial}</div>
            <span>{comment.user?.email || 'Anonymous'}</span>
          </div>
          <div className="comment-timestamp">{formatDate(comment.created_at)}</div>
        </div>
        
        {isEditing === comment.id ? (
          <div className="comment-edit-form">
            <textarea 
              className="comment-input"
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              rows="1"
            ></textarea>
            <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
              <button 
                className="comment-submit"
                onClick={() => updateComment(comment.id, editContent)}
                disabled={!editContent.trim() || loading}
              >
                Save
              </button>
              <button 
                className="comment-action-btn"
                onClick={() => setIsEditing(null)}
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="comment-content">{comment.content}</div>
            {!readOnly && canModify && (
              <div className="comment-actions">
                <button 
                  className="comment-action-btn" 
                  onClick={() => {
                    setIsEditing(comment.id);
                    setEditContent(comment.content);
                  }}
                  disabled={loading}
                >
                  <FiEdit2 size={14} /> Edit
                </button>
                <button 
                  className="comment-action-btn delete" 
                  onClick={() => deleteComment(comment.id)}
                  disabled={loading}
                >
                  <FiTrash2 size={14} /> Delete
                </button>
              </div>
            )}
          </>
        )}
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
        
        {/* Comments Section */}
        <div className="comments-section">
          <h3>
            <FiMessageSquare style={{ marginRight: '6px' }} />
            Comments {comments.length > 0 && `(${comments.length})`}
          </h3>
          
          {commentSuccess && (
            <div className="comment-success">{commentSuccess}</div>
          )}
          
          {error && (
            <div className="comment-error">{error}</div>
          )}
          
          <div className="comments-list">
            {loading && comments.length === 0 ? (
              <div className="comments-loading">Loading comments...</div>
            ) : comments.length > 0 ? (
              comments.map(comment => (
                <Comment key={comment.id} comment={comment} />
              ))
            ) : (
              <div className="comments-empty-state">No comments yet.</div>
            )}
          </div>
          
          {!readOnly && (
            <form onSubmit={handleCommentSubmit}>
              <div className="comment-input-container">
                <textarea
                  className="comment-input"
                  value={newComment}
                  onChange={handleCommentChange}
                  placeholder="Add a comment..."
                  rows="1"
                  disabled={loading}
                ></textarea>
                <button
                  type="submit"
                  className="comment-submit"
                  disabled={!newComment.trim() || loading || !currentUser}
                >
                  {loading ? 'Adding...' : 'Add'}
                </button>
              </div>
              {!currentUser && (
                <div className="comment-error" style={{ marginTop: '8px', fontSize: '12px' }}>
                  You must be logged in to add comments
                </div>
              )}
            </form>
          )}
        </div>
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