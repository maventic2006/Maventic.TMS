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
import { logoutUser } from "../../redux/slices/authSlice";

const TMSHeader = ({ theme }) => {
  const [activeDropdown, setActiveDropdown] = useState(null);
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
        {
          title: "Vehicle Maintenance",
          icon: Car,
          description: "View all vehicles",
        },
        {
          title: "Driver Maintenance",
          icon: Users,
          description: "View all drivers",
        },
        {
          title: "Consignor Maintenance",
          icon: Building2,
          description: "View all consignors",
        },
        {
          title: "Consignor WH Maintenance",
          icon: MapPin,
          description: "View warehouses",
        },
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

  const handleMenuClick = (menuId) => {
    // Toggle dropdown - close if already open, open if closed
    setActiveDropdown(activeDropdown === menuId ? null : menuId);
  };

  const handleMenuItemClick = (item) => {
    console.log("🖱️ Menu item clicked:", item.title);
    console.log("🧭 Navigation details:", {
      itemTitle: item.title,
      timestamp: new Date().toISOString(),
      currentPath: window.location.pathname
    });
    
    // Close dropdown after selecting an item
    setActiveDropdown(null);

    // Master Data Maintenance navigation
    if (item.title === "Transporter Maintenance") {
      console.log("➡️ Navigating to /transporters");
      navigate("/transporters");
    } else if (item.title === "Vehicle Maintenance") {
      console.log("➡️ Navigating to /vehicles");
      navigate("/vehicles");
    } else if (item.title === "Driver Maintenance") {
      console.log("➡️ Navigating to /drivers");
      navigate("/drivers");
    } else if (item.title === "Consignor Maintenance") {
      console.log("➡️ Navigating to /consignor");
      navigate("/consignor");
    } else if (item.title === "Consignor WH Maintenance") {
      console.log("➡️ Navigating to /warehouse");
      navigate("/warehouse");
    } 
    
    // My Approval navigation
    else if (item.title === "Super Admin Approval List") {
      console.log("➡️ Navigating to /approvals/super-admin");
      navigate("/approvals/super-admin");
    }
    
    // Global Master Config navigation - Enhanced with debugging
    else if (item.title === "Consignor General Config Parameter Name") {
      const targetPath = "/configuration/consignor-general-parameter";
      console.log("🔧 Global Master Config - Consignor General Config");
      console.log("➡️ Navigating to:", targetPath);
      navigate(targetPath);
      console.log("✅ Navigation command executed for:", targetPath);
    } else if (item.title === "Transporter Vehicle Configure Parameter Name") {
      const targetPath = "/configuration/transporter-vehicle-config";
      console.log("🔧 Global Master Config - Vehicle Configure");
      console.log("➡️ Navigating to:", targetPath);
      navigate(targetPath);
      console.log("✅ Navigation command executed for:", targetPath);
    } else if (item.title === "Master - Vehicle Type for Indent") {
      const targetPath = "/configuration/vehicle-type";
      console.log("🔧 Global Master Config - Vehicle Type for Indent");
      console.log("➡️ Navigating to:", targetPath);
      navigate(targetPath);
      console.log("✅ Navigation command executed for:", targetPath);
    } else if (item.title === "Document Name Master") {
      const targetPath = "/configuration/document-name";
      console.log("🔧 Global Master Config - Document Name Master");
      console.log("➡️ Navigating to:", targetPath);
      navigate(targetPath);
      console.log("✅ Navigation command executed for:", targetPath);
    } else if (item.title === "Doc Type Configuration") {
      const targetPath = "/configuration/document-type";
      console.log("🔧 Global Master Config - Doc Type Configuration");
      console.log("➡️ Navigating to:", targetPath);
      navigate(targetPath);
      console.log("✅ Navigation command executed for:", targetPath);
    } else if (item.title === "Material Master Information") {
      const targetPath = "/configuration/material-master";
      console.log("🔧 Global Master Config - Material Master Information");
      console.log("➡️ Navigating to:", targetPath);
      navigate(targetPath);
      console.log("✅ Navigation command executed for:", targetPath);
    } else if (item.title === "Approval Configuration") {
      const targetPath = "/configuration/approval-configuration";
      console.log("🔧 Global Master Config - Approval Configuration");
      console.log("➡️ Navigating to:", targetPath);
      navigate(targetPath);
      console.log("✅ Navigation command executed for:", targetPath);
    } else if (item.title === "General Config") {
      const targetPath = "/configuration/general-config";
      console.log("🔧 Global Master Config - General Config");
      console.log("➡️ Navigating to:", targetPath);
      navigate(targetPath);
      console.log("✅ Navigation command executed for:", targetPath);
    } else if (item.title === "Message Master") {
      const targetPath = "/configuration/message-master";
      console.log("🔧 Global Master Config - Message Master");
      console.log("➡️ Navigating to:", targetPath);
      navigate(targetPath);
      console.log("✅ Navigation command executed for:", targetPath);
    } else if (item.title === "Payment Term Master") {
      const targetPath = "/configuration/payment-term";
      console.log("🔧 Global Master Config - Payment Term Master");
      console.log("➡️ Navigating to:", targetPath);
      navigate(targetPath);
      console.log("✅ Navigation command executed for:", targetPath);
    } else if (item.title === "Currency Master") {
      const targetPath = "/configuration/currency-master";
      console.log("🔧 Global Master Config - Currency Master");
      console.log("➡️ Navigating to:", targetPath);
      navigate(targetPath);
      console.log("✅ Navigation command executed for:", targetPath);
    } else if (item.title === "Status Master") {
      const targetPath = "/configuration/status";
      console.log("🔧 Global Master Config - Status Master");
      console.log("➡️ Navigating to:", targetPath);
      navigate(targetPath);
      console.log("✅ Navigation command executed for:", targetPath);
    } else if (item.title === "Vehicle IMEI Mapping") {
      const targetPath = "/configuration/vehicle-imei-mapping";
      console.log("🔧 Global Master Config - Vehicle IMEI Mapping");
      console.log("➡️ Navigating to:", targetPath);
      navigate(targetPath);
      console.log("✅ Navigation command executed for:", targetPath);
    } else if (item.title === "Vehicle Type/Container Type/ULD Type Master") {
      const targetPath = "/configuration/vehicle-type";
      console.log("🔧 Global Master Config - Vehicle Type/Container Type/ULD Type Master");
      console.log("➡️ Navigating to:", targetPath);
      navigate(targetPath);
      console.log("✅ Navigation command executed for:", targetPath);
    } else if (item.title === "Milestone Master") {
      const targetPath = "/configuration/milestone";
      console.log("🔧 Global Master Config - Milestone Master");
      console.log("➡️ Navigating to:", targetPath);
      navigate(targetPath);
      console.log("✅ Navigation command executed for:", targetPath);
    } else if (item.title === "SLA Master") {
      const targetPath = "/configuration/sla-master";
      console.log("🔧 Global Master Config - SLA Master");
      console.log("➡️ Navigating to:", targetPath);
      navigate(targetPath);
      console.log("✅ Navigation command executed for:", targetPath);
    } else if (item.title === "SLA to SLA Area Mapping") {
      const targetPath = "/configuration/sla-area-mapping";
      console.log("🔧 Global Master Config - SLA to SLA Area Mapping");
      console.log("➡️ Navigating to:", targetPath);
      navigate(targetPath);
      console.log("✅ Navigation command executed for:", targetPath);
    } else if (item.title === "SLA & Measurement Method Mapping") {
      const targetPath = "/configuration/sla-measurement-method-mapping";
      console.log("🔧 Global Master Config - SLA & Measurement Method Mapping");
      console.log("➡️ Navigating to:", targetPath);
      navigate(targetPath);
      console.log("✅ Navigation command executed for:", targetPath);
    } else if (item.title === "Rate Type Mapping") {
      const targetPath = "/configuration/rate-type";
      console.log("🔧 Global Master Config - Rate Type Mapping");
      console.log("➡️ Navigating to:", targetPath);
      navigate(targetPath);
      console.log("✅ Navigation command executed for:", targetPath);
    } else {
      console.warn("⚠️ Unknown menu item clicked:", item.title);
      console.warn("❓ No navigation rule defined for this menu item");
    }
    
    // Log final state after navigation attempt
    setTimeout(() => {
      console.log("🔍 Post-navigation state:", {
        currentPath: window.location.pathname,
        timestamp: new Date().toISOString()
      });
    }, 100);
  };

  // Get theme colors or use defaults
  const headerBg = theme?.colors?.card?.background || "#FFFFFF";
  const textPrimary = theme?.colors?.text?.primary || "#0D1A33";
  const textSecondary = theme?.colors?.text?.secondary || "#4A5568";
  const accentColor = theme?.colors?.pagination?.active || "#3B82F6";
  const borderColor = theme?.colors?.card?.border || "#E5E7EB";

  return (
    <>
      {/* Glassmorphic Header */}
      <nav
        className="sticky top-0 z-50 transition-all duration-300 mb-0"
        style={{
          background: "#0D1A33",
          // background: "rgba(255, 255, 255, 0.36)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          // border: `1px solid ${borderColor}`,
          // borderTop: "none",
          // borderLeft: "none",
          // borderRight: "none",
          // borderBottomLeftRadius: "10px",
          // borderBottomRightRadius: "10px",
          // boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
        }}
      >
        {/* Top Row - Logo and User Info */}
        <div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-14">
              {/* Logo Section */}
              <div
                className="flex items-center space-x-3 cursor-pointer"
                onClick={() => navigate("/tms-portal")}
              >
                <div
                  className="p-2 rounded-lg shadow-sm transform hover:scale-110 transition-all duration-300"
                  style={{ backgroundColor: accentColor }}
                >
                  <Home className="h-5 w-5" style={{ color: "#FFFFFF" }} />
                </div>
                <div>
                  <h1
                    className="text-lg font-bold"
                    style={{ color: "#FFFFFF" }}
                  >
                    TMS Portal
                  </h1>
                  <p
                    className="text-xs font-semibold hidden lg:block leading-none"
                    style={{ color: "#FFFFFF" }}
                  >
                    Transportation Management System
                  </p>
                </div>
              </div>

              {/* User Profile Section */}
              <div className="flex items-center space-x-3">
                <div className="text-right hidden sm:block">
                  <p
                    className="text-sm font-semibold leading-tight"
                    style={{ color: "#FFFFFF" }}
                  >
                    {user?.user_full_name || "User"}
                  </p>
                  <p
                    className="text-xs leading-none"
                    style={{ color: "#FFFFFF" }}
                  >
                    {user?.user_type_id || "User"}
                  </p>
                </div>
                <div
                  className="h-9 w-9 rounded-full flex items-center justify-center shadow-md transition-all duration-300 transform hover:scale-110"
                  style={{
                    backgroundColor: accentColor,
                    border: `2px solid ${accentColor}40`,
                  }}
                >
                  <User className="h-4 w-4" style={{ color: "#FFFFFF" }} />
                </div>

                {/* Logout Button */}
                {user && (
                  <button
                    onClick={() => setShowLogoutModal(true)}
                    className="flex items-center space-x-1 px-2 py-2 rounded-md text-xs font-medium transition-all duration-300 transform hover:scale-105 group"
                    style={{ color: "#DC2626" }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor =
                        "rgba(220, 38, 38, 0.1)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = "transparent")
                    }
                    title="Logout"
                  >
                    <LogOut className="h-4 w-4 transition-colors duration-300" />
                    {/* <span className="hidden md:block text-xs">Logout</span> */}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Row - Navigation Menu */}
        <div className="max-w-7xl mx-auto px-0 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center px-0">
            {/* Desktop Menu */}
            <div className="hidden sm:flex flex-wrap justify-center gap-0.5 py-2 max-w-full overflow-x-auto">
              {menuItems.map((menu) => {
                const Icon = menu.icon;
                const isActive = activeDropdown === menu.id;

                return (
                  <div
                    key={menu.id}
                    className="relative flex-shrink-0"
                  >
                    <button
                      onClick={() => handleMenuClick(menu.id)}
                      className="flex items-center justify-center space-x-1.5 px-2 py-2 md:px-3 md:py-2.5 lg:px-4 lg:py-2.5 rounded-lg text-xs font-medium transition-all duration-300 transform hover:scale-[1.02] min-w-[140px] lg:min-w-[180px]"
                      style={{
                        backgroundColor: isActive ? headerBg : "transparent",
                        color: isActive ? textPrimary : "#FFFFFF",
                        boxShadow: isActive
                          ? "0 2px 6px rgba(0, 0, 0, 0.1)"
                          : "none",
                      }}
                    >
                      <Icon
                        className="h-4 w-4 transition-all duration-300 flex-shrink-0"
                        style={{ color: isActive ? accentColor : "#FFFFFF" }}
                      />
                      <span className="hidden lg:inline text-xs font-medium leading-tight text-center">
                        {menu.title}
                      </span>
                      <ChevronDown
                        className="h-3 w-3 transition-all duration-300 flex-shrink-0"
                        style={{
                          color: isActive ? accentColor : "#FFFFFF",
                          transform: isActive
                            ? "rotate(180deg)"
                            : "rotate(0deg)",
                        }}
                      />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Mobile Menu Button */}
            <div className="sm:hidden w-full flex justify-between items-center py-2 px-4">
              <span
                className="text-sm font-medium"
                style={{ color: "#FFFFFF" }}
              >
                Menu
              </span>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-md transition-all duration-200"
                style={{ color: "#FFFFFF" }}
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
              className="sm:hidden"
              style={{
                backgroundColor: headerBg,
                borderTop: `1px solid ${borderColor}`,
              }}
            >
              <div className="px-4 py-3 space-y-2 max-h-96 overflow-y-auto">
                {menuItems.map((menu) => {
                  const Icon = menu.icon;
                  return (
                    <div
                      key={menu.id}
                      className="pb-2 last:pb-0"
                      style={{ borderBottom: `1px solid ${borderColor}` }}
                    >
                      <div
                        className="flex items-center space-x-3 font-medium py-2"
                        style={{ color: textPrimary }}
                      >
                        <Icon
                          className="h-5 w-5"
                          style={{ color: accentColor }}
                        />
                        <span>{menu.title}</span>
                      </div>
                      {menu.items && (
                        <div className="ml-8 space-y-1">
                          {menu.items.slice(0, 3).map((item, index) => {
                            const ItemIcon = item.icon;
                            return (
                              <div
                                key={index}
                                className="flex items-center space-x-2 text-sm py-1 cursor-pointer transition-colors duration-200"
                                style={{ color: textSecondary }}
                                onClick={() => handleMenuItemClick(item)}
                              >
                                <ItemIcon className="h-4 w-4 flex-shrink-0" />
                                <span className="flex-1 leading-snug">
                                  {item.title}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Desktop Dropdown Panels */}
        <AnimatePresence>
          {activeDropdown && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="absolute top-full left-0 right-0 z-40"
              style={{
                backgroundColor: headerBg,
                backdropFilter: "blur(10px)",
                WebkitBackdropFilter: "blur(10px)",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                borderTop: `2px solid ${accentColor}`,
              }}
            >
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {menuItems
                    .find((menu) => menu.id === activeDropdown)
                    ?.items.map((item, index) => {
                      const Icon = item.icon;
                      return (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.25, delay: index * 0.03 }}
                          className="min-h-[70px]"
                        >
                          <div
                            onClick={() => handleMenuItemClick(item)}
                            className="flex items-start space-x-3 p-3 rounded-lg cursor-pointer transition-all duration-200 h-full"
                            style={{
                              backgroundColor: "transparent",
                              border: `1px solid ${borderColor}`,
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor =
                                theme?.colors?.table?.row?.hover || "#F9FAFB";
                              e.currentTarget.style.borderColor = accentColor;
                              e.currentTarget.style.transform =
                                "translateY(-2px)";
                              e.currentTarget.style.boxShadow =
                                "0 4px 12px rgba(0, 0, 0, 0.1)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor =
                                "transparent";
                              e.currentTarget.style.borderColor = borderColor;
                              e.currentTarget.style.transform = "translateY(0)";
                              e.currentTarget.style.boxShadow = "none";
                            }}
                          >
                            <Icon
                              className="h-5 w-5 flex-shrink-0"
                              style={{ color: accentColor }}
                            />
                            <div className="flex-1 min-w-0">
                              <h4
                                className="text-sm font-semibold leading-tight mb-1"
                                style={{ color: textPrimary }}
                              >
                                {item.title}
                              </h4>
                              <p
                                className="text-xs leading-snug"
                                style={{ color: textSecondary }}
                              >
                                {item.description}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {showLogoutModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
            onClick={() => setShowLogoutModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="rounded-xl p-6 max-w-sm w-full shadow-xl"
              style={{ backgroundColor: headerBg }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3
                className="text-lg font-bold mb-2"
                style={{ color: textPrimary }}
              >
                Confirm Logout
              </h3>
              <p className="text-sm mb-6" style={{ color: textSecondary }}>
                Are you sure you want to logout from TMS Portal?
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                  style={{
                    backgroundColor: "transparent",
                    color: textPrimary,
                    border: `1px solid ${borderColor}`,
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                  style={{
                    backgroundColor: "#DC2626",
                    color: "#FFFFFF",
                  }}
                >
                  Logout
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default TMSHeader;
