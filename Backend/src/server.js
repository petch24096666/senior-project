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

// ตัวอย่างการตั้งค่า API Routes
/*app.get('/api/projects', (req, res) => {
  res.json({
    data: [
      { title: 'Project 1', tasksCompleted: 5, totalTasks: 10 },
      { title: 'Project 2', tasksCompleted: 1, totalTasks: 14 },
    ],
  });
});*/

app.listen(8081, () => {
  console.log("Server running");
});

/*const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});*/
