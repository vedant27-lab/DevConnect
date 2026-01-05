const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { getTasksByProject, createTask, updateTask, deleteTask } = require('../controllers/taskController');

router.route('/project/:projectId').get(auth, getTasksByProject).post(auth, createTask);
router.route('/:id').put(auth, updateTask).delete(auth, deleteTask);

module.exports = router;