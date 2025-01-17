const express = require('express');
const { getAllProjects, createProject } = require('../controllers/projectController');

const router = express.Router();

// Routes
router.get('/', getAllProjects);
router.post('/', createProject);

module.exports = router;
