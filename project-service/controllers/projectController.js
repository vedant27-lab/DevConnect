// File: devconnect/project-service/controllers/projectController.js
const Project = require('../models/Project');

exports.createProject = async (req, res) => {
    try {
        const { name, description } = req.body;
        const newProject = new Project({ name, description, owner: req.user.id, members: [req.user.id] });
        const project = await newProject.save();
        res.status(201).json(project);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.getProjects = async (req, res) => {
    try {
        // Find projects where the current user is a member
        const projects = await Project.find({ members: req.user.id }).sort({ createdAt: -1 });
        res.json(projects);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.getProjectById = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) return res.status(404).json({ msg: 'Project not found' });
        
        // Ensure the user requesting the project is a member
        if (!project.members.includes(req.user.id)) {
            return res.status(403).json({ msg: 'User not authorized for this project' });
        }
        res.json(project);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};