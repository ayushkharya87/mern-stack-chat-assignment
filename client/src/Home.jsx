import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();

  const vendorSession = localStorage.getItem('vendor');
  const agentSession = localStorage.getItem('agent');
  const userSession = vendorSession || agentSession;
  const user = userSession ? JSON.parse(userSession).user : null;
  const role = vendorSession ? 'Vendor' : agentSession ? 'Agent' : null;

  const handleGoToChat = async () => {
    if (role === 'Vendor') {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/agent/default`);
        const data = await res.json();
        const agentId = data._id;
        navigate(`/vendor/chat?agent=${agentId}`);
      } catch (error) {
        console.error('Failed to fetch agent ID:', error);
        alert('Unable to connect to chat. Please try again later.');
      }
    } else if (role === 'Agent') {
      navigate('/agent/dashboard');
    }
  };

  return (
    <div className=" d-flex flex-column justify-content-center align-items-center min-vh-100 text-white bg-black">
      <div className="text-center bg-dark p-5 rounded shadow col-md-8 col-lg-6">

        {user ? (
          <>
            <h2 className="text-success mb-3">
              Hello, {user.name || user.email}! 👋
            </h2>
            <p className="mb-4">
              Welcome back to your {role} panel.
            </p>
            <div className="d-grid gap-2">
              <button
                className="btn btn-success fw-bold"
                onClick={handleGoToChat}
              >
                Go to Chat
              </button>
            </div>
          </>
        ) : (
          <>
            <h1 className="mb-3">Welcome to the MERN Chat App</h1>
            <p className="mb-4">
              This is a simple real-time chat platform for vendors and agents. Choose your role to continue.
            </p>
            <div className="d-grid gap-3">
              <button
                className="btn btn-outline-info fw-bold"
                onClick={() => navigate('/vendor')}
              >
                Login as Vendor
              </button>
              <button
                className="btn btn-outline-light fw-bold"
                onClick={() => navigate('/agent')}
              >
                Login as Agent
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
