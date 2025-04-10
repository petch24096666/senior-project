// controllers/commentController.js
import db from '../config/database.js';
import CommentModel from '../models/commentModel.js';
import { v4 as uuidv4 } from 'uuid';

// Get all comments for a specific task
export const getCommentsByTaskId = async (req, res) => {
  try {
    const taskId = req.params.taskId;
    
    const [comments] = await db.query(CommentModel.getCommentsByTaskId, [taskId]);
    
    // Format the response to include user information in a nested object
    const formattedComments = comments.map(comment => ({
      id: comment.id,
      content: comment.content,
      task_id: comment.task_id,
      created_at: comment.created_at,
      updated_at: comment.updated_at,
      user: {
        id: comment.user_id,
        name: comment.user_name,
        email: comment.user_email
      }
    }));
    
    res.status(200).json(formattedComments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
};

// Create a new comment
export const createComment = async (req, res) => {
    try {
      const { content, task_id, user_id } = req.body;
      
      if (!content || !task_id || !user_id) {
        return res.status(400).json({ error: 'Content, task_id, and user_id are required' });
      }
      
      // ตรวจสอบว่ามี task ที่มี id ตามที่ส่งมาหรือไม่
      const [taskExists] = await db.query('SELECT id FROM tasks WHERE id = ?', [task_id]);
      
      if (taskExists.length === 0) {
        return res.status(404).json({ error: 'Task not found' });
      }
      
      // ตรวจสอบว่ามี user ที่มี user_id ตามที่ส่งมาหรือไม่
      const [userExists] = await db.query(
        'SELECT user_id AS id, fullname AS name, email FROM users WHERE user_id = ?',
        [user_id]
      );
      
      if (userExists.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      // สร้าง comment ใหม่
      const commentId = uuidv4();
      await db.query(CommentModel.createComment, [commentId, task_id, user_id, content]);
      
      const newComment = {
        id: commentId,
        content,
        task_id,
        created_at: new Date(),
        updated_at: new Date(),
        user: {
          id: user_id,
          email: userExists[0].email
        }
      };
      
      res.status(201).json(newComment);
    } catch (error) {
      console.error('Error creating comment:', error);
      res.status(500).json({ error: 'Failed to create comment' });
    }
  };
  

// Update a comment (only the owner can update)
export const updateComment = async (req, res) => {
  try {
    const commentId = req.params.id;
    const { content, user_id } = req.body;
    
    if (!content || !user_id) {
      return res.status(400).json({ error: 'Content and user_id are required' });
    }
    
    // First check if the comment exists and belongs to the user
    const [comment] = await db.query(CommentModel.getCommentWithOwner, [commentId]);
    
    if (comment.length === 0) {
      return res.status(404).json({ error: 'Comment not found' });
    }
    
    // Verify the comment belongs to the user
    if (comment[0].user_id !== user_id) {
      return res.status(403).json({ error: 'You can only edit your own comments' });
    }
    
    // Update the comment
    await db.query(CommentModel.updateComment, [content, commentId]);
    
    // Fetch updated comment with user info
    const [updatedComment] = await db.query(CommentModel.getCommentWithOwner, [commentId]);
    
    const formattedComment = {
      id: updatedComment[0].id,
      content: updatedComment[0].content,
      task_id: updatedComment[0].task_id,
      created_at: updatedComment[0].created_at,
      updated_at: updatedComment[0].updated_at,
      user: {
        id: updatedComment[0].user_id,
        name: updatedComment[0].user_name,
        email: updatedComment[0].user_email
      }
    };
    
    res.status(200).json(formattedComment);
  } catch (error) {
    console.error('Error updating comment:', error);
    res.status(500).json({ error: 'Failed to update comment' });
  }
};

// Delete a comment (only the owner can delete)
export const deleteComment = async (req, res) => {
  try {
    const commentId = req.params.id;
    const { user_id } = req.body;
    
    if (!user_id) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    // First check if the comment exists and belongs to the user
    const [comment] = await db.query(CommentModel.getCommentWithOwner, [commentId]);
    
    if (comment.length === 0) {
      return res.status(404).json({ error: 'Comment not found' });
    }
    
    // Verify the comment belongs to the user
    if (comment[0].user_id !== user_id) {
      return res.status(403).json({ error: 'You can only delete your own comments' });
    }
    
    // Permanently delete the comment
    await db.query(CommentModel.deleteComment, [commentId]);
    
    res.status(200).json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ error: 'Failed to delete comment' });
  }
};