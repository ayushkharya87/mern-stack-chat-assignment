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
            <div className="col-12 col-md-6 mb-4" key={vendor._id}>
              <div className="card shadow border-0 h-100">
                <div className="card-body">
                  {/* Header */}
                  <div className="d-flex align-items-center mb-3">
                    <div className="me-3">
                      <i className="fas fa-store fa-2x text-primary"></i>
                    </div>
                    <div>
                      <h5 className="mb-0 fw-bold">{vendor.shopName}</h5>
                      <small className="text-muted">{vendor.shopCategory}</small>
                    </div>
                  </div>

                  {/* Vendor Info - Responsive Stack */}
                  <div className="row">
                    <div className="col-12 col-sm-6 mb-2">
                      <p className="mb-1"><i className="fas fa-user me-1 text-secondary"></i>{vendor.name}</p>
                      <p className="mb-1"><i className="fas fa-envelope me-1 text-secondary"></i>{vendor.email}</p>
                      <p className="mb-1"><i className="fas fa-phone me-1 text-secondary"></i>{vendor.phone}</p>
                      <p className="mb-1"><i className="fas fa-city me-1 text-secondary"></i>{vendor.city}, {vendor.state}</p>
                    </div>

                    <div className="col-12 col-sm-6 mb-2">
                      <p className="mb-1"><i className="fas fa-map-marker-alt me-1 text-secondary"></i>{vendor.address}</p>
                      <p className="mb-1"><i className="fas fa-globe me-1 text-secondary"></i>{vendor.country}</p>
                      <p className="mb-1"><i className="fas fa-receipt me-1 text-secondary"></i>GST: {vendor.gstNumber}</p>
                      {vendor.businessLicenseNo && (
                        <p className="mb-1"><i className="fas fa-id-card me-1 text-secondary"></i>Lic: {vendor.businessLicenseNo}</p>
                      )}
                    </div>
                  </div>

                  {/* Chat Button */}
                  <div className="text-end mt-3">
                    <button
                      className="btn btn-sm btn-outline-primary"
                      onClick={() =>
                        navigate(`/agent/chat?vendor=${vendor._id}`, {
                          state: {
                            vendorName: vendor.name,
                            vendorEmail: vendor.email,
                          },
                        })
                      }
                    >
                      <i className="fas fa-comments me-1"></i>Chat
                    </button>
                  </div>
                </div>
              </div>
            </div>

          ))}
        </div>
      </div>
    </div>
  );
}
