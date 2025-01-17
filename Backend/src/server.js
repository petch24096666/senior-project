const express = require('express');
const cors = require('cors');

const app = express();

// ใช้ CORS Middleware
app.use(cors());

// ตัวอย่างการตั้งค่า API Routes
app.get('/api/projects', (req, res) => {
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
});
