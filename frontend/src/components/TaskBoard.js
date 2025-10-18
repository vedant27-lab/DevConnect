// File: devconnect/frontend/src/components/TaskBoard.js
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import './TaskBoard.css';

const TaskBoard = ({ projectId }) => {
    const [tasks, setTasks] = useState([]);
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const { api } = useAuth();
    const columns = ['To Do', 'In Progress', 'Done'];

    const fetchTasks = useCallback(async () => {
        try {
            const res = await api.get(`${process.env.REACT_APP_PROJECT_API_URL}/tasks/project/${projectId}`);
            setTasks(res.data);
        } catch (error) {
            console.error("Failed to fetch tasks", error);
        }
    }, [projectId, api]);

    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);

    const handleCreateTask = async (e) => {
        e.preventDefault();
        if (!newTaskTitle.trim()) return;
        try {
            await api.post(`${process.env.REACT_APP_PROJECT_API_URL}/tasks/project/${projectId}`, { title: newTaskTitle });
            setNewTaskTitle('');
            fetchTasks();
        } catch (error) {
            console.error("Failed to create task", error);
        }
    };

    const handleStatusChange = async (taskId, status) => {
        try {
            await api.put(`${process.env.REACT_APP_PROJECT_API_URL}/tasks/${taskId}`, { status });
            fetchTasks();
        } catch (error) {
            console.error("Failed to update task", error);
        }
    };

    return (
        <div className="task-board">
            <h3>Task Board</h3>
            <form onSubmit={handleCreateTask} className="add-task-form">
                <input
                    type="text"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    placeholder="New task title"
                />
                <button type="submit">Add Task</button>
            </form>
            <div className="task-columns">
                {columns.map(column => (
                    <div key={column} className="task-column">
                        <h4>{column}</h4>
                        <div className="task-column-body">
                            {tasks.filter(t => t.status === column).map(task => (
                                <div key={task._id} className="task-card">
                                    <p>{task.title}</p>
                                    <select value={task.status} onChange={(e) => handleStatusChange(task._id, e.target.value)}>
                                        {columns.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
export default TaskBoard;