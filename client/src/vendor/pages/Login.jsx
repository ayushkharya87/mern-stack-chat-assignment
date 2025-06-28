import axios from 'axios';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/vendor/login`;

export default function VendorLogin() {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await axios.post(API_URL, credentials);
      const sessionData = { user: res.data, timestamp: Date.now() };
      localStorage.setItem('vendor', JSON.stringify(sessionData));
      const agentRes = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/agent/default`);
      const agentId = agentRes.data._id;
      navigate(`/vendor/chat?agent=${agentId}`);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className=" d-flex flex-column justify-content-center align-items-center min-vh-100 text-white bg-black">
      <div className="col-md-6 col-11 bg-dark p-4 rounded shadow">
        <h2 className="text-center mb-4">Vendor Login</h2>

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <input
              name="email"
              type="email"
              className="form-control"
              placeholder="Email"
              value={credentials.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-4">
            <input
              name="password"
              type="password"
              className="form-control"
              placeholder="Password"
              value={credentials.password}
              onChange={handleChange}
              required
            />
          </div>
          <div className="d-grid">
            <button type="submit" className="btn btn-info text-dark fw-bold">
              Login
            </button>
          </div>
        </form>

        <p className="mt-3 text-center">
          New here?{' '}
          <span
            className="text-info text-decoration-underline"
            role="button"
            onClick={() => navigate('/vendor')}
          >
            Register
          </span>
        </p>
      </div>
    </div>
  );
}
