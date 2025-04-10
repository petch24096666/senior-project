// routes/commentRoutes.js
import express from 'express';
import {
  getCommentsByTaskId,
  createComment,
  updateComment,
  deleteComment
} from '../controllers/commentController.js';

const router = express.Router();

// Get comments for a specific task
router.get('/tasks/:taskId/comments', getCommentsByTaskId);

// Create a new comment
router.post('/tasks/:taskId/comments', (req, res) => {
  // Ensure task_id from URL params is added to request body
  req.body.task_id = req.params.taskId;
  createComment(req, res);
});

// Update a comment (owner verification done in controller)
router.put('/comments/:id', updateComment);

// Delete a comment (owner verification done in controller)
router.delete('/comments/:id', deleteComment);

export default router;