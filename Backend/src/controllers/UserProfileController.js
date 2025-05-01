// controllers/UserProfileController.js

import express from 'express';
import db from '../config/database.js'; // เชื่อม database

const router = express.Router();

// ดึงข้อมูลผู้ใช้
router.get('/api/users/me', async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: 'userId is required' });

    const [rows] = await db.query('SELECT * FROM users WHERE user_id = ?', [userId]);
    if (rows.length === 0) return res.status(404).json({ error: 'User not found' });

    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// อัปเดตข้อมูลผู้ใช้
router.put('/api/users/me', async (req, res) => {
  try {
    const { userId, fullName, phoneNumber, company, location, department, employeeId, reportingTo } = req.body;
    if (!userId) return res.status(400).json({ error: 'userId is required' });

    await db.query(
      `UPDATE users 
       SET fullname = ?, phone_number = ?, company = ?, location = ?, department = ?, employee_id = ?, reporting_to = ?
       WHERE user_id = ?`,
      [fullName, phoneNumber, company, location, department, employeeId, reportingTo, userId]
    );
    res.json({ message: 'User updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;