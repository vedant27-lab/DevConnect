// File: devconnect/frontend/src/pages/ProjectDetailPage.js
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import TaskBoard from '../components/TaskBoard';
import Chat from '../components/Chat';
import './ProjectDetailPage.css';

const ProjectDetailPage = () => {
    const { id } = useParams();
    const [project, setProject] = useState(null);
    const { api } = useAuth();

    useEffect(() => {
        const fetchProject = async () => {
            try {
                const res = await api.get(`${process.env.REACT_APP_PROJECT_API_URL}/projects/${id}`);
                setProject(res.data);
            } catch (error) {
                console.error("Failed to fetch project details", error);
            }
        };
        fetchProject();
    }, [id, api]);

    if (!project) return <div className="loading">Loading project details...</div>;

    return (
        <div className="project-detail-container">
            <h1 className="project-title">{project.name}</h1>
            <p className="project-description">{project.description}</p>
            <div className="project-detail-layout">
                <TaskBoard projectId={id} />
                <Chat projectId={id} />
            </div>
        </div>
    );
};
export default ProjectDetailPage;