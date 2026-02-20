// File: devconnect/frontend/src/pages/DashboardPage.js
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import './DashboardPage.css';

const DashboardPage = () => {
    const [projects, setProjects] = useState([]);
    const [projectName, setProjectName] = useState('');
    const [creating, setCreating] = useState(false);
    const { api } = useAuth();

    const fetchProjects = useCallback(async () => {
        try {
            const res = await api.get(`${process.env.REACT_APP_PROJECT_API_URL}/projects`);
            setProjects(res.data);
        } catch (error) {
            console.error('Failed to fetch projects', error);
        }
    }, [api]);

    useEffect(() => { fetchProjects(); }, [fetchProjects]);

    const handleCreateProject = async (e) => {
        e.preventDefault();
        if (!projectName.trim()) return;
        setCreating(true);
        try {
            await api.post(`${process.env.REACT_APP_PROJECT_API_URL}/projects`, { name: projectName });
            setProjectName('');
            fetchProjects();
        } catch (error) {
            console.error('Failed to create project', error);
        } finally {
            setCreating(false);
        }
    };

    return (
        <div className="dashboard-container">
            {/* Header */}
            <div className="dashboard-header">
                <h2>Your Projects</h2>
                <p>Manage and collaborate on your development projects</p>
            </div>

            {/* Create Form */}
            <form onSubmit={handleCreateProject} className="create-project-form">
                <input
                    type="text"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="✦  New project name..."
                    required
                />
                <button type="submit" disabled={creating}>
                    {creating ? '⏳ Creating...' : '+ Create'}
                </button>
            </form>

            {/* Project List */}
            <p className="projects-section-title">All Projects ({projects.length})</p>

            {projects.length === 0 ? (
                <div className="projects-empty">
                    <span className="empty-icon">🚀</span>
                    <p>No projects yet. Create your first one above!</p>
                </div>
            ) : (
                <div className="project-list">
                    {projects.map((project, i) => (
                        <Link
                            to={`/project/${project._id}`}
                            key={project._id}
                            className="project-card"
                            style={{ animationDelay: `${i * 0.06}s` }}
                        >
                            <h3>{project.name}</h3>
                            <p>Click to open project →</p>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};

export default DashboardPage;