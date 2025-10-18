// File: devconnect/frontend/src/components/Chat.js
import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './Chat.css';

const Chat = ({ projectId }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const socketRef = useRef();
    const { user } = useAuth();
    const messagesEndRef = useRef(null);

    // Effect for scrolling to the bottom of the chat
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);
    
    useEffect(() => {
        // Fetch historical messages
        const fetchMessages = async () => {
            const res = await axios.get(`${process.env.REACT_APP_CHAT_API_URL}/api/messages/${projectId}`);
            setMessages(res.data);
        };
        fetchMessages();

        // Connect to the socket server, passing the token for authentication
        socketRef.current = io(process.env.REACT_APP_CHAT_API_URL, {
            auth: { token: localStorage.getItem('token') }
        });

        // Join the project-specific room
        socketRef.current.emit('joinRoom', { projectId });

        // Listen for incoming messages
        socketRef.current.on('message', (message) => {
            setMessages(prevMessages => [...prevMessages, message]);
        });

        // Clean up on component unmount
        return () => socketRef.current.disconnect();
    }, [projectId]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;
        socketRef.current.emit('sendMessage', { projectId, text: newMessage });
        setNewMessage('');
    };

    return (
        <div className="chat-container">
            <h3>Project Chat</h3>
            <div className="message-list">
                {messages.map((msg, index) => (
                    <div key={index} className={`message ${msg.user.id === user.id ? 'sent' : 'received'}`}>
                        <div className="message-bubble">
                            <strong>{msg.user.username}:</strong> {msg.text}
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>
            <form onSubmit={handleSendMessage} className="message-form">
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                />
                <button type="submit">Send</button>
            </form>
        </div>
    );
};
export default Chat;