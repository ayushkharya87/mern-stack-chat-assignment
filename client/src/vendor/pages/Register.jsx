import axios from 'axios';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/vendor/register`;

export default function Register() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        shopName: '',
        shopCategory: '',
        address: '',
        city: '',
        state: '',
        country: '',
        businessLicenseNo: '',
        gstNumber: ''
    });

    const [step, setStep] = useState(1);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const categories = [
        'Grocery',
        'Restaurant',
        'Pharmacy',
        'Electronics',
        'Clothing',
        'Beauty & Wellness',
        'Bakery',
        'Stationery',
        'Automobile',
        'Home Decor',
        'Others'
    ];


    const validateStep1 = () => {
        const { name, email, phone, password, confirmPassword } = formData;
        if (!name || !email || !phone || !password || !confirmPassword) {
            setError('All fields are required');
            return false;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setError('Invalid email format');
            return false;
        }
        if (!/^\d{10}$/.test(phone)) {
            setError('Phone number must be 10 digits');
            return false;
        }
        if (password.length < 6) {
            setError('Password must be at least 6 characters long');
            return false;
        }
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return false;
        }
        setError('');
        return true;
    };

    const validateStep2 = () => {
        const {
            shopName, shopCategory, address, city, state,
            country, gstNumber
        } = formData;

        if (!shopName || !shopCategory || !address || !city || !state || !country || !gstNumber) {
            setError('All fields are required');
            return false;
        }

        setError('');
        return true;
    };

    const handleNext = () => {
        if (step === 1 && validateStep1()) {
            setStep(2);
        }
    };

    const handleBack = () => {
        if (step === 2) setStep(1);
    };

    const handleRegister = async (e) => {
        e.preventDefault();

        if (!validateStep2()) return;

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

    const renderInput = (name, type, label) => (
        <div className="mb-3" key={name}>
            <label htmlFor={name} className="form-label">
                {label} <span className="text-danger">*</span>
            </label>
            <input
                id={name}
                type={type}
                name={name}
                className="form-control"
                placeholder={label}
                value={formData[name]}
                onChange={handleChange}
                required
            />
        </div>
    );

    const renderTextArea = (name, label) => (
        <div className="mb-3" key={name}>
            <label htmlFor={name} className="form-label">
                {label} <span className="text-danger">*</span>
            </label>
            <textarea
                id={name}
                name={name}
                className="form-control"
                placeholder={label}
                rows="3"
                value={formData[name]}
                onChange={handleChange}
                required
            />
        </div>
    );

    return (
        <div className="d-flex flex-column justify-content-center align-items-center min-vh-100 text-white bg-black">
            <div className="col-md-8 col-11 bg-dark p-4 my-3 rounded shadow">
                <h2 className="text-center mb-4">Vendor Registration</h2>

                {error && <div className="alert alert-danger">{error}</div>}

                <form onSubmit={handleRegister}>
                    {step === 1 && (
                        <>
                            {renderInput('name', 'text', 'Full Name')}
                            <div className="mb-3" key="email">
                                <label htmlFor="email" className="form-label">
                                    Email Address <span className="text-danger">*</span>
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    name="email"
                                    className="form-control"
                                    placeholder="Email Address"
                                    value={formData.email}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        setFormData({ ...formData, email: val });
                                        if (val && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
                                            setError('Please enter a valid email address');
                                        } else {
                                            setError('');
                                        }
                                    }}
                                    required
                                />
                            </div>

                            <div className="mb-3" key="phone">
                                <label htmlFor="phone" className="form-label">
                                    Phone Number <span className="text-danger">*</span>
                                </label>
                                <input
                                    id="phone"
                                    type="tel"
                                    name="phone"
                                    className="form-control"
                                    placeholder="Phone Number"
                                    value={formData.phone}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        if (/^\d*$/.test(val)) {
                                            setFormData({ ...formData, phone: val });
                                        }
                                    }}
                                    inputMode="numeric"
                                    pattern="\d*"
                                    maxLength="10"
                                    required
                                />
                            </div>
                            {renderInput('password', 'password', 'Password')}
                            {renderInput('confirmPassword', 'password', 'Confirm Password')}
                        </>
                    )}

                    {step === 2 && (
                        <>
                            <div className="row">
                                <div className="col-md-6">
                                    {renderInput('shopName', 'text', 'Shop Name')}
                                </div>
                                <div className="col-md-6">
                                    <div className="mb-3" key="shopCategory">
                                        <label htmlFor="shopCategory" className="form-label">
                                            Shop Category <span className="text-danger">*</span>
                                        </label>
                                        <select
                                            id="shopCategory"
                                            name="shopCategory"
                                            className="form-select"
                                            value={formData.shopCategory}
                                            onChange={handleChange}
                                            required
                                        >
                                            <option value="">-- Select Category --</option>
                                            {categories.map((category) => (
                                                <option key={category} value={category}>
                                                    {category}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {renderTextArea('address', 'Address')}

                            <div className="row">
                                <div className="col-md-4">
                                    {renderInput('city', 'text', 'City')}
                                </div>
                                <div className="col-md-4">
                                    {renderInput('state', 'text', 'State')}
                                </div>
                                <div className="col-md-4">
                                    {renderInput('country', 'text', 'Country')}
                                </div>
                            </div>

                            <div className="row">
                                <div className="col-md-6">
                                    {renderInput('gstNumber', 'text', 'GST Number')}
                                </div>
                                <div className="col-md-6">
                                    <div className="mb-3" key="businessLicenseNo">
                                        <label htmlFor="businessLicenseNo" className="form-label">
                                            Business License No.
                                        </label>
                                        <input
                                            id="businessLicenseNo"
                                            type="text"
                                            name="businessLicenseNo"
                                            className="form-control"
                                            placeholder="Business License No."
                                            value={formData.businessLicenseNo}
                                            onChange={handleChange}
                                        />
                                    </div>

                                </div>
                            </div>
                        </>
                    )}

                    <div className="d-flex justify-content-between mt-3">
                        {step === 2 && (
                            <button type="button" className="btn btn-secondary" onClick={handleBack}>
                                Back
                            </button>
                        )}
                        {step === 1 ? (
                            <button type="button" className="btn btn-info text-dark fw-bold ms-auto" onClick={handleNext}>
                                Next
                            </button>
                        ) : (
                            <button type="submit" className="btn btn-success text-white fw-bold ms-auto">
                                Register
                            </button>
                        )}
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
