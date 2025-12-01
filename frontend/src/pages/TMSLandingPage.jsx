import React, { useState, useEffect } from "react";
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
  const { user, isAuthenticated, isLoading } = useSelector(
    (state) => state.auth
  );

  // Authentication guard - redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      console.log(
        "TMSLandingPage: User not authenticated, redirecting to login"
      );
      navigate("/login", { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated (will redirect via useEffect)
  if (!isAuthenticated) {
    return null;
  }

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
    console.log("🖱️ Menu item clicked:", item.title);
    console.log("🧭 Navigation details:", {
      itemTitle: item.title,
      timestamp: new Date().toISOString(),
      currentPath: window.location.pathname,
    });

    // Special debug logging for PO001
    const currentUser = user;
    if (currentUser?.user_id === "PO001") {
      console.log("👤 PO001 Navigation Debug:", {
        userId: currentUser.user_id,
        menuItem: item.title,
        currentPath: window.location.pathname,
        timestamp: new Date().toISOString(),
      });
    }

    // Close dropdown after selecting an item
    setHoveredDropdown(null);

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
      console.log(
        "🔧 Global Master Config - Vehicle Type/Container Type/ULD Type Master"
      );
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
    } else if (item.title === "Drop Down Maintenance") {
      const targetPath = "/configuration/dropdown";
      console.log("🔧 Global Master Config - Drop Down Maintenance");
      console.log("➡️ Navigating to:", targetPath);
      navigate(targetPath);
      console.log("✅ Navigation command executed for:", targetPath);
    }

    // Consignor Configuration navigation - Enhanced with debugging
    else if (item.title === "Consignor General Config Master") {
      const targetPath =
        "/consignor-configuration/consignor_general_config_master";
      console.log("🏢 Consignor Config - General Config Master");
      console.log("➡️ Navigating to:", targetPath);
      navigate(targetPath);
      console.log("✅ Navigation command executed for:", targetPath);
    } else if (item.title === "E-bidding Config") {
      const targetPath = "/consignor-configuration/e_bidding_config";
      console.log("🏢 Consignor Config - E-bidding Config");
      console.log("➡️ Navigating to:", targetPath);
      navigate(targetPath);
      console.log("✅ Navigation command executed for:", targetPath);
    } else if (item.title === "Consignor Approval Hierarchy Configuration") {
      const targetPath =
        "/consignor-configuration/consignor_approval_hierarchy_configuration";
      console.log("🏢 Consignor Config - Approval Hierarchy Configuration");
      console.log("➡️ Navigating to:", targetPath);
      navigate(targetPath);
      console.log("✅ Navigation command executed for:", targetPath);
    } else if (item.title === "Consignor Material Master Information") {
      const targetPath =
        "/consignor-configuration/consignor_material_master_information";
      console.log("🏢 Consignor Config - Material Master Information");
      console.log("➡️ Navigating to:", targetPath);
      navigate(targetPath);
      console.log("✅ Navigation command executed for:", targetPath);
    } else if (item.title === "E-bidding Auction Slot") {
      const targetPath = "/consignor-configuration/ebidding_auction_slot";
      console.log("🏢 Consignor Config - E-bidding Auction Slot");
      console.log("➡️ Navigating to:", targetPath);
      navigate(targetPath);
      console.log("✅ Navigation command executed for:", targetPath);
    } else if (item.title === "Checklist Configuration") {
      const targetPath = "/consignor-configuration/checklist_configuration";
      console.log("🏢 Consignor Config - Checklist Configuration");
      console.log("➡️ Navigating to:", targetPath);
      navigate(targetPath);
      console.log("✅ Navigation command executed for:", targetPath);
    } else if (item.title === "Consignor Material State Config") {
      const targetPath =
        "/consignor-configuration/consignor_material_state_config";
      console.log("🏢 Consignor Config - Material State Config");
      console.log("➡️ Navigating to:", targetPath);
      navigate(targetPath);
      console.log("✅ Navigation command executed for:", targetPath);
    } else if (item.title === "Changeable Field Info") {
      const targetPath = "/consignor-configuration/changeable_field_info";
      console.log("🏢 Consignor Config - Changeable Field Info");
      console.log("➡️ Navigating to:", targetPath);
      navigate(targetPath);
      console.log("✅ Navigation command executed for:", targetPath);
    } else if (item.title === "Milestone Invoice Requirement") {
      const targetPath =
        "/consignor-configuration/milestone_invoice_requirement";
      console.log("🏢 Consignor Config - Milestone Invoice Requirement");
      console.log("➡️ Navigating to:", targetPath);
      navigate(targetPath);
      console.log("✅ Navigation command executed for:", targetPath);
    }

    // Transporter Config navigation
    else if (item.title === "Transporter Vehicle Configured Data") {
      const targetPath = "/transporter-configuration/vehicle-config";
      console.log("🚚 Transporter Config - Vehicle Configured Data");
      console.log("➡️ Navigating to:", targetPath);
      navigate(targetPath);
      console.log("✅ Navigation command executed for:", targetPath);
    }

    // User Maintenance navigation
    else if (
      item.title === "Role and Auth Control - User Create/Access Maintenance"
    ) {
      const targetPath = "/user-maintenance/role-auth-control";
      console.log("👥 User Maintenance - Role and Auth Control");
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
        timestamp: new Date().toISOString(),
      });
    }, 100);
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
    <div className="min-h-screen" style={{ backgroundColor: "#F5F7FA" }}>
      {/* Combined Header & Navigation Section with Glassmorphism */}
      <nav
        className="sticky top-0 z-50 transition-all duration-300"
        style={{
          background: "rgba(255, 255, 255, 0.3)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          border: "1px solid rgba(255, 255, 255, 0.2)",
          borderTop: "none",
          borderLeft: "none",
          borderRight: "none",
          borderBottomLeftRadius: "10px",
          borderBottomRightRadius: "10px",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
        }}
      >
        {/* Top Row - Logo and User Info */}
        <div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-14">
              {/* Compact Logo Section */}
              <div className="flex items-center space-x-3">
                <div
                  className="p-2 rounded-lg shadow-sm transform hover:scale-110 transition-all duration-300"
                  style={{ backgroundColor: "#3B82F6" }}
                >
                  <Home className="h-5 w-5" style={{ color: "#FFFFFF" }} />
                </div>
                <div>
                  <h1
                    className="text-lg font-bold"
                    style={{ color: "#0D1A33" }}
                  >
                    TMS Portal
                  </h1>
                  <p
                    className="text-xs font-semibold hidden lg:block leading-none"
                    style={{ color: "#4A5568" }}
                  >
                    Transportation Management System
                  </p>
                </div>
              </div>

              {/* Compact User Profile Section */}
              <div className="flex items-center space-x-3">
                <div className="text-right hidden sm:block">
                  <p
                    className="text-sm font-semibold leading-tight"
                    style={{ color: "#0D1A33" }}
                  >
                    {user?.user_full_name || "User"}
                  </p>
                  <p
                    className="text-xs leading-none"
                    style={{ color: "#4A5568" }}
                  >
                    {user?.user_type_id || "User"}
                  </p>
                </div>
                <div
                  className="h-9 w-9 rounded-full flex items-center justify-center shadow-md transition-all duration-300 transform hover:scale-110"
                  style={{
                    backgroundColor: "#3B82F6",
                    border: "2px solid rgba(59, 130, 246, 0.3)",
                  }}
                >
                  <User className="h-4 w-4" style={{ color: "#FFFFFF" }} />
                </div>

                {/* Authentication Buttons */}
                {user ? (
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
                    <span className="hidden md:block text-xs">Logout</span>
                  </button>
                ) : (
                  <button
                    onClick={() => navigate("/login")}
                    className="flex items-center space-x-1 px-3 py-2 rounded-md text-xs font-medium transition-all duration-300 transform hover:scale-105"
                    style={{
                      backgroundColor: "#3B82F6",
                      color: "#FFFFFF",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = "#2563EB")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = "#3B82F6")
                    }
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
        <div className="max-w-7xl mx-auto px-0 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center px-0">
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
                      className="flex items-center justify-center space-x-1.5 px-2 py-2 md:px-3 md:py-2.5 lg:px-4 lg:py-2.5 rounded-lg text-xs font-medium transition-all duration-300 transform hover:scale-[1.02] min-w-[140px] lg:min-w-[180px]"
                      style={{
                        backgroundColor: isHovered
                          ? "rgba(255, 255, 255, 0.9)"
                          : "transparent",
                        color: isHovered ? "#0D1A33" : "#0D1A33",
                        boxShadow: isHovered
                          ? "0 2px 6px rgba(0, 0, 0, 0.1)"
                          : "none",
                      }}
                      onMouseEnter={(e) => {
                        if (!isHovered) {
                          e.currentTarget.style.backgroundColor =
                            "rgba(255, 255, 255, 0.5)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isHovered) {
                          e.currentTarget.style.backgroundColor = "transparent";
                        }
                      }}
                    >
                      <Icon
                        className="h-4 w-4 transition-all duration-300 flex-shrink-0"
                        style={{ color: isHovered ? "#3B82F6" : "#0D1A33" }}
                      />
                      <span className="hidden lg:inline text-xs font-medium leading-tight text-center">
                        {menu.title}
                      </span>
                      <ChevronDown
                        className="h-3 w-3 transition-all duration-300 flex-shrink-0"
                        style={{
                          color: isHovered ? "#3B82F6" : "#0D1A33",
                          transform: isHovered
                            ? "rotate(180deg)"
                            : "rotate(0deg)",
                        }}
                      />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Compact Mobile Menu Button */}
            <div className="sm:hidden w-full flex justify-between items-center py-2">
              <span
                className="text-sm font-medium"
                style={{ color: "#0D1A33" }}
              >
                Menu
              </span>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-md transition-all duration-200"
                style={{ color: "#0D1A33" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor =
                    "rgba(255, 255, 255, 0.5)";
                  e.currentTarget.style.color = "#3B82F6";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.color = "#0D1A33";
                }}
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
                backgroundColor: "rgba(255, 255, 255, 0.95)",
                borderTop: "1px solid rgba(229, 231, 235, 0.5)",
              }}
            >
              <div className="px-4 py-3 space-y-2">
                {menuItems.map((menu) => {
                  const Icon = menu.icon;
                  return (
                    <div
                      key={menu.id}
                      className="pb-2 last:pb-0"
                      style={{
                        borderBottom: "1px solid rgba(229, 231, 235, 0.3)",
                      }}
                    >
                      <div
                        className="flex items-center space-x-3 font-medium py-2"
                        style={{ color: "#0D1A33" }}
                      >
                        <Icon
                          className="h-5 w-5"
                          style={{ color: "#3B82F6" }}
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
                                style={{ color: "#4A5568" }}
                                onMouseEnter={(e) =>
                                  (e.currentTarget.style.color = "#0D1A33")
                                }
                                onMouseLeave={(e) =>
                                  (e.currentTarget.style.color = "#4A5568")
                                }
                                onClick={() => handleMenuItemClick(item)}
                              >
                                <ItemIcon className="h-4 w-4 flex-shrink-0" />
                                <span className="flex-1 leading-snug">
                                  {item.title}
                                </span>
                              </div>
                            );
                          })}
                          {menu.items.length > 3 && (
                            <div
                              className="text-xs py-1 ml-6"
                              style={{ color: "#9CA3AF" }}
                            >
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
              className="absolute top-full left-0 right-0 z-40"
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.95)",
                backdropFilter: "blur(10px)",
                WebkitBackdropFilter: "blur(10px)",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                borderTop: "2px solid #3B82F6",
              }}
              onMouseEnter={() => setHoveredDropdown(hoveredDropdown)}
              onMouseLeave={handleMouseLeave}
            >
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
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
                          className="min-h-[70px]"
                        >
                          <Card
                            className="p-3 cursor-pointer group hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1 h-full"
                            style={{
                              border: "1px solid transparent",
                              backgroundColor: "#FFFFFF",
                              minHeight: "70px",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.borderColor =
                                "rgba(59, 130, 246, 0.3)";
                              e.currentTarget.style.backgroundColor =
                                "rgba(59, 130, 246, 0.02)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.borderColor = "transparent";
                              e.currentTarget.style.backgroundColor = "#FFFFFF";
                            }}
                            onClick={() => handleMenuItemClick(item)}
                          >
                            <div className="flex items-center space-x-2">
                              <div
                                className="p-1.5 rounded-lg transition-all duration-200 flex-shrink-0"
                                style={{
                                  backgroundColor: "rgba(59, 130, 246, 0.1)",
                                }}
                              >
                                <Icon
                                  className="h-4 w-4 transition-colors duration-200"
                                  style={{ color: "#3B82F6" }}
                                />
                              </div>
                              <div className="flex-1">
                                <h3
                                  className="text-xs font-bold transition-colors duration-200 mb-0.5 leading-tight"
                                  style={{ color: "#0D1A33" }}
                                >
                                  {item.title}
                                </h3>
                                <p
                                  className="text-xs transition-colors duration-200 leading-tight opacity-80"
                                  style={{ color: "#4A5568" }}
                                >
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
      <div
        className="relative overflow-hidden"
        style={{ backgroundColor: "#F5F7FA" }}
      >
        {/* Background Elements - Minimal */}
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="absolute -top-40 -right-40 w-80 h-80 rounded-full blur-3xl"
            style={{ backgroundColor: "rgba(59, 130, 246, 0.08)" }}
          ></div>
          <div
            className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full blur-3xl"
            style={{ backgroundColor: "rgba(59, 130, 246, 0.05)" }}
          ></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <h1
                className="text-3xl md:text-4xl font-extrabold mb-8 leading-tight"
                style={{ color: "#0D1A33" }}
              >
                Welcome to the
                <br />
                Transport Management System
              </h1>
              <p
                className="text-lg md:text-xl max-w-4xl mx-auto mb-12 leading-relaxed"
                style={{ color: "#4A5568" }}
              >
                Revolutionize your logistics operations with our
                <span className="font-semibold" style={{ color: "#3B82F6" }}>
                  {" "}
                  AI-powered
                </span>{" "}
                platform designed for
                <span className="font-semibold" style={{ color: "#3B82F6" }}>
                  {" "}
                  modern enterprises
                </span>
              </p>

              {/* Feature Pills */}
              <div className="flex flex-wrap justify-center gap-6 mb-16">
                <motion.div
                  className="px-6 py-3 rounded-full text-pill font-semibold transition-all duration-300"
                  style={{
                    backgroundColor: "#10B981",
                    color: "#FFFFFF",
                    boxShadow: "0 2px 6px rgba(0, 0, 0, 0.1)",
                  }}
                  whileHover={{
                    y: -2,
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                  }}
                >
                  <CheckCircle className="inline h-5 w-5 mr-2" />
                  Real-time Tracking
                </motion.div>
                <motion.div
                  className="px-6 py-3 rounded-full text-pill font-semibold transition-all duration-300"
                  style={{
                    backgroundColor: "#3B82F6",
                    color: "#FFFFFF",
                    boxShadow: "0 2px 6px rgba(0, 0, 0, 0.1)",
                  }}
                  whileHover={{
                    y: -2,
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                  }}
                >
                  <Shield className="inline h-5 w-5 mr-2" />
                  Secure Management
                </motion.div>
                <motion.div
                  className="px-6 py-3 rounded-full text-pill font-semibold transition-all duration-300"
                  style={{
                    backgroundColor: "#8B5CF6",
                    color: "#FFFFFF",
                    boxShadow: "0 2px 6px rgba(0, 0, 0, 0.1)",
                  }}
                  whileHover={{
                    y: -2,
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                  }}
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
                  className="rounded-xl p-6 max-w-lg mx-auto mb-12"
                  style={{
                    backgroundColor: "rgba(59, 130, 246, 0.05)",
                    border: "1px solid rgba(59, 130, 246, 0.2)",
                  }}
                >
                  <div className="text-center">
                    <h3
                      className="text-lg font-semibold mb-2"
                      style={{ color: "#3B82F6" }}
                    >
                      Demo Access
                    </h3>
                    <p className="text-sm mb-3" style={{ color: "#4A5568" }}>
                      Login to access all features including Transporter
                      Maintenance
                    </p>
                    <div
                      className="rounded-lg p-3 text-sm"
                      style={{ backgroundColor: "#FFFFFF" }}
                    >
                      <div className="font-medium" style={{ color: "#0D1A33" }}>
                        Test Credentials:
                      </div>
                      <div style={{ color: "#4A5568" }}>
                        <span
                          className="font-mono px-2 py-1 rounded mr-2"
                          style={{ backgroundColor: "#F5F7FA" }}
                        >
                          test1
                        </span>
                        /
                        <span
                          className="font-mono px-2 py-1 rounded ml-2"
                          style={{ backgroundColor: "#F5F7FA" }}
                        >
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
                  bgColor: "#3B82F6",
                },
                {
                  icon: Users,
                  count: "850+",
                  label: "Transporters",
                  bgColor: "#10B981",
                },
                {
                  icon: Building2,
                  count: "420+",
                  label: "Consignors",
                  bgColor: "#8B5CF6",
                },
                {
                  icon: Package,
                  count: "99.8%",
                  label: "Delivery Success",
                  bgColor: "#F59E0B",
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
                    <Card
                      className="p-8 text-center group transition-all duration-500 transform hover:-translate-y-3"
                      style={{
                        backgroundColor: "#FFFFFF",
                        border: "1px solid transparent",
                        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor =
                          "rgba(59, 130, 246, 0.2)";
                        e.currentTarget.style.boxShadow =
                          "0 8px 24px rgba(0, 0, 0, 0.12)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = "transparent";
                        e.currentTarget.style.boxShadow =
                          "0 2px 8px rgba(0, 0, 0, 0.08)";
                      }}
                    >
                      <div
                        className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 transition-all duration-300 group-hover:scale-110"
                        style={{
                          backgroundColor: stat.bgColor,
                          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                        }}
                      >
                        <Icon className="h-8 w-8 text-white" />
                      </div>
                      <h3
                        className="text-3xl font-bold mb-2"
                        style={{ color: "#0D1A33" }}
                      >
                        {stat.count}
                      </h3>
                      <p className="font-medium" style={{ color: "#4A5568" }}>
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
        <button
          className="text-white p-4 rounded-full transition-all duration-300 transform hover:scale-110 hover:rotate-12"
          style={{
            backgroundColor: "#3B82F6",
            boxShadow: "0 4px 16px rgba(59, 130, 246, 0.4)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#2563EB";
            e.currentTarget.style.boxShadow =
              "0 8px 24px rgba(59, 130, 246, 0.5)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#3B82F6";
            e.currentTarget.style.boxShadow =
              "0 4px 16px rgba(59, 130, 246, 0.4)";
          }}
        >
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
            className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm"
            style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="rounded-2xl p-8 max-w-md mx-4"
              style={{
                backgroundColor: "#FFFFFF",
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.15)",
              }}
            >
              <div className="flex items-center space-x-4 mb-6">
                <div
                  className="p-3 rounded-full"
                  style={{ backgroundColor: "rgba(220, 38, 38, 0.1)" }}
                >
                  <LogOut className="h-6 w-6" style={{ color: "#DC2626" }} />
                </div>
                <div>
                  <h3
                    className="text-xl font-bold"
                    style={{ color: "#0D1A33" }}
                  >
                    Confirm Logout
                  </h3>
                  <p className="mt-1" style={{ color: "#4A5568" }}>
                    Are you sure you want to sign out?
                  </p>
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className="flex-1 px-6 py-3 rounded-lg transition-colors font-medium"
                  style={{
                    backgroundColor: "#F5F7FA",
                    color: "#0D1A33",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#E5E7EB";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#F5F7FA";
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogout}
                  className="flex-1 px-6 py-3 rounded-lg transition-colors font-medium"
                  style={{
                    backgroundColor: "#DC2626",
                    color: "#FFFFFF",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#B91C1C";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#DC2626";
                  }}
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
