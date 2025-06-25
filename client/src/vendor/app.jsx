import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import VendorChat from './pages/chat';

export default function VendorApp() {
  return (
    <Routes>
      <Route path="/" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/chat" element={<VendorChat />} />
    </Routes>
  );
}
