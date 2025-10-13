import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Truck,
  Users,
  Settings,
  Building2,
  Car,
  UserCheck,
  FileText,
  Database,
  Shield,
  MapPin,
  Package,
  Clock,
  CheckCircle,
  Edit,
  Upload,
  List,
  Plus,
  Eye,
  Wrench,
  Globe,
  MessageSquare,
  CreditCard,
  DollarSign,
  Activity,
  Route,
  Target,
  BarChart3,
  Layers,
  ChevronDown,
  Home,
  LogOut,
  User
} from 'lucide-react';
import { logoutUser } from '../redux/slices/authSlice';

const TMSLandingPage = () => {
  const [hoveredDropdown, setHoveredDropdown] = useState(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
      // Even if logout fails, redirect to login
      navigate('/login', { replace: true });
    }
  };

  const menuItems = [
    {
      id: 'master-data',
      title: 'Master Data Maintenance',
      icon: Database,
      items: [
        { title: 'Transporter List', icon: List, description: 'View all transporters' },
        { title: 'Transporter Create', icon: Plus, description: 'Add new transporter' },
        { title: 'Transporter Details/Update', icon: Edit, description: 'Update transporter info' },
        { title: 'Transporter Bulk Upload', icon: Upload, description: 'Bulk upload transporters' },
        { title: 'Vehicle List', icon: Car, description: 'View all vehicles' },
        { title: 'Vehicle Create', icon: Plus, description: 'Add new vehicle' },
        { title: 'Vehicle Details/Update', icon: Edit, description: 'Update vehicle info' },
        { title: 'Vehicle Bulk Upload', icon: Upload, description: 'Bulk upload vehicles' },
        { title: 'Driver List', icon: Users, description: 'View all drivers' },
        { title: 'Driver Create', icon: Plus, description: 'Add new driver' },
        { title: 'Driver Details/Update', icon: Edit, description: 'Update driver info' },
        { title: 'Driver Bulk Upload', icon: Upload, description: 'Bulk upload drivers' },
        { title: 'Consignor List', icon: Building2, description: 'View all consignors' },
        { title: 'Consignor Create', icon: Plus, description: 'Add new consignor' },
        { title: 'Consignor Detail/Update', icon: Edit, description: 'Update consignor info' },
        { title: 'Consignor WH List', icon: MapPin, description: 'View warehouses' },
        { title: 'Consignor WH Create', icon: Plus, description: 'Add new warehouse' },
        { title: 'Consignor WH Detail/Update', icon: Edit, description: 'Update warehouse info' },
        { title: 'Consignor WH Bulk Upload', icon: Upload, description: 'Bulk upload warehouses' }
      ]
    },
    {
      id: 'my-approval',
      title: 'My Approval',
      icon: CheckCircle,
      items: [
        { title: 'Super Admin Approval List', icon: Shield, description: 'Manage admin approvals' }
      ]
    },
    {
      id: 'global-master',
      title: 'Global Master Config',
      icon: Globe,
      items: [
        { title: 'Consignor General Config Parameter Name', icon: Settings, description: 'Config parameters' },
        { title: 'Transporter Vehicle Configure Parameter Name', icon: Wrench, description: 'Vehicle parameters' },
        { title: 'Master - Vehicle Type for Indent', icon: Car, description: 'Vehicle type management' },
        { title: 'Document Name Master', icon: FileText, description: 'Document management' },
        { title: 'Doc Type Configuration', icon: Layers, description: 'Document types' },
        { title: 'Material Master Information', icon: Package, description: 'Material database' },
        { title: 'Approval Configuration', icon: CheckCircle, description: 'Approval workflows' },
        { title: 'General Config', icon: Settings, description: 'General settings' },
        { title: 'Message Master', icon: MessageSquare, description: 'Message templates' },
        { title: 'Payment Term Master', icon: CreditCard, description: 'Payment terms' },
        { title: 'Currency Master', icon: DollarSign, description: 'Currency management' },
        { title: 'Status Master', icon: Activity, description: 'Status definitions' },
        { title: 'Vehicle IMEI Mapping', icon: MapPin, description: 'IMEI tracking' },
        { title: 'Vehicle Type/Container Type/ULD Type Master', icon: Truck, description: 'Type definitions' },
        { title: 'Milestone Master', icon: Target, description: 'Milestone management' },
        { title: 'SLA Master', icon: Clock, description: 'SLA definitions' },
        { title: 'SLA to SLA Area Mapping', icon: Route, description: 'Area mapping' },
        { title: 'SLA & Measurement Method Mapping', icon: BarChart3, description: 'Measurement methods' },
        { title: 'Rate Type Mapping', icon: DollarSign, description: 'Rate management' },
        { title: 'Drop Down Maintenance', icon: List, description: 'Dropdown options' }
      ]
    },
    {
      id: 'consignor-config',
      title: 'Consignor Config',
      icon: Building2,
      items: [
        { title: 'Consignor General Config Master', icon: Settings, description: 'General configuration' },
        { title: 'E-bidding Config', icon: Target, description: 'E-bidding settings' },
        { title: 'Consignor Approval Hierarchy Configuration', icon: Layers, description: 'Approval hierarchy' },
        { title: 'Consignor Material Master Information', icon: Package, description: 'Material information' },
        { title: 'E-bidding Auction Slot', icon: Clock, description: 'Auction slots' },
        { title: 'Checklist Configuration', icon: CheckCircle, description: 'Checklist setup' },
        { title: 'Consignor Material State Config', icon: Activity, description: 'Material states' },
        { title: 'Changeable Field Info', icon: Edit, description: 'Field configuration' },
        { title: 'Milestone Invoice Requirement', icon: FileText, description: 'Invoice requirements' }
      ]
    },
    {
      id: 'transporter-config',
      title: 'Transporter Config',
      icon: Truck,
      items: [
        { title: 'Transporter Vehicle Configured Data', icon: Car, description: 'Vehicle configuration data' }
      ]
    },
    {
      id: 'user-maintenance',
      title: 'User Maintenance',
      icon: Users,
      items: [
        { title: 'Role and Auth Control - User Create/Access Maintenance', icon: UserCheck, description: 'User access management' }
      ]
    }
  ];

  const handleMouseEnter = (menuId) => {
    setHoveredDropdown(menuId);
  };

  const handleMouseLeave = () => {
    setHoveredDropdown(null);
  };

  const Card = ({ children, className = '' }) => (
    <div className={`bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] ${className}`}>
      {children}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-background via-slate-50 to-blue-50">
      {/* Navigation Bar */}
      <nav className="bg-gradient-to-r from-tab-background via-slate-900 to-blue-900 shadow-2xl sticky top-0 z-50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-primary-accent to-blue-600 p-3 rounded-xl shadow-lg transform hover:scale-110 transition-all duration-300">
                <Home className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">TMS Portal</h1>
            </div>

            {/* Menu Items */}
            <div className="hidden lg:flex space-x-2">
              {menuItems.map((menu) => {
                const Icon = menu.icon;
                const isHovered = hoveredDropdown === menu.id;
                
                return (
                  <div 
                    key={menu.id} 
                    className="relative"
                    onMouseEnter={() => handleMouseEnter(menu.id)}
                    onMouseLeave={handleMouseLeave}
                  >
                    <button
                      className={`flex items-center space-x-2 px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300 transform hover:scale-105 ${
                        isHovered
                          ? 'bg-gradient-to-r from-white to-blue-50 text-tab-active-text shadow-lg'
                          : 'text-tab-inactive-text hover:bg-white/20 hover:backdrop-blur-sm'
                      }`}
                    >
                      <Icon className={`h-5 w-5 transition-all duration-300 ${isHovered ? 'text-primary-accent' : ''}`} />
                      <span className="whitespace-nowrap">{menu.title}</span>
                      <ChevronDown 
                        className={`h-4 w-4 transition-all duration-300 ${
                          isHovered ? 'rotate-180 text-primary-accent' : ''
                        }`} 
                      />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* User Profile */}
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                  {user?.user_full_name || 'User'}
                </p>
                <p className="text-xs text-blue-200">
                  {user?.user_type_id || 'User'}
                </p>
              </div>
              <div className="h-10 w-10 bg-gradient-to-br from-primary-accent to-blue-600 rounded-full flex items-center justify-center shadow-lg ring-2 ring-white/20 hover:ring-white/40 transition-all duration-300 transform hover:scale-110">
                <User className="h-5 w-5 text-white" />
              </div>
              
              {/* Logout Button */}
              <button
                onClick={() => setShowLogoutModal(true)}
                className="flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium text-white hover:bg-red-500/20 hover:backdrop-blur-sm transition-all duration-300 transform hover:scale-105 group"
                title="Logout"
              >
                <LogOut className="h-5 w-5 group-hover:text-red-400 transition-colors duration-300" />
                <span className="hidden sm:block">Logout</span>
              </button>
            </div>
          </div>
        </div>

        {/* Dropdown Panels */}
        <AnimatePresence>
          {hoveredDropdown && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="absolute top-full left-0 right-0 bg-gradient-to-br from-white via-slate-50 to-blue-50 shadow-2xl border-t-4 border-primary-accent z-40 backdrop-blur-xl"
              onMouseEnter={() => setHoveredDropdown(hoveredDropdown)}
              onMouseLeave={handleMouseLeave}
            >
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {menuItems
                    .find(menu => menu.id === hoveredDropdown)
                    ?.items.map((item, index) => {
                      const Icon = item.icon;
                      return (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                        >
                          <Card className="p-6 cursor-pointer group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-transparent hover:border-primary-accent/20">
                            <div className="flex items-start space-x-4">
                              <div className="bg-gradient-to-br from-primary-accent/10 to-blue-100 p-3 rounded-xl group-hover:from-primary-accent/20 group-hover:to-blue-200 transition-all duration-300 group-hover:scale-110">
                                <Icon className="h-6 w-6 text-primary-accent group-hover:text-blue-600 transition-colors duration-300" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="text-sm font-bold text-text-primary group-hover:text-primary-accent transition-colors duration-300 mb-2">
                                  {item.title}
                                </h3>
                                <p className="text-xs text-text-secondary group-hover:text-slate-600 transition-colors duration-300 leading-relaxed">
                                  {item.description}
                                </p>
                              </div>
                            </div>
                          </Card>
                        </motion.div>
                      );
                    })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-primary-accent/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-purple-400/20 to-blue-400/20 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            >
              <h1 className="text-5xl md:text-7xl font-extrabold mb-8 leading-tight">
                <span className="bg-gradient-to-r from-text-primary via-slate-700 to-text-primary bg-clip-text text-transparent">
                  Welcome to the
                </span>
                <br />
                <span className="bg-gradient-to-r from-primary-accent via-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Transport Management System
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-text-secondary max-w-4xl mx-auto mb-12 leading-relaxed">
                Revolutionize your logistics operations with our 
                <span className="font-semibold text-primary-accent"> AI-powered</span> platform designed for 
                <span className="font-semibold text-primary-accent"> modern enterprises</span>
              </p>
              
              {/* Feature Pills */}
              <div className="flex flex-wrap justify-center gap-6 mb-16">
                <motion.div 
                  className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-full text-pill font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                  whileHover={{ y: -2 }}
                >
                  <CheckCircle className="inline h-5 w-5 mr-2" />
                  Real-time Tracking
                </motion.div>
                <motion.div 
                  className="bg-gradient-to-r from-blue-500 to-primary-accent text-white px-6 py-3 rounded-full text-pill font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                  whileHover={{ y: -2 }}
                >
                  <Shield className="inline h-5 w-5 mr-2" />
                  Secure Management
                </motion.div>
                <motion.div 
                  className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-6 py-3 rounded-full text-pill font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                  whileHover={{ y: -2 }}
                >
                  <BarChart3 className="inline h-5 w-5 mr-2" />
                  Advanced Analytics
                </motion.div>
              </div>
            </motion.div>

            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-20"
            >
              {[
                { icon: Truck, count: '1,250+', label: 'Active Vehicles', color: 'from-blue-500 to-primary-accent' },
                { icon: Users, count: '850+', label: 'Transporters', color: 'from-green-500 to-emerald-600' },
                { icon: Building2, count: '420+', label: 'Consignors', color: 'from-purple-500 to-indigo-600' },
                { icon: Package, count: '99.8%', label: 'Delivery Success', color: 'from-orange-500 to-red-500' }
              ].map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                  >
                    <Card className="p-8 text-center group hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 border border-transparent hover:border-primary-accent/20 bg-gradient-to-br from-white to-slate-50">
                      <div className={`bg-gradient-to-br ${stat.color} w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110`}>
                        <Icon className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="text-3xl font-bold bg-gradient-to-r from-text-primary to-slate-600 bg-clip-text text-transparent mb-2">
                        {stat.count}
                      </h3>
                      <p className="text-text-secondary font-medium">{stat.label}</p>
                    </Card>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Floating Action Button */}
      <motion.div
        className="fixed bottom-8 right-8 z-40"
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 1, duration: 0.5, ease: 'easeOut' }}
      >
        <button className="bg-gradient-to-r from-primary-accent to-blue-600 hover:from-blue-600 hover:to-purple-600 text-white p-4 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-110 hover:rotate-12">
          <MessageSquare className="h-6 w-6" />
        </button>
      </motion.div>

      {/* Background overlay for dropdown */}
      {hoveredDropdown && (
        <div className="fixed inset-0 z-30 pointer-events-none" />
      )}

      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {showLogoutModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl p-8 max-w-md mx-4"
            >
              <div className="flex items-center space-x-4 mb-6">
                <div className="bg-red-100 p-3 rounded-full">
                  <LogOut className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Confirm Logout</h3>
                  <p className="text-gray-600 mt-1">Are you sure you want to sign out?</p>
                </div>
              </div>
              
              <div className="flex space-x-4">
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogout}
                  className="flex-1 px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
                >
                  Logout
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TMSLandingPage;