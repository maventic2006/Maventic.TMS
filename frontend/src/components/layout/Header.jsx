import React from 'react';
import { LogOut, Building2, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Button } from '../ui/Button';

const Header = ({ onLogout }) => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      // Default logout behavior
      localStorage.removeItem('token');
      navigate('/login');
    }
  };

  return (
    <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white shadow-lg border-b border-gray-700">
      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-4">
        <div className="flex items-center justify-between relative">
          {/* Left - Company Logo */}
          <div className="flex items-center">
            <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/20">
              <Building2 className="h-6 w-6 text-orange-400" />
              <span className="text-sm font-semibold text-gray-200 hidden sm:inline">
                Maventic
              </span>
            </div>
          </div>

          {/* Center - Project Name */}
          <div className="absolute left-1/2 transform -translate-x-1/2">
            <h1 className="text-sm sm:text-lg md:text-xl lg:text-2xl font-bold text-white font-poppins tracking-wide whitespace-nowrap">
              <span className="hidden sm:inline">Transport Management System</span>
              <span className="sm:hidden">TMS</span>
            </h1>
          </div>

          {/* Right - User Info and Logout Button */}
          <div className="flex items-center space-x-3">
            {isAuthenticated && user && (
              <div className="flex items-center space-x-3 hover:bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2 hover:border border-white/20">
                <div className="flex items-center space-x-2">
                  <div className="h-8 w-8 bg-orange-500 rounded-lg flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <div className="hidden md:block">
                    <div className="text-xs font-semibold text-gray-200">
                      ID: {user.user_id || user.id || 'N/A'}
                    </div>
                    <div className="text-sm font-bold text-white truncate max-w-32">
                      {user.name || user.username || user.email || 'User'}
                    </div>
                  </div>
                  <div className="block md:hidden">
                    <div className="text-xs font-bold text-white">
                      {user.user_id || user.id || 'N/A'}
                    </div>
                  </div>
                </div>
              </div>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="h-12 w-12 rounded-xl hover:bg-red-500/20 hover:text-red-400 transition-all duration-200 text-gray-300"
              title="Logout"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;