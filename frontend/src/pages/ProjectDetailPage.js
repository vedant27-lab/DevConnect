// File: frontend/src/pages/ProjectDetailPage.js
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import TaskBoard from '../components/TaskBoard';
import Chat from '../components/Chat';
import MemberManagement from '../components/MemberManagement'; // Import the new component
import './ProjectDetailPage.css';

const ProjectDetailPage = () => {
    const { id } = useParams(); // Get the project ID from the URL
    const [project, setProject] = useState(null);
    const { api, user } = useAuth(); // Get the API instance and current user from context

    // Effect to fetch project details when the component mounts or the ID changes
    useEffect(() => {
        const fetchProject = async () => {
            try {
                const res = await api.get(`${process.env.REACT_APP_PROJECT_API_URL}/projects/${id}`);
                setProject(res.data);
            } catch (error) {
                console.error("Failed to fetch project details", error);
                // Optionally, handle error state e.g., redirect to a 404 page
            }
        };
        fetchProject();
    }, [id, api]);

    // Show a loading message while the project data is being fetched
    if (!project) {
        return <div className="loading">Loading Project...</div>;
    }

    // Check if the currently logged-in user is the owner of the project
    const isOwner = project.owner === user.id;

    return (
        <div className="project-detail-container">
            <h1 className="project-title">{project.name}</h1>
            {project.description && (
                <p className="project-description">{project.description}</p>
            )}

            {/* --- Member Management Section --- */}
            {/* Only render the MemberManagement component if the user is the project owner */}
            {isOwner && <MemberManagement projectId={id} />}

            {/* --- Main Layout for Tasks and Chat --- */}
            <div className="project-detail-layout">
                <TaskBoard projectId={id} />
                <Chat projectId={id} />
            </div>
        </div>
    );
};

export default ProjectDetailPage;