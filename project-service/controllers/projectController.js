// File: devconnect/project-service/controllers/projectController.js
const Project = require('../models/Project');
const axios = require('axios');

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

exports.addMemberToProject = async (req, res) => {
    try {
        const { email } = req.body;
        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({ msg: 'Project not found' });
        }

        // 1. Only the project owner can add members
        if (project.owner.toString() !== req.user.id) {
            return res.status(403).json({ msg: 'Not authorized to add members' });
        }

        // 2. Ask the Auth service to find the user by email
        const authServiceUrl = `${process.env.AUTH_SERVICE_URL}/api/auth/user/email/${email}`;
        const { data: userToAdd } = await axios.get(authServiceUrl);

        // 3. Check if the user is already a member
        if (project.members.includes(userToAdd.id)) {
            return res.status(400).json({ msg: 'User is already a member of this project' });
        }

        // 4. Add the user's ID to the members array and save
        project.members.push(userToAdd.id);
        await project.save();

        res.json(project.members);

    } catch (err) {
        // Handle case where user is not found by the auth service
        if (err.response && err.response.status === 404) {
            return res.status(404).json({ msg: 'User with that email not found' });
        }
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};