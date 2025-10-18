// File: devconnect/project-service/controllers/taskController.js
const Task = require('../models/Task');
const Project = require('../models/Project');

// Helper function to check project membership
const checkMembership = async (projectId, userId) => {
    const project = await Project.findById(projectId);
    if (!project || !project.members.includes(userId)) {
        return false;
    }
    return true;
};

exports.createTask = async (req, res) => {
    try {
        const { title } = req.body;
        const { projectId } = req.params;

        if (!await checkMembership(projectId, req.user.id)) {
            return res.status(403).json({ msg: 'Not authorized' });
        }

        const newTask = new Task({ title, project: projectId });
        const task = await newTask.save();
        res.status(201).json(task);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.getTasksByProject = async (req, res) => {
    try {
        const { projectId } = req.params;
        if (!await checkMembership(projectId, req.user.id)) {
            return res.status(403).json({ msg: 'Not authorized' });
        }

        const tasks = await Task.find({ project: projectId });
        res.json(tasks);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.updateTask = async (req, res) => {
    try {
        const { status } = req.body;
        let task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ msg: 'Task not found' });
        
        if (!await checkMembership(task.project, req.user.id)) {
            return res.status(403).json({ msg: 'Not authorized' });
        }

        task = await Task.findByIdAndUpdate(req.params.id, { $set: { status } }, { new: true });
        res.json(task);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.deleteTask = async (req, res) => {
    try {
        let task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ msg: 'Task not found' });

        if (!await checkMembership(task.project, req.user.id)) {
            return res.status(403).json({ msg: 'Not authorized' });
        }

        await Task.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Task removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};