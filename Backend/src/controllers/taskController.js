import db from "../config/database.js";
import Task from "../models/taskModel.js";

export const createTask = async (req, res) => {
    console.log("🟢 Received Task Data:", req.body); // ตรวจสอบค่าที่ถูกส่งมา

    const { task_label, task_name, task_description, task_due_date, task_group } = req.body;

    // ตรวจสอบว่าทุกค่าถูกส่งมาครบ
    if (!task_label || !task_name || !task_due_date || !task_group) {
        console.error("❌ Missing required fields:", { task_label, task_name, task_due_date, task_group });
        return res.status(400).json({ success: false, error: "Missing required fields" });
    }

    try {
        console.log("🟡 SQL Query: INSERT INTO task (task_label, task_name, task_description, task_due_date, task_group) VALUES (?, ?, ?, ?, ?)");
        console.log("🟢 Data:", { task_label, task_name, task_description, task_due_date, task_group });
    
        const [result] = await db.query(
            "INSERT INTO task (task_label, task_name, task_description, task_due_date, task_group) VALUES (?, ?, ?, ?, ?)",
            [task_label, task_name, task_description || "", task_due_date, task_group]
        );
    
        console.log("✅ Task Inserted with ID:", result.insertId);
        return res.status(201).json({ success: true, message: "Task created successfully", taskId: result.insertId });
    
    } catch (error) {
        console.error("🔥 Database Insert Error:", error);
        return res.status(500).json({ success: false, error: error.message });
    }
    
};
