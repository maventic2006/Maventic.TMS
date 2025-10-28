import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchTransporterById } from "../../redux/slices/transporterSlice";
import {
  ArrowLeft,
  Edit,
  Save,
  X,
  Building2,
  MapPin,
  Globe,
  FileText,
  AlertTriangle,
  Eye,
  User,
  Calendar,
  Hash,
} from "lucide-react";

import { getComponentTheme } from "../../utils/theme";

// Import tab components (we'll create view versions)
import GeneralDetailsViewTab from "./components/GeneralDetailsViewTab";
import AddressContactsViewTab from "./components/AddressContactsViewTab";
import ServiceableAreaViewTab from "./components/ServiceableAreaViewTab";
import DocumentsViewTab from "./components/DocumentsViewTab";

// Import edit components for edit mode
import GeneralDetailsTab from "./components/GeneralDetailsTab";
import AddressContactsTab from "./components/AddressContactsTab";
import ServiceableAreaTab from "./components/ServiceableAreaTab";
import DocumentsTab from "./components/DocumentsTab";

const TransporterDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user, role } = useSelector((state) => state.auth);
  const { selectedTransporter, isFetchingDetails, error } = useSelector(
    (state) => state.transporter
  );

  const [isEditMode, setIsEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [editFormData, setEditFormData] = useState(null);

  const actionButtonTheme = getComponentTheme("actionButton");
  const tabButtonTheme = getComponentTheme("tabButton");

  const tabs = [
    {
      id: 0,
      name: "General Details",
      icon: Building2,
      viewComponent: GeneralDetailsViewTab,
      editComponent: GeneralDetailsTab,
    },
    {
      id: 1,
      name: "Address & Contacts",
      icon: MapPin,
      viewComponent: AddressContactsViewTab,
      editComponent: AddressContactsTab,
    },
    {
      id: 2,
      name: "Serviceable Area",
      icon: Globe,
      viewComponent: ServiceableAreaViewTab,
      editComponent: ServiceableAreaTab,
    },
    {
      id: 3,
      name: "Documents",
      icon: FileText,
      viewComponent: DocumentsViewTab,
      editComponent: DocumentsTab,
    },
  ];

  // Load transporter data from API
  useEffect(() => {
    if (id) {
      dispatch(fetchTransporterById(id));
    }
  }, [id, dispatch]);

  // Set edit form data when transporter data is loaded
  useEffect(() => {
    if (selectedTransporter && !editFormData) {
      setEditFormData(selectedTransporter);
    }
  }, [selectedTransporter, editFormData]);

  const handleEditToggle = () => {
    if (isEditMode) {
      // Cancel edit mode - reset form data
      setEditFormData(selectedTransporter);
    }
    setIsEditMode(!isEditMode);
  };

  const handleSaveChanges = async () => {
    try {
      // TODO: Implement actual save functionality
      // await dispatch(updateTransporter(id, editFormData));

      // For now, just show success message
      setIsEditMode(false);

      // Show success message (you can replace with toast)
      alert("Transporter updated successfully!");
    } catch (err) {
      console.error("Error saving transporter:", err);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-800";
      case "inactive":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isFetchingDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F5F7FA] via-[#F8FAFC] to-[#F1F5F9] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#14B8A6] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading transporter details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F5F7FA] via-[#F8FAFC] to-[#F1F5F9] flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Error Loading Data
          </h2>
          <p className="text-gray-600 mb-4">
            {error.message || "Failed to load transporter details"}
          </p>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-[#14B8A6] text-white rounded-lg hover:bg-[#0891B2] transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!selectedTransporter) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F5F7FA] via-[#F8FAFC] to-[#F1F5F9] flex items-center justify-center">
        <div className="text-center">
          <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Transporter Not Found
          </h2>
          <p className="text-gray-600 mb-4">
            The requested transporter could not be found.
          </p>
          <button
            onClick={() => navigate("/transporters")}
            className="px-4 py-2 bg-[#14B8A6] text-white rounded-lg hover:bg-[#0891B2] transition-colors"
          >
            Back to Transporters
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F7FA] via-[#F8FAFC] to-[#F1F5F9]">
      {/* Modern Header Bar with glassmorphism */}
      <div className="bg-gradient-to-r from-[#0D1A33] via-[#1A2B47] to-[#0D1A33] px-6 py-6 shadow-xl relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-transparent to-teal-600/10"></div>
        <div className="absolute -top-4 -right-4 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-full blur-2xl"></div>
        <div className="absolute -bottom-4 -left-4 w-40 h-40 bg-gradient-to-tr from-teal-400/10 to-transparent rounded-full blur-2xl"></div>

        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button
              onClick={() => navigate(-1)}
              className="group p-3 bg-white/10 backdrop-blur-sm rounded-xl hover:bg-white/20 transition-all duration-300 hover:scale-105 border border-white/20"
            >
              <ArrowLeft className="w-5 h-5 text-white group-hover:text-white transition-colors" />
            </button>

            <div className="space-y-2">
              <div className="flex items-center gap-4">
                <h1 className="text-3xl font-bold text-white tracking-tight">
                  {selectedTransporter.generalDetails.businessName}
                </h1>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                    selectedTransporter.generalDetails.status
                  )}`}
                >
                  {selectedTransporter.generalDetails.status}
                </span>
              </div>
              <div className="flex items-center gap-6 text-blue-100/80 text-sm">
                <div className="flex items-center gap-2">
                  <Hash className="w-4 h-4" />
                  <span>ID: {selectedTransporter.transporterId}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>
                    Created by: {selectedTransporter.generalDetails.createdBy}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>
                    Created: {selectedTransporter.generalDetails.createdOn}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isEditMode ? (
              <>
                <button
                  onClick={handleEditToggle}
                  className="group inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 backdrop-blur-sm text-white border border-white/20 rounded-xl font-medium hover:bg-white/20 transition-all duration-300 hover:scale-105"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>

                <button
                  onClick={handleSaveChanges}
                  className="group inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#14B8A6] to-[#0891B2] text-white rounded-xl font-medium hover:from-[#0891B2] hover:to-[#14B8A6] transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-teal-500/25"
                >
                  <Save className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                  Save Changes
                </button>
              </>
            ) : (
              <button
                onClick={handleEditToggle}
                className="group inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#14B8A6] to-[#0891B2] text-white rounded-xl font-medium hover:from-[#0891B2] hover:to-[#14B8A6] transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-teal-500/25"
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

        <div className="relative flex space-x-1 py-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`group relative px-6 py-4 font-medium text-sm rounded-t-2xl transition-all duration-300 flex items-center gap-3 ${
                  isActive
                    ? "bg-gradient-to-br from-white via-white to-gray-50 text-[#0D1A33] shadow-lg transform -translate-y-1 scale-105"
                    : "bg-white/5 backdrop-blur-sm text-blue-100/80 hover:bg-white/10 hover:text-white border border-white/10 hover:border-white/20"
                }`}
              >
                {/* Active tab decoration */}
                {isActive && (
                  <div className="absolute inset-x-0 -bottom-0 h-1 bg-gradient-to-r from-[#14B8A6] to-[#0891B2] rounded-t-full"></div>
                )}

                <Icon
                  className={`w-5 h-5 transition-all duration-300 ${
                    isActive
                      ? "text-[#14B8A6] scale-110"
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
      </div>

      {/* Modern Content Area */}
      <div className="px-6 py-8 space-y-8">
        {/* Enhanced Tab Content Container */}
        <div className="relative">
          {tabs.map((tab) => {
            const TabComponent = isEditMode
              ? tab.editComponent
              : tab.viewComponent;
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
                <div className="bg-white/60 backdrop-blur-sm rounded-3xl shadow-xl border border-white/40 overflow-hidden">
                  {/* Tab content header with gradient */}
                  <div className="bg-gradient-to-r from-gray-50/80 to-white/80 backdrop-blur-sm px-8 py-6 border-b border-gray-200/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-[#14B8A6] to-[#0891B2] rounded-xl flex items-center justify-center shadow-lg">
                          {React.createElement(tab.icon, {
                            className: "w-5 h-5 text-white",
                          })}
                        </div>
                        <div>
                          <h2 className="text-lg font-bold text-[#0D1A33] tracking-tight">
                            {tab.name}
                          </h2>
                          <p className="text-sm text-gray-600">
                            {isEditMode
                              ? "Edit the information below"
                              : "View detailed information"}
                          </p>
                        </div>
                      </div>

                      {/* Mode indicator badge */}
                      <div
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          isEditMode
                            ? "bg-orange-100 text-orange-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {isEditMode ? "Edit Mode" : "View Mode"}
                      </div>
                    </div>
                  </div>

                  {/* Tab content */}
                  <div className="p-8">
                    <TabComponent
                      formData={isEditMode ? editFormData : selectedTransporter}
                      setFormData={isEditMode ? setEditFormData : undefined}
                      errors={{}}
                      isEditMode={isEditMode}
                      transporterData={selectedTransporter}
                    />
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

export default TransporterDetailsPage;
