import axios from 'axios';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getValidSession } from '../../utils/getValidSession';

const API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/vendor/register`;

export default function Register() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: ''
    });

    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        try {
            const res = await axios.post(API_URL, formData);
            const sessionData = {
                user: res.data,
                timestamp: Date.now(),
            };
            localStorage.setItem('vendor', JSON.stringify(sessionData));
            const agentRes = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/agent/default`);
            const agentId = agentRes.data._id;
            navigate(`/vendor/chat?agent=${agentId}`);
        } catch (err) {
            console.error(err);
            const msg = err.response?.data?.message || 'Registration failed';
            setError(msg);
        }
    };

    return (
        <div className=" d-flex flex-column justify-content-center align-items-center min-vh-100 text-white bg-black">
            <div className="col-md-6 bg-dark p-4 rounded shadow">
                <h2 className="text-center mb-4">Vendor Registration</h2>

                {error && <div className="alert alert-danger">{error}</div>}

                <form onSubmit={handleRegister}>
                    <div className="mb-3">
                        <input
                            type="text"
                            name="name"
                            className="form-control"
                            placeholder="Full Name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <input
                            type="email"
                            name="email"
                            className="form-control"
                            placeholder="Email Address"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <input
                            type="tel"
                            name="phone"
                            className="form-control"
                            placeholder="Phone Number"
                            value={formData.phone}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <input
                            type="password"
                            name="password"
                            className="form-control"
                            placeholder="Password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <input
                            type="password"
                            name="confirmPassword"
                            className="form-control"
                            placeholder="Confirm Password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="d-grid">
                        <button type="submit" className="btn btn-info text-dark fw-bold">
                            Register
                        </button>
                    </div>
                    <p className="mt-3 text-center">
                        Already have an account?{' '}
                        <span
                            className="text-info text-decoration-underline"
                            role="button"
                            onClick={() => navigate('/vendor/login')}
                        >
                            Login
                        </span>
                    </p>
                </form>
            </div>
        </div>
    );
}
