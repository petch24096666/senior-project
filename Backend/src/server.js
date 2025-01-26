import express from 'express'
import mysql from 'mysql2'
import cors from'cors'
import bcrypt from 'bcrypt'

const app = express();

app.use(express.json());

app.use(cors());

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "db_project"
})

db.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err);
    return;
  }
  console.log("Connected to MySQL database successfully.");
});

const salt = 5;
app.post("/register", (req,res)=>{
  const sql = "INSERT INTO user (`fullname`,`email`,`password`) VALUES (?)";
  bcrypt.hash(req.body.password.toString(),salt,(err,hash)=>{
    if(err) return res.json("Error")
    const values = [req.body.fullname,req.body.email,hash]
    db.query(sql,[values],(err, result) =>{
      if(err) console.log(err);
      else return res.json(result)
    })
  })
})

app.post("/login", (req,res)=>{
  const sql = "SELECT * FROM user WHERE `email` = ?";
  db.query(sql,[req.body.email],(err, result)=>{
    if(err) return res.json({Error:"Error"})
    else{
      if(result.length > 0){
        bcrypt.compare(req.body.password.toString(),result[0].password,(err,response)=>{
          if(err) return res.json({Error:"Error"})
          if(response) return res.json({Status:"Success"})
          else return res.json({Error:"Wrong password"})
        })
      }else{
        return res.json({Error:"Email not existing"})
      }
    }
  })
})
// Projectpageeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee
// ตัวอย่างการตั้งค่า API Routes
// ดึงข้อมูลโปรเจคทั้งหมดจากฐานข้อมูล
app.get('/api/projects', (req, res) => {
  const sql = "SELECT * FROM projects";
  db.query(sql, (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Database query error" });
    }
    res.status(200).json({ success: true, data: result });
  });
});


// เพิ่มโปรเจคใหม่ลงในฐานข้อมูล
app.post("/api/projects", (req, res) => {
  const { title, tasksCompleted, totalTasks, teamMembers } = req.body;

  if (!title || totalTasks === undefined || !teamMembers || teamMembers.length === 0) {
    return res.status(400).json({ success: false, error: "Invalid input data" });
  }

  // SQL สำหรับบันทึกโปรเจคใหม่
  const sqlProject = "INSERT INTO projects (title, tasksCompleted, totalTasks) VALUES (?, ?, ?)";
  const projectValues = [title, tasksCompleted || 0, totalTasks];

  db.query(sqlProject, projectValues, (err, result) => {
    if (err) {
      console.error("Error inserting project:", err);
      return res.status(500).json({ success: false, error: "Database insert error" });
    }

    const projectId = result.insertId;
    const sqlMembers = "INSERT INTO project_members (project_id, email, role) VALUES ?";
    const memberValues = teamMembers.map(member => [projectId, member.email, member.role]);

    db.query(sqlMembers, [memberValues], (err) => {
      if (err) {
        console.error("Error inserting members:", err);
        return res.status(500).json({ success: false, error: "Error adding members" });
      }
      res.status(201).json({ success: true, message: "Project created successfully" });
    });
  });
});

// อัปเดตข้อมูลโปรเจค
app.put('/api/projects/:id', (req, res) => {
  const { id } = req.params;
  const { title, tasksCompleted, totalTasks } = req.body;

  const sql = "UPDATE projects SET title = ?, tasksCompleted = ?, totalTasks = ? WHERE id = ?";
  const values = [title, tasksCompleted, totalTasks, id];

  db.query(sql, values, (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Database update error" });
    }
    res.status(200).json({ success: true, message: "Project updated successfully" });
  });
});

// ลบโปรเจค
app.delete('/api/projects/:id', (req, res) => {
  const { id } = req.params;

  const sql = "DELETE FROM projects WHERE id = ?";
  db.query(sql, [id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Database delete error" });
    }
    res.status(200).json({ success: true, message: "Project deleted successfully" });
  });
});


const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
