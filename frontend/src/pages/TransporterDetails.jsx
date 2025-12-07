import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  ArrowLeft,
  Building,
  MapPin,
  FileText,
  Users,
  Globe,
  Truck,
  UserCircle,
  ShieldAlert,
} from "lucide-react";
import { motion } from "framer-motion";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import GeneralInfoTab from "../components/transporter/details/GeneralInfoTab";
import AddressContactsTab from "../components/transporter/details/AddressContactsTab";
import ServiceAreaTab from "../components/transporter/details/ServiceAreaTab";
import DocumentsTab from "../components/transporter/details/DocumentsTab";
import ConsignorMappingTab from "../features/transporter/components/ConsignorMappingTab";
import ConsignorMappingViewTab from "../features/transporter/components/ConsignorMappingViewTab";
import VehicleMappingTab from "../features/transporter/components/VehicleMappingTab";
import VehicleMappingViewTab from "../features/transporter/components/VehicleMappingViewTab";
import DriverMappingTab from "../features/transporter/components/DriverMappingTab";
import DriverMappingViewTab from "../features/transporter/components/DriverMappingViewTab";
import OwnerMappingTab from "../features/transporter/components/OwnerMappingTab";
import OwnerMappingViewTab from "../features/transporter/components/OwnerMappingViewTab";
import BlacklistMappingTab from "../features/transporter/components/BlacklistMappingTab";
import BlacklistMappingViewTab from "../features/transporter/components/BlacklistMappingViewTab";
import ApprovalActionBar from "../components/approval/ApprovalActionBar";
import { transporterAPI } from "../utils/api";
import { clearSelectedTransporter } from "../redux/slices/transporterSlice";

const TransporterDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState("general");
  const [transporter, setTransporter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Tab configuration
  const tabs = [
    {
      id: "general",
      label: "General Information",
      icon: Building,
      component: GeneralInfoTab,
    },
    {
      id: "address-contacts",
      label: "Address & Contacts",
      icon: MapPin,
      component: AddressContactsTab,
    },
    {
      id: "service-area",
      label: "Service Area",
      icon: Globe,
      component: ServiceAreaTab,
    },
    {
      id: "documents",
      label: "Documents",
      icon: FileText,
      component: DocumentsTab,
    },
    {
      id: "consignor-mapping",
      label: "Transporter and Consignor Mapping",
      icon: Users,
      viewComponent: ConsignorMappingViewTab,
      editComponent: ConsignorMappingTab,
    },
    {
      id: "vehicle-mapping",
      label: "Transporter and Vehicle Mapping",
      icon: Truck,
      viewComponent: VehicleMappingViewTab,
      editComponent: VehicleMappingTab,
    },
    {
      id: "driver-mapping",
      label: "Transporter and Driver Mapping",
      icon: UserCircle,
      viewComponent: DriverMappingViewTab,
      editComponent: DriverMappingTab,
    },
    {
      id: "owner-mapping",
      label: "Transporter and Vehicle Owner Mapping",
      icon: Users,
      viewComponent: OwnerMappingViewTab,
      editComponent: OwnerMappingTab,
    },
    {
      id: "blacklist-mapping",
      label: "Blacklist Mapping",
      icon: ShieldAlert,
      viewComponent: BlacklistMappingViewTab,
      editComponent: BlacklistMappingTab,
    },
  ];

  // Cleanup when navigating away to prevent stale state
  useEffect(() => {
    return () => {
      dispatch(clearSelectedTransporter());
    };
  }, [dispatch]);

  // Fetch transporter data
  useEffect(() => {
    fetchTransporterDetails();
  }, [id]);

  // Fetch transporter data function
  const fetchTransporterDetails = async () => {
    try {
      setLoading(true);
      const response = await transporterAPI.getTransporter(id);

      // Debug logging to understand the response structure
      console.log("🔍 Raw API Response:", response);
      console.log("🔍 Response data:", response.data);
      console.log("🔍 Response status:", response.status);

      let transporterData = null;

      // Check if the response has the expected structure
      if (response.data && response.data.success && response.data.data) {
        // Extract the actual transporter data from the nested structure
        transporterData = response.data.data;
        console.log(
          "✅ Extracted transporter data from nested structure:",
          transporterData
        );
      } else if (response.data && response.data.success === false) {
        // Handle API error response
        throw new Error(
          response.data.message || "API returned unsuccessful response"
        );
      } else if (response.data && typeof response.data === "object") {
        // Fallback: assume response.data is the transporter data directly
        transporterData = response.data;
        console.log(
          "⚠️ Using direct response data (fallback):",
          transporterData
        );
      } else {
        throw new Error("Invalid API response structure");
      }

      // Validate that we have the basic required fields
      if (!transporterData) {
        throw new Error("No transporter data received from API");
      }

      // Log the specific fields we expect to use
      console.log("📋 Transporter fields check:", {
        id: transporterData.id,
        businessName: transporterData.businessName,
        status: transporterData.status,
        transportMode: transporterData.transportMode,
        addresses: transporterData.addresses?.length || 0,
        contacts: transporterData.contacts?.length || 0,
        documents: transporterData.documents?.length || 0,
      });

      setTransporter(transporterData);

      setError(null);
    } catch (err) {
      console.error("Error fetching transporter details:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to load transporter details"
      );
    } finally {
      setLoading(false);
    }
    // };

    if (id) {
      fetchTransporterDetails();
    }
  };

  const handleBackClick = () => {
    navigate("/transporters");
  };

  const handleRefreshData = () => {
    fetchTransporterDetails();
  };

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-primary-background p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center min-h-[60vh]">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center bg-white rounded-lg p-8 shadow-sm border border-gray-200 max-w-sm w-full"
            >
              <div className="flex justify-center mb-6">
                <div className="animate-spin rounded-full h-12 w-12 border-2 border-gray-200 border-t-primary-accent"></div>
              </div>
              <h3 className="text-lg font-semibold text-text-primary mb-2">
                Loading Details
              </h3>
              <p className="text-text-secondary text-sm">Please wait...</p>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-primary-background p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center min-h-[60vh]">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center bg-white rounded-lg p-8 shadow-sm border border-gray-200 max-w-md w-full"
            >
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <FileText className="h-8 w-8 text-red-500" />
              </div>
              <h3 className="text-lg font-semibold text-text-primary mb-2">
                Unable to Load Data
              </h3>
              <p className="text-text-secondary text-sm mb-4">
                We encountered an issue loading the transporter information.
              </p>
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6 text-left">
                <p className="text-xs text-red-700">{error}</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <Button
                  onClick={handleRefreshData}
                  className="bg-primary-accent hover:bg-blue-600 text-white px-4 py-2 text-sm"
                >
                  Try Again
                </Button>
                <Button
                  onClick={handleBackClick}
                  variant="outline"
                  className="border-gray-300 hover:border-primary-accent hover:text-primary-accent px-4 py-2 text-sm"
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Back
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  const ActiveTabComponent =
    tabs.find((tab) => tab.id === activeTab)?.component ||
    tabs.find((tab) => tab.id === activeTab)?.editComponent;

  return (
    <div className="min-h-screen bg-primary-background">
      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Header Section */}
        <div className="mb-6">
          {/* Navigation and Title */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <Button
                onClick={handleBackClick}
                variant="outline"
                size="sm"
                className="flex items-center space-x-2 text-sm"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-text-primary">
                  Transporter Details
                </h1>
                <p className="text-sm text-text-secondary">ID: {id}</p>
              </div>
            </div>

            {/* Approval Action Bar */}
            <div className="flex items-center gap-2">
              {transporter?.userApprovalStatus && (
                <ApprovalActionBar
                  userApprovalStatus={transporter.userApprovalStatus}
                  entityId={id}
                  onRefreshData={handleRefreshData}
                />
              )}
            </div>
          </div>

          {/* Business Info Card */}
          {transporter && (
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-text-primary mb-1">
                    {transporter?.businessName ||
                      transporter?.business_name ||
                      "Business Name Not Available"}
                  </h2>
                  <p className="text-sm text-text-secondary">
                    Transportation & Logistics
                  </p>
                </div>
                <div className="text-right">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                      transporter?.status === "Active"
                        ? "bg-green-100 text-green-800"
                        : transporter?.status === "Pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    <div
                      className={`w-2 h-2 rounded-full mr-2 ${
                        transporter?.status === "Active"
                          ? "bg-green-500"
                          : transporter?.status === "Pending"
                          ? "bg-yellow-500"
                          : "bg-red-500"
                      }`}
                    ></div>
                    {transporter?.status || "Unknown"}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="mb-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-1">
            <div className="flex">
              {tabs.map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={`flex-1 flex items-center justify-center space-x-2 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      activeTab === tab.id
                        ? "bg-primary-accent text-white"
                        : "text-text-secondary hover:text-text-primary hover:bg-gray-50"
                    }`}
                  >
                    <IconComponent className="h-4 w-4" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow-sm border-gray-200 min-h-[400px]">
          {ActiveTabComponent && (
            <ActiveTabComponent
              transporter={transporter}
              entityId={id}
              transporterId={id}
              onUpdate={(updatedData) =>
                setTransporter((prev) => ({ ...prev, ...updatedData }))
              }
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default TransporterDetails;
