import express from 'express'
import mysql from 'mysql2'
import cors from 'cors'
import bcrypt from 'bcrypt';


const app = express();

// ใช้ CORS Middleware
app.use(express.json());

app.use(cors())

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "db_project"
})

const saltRounds = 10; // กำหนดจำนวนรอบการ Hash

app.post("/signup", (req, res) => {
    const sql = "INSERT INTO user (name, email, password) VALUES (?, ?, ?)";
    bcrypt.hash(req.body.password.toString(), saltRounds, (err, hash) => {
        if (err) {
            console.error("Hashing error:", err);
            return res.status(500).json({ Error: "Hashing error" });
        }
        const values = [req.body.name, req.body.email, hash];
        db.query(sql, values, (err, result) => {
            if (err) {
                console.error("Database error:", err);
                return res.status(500).json({ Error: "Database error" });
            }
            return res.json({ Status: "Success", Data: result });
        });
    });
});

app.post("/signin", (req,res)=>{
  const sql ="SELECT * FROM user WHERE `email` = ?";
  db.query(sql,[req.body.email], (err,result)=>{
    if(err) return res.json({Error:"Error"})
    else{
      if(result.length > 0) {
        bcrypt.compare(req.body.password.toString(), result[0].password, (err,response)=>{
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

app.listen(8081, ()=>{
  console.log("listening")
})

// ตัวอย่างการตั้งค่า API Routes
/*app.get('/api/projects', (req, res) => {
  res.json({
    data: [
      { title: 'Project 1', tasksCompleted: 5, totalTasks: 10 },
      { title: 'Project 2', tasksCompleted: 1, totalTasks: 14 },
    ],
  });
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});*/