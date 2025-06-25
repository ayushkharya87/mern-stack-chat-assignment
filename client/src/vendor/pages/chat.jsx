import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { io } from 'socket.io-client';

const socket = io(import.meta.env.VITE_API_BASE_URL); 

const VendorChat = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const vendorSession = JSON.parse(localStorage.getItem('vendor'));
    const vendorId = vendorSession?.user?._id;

    const agentId = new URLSearchParams(location.search).get('agent');
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const chatEndRef = useRef(null);

    // Join room when connected
    useEffect(() => {
        if (!vendorId || !agentId) return;

        socket.emit('joinRoom', { vendorId, agentId });
    }, [vendorId, agentId]);

    // fetch Messages
    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const res = await axios.get(
                    `${import.meta.env.VITE_API_BASE_URL}/api/vendor/messages`,
                    { params: { vendorId, agentId } }
                );
                const formatted = res.data.map((msg) => ({
                    sender: msg.sender === vendorId ? 'vendor' : 'agent',
                    text: msg.text,
                    createdAt: msg.createdAt,
                }));
                setMessages(formatted);
            } catch (err) {
                console.error('Failed to fetch messages:', err);
            }
        };
        if (vendorId && agentId) {
            fetchMessages();
        }
    }, [vendorId, agentId]);

    // sending message
    const handleSend = async () => {
        if (!newMessage.trim()) return;
        const msgData = {
            sender: vendorId,
            receiver: agentId,
            text: newMessage
        };

        try {
            const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/vendor/message`, msgData);
            const formatted = {
                sender: 'vendor',
                text: res.data.text,
                createdAt: res.data.createdAt
            };
            setMessages((prev) => [...prev, formatted]);
            socket.emit('sendMessage', {
                ...msgData,
                text: res.data.text,
                createdAt: res.data.createdAt
            });
            setNewMessage('');
        } catch (err) {
            console.error('Message send error:', err);
        }
    };

    // Receive Message
    useEffect(() => {
        const handleReceiveMessage = (msg) => {
            if (msg.sender === agentId && msg.receiver === vendorId) {
                setMessages((prev) => [
                    ...prev,
                    {
                        sender: 'agent',
                        text: msg.text,
                        createdAt: msg.createdAt || new Date().toISOString()
                    }
                ]);
            }
        };
        socket.on('receiveMessage', handleReceiveMessage);
        return () => {
            socket.off('receiveMessage', handleReceiveMessage);
        };
    }, [vendorId, agentId]);

    // scroll to bottom
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleLogout = () => {
        localStorage.removeItem('vendor');
        navigate('/');
    };

    return (
        <div className="container-fluid vh-100 bg-dark text-white d-flex">
            <div className="col-md-3 bg-secondary p-4 d-flex flex-column justify-content-center">
                <div className="text-center">
                    <div
                        className="rounded-circle bg-light text-dark fw-bold d-flex align-items-center justify-content-center mx-auto mb-3"
                        style={{ width: 80, height: 80, fontSize: 24 }} >
                        A
                    </div>
                    <h5 className="mb-1">Agent</h5>
                    <button className="btn btn-sm btn-danger mt-3" onClick={handleLogout}>
                        Logout
                    </button>
                </div>
            </div>

            {/* Chat Area */}
            <div className="col-md-9 d-flex flex-column p-4">
                <div className="flex-grow-1 overflow-auto mb-3 border rounded p-3" style={{ backgroundColor: '#1e1e1e' }}>
                    {messages.map((msg, index) => (
                        <div
                            key={index}
                            className={`d-flex flex-column ${msg.sender === 'vendor' ? 'align-items-end' : 'align-items-start'} mb-3`}>
                            <div style={{ maxWidth: '80%' }}>
                                <div
                                    className={`p-2 rounded ${msg.sender === 'vendor' ? 'bg-info text-dark' : 'bg-light text-dark'}`}
                                    style={{ wordBreak: 'break-word' }}
                                >
                                    {msg.text}
                                </div>
                                <small className="small mt-1 text-end">
                                    {new Date(msg.createdAt).toLocaleTimeString([], {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        hour12: true,
                                    })}
                                </small>
                            </div>
                        </div>
                    ))}
                    <div ref={chatEndRef} />
                </div>

                {/* Input */}
                <div className="d-flex">
                    <input
                        type="text"
                        className="form-control me-2"
                        placeholder="Type your message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    />
                    <button className="btn btn-info fw-bold" onClick={handleSend}>
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VendorChat;
