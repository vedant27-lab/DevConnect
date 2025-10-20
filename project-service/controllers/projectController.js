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
    } catch (err)
 {
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

// This is the function with added debugging logs.
exports.addMemberToProject = async (req, res) => {
    try {
        const { email } = req.body;
        
        // --- LOG 1: See what email the service receives ---
        console.log(`[Project Service] Received request to add member with email: ${email}`);
        
        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({ msg: 'Project not found' });
        }
        if (project.owner.toString() !== req.user.id) {
            return res.status(403).json({ msg: 'Not authorized to add members' });
        }

        const authServiceUrl = `${process.env.AUTH_SERVICE_URL}/api/auth/user/email/${email}`;
        
        // --- LOG 2: Verify the URL being called is correct ---
        console.log(`[Project Service] Calling Auth Service at URL: ${authServiceUrl}`);

        const { data: userToAdd } = await axios.get(authServiceUrl);

        if (project.members.includes(userToAdd.id)) {
            return res.status(400).json({ msg: 'User is already a member of this project' });
        }

        project.members.push(userToAdd.id);
        await project.save();

        res.json(project.members);

    } catch (err) {
        // --- LOG 3: See the exact error if the request fails ---
        console.error('[Project Service] Error adding member:', err.message);
        if (err.response) {
            console.error('[Project Service] Error details from Auth Service:', err.response.data);
        }

        if (err.response && err.response.status === 404) {
            return res.status(404).json({ msg: 'User with that email not found' });
        }
        res.status(500).send('Server Error');
    }
};