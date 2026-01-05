const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { getProjects, createProject, getProjectById, addMemberToProject } = require('../controllers/projectController');

router.route('/').get(auth, getProjects).post(auth, createProject);
router.route('/:id').get(auth, getProjectById);

router.route('/:id/members').post(auth, addMemberToProject);

module.exports = router;