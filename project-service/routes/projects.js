// File: devconnect/project-service/routes/projects.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { getProjects, createProject, getProjectById } = require('../controllers/projectController');

// All project routes are protected
router.route('/').get(auth, getProjects).post(auth, createProject);
router.route('/:id').get(auth, getProjectById);

module.exports = router;