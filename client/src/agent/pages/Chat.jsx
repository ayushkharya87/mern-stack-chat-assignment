import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { io } from 'socket.io-client';

const socket = io(import.meta.env.VITE_API_BASE_URL);

const AgentChat = () => {
  const location = useLocation();
  const { vendorName, vendorEmail } = location.state || {};
  const [messages, setMessages] = useState([]);
  const [vendor, setVendor] = useState({
    name: vendorName || '',
    email: vendorEmail || '',
  });
  const [newMessage, setNewMessage] = useState('');
  const [agentId, setAgentId] = useState(null);
  const chatEndRef = useRef(null);

  const searchParams = new URLSearchParams(location.search);
  const vendorId = searchParams.get('vendor');

  useEffect(() => {
    const fetchAgent = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/agent/default`);
        setAgentId(res.data._id);

        // Join socket room
        socket.emit('joinRoom', { vendorId, agentId: res.data._id });
      } catch (err) {
        console.error('Failed to fetch default agent:', err);
      }
    };

    fetchAgent();
  }, [vendorId]);

  // fetch Messages
  useEffect(() => {
    const fetchMessages = async () => {
      if (!vendorId || !agentId) return;
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/agent/messages`, {
          params: { vendorId, agentId },
        });
        setMessages(res.data);
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    fetchMessages();
  }, [vendorId, agentId]);

  // Send message
  const handleSend = async () => {
    if (!newMessage.trim() || !vendorId || !agentId) return;
    const message = {
      sender: agentId,
      receiver: vendorId,
      senderModel: 'Agent',
      receiverModel: 'Vendor',
      text: newMessage,
    };
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/agent/message`, message);
      setNewMessage('');
      socket.emit('sendMessage', res.data);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  // receive Message
  useEffect(() => {
    socket.on('receiveMessage', (msg) => {
      const inRoom =
        (msg.sender === vendorId && msg.receiver === agentId) ||
        (msg.sender === agentId && msg.receiver === vendorId);

      if (inRoom) {
        setMessages((prev) => [...prev, msg]);
      }
    });
    return () => {
      socket.off('receiveMessage');
    };
  }, [vendorId, agentId]);

  // Scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="container-fluid vh-100 bg-dark text-white d-flex">
      <div className="col-md-3 bg-secondary p-4 d-flex flex-column justify-content-center">
        <div className="text-center">
          <div
            className="rounded-circle bg-light text-dark fw-bold d-flex align-items-center justify-content-center mx-auto mb-3"
            style={{ width: 80, height: 80, fontSize: 24 }}
          >
            {vendor.name?.charAt(0) || 'V'}
          </div>
          <h5 className="mb-1">Vendor {vendor.name || 'Loading...'}</h5>
          <p className="mb-0 small">{vendor.email || 'Loading email...'}</p>
        </div>
      </div>

      {/* Chat Area */}
      <div className="col-md-9 d-flex flex-column p-4">
        <div className="flex-grow-1 overflow-auto mb-3 border rounded p-3" style={{ backgroundColor: '#1e1e1e' }}>
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`d-flex w-100 flex-column ${msg.senderModel === 'Agent' ? 'align-items-end' : 'align-items-start'} mb-3`}
            >
              <div
                className={`p-2 rounded ${msg.senderModel === 'Agent' ? 'bg-info text-dark' : 'bg-light text-dark'}`}
                style={{ maxWidth: '80%', wordBreak: 'break-word' }}
              >
                {msg.text}
              </div>
              <small className="mt-1">
                {new Date(msg.createdAt).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: true,
                })}
              </small>
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

export default AgentChat;
