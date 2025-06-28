import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { io } from 'socket.io-client';

const socket = io(import.meta.env.VITE_API_BASE_URL);

const AgentChat = () => {
  
  const navigate = useNavigate();
  const location = useLocation();
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
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

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/agent/vendors`);
        setVendors(res.data);
      } catch (err) {
        console.error('Error fetching vendors:', err);
        setError('Failed to load vendors');
      } finally {
        setLoading(false);
      }
    };
    fetchVendors();
  }, []);

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

  const handleSelectVendor = (vendor) => {
    navigate(`?vendor=${vendor._id}`, {
      state: {
        vendorName: vendor.name,
        vendorEmail: vendor.email,
      },
    });
  };

  return (
    <div className="container-fluid vh-100 bg-dark text-white d-flex">
      <div className="col-md-3 bg-secondary p-3 overflow-auto d-md-block d-none">
        <div className='d-flex align-items-center gap-3 mb-3'>
          <button
            className="btn btn-light"
             onClick={() => navigate('/agent/dashboard')}
          >
            ← Back
          </button>
          <h5 className="text-white">Vendors</h5>
        </div>
        {loading ? (
          <p className="text-light">Loading...</p>
        ) : error ? (
          <p className="text-danger">{error}</p>
        ) : vendors.length === 0 ? (
          <p className="text-light">No vendors found</p>
        ) : (
          vendors.map((v, idx) => {
            const isActive = v._id === vendorId;
            return (
              <div
                key={idx}
                className={`d-flex align-items-center p-2 mb-2 rounded ${isActive ? 'bg-info text-dark' : 'bg-dark text-white'}`}
                style={{ cursor: 'pointer' }}
                onClick={() => handleSelectVendor(v)}
              >
                <div
                  className="rounded-circle bg-light text-dark fw-bold d-flex align-items-center justify-content-center me-2"
                  style={{ width: 40, height: 40, fontSize: 16 }}
                >
                  {v.name?.charAt(0) || 'V'}
                </div>
                <div>
                  <div className="fw-bold">{v.name}</div>
                  <small>{v.email}</small>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Chat Area */}
      <div className="col-md-9 col-12 d-flex flex-column p-md-4 py-md-3 py-2">
        {/* Chat Header */}
        <div className="d-flex align-items-center bg-secondary p-3 rounded mb-3">
          <button
            className="btn btn-light me-3 d-md-none"
             onClick={() => navigate('/agent/dashboard')}
          >
            ← Back
          </button>
          <div
            className="rounded-circle bg-light text-dark fw-bold d-flex align-items-center justify-content-center me-3"
            style={{ width: 50, height: 50, fontSize: 20 }}
          >
            {vendor.name?.charAt(0) || 'V'}
          </div>

          <div>
            <h6 className="mb-0">{vendor.name || 'Loading...'}</h6>
            <small>{vendor.email || 'Loading email...'}</small>
          </div>
        </div>

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
