import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
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
  User,
} from "lucide-react";
import { logoutUser } from "../redux/slices/authSlice";

const TMSLandingPage = () => {
  const [hoveredDropdown, setHoveredDropdown] = useState(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Logout error:", error);
      // Even if logout fails, redirect to login
      navigate("/login", { replace: true });
    }
  };

  const menuItems = [
    {
      id: "master-data",
      title: "Master Data Maintenance",
      icon: Database,
      items: [
        {
          title: "Transporter Maintenance",
          icon: List,
          description: "View all transporters",
        },
        // { title: 'Transporter Create', icon: Plus, description: 'Add new transporter' },
        // { title: 'Transporter Details/Update', icon: Edit, description: 'Update transporter info' },
        // { title: 'Transporter Bulk Upload', icon: Upload, description: 'Bulk upload transporters' },
        {
          title: "Vehicle Maintenance",
          icon: Car,
          description: "View all vehicles",
        },
        // { title: 'Vehicle Create', icon: Plus, description: 'Add new vehicle' },
        // { title: 'Vehicle Details/Update', icon: Edit, description: 'Update vehicle info' },
        // { title: 'Vehicle Bulk Upload', icon: Upload, description: 'Bulk upload vehicles' },
        {
          title: "Driver Maintenance",
          icon: Users,
          description: "View all drivers",
        },
        // { title: 'Driver Create', icon: Plus, description: 'Add new driver' },
        // { title: 'Driver Details/Update', icon: Edit, description: 'Update driver info' },
        // { title: 'Driver Bulk Upload', icon: Upload, description: 'Bulk upload drivers' },
        {
          title: "Consignor Maintenance",
          icon: Building2,
          description: "View all consignors",
        },
        // { title: 'Consignor Create', icon: Plus, description: 'Add new consignor' },
        // { title: 'Consignor Detail/Update', icon: Edit, description: 'Update consignor info' },
        {
          title: "Consignor WH Maintenance",
          icon: MapPin,
          description: "View warehouses",
        },
        // { title: 'Consignor WH Create', icon: Plus, description: 'Add new warehouse' },
        // { title: 'Consignor WH Detail/Update', icon: Edit, description: 'Update warehouse info' },
        // { title: 'Consignor WH Bulk Upload', icon: Upload, description: 'Bulk upload warehouses' }
      ],
    },
    {
      id: "my-approval",
      title: "My Approval",
      icon: CheckCircle,
      items: [
        {
          title: "Super Admin Approval List",
          icon: Shield,
          description: "Manage admin approvals",
        },
      ],
    },
    {
      id: "global-master",
      title: "Global Master Config",
      icon: Globe,
      items: [
        {
          title: "Consignor General Config Parameter Name",
          icon: Settings,
          description: "Config parameters",
        },
        {
          title: "Transporter Vehicle Configure Parameter Name",
          icon: Wrench,
          description: "Vehicle parameters",
        },
        {
          title: "Master - Vehicle Type for Indent",
          icon: Car,
          description: "Vehicle type management",
        },
        {
          title: "Document Name Master",
          icon: FileText,
          description: "Document management",
        },
        {
          title: "Doc Type Configuration",
          icon: Layers,
          description: "Document types",
        },
        {
          title: "Material Master Information",
          icon: Package,
          description: "Material database",
        },
        {
          title: "Approval Configuration",
          icon: CheckCircle,
          description: "Approval workflows",
        },
        {
          title: "General Config",
          icon: Settings,
          description: "General settings",
        },
        {
          title: "Message Master",
          icon: MessageSquare,
          description: "Message templates",
        },
        {
          title: "Payment Term Master",
          icon: CreditCard,
          description: "Payment terms",
        },
        {
          title: "Currency Master",
          icon: DollarSign,
          description: "Currency management",
        },
        {
          title: "Status Master",
          icon: Activity,
          description: "Status definitions",
        },
        {
          title: "Vehicle IMEI Mapping",
          icon: MapPin,
          description: "IMEI tracking",
        },
        {
          title: "Vehicle Type/Container Type/ULD Type Master",
          icon: Truck,
          description: "Type definitions",
        },
        {
          title: "Milestone Master",
          icon: Target,
          description: "Milestone management",
        },
        { title: "SLA Master", icon: Clock, description: "SLA definitions" },
        {
          title: "SLA to SLA Area Mapping",
          icon: Route,
          description: "Area mapping",
        },
        {
          title: "SLA & Measurement Method Mapping",
          icon: BarChart3,
          description: "Measurement methods",
        },
        {
          title: "Rate Type Mapping",
          icon: DollarSign,
          description: "Rate management",
        },
        {
          title: "Drop Down Maintenance",
          icon: List,
          description: "Dropdown options",
        },
      ],
    },
    {
      id: "consignor-config",
      title: "Consignor Config",
      icon: Building2,
      items: [
        {
          title: "Consignor General Config Master",
          icon: Settings,
          description: "General configuration",
        },
        {
          title: "E-bidding Config",
          icon: Target,
          description: "E-bidding settings",
        },
        {
          title: "Consignor Approval Hierarchy Configuration",
          icon: Layers,
          description: "Approval hierarchy",
        },
        {
          title: "Consignor Material Master Information",
          icon: Package,
          description: "Material information",
        },
        {
          title: "E-bidding Auction Slot",
          icon: Clock,
          description: "Auction slots",
        },
        {
          title: "Checklist Configuration",
          icon: CheckCircle,
          description: "Checklist setup",
        },
        {
          title: "Consignor Material State Config",
          icon: Activity,
          description: "Material states",
        },
        {
          title: "Changeable Field Info",
          icon: Edit,
          description: "Field configuration",
        },
        {
          title: "Milestone Invoice Requirement",
          icon: FileText,
          description: "Invoice requirements",
        },
      ],
    },
    {
      id: "transporter-config",
      title: "Transporter Config",
      icon: Truck,
      items: [
        {
          title: "Transporter Vehicle Configured Data",
          icon: Car,
          description: "Vehicle configuration data",
        },
      ],
    },
    {
      id: "user-maintenance",
      title: "User Maintenance",
      icon: Users,
      items: [
        {
          title: "Role and Auth Control - User Create/Access Maintenance",
          icon: UserCheck,
          description: "User access management",
        },
      ],
    },
  ];

  const handleMouseEnter = (menuId) => {
    setHoveredDropdown(menuId);
  };

  const handleMouseLeave = () => {
    setHoveredDropdown(null);
  };

  const handleMenuItemClick = (item) => {
    console.log("Menu item clicked:", item.title);

    try {
      // Close dropdown first
      setHoveredDropdown(null);

      if (item.title === "Transporter Maintenance") {
        console.log("Navigating to /transporters");
        // TEMPORARILY DISABLED: Skip authentication check for development
        // if (user) {
        navigate("/transporters");
        // } else {
        //   // Redirect to login if not authenticated
        //   navigate('/login', { state: { from: '/transporters' } });
        // }
      }
      // Add more navigation handlers for other menu items as needed
    } catch (error) {
      console.error("Navigation error:", error);
    }
  };

  const Card = ({ children, className = "", onClick, ...props }) => (
    <div
      className={`bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-background via-slate-50 to-blue-50">
      {/* Combined Header & Navigation Section */}
      <nav className="bg-gradient-to-r from-tab-background via-slate-900 to-blue-900 shadow-2xl sticky top-0 z-50 backdrop-blur-sm">
        {/* Top Row - Logo and User Info */}
        {/* <div className="border-b border-slate-700/50"> */}
        <div className="">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-14">
              {/* Compact Logo Section */}
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-br from-primary-accent to-blue-600 p-2 rounded-lg shadow-md transform hover:scale-110 transition-all duration-300">
                  <Home className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                    TMS Portal
                  </h1>
                  <p className="text-xs text-black font-semibold hidden lg:block leading-none">
                    Transportation Management System
                  </p>
                </div>
              </div>

              {/* Compact User Profile Section */}
              <div className="flex items-center space-x-3">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-semibold text-white leading-tight">
                    {user?.user_full_name || "User"}
                  </p>
                  <p className="text-xs text-slate-400 leading-none">
                    {user?.user_type_id || "User"}
                  </p>
                </div>
                <div className="h-9 w-9 bg-gradient-to-br from-primary-accent to-blue-600 rounded-full flex items-center justify-center shadow-lg ring-2 ring-blue-400/30 hover:ring-blue-400/50 transition-all duration-300 transform hover:scale-110">
                  <User className="h-4 w-4 text-white" />
                </div>

                {/* Authentication Buttons */}
                {user ? (
                  <button
                    onClick={() => setShowLogoutModal(true)}
                    className="flex items-center space-x-1 px-2 py-2 rounded-md text-xs font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/20 transition-all duration-300 transform hover:scale-105 group"
                    title="Logout"
                  >
                    <LogOut className="h-4 w-4 group-hover:text-red-400 transition-colors duration-300" />
                    <span className="hidden md:block text-xs">Logout</span>
                  </button>
                ) : (
                  <button
                    onClick={() => navigate("/login")}
                    className="flex items-center space-x-1 px-3 py-2 rounded-md text-xs font-medium text-white bg-primary-accent hover:bg-blue-600 transition-all duration-300 transform hover:scale-105"
                    title="Login"
                  >
                    <User className="h-4 w-4" />
                    <span className="hidden md:block text-xs">Login</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Row - Navigation Menu */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center">
            {/* Optimized Menu Items with Compact Spacing */}
            <div className="hidden sm:flex flex-wrap justify-center gap-0.5 py-2 max-w-full overflow-x-auto">
              {menuItems.map((menu) => {
                const Icon = menu.icon;
                const isHovered = hoveredDropdown === menu.id;

                return (
                  <div
                    key={menu.id}
                    className="relative flex-shrink-0"
                    onMouseEnter={() => handleMouseEnter(menu.id)}
                    onMouseLeave={handleMouseLeave}
                  >
                    <button
                      className={`flex items-center space-x-1.5 px-2 py-2 md:px-3 md:py-2.5 lg:px-3 lg:py-2.5 rounded-lg text-xs font-medium transition-all duration-300 transform hover:scale-[1.02] ${
                        isHovered
                          ? "bg-gradient-to-r from-white to-blue-50 text-tab-active-text shadow-md scale-[1.02]"
                          : "text-white hover:bg-white/15 hover:backdrop-blur-sm"
                      }`}
                    >
                      <Icon
                        className={`h-4 w-4 transition-all duration-300 flex-shrink-0 ${
                          isHovered ? "text-primary-accent" : "text-white"
                        }`}
                      />
                      <span className="whitespace-nowrap hidden lg:inline text-xs font-medium">
                        {menu.title.length > 16
                          ? `${menu.title.substring(0, 13)}...`
                          : menu.title}
                      </span>
                      <ChevronDown
                        className={`h-3 w-3 transition-all duration-300 flex-shrink-0 ${
                          isHovered
                            ? "rotate-180 text-primary-accent"
                            : "text-white"
                        }`}
                      />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Compact Mobile Menu Button */}
            <div className="sm:hidden w-full flex justify-between items-center py-2">
              <span className="text-white text-sm font-medium">Menu</span>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-white p-2 hover:text-blue-200 hover:bg-white/10 rounded-md transition-all duration-200"
              >
                {mobileMenuOpen ? (
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                ) : (
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="sm:hidden bg-slate-800 border-t border-slate-700"
            >
              <div className="px-4 py-3 space-y-2">
                {menuItems.map((menu) => {
                  const Icon = menu.icon;
                  return (
                    <div
                      key={menu.id}
                      className="border-b border-slate-700 last:border-b-0 pb-2 last:pb-0"
                    >
                      <div className="flex items-center space-x-3 text-white font-medium py-2">
                        <Icon className="h-5 w-5 text-primary-accent" />
                        <span>{menu.title}</span>
                      </div>
                      {menu.items && (
                        <div className="ml-8 space-y-1">
                          {menu.items.slice(0, 3).map((item, index) => {
                            const ItemIcon = item.icon;
                            return (
                              <div
                                key={index}
                                className="flex items-center space-x-2 text-slate-300 text-sm py-1 cursor-pointer hover:text-white transition-colors duration-200"
                                onClick={() => handleMenuItemClick(item)}
                              >
                                <ItemIcon className="h-4 w-4" />
                                <span className="truncate">{item.title}</span>
                              </div>
                            );
                          })}
                          {menu.items.length > 3 && (
                            <div className="text-xs text-slate-400 py-1 ml-6">
                              +{menu.items.length - 3} more items
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Optimized Desktop Dropdown Panels */}
        <AnimatePresence>
          {hoveredDropdown && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="absolute top-full left-0 right-0 bg-gradient-to-br from-white/95 via-slate-50/95 to-blue-50/95 shadow-2xl border-t-2 border-primary-accent z-40 backdrop-blur-xl"
              onMouseEnter={() => setHoveredDropdown(hoveredDropdown)}
              onMouseLeave={handleMouseLeave}
            >
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {menuItems
                    .find((menu) => menu.id === hoveredDropdown)
                    ?.items.map((item, index) => {
                      const Icon = item.icon;
                      return (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.25, delay: index * 0.03 }}
                        >
                          <Card
                            className="p-4 cursor-pointer group hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1 border border-transparent hover:border-primary-accent/30 hover:bg-gradient-to-br hover:from-white hover:to-blue-50/50"
                            onClick={() => handleMenuItemClick(item)}
                          >
                            <div className="flex items-center space-x-3">
                              <div className="bg-gradient-to-br from-primary-accent/10 to-blue-100 p-2 rounded-lg group-hover:from-primary-accent/20 group-hover:to-blue-200 transition-all duration-200 flex-shrink-0">
                                <Icon className="h-4 w-4 text-primary-accent group-hover:text-blue-600 transition-colors duration-200" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="text-xs font-bold text-text-primary group-hover:text-primary-accent transition-colors duration-200 mb-1 leading-tight">
                                  {item.title.length > 25
                                    ? `${item.title.substring(0, 22)}...`
                                    : item.title}
                                </h3>
                                <p className="text-xs text-text-secondary group-hover:text-slate-600 transition-colors duration-200 leading-tight opacity-80">
                                  {item.description.length > 35
                                    ? `${item.description.substring(0, 32)}...`
                                    : item.description}
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
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <h1 className="text-5xl md:text-7xl font-extrabold mb-8 leading-tight">
                <span className="text-slate-800 drop-shadow-sm">
                  Welcome to the
                </span>
                <br />
                <span className="bg-gradient-to-r from-blue-600 via-primary-accent to-blue-700 bg-clip-text text-transparent drop-shadow-sm">
                  Transport Management System
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-text-secondary max-w-4xl mx-auto mb-12 leading-relaxed">
                Revolutionize your logistics operations with our
                <span className="font-semibold text-primary-accent">
                  {" "}
                  AI-powered
                </span>{" "}
                platform designed for
                <span className="font-semibold text-primary-accent">
                  {" "}
                  modern enterprises
                </span>
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

              {/* Demo Credentials Info */}
              {!user && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                  className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 max-w-lg mx-auto mb-12"
                >
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-blue-800 mb-2">
                      Demo Access
                    </h3>
                    <p className="text-blue-600 text-sm mb-3">
                      Login to access all features including Transporter
                      Maintenance
                    </p>
                    <div className="bg-white rounded-lg p-3 text-sm">
                      <div className="font-medium text-gray-700">
                        Test Credentials:
                      </div>
                      <div className="text-gray-600">
                        <span className="font-mono bg-gray-100 px-2 py-1 rounded mr-2">
                          test1
                        </span>
                        /
                        <span className="font-mono bg-gray-100 px-2 py-1 rounded ml-2">
                          test456
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>

            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-20"
            >
              {[
                {
                  icon: Truck,
                  count: "1,250+",
                  label: "Active Vehicles",
                  color: "from-blue-500 to-primary-accent",
                },
                {
                  icon: Users,
                  count: "850+",
                  label: "Transporters",
                  color: "from-green-500 to-emerald-600",
                },
                {
                  icon: Building2,
                  count: "420+",
                  label: "Consignors",
                  color: "from-purple-500 to-indigo-600",
                },
                {
                  icon: Package,
                  count: "99.8%",
                  label: "Delivery Success",
                  color: "from-orange-500 to-red-500",
                },
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
                      <div
                        className={`bg-gradient-to-br ${stat.color} w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110`}
                      >
                        <Icon className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="text-3xl font-bold bg-gradient-to-r from-text-primary to-slate-600 bg-clip-text text-transparent mb-2">
                        {stat.count}
                      </h3>
                      <p className="text-text-secondary font-medium">
                        {stat.label}
                      </p>
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
        transition={{ delay: 1, duration: 0.5, ease: "easeOut" }}
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
                  <h3 className="text-xl font-bold text-gray-900">
                    Confirm Logout
                  </h3>
                  <p className="text-gray-600 mt-1">
                    Are you sure you want to sign out?
                  </p>
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
