// File: devconnect/frontend/src/pages/DashboardPage.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import './DashboardPage.css';

const DashboardPage = () => {
    const [projects, setProjects] = useState([]);
    const [projectName, setProjectName] = useState('');
    const { api } = useAuth();

    const fetchProjects = async () => {
        try {
            const res = await api.get(`${process.env.REACT_APP_PROJECT_API_URL}/projects`);
            setProjects(res.data);
        } catch (error) {
            console.error("Failed to fetch projects", error);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    const handleCreateProject = async (e) => {
        e.preventDefault();
        try {
            await api.post(`${process.env.REACT_APP_PROJECT_API_URL}/projects`, { name: projectName });
            setProjectName('');
            fetchProjects();
        } catch (error) {
            console.error("Failed to create project", error);
        }
    };

    return (
        <div className="dashboard-container">
            <h2>Your Projects</h2>
            <form onSubmit={handleCreateProject} className="create-project-form">
                <input
                    type="text"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="New project name"
                    required
                />
                <button type="submit">Create Project</button>
            </form>
            <div className="project-list">
                {projects.map(project => (
                    <Link to={`/project/${project._id}`} key={project._id} className="project-card">
                        <h3>{project.name}</h3>
                    </Link>
                ))}
            </div>
        </div>
    );
};
export default DashboardPage;