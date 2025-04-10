// models/commentModel.js

const CommentModel = {
    // ดึงคอมเมนต์ทั้งหมดของ task ตาม task_id
    getCommentsByTaskId: `
      SELECT 
        c.id, 
        c.task_id,
        c.user_id,
        c.content,
        c.created_at,
        c.updated_at,
        u.fullname AS user_fullname,
        u.email AS user_email
      FROM task_comments c
      LEFT JOIN users u ON c.user_id = u.user_id
      WHERE c.task_id = ?
      ORDER BY c.created_at ASC
    `,
  
    // สร้างคอมเมนต์ใหม่
    createComment: `
      INSERT INTO task_comments (id, task_id, user_id, content, created_at, updated_at)
      VALUES (?, ?, ?, ?, NOW(), NOW())
    `,
  
    // อัปเดตคอมเมนต์ (แก้ไขเฉพาะ content พร้อมอัปเดต updated_at)
    updateComment: `
      UPDATE task_comments
      SET content = ?, updated_at = NOW()
      WHERE id = ?
    `,
  
    // ลบคอมเมนต์
    deleteComment: `
      DELETE FROM task_comments
      WHERE id = ?
    `,
  
    // ตรวจสอบว่าคอมเมนต์มีอยู่จริงและดึงข้อมูลเจ้าของคอมเมนต์
    getCommentWithOwner: `
      SELECT 
        c.id,
        c.task_id,
        c.user_id,
        c.content,
        c.created_at,
        c.updated_at,
        u.fullname AS user_fullname
      FROM task_comments c
      LEFT JOIN users u ON c.user_id = u.user_id
      WHERE c.id = ?
    `,
  };
  
  export default CommentModel;
  