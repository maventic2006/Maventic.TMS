import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { transporterAPI } from '../utils/api';

const DevAuthHelper = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
  const navigate = useNavigate();

  const handleQuickLogin = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: 'admin',
          password: 'admin123'
        })
      });

      const data = await response.json();
      
      if (data.success) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setIsLoggedIn(true);
        alert('✅ Successfully logged in as admin!');
        navigate('/transporter-maintenance');
      } else {
        alert('❌ Login failed: ' + data.message);
      }
    } catch (error) {
      alert('❌ Login error: ' + error.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    alert('✅ Logged out successfully!');
  };

  const testAPI = async () => {
    try {
      const response = await transporterAPI.getTransporters();
      alert('✅ API Test Successful! Found ' + response.data.data.length + ' transporters');
    } catch (error) {
      alert('❌ API Test Failed: ' + error.message);
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 bg-white border border-gray-300 rounded-lg p-4 shadow-lg">
      <h3 className="text-sm font-bold text-gray-800 mb-2">🔧 Dev Auth Helper</h3>
      <div className="space-y-2">
        <div className="text-xs text-gray-600">
          Status: {isLoggedIn ? '✅ Logged In' : '❌ Not Logged In'}
        </div>
        
        {!isLoggedIn ? (
          <button
            onClick={handleQuickLogin}
            className="w-full bg-blue-500 text-white px-3 py-1 rounded text-xs hover:bg-blue-600"
          >
            Quick Login (admin)
          </button>
        ) : (
          <div className="space-y-1">
            <button
              onClick={testAPI}
              className="w-full bg-green-500 text-white px-3 py-1 rounded text-xs hover:bg-green-600"
            >
              Test API
            </button>
            <button
              onClick={handleLogout}
              className="w-full bg-red-500 text-white px-3 py-1 rounded text-xs hover:bg-red-600"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DevAuthHelper;