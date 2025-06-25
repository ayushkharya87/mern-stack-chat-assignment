import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function AgentDashboard() {
  const navigate = useNavigate();
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // logout
  const handleLogout = () => {
    localStorage.removeItem('agent');
    navigate('/');
  };

  // fetch vendor
  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/agent/vendors`
        );
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

  if (loading) {
    return (
      <div className="container-fluid bg-dark text-white min-vh-100 d-flex justify-content-center align-items-center">
        <div>Loading vendors…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-fluid bg-dark text-white min-vh-100 d-flex justify-content-center align-items-center">
        <div className="alert alert-danger">{error}</div>
      </div>
    );
  }

  return (
    <div className="container-fluid bg-dark text-white min-vh-100 py-4">
      <div className="container">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>Vendors</h2>
          <button className="btn btn-sm btn-danger" onClick={handleLogout}>
            Logout
          </button>
        </div>

        <div className="row g-4">
          {vendors.map((vendor) => (
            <div className="col-md-4" key={vendor._id}>
              <div className="card text-dark">
                <div className="card-body">
                  <h5 className="card-title">{vendor.name}</h5>
                  <p className="card-text mb-1">
                    <strong>Email:</strong> {vendor.email}
                  </p>
                  <p className="card-text mb-1">
                    <strong>Phone:</strong> {vendor.phone}
                  </p>
                  <button
                    className="btn btn-primary"
                    onClick={() =>
                      navigate(`/agent/chat?vendor=${vendor._id}`, {
                        state: {
                          vendorName: vendor.name,
                          vendorEmail: vendor.email,
                        },
                      })
                    } >
                    Chat
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
