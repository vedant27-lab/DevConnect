// File: devconnect/frontend/src/components/MemberManagement.js
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './MemberManagement.css';

const MemberManagement = ({ projectId }) => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const { api } = useAuth();

    const handleAddMember = async (e) => {
        e.preventDefault();
        setMessage('');
        try {
            await api.post(`${process.env.REACT_APP_PROJECT_API_URL}/projects/${projectId}/members`, { email });
            setMessage(`Successfully added ${email} to the project!`);
            setEmail('');
        } catch (error) {
            setMessage(error.response?.data?.msg || 'Failed to add member.');
        }
    };

    return (
        <div className="member-management-container">
            <h3>Add New Member</h3>
            <form onSubmit={handleAddMember} className="add-member-form">
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter user's email"
                    required
                />
                <button type="submit">Add Member</button>
            </form>
            {message && <p className="member-message">{message}</p>}
        </div>
    );
};

export default MemberManagement;