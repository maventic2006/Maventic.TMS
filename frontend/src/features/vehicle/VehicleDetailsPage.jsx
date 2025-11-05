import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchVehicleById, clearError } from "../../redux/slices/vehicleSlice";
import {
  ArrowLeft,
  Edit,
  Save,
  X,
  Truck,
  Settings,
  Package,
  Building,
  Wrench,
  FileText,
  BarChart3,
  AlertTriangle,
  Eye,
} from "lucide-react";
import { getComponentTheme } from "../../utils/theme";
import { getPageTheme } from "../../theme.config";
import TMSHeader from "../../components/layout/TMSHeader";
import VehicleStatusPill from "../../components/vehicle/VehicleStatusPill";

// Import view tab components
import BasicInformationViewTab from "./components/BasicInformationViewTab";
import SpecificationsViewTab from "./components/SpecificationsViewTab";
import CapacityDetailsViewTab from "./components/CapacityDetailsViewTab";
import OwnershipDetailsViewTab from "./components/OwnershipDetailsViewTab";
import MaintenanceViewTab from "./components/MaintenanceViewTab";
import DocumentsViewTab from "./components/DocumentsViewTab";
import PerformanceDashboardViewTab from "./components/PerformanceDashboardViewTab";

const VehicleDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { currentVehicle, isFetching, error } = useSelector((state) => state.vehicle);

  const [isEditMode, setIsEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  const actionButtonTheme = getComponentTheme("actionButton");
  const tabButtonTheme = getComponentTheme("tabButton");
  const theme = getPageTheme("tab");

  const tabs = [
    {
      id: 0,
      name: "Basic Information",
      icon: Truck,
      viewComponent: BasicInformationViewTab,
    },
    {
      id: 1,
      name: "Specifications",
      icon: Settings,
      viewComponent: SpecificationsViewTab,
    },
    {
      id: 2,
      name: "Capacity Details",
      icon: Package,
      viewComponent: CapacityDetailsViewTab,
    },
    {
      id: 3,
      name: "Ownership Details",
      icon: Building,
      viewComponent: OwnershipDetailsViewTab,
    },
    {
      id: 4,
      name: "Maintenance & Service History",
      icon: Wrench,
      viewComponent: MaintenanceViewTab,
    },
    {
      id: 5,
      name: "Vehicle Service Frequency",
      icon: BarChart3,
      viewComponent: PerformanceDashboardViewTab,
    },
    {
      id: 6,
      name: "Vehicle Documents",
      icon: FileText,
      viewComponent: DocumentsViewTab,
    },
  ];

  // Load vehicle data
  useEffect(() => {
    if (id) {
      dispatch(fetchVehicleById(id));
    }
  }, [id, dispatch]);

  const handleBack = () => {
    navigate("/vehicles");
  };

  const handleEditToggle = () => {
    setIsEditMode(!isEditMode);
  };

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
  };

  const activeTabData = tabs[activeTab];
  const TabViewComponent = activeTabData?.viewComponent;

  // Loading state
  if (isFetching) {
    return (
      <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-[#6366F1] mx-auto mb-4"></div>
          <p className="text-[#4A5568] font-semibold">Loading vehicle details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center">
        <div className="bg-white rounded-xl p-8 shadow-md max-w-md">
          <AlertTriangle className="h-12 w-12 text-[#EF4444] mx-auto mb-4" />
          <h2 className="text-xl font-bold text-[#0D1A33] text-center mb-2">
            Error Loading Vehicle
          </h2>
          <p className="text-[#4A5568] text-center mb-6">
            {error.message || "Failed to load vehicle details"}
          </p>
          <button
            onClick={handleBack}
            className="w-full px-4 py-2 bg-[#6366F1] text-white rounded-lg hover:bg-[#4F46E5] transition-colors"
          >
            Back to Vehicle List
          </button>
        </div>
      </div>
    );
  }

  // No data state
  if (!currentVehicle) {
    return (
      <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center">
        <div className="text-center">
          <Truck className="h-20 w-20 text-[#E5E7EB] mx-auto mb-4" />
          <p className="text-[#4A5568] font-semibold">Vehicle not found</p>
          <button
            onClick={handleBack}
            className="mt-4 px-6 py-2 bg-[#6366F1] text-white rounded-lg hover:bg-[#4F46E5] transition-colors"
          >
            Back to Vehicle List
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F7FA] via-[#F8FAFC] to-[#F1F5F9]">
      <TMSHeader theme={theme} />
      
      {/* Modern Header Bar with glassmorphism - Transporter Style */}
      <div className="bg-gradient-to-r from-[#0D1A33] via-[#1A2B47] to-[#0D1A33] px-6 py-4 shadow-xl relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-transparent to-blue-800/10"></div>
        <div className="absolute -top-4 -right-4 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-full blur-2xl"></div>
        <div className="absolute -bottom-4 -left-4 w-40 h-40 bg-gradient-to-tr from-blue-400/10 to-transparent rounded-full blur-2xl"></div>

        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBack}
              className="group p-2 bg-white/10 backdrop-blur-sm rounded-xl hover:bg-white/20 transition-all duration-300 hover:scale-105 border border-white/20"
            >
              <ArrowLeft className="w-5 h-5 text-white group-hover:text-white transition-colors" />
            </button>

            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-white tracking-tight">
                  {currentVehicle.vehicleId}
                </h1>
                <VehicleStatusPill status={currentVehicle.status} />
              </div>
              <div className="flex items-center gap-4 text-blue-100/80 text-xs">
                <span>{currentVehicle.registrationNumber}</span>
                <span>•</span>
                <span>{currentVehicle.make} {currentVehicle.model}</span>
                <span>•</span>
                <span>{currentVehicle.year}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isEditMode ? (
              <>
                <button
                  onClick={handleEditToggle}
                  className="group inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm text-white border border-white/20 rounded-xl font-medium text-sm hover:bg-white/20 transition-all duration-300 hover:scale-105"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>

                <button
                  className="group inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-[#10B981] to-[#059669] text-white rounded-xl font-medium text-sm hover:from-[#059669] hover:to-[#10B981] transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-green-500/25"
                >
                  <Save className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                  Save Changes
                </button>
              </>
            ) : (
              <button
                onClick={handleEditToggle}
                className="group inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-[#10B981] to-[#059669] text-white rounded-xl font-medium text-sm hover:from-[#059669] hover:to-[#10B981] transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-green-500/25"
              >
                <Edit className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                Edit Details
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Modern Tab Navigation with glassmorphism */}
      <div className="bg-gradient-to-r from-[#0D1A33] to-[#1A2B47] px-6 relative">
        {/* Tab backdrop blur effect */}
        <div className="absolute inset-0 bg-black/20 backdrop-blur-sm"></div>

        {/* Desktop Tabs */}
        <div 
          className="relative hidden lg:flex space-x-2 p-2 overflow-x-auto"
          style={{
            scrollbarWidth: "none", // Firefox
            msOverflowStyle: "none", // IE/Edge
            WebkitOverflowScrolling: "touch",
          }}
        >
            <style>{`
            .relative.hidden.lg\\:flex::-webkit-scrollbar {
              display: none;
            }
          `}</style>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`group relative px-6 py-4 font-medium text-sm rounded-t-2xl transition-all duration-300 flex items-center gap-3 whitespace-nowrap ${
                  isActive
                    ? "bg-gradient-to-br from-white via-white to-gray-50 text-[#0D1A33] shadow-lg transform -translate-y-1 scale-105"
                    : "bg-white/5 backdrop-blur-sm text-blue-100/80 hover:bg-white/10 hover:text-white border border-white/10 hover:border-white/20"
                }`}
              >
                {/* Active tab decoration */}
                {isActive && (
                  <div className="absolute inset-x-0 -bottom-0 h-1 bg-gradient-to-r from-[#10B981] to-[#059669] rounded-t-full"></div>
                )}

                <Icon
                  className={`w-5 h-5 transition-all duration-300 ${
                    isActive
                      ? "text-[#10B981] scale-110"
                      : "text-blue-200/70 group-hover:text-white group-hover:scale-105"
                  }`}
                />
                <span className="font-semibold tracking-wide">{tab.name}</span>

                {/* Mode indicator */}
                {isActive && (
                  <div className="ml-2">
                    {isEditMode ? (
                      <Edit className="w-3 h-3 text-orange-500" />
                    ) : (
                      <Eye className="w-3 h-3 text-green-500" />
                    )}
                  </div>
                )}

                {/* Hover glow effect */}
                {!isActive && (
                  <div className="absolute inset-0 rounded-t-2xl bg-gradient-to-r from-white/0 via-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                )}
              </button>
            );
          })}
        </div>

        {/* Mobile Dropdown */}
        <div className="lg:hidden p-4">
          <select
            value={activeTab}
            onChange={(e) => handleTabChange(Number(e.target.value))}
            className="w-full px-4 py-2 border border-white/20 rounded-lg bg-white/10 text-white backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-[#10B981]/50"
          >
            {tabs.map((tab) => (
              <option key={tab.id} value={tab.id} className="bg-[#0D1A33] text-white">
                {tab.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Modern Content Area */}
      <div className="px-0 py-0">
        {/* Enhanced Tab Content Container */}
        <div className="relative">
          {tabs.map((tab) => {
            const TabComponent = tab.viewComponent;
            const isActive = activeTab === tab.id;

            return (
              <div
                key={tab.id}
                className={`transition-all duration-500 ease-in-out ${
                  isActive
                    ? "block opacity-100 transform translate-y-0"
                    : "hidden opacity-0 transform translate-y-4"
                }`}
              >
                {/* Content wrapper with modern styling */}
                <div className="bg-white/60 backdrop-blur-sm rounded-b-3xl shadow-xl border border-white/40 overflow-hidden">
                  {/* Tab content */}
                  <div className="p-4">
                    {TabComponent && (
                      <TabComponent vehicle={currentVehicle} isEditMode={isEditMode} />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default VehicleDetailsPage;
