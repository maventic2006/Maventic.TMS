import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchVehicleById, updateVehicle, fetchMasterData } from "../../redux/slices/vehicleSlice";
import { showToast } from "../../redux/slices/uiSlice";
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
// theme helpers are available via getPageTheme
import { getPageTheme } from "../../theme.config";
import TMSHeader from "../../components/layout/TMSHeader";
import VehicleStatusPill from "../../components/vehicle/VehicleStatusPill";
import { CustomSelect } from "../../components/ui/Select";

// Import view tab components
import BasicInformationViewTab from "./components/BasicInformationViewTab";
import SpecificationsViewTab from "./components/SpecificationsViewTab";
import CapacityDetailsViewTab from "./components/CapacityDetailsViewTab";
import OwnershipDetailsViewTab from "./components/OwnershipDetailsViewTab";
import MaintenanceViewTab from "./components/MaintenanceViewTab";
import DocumentsViewTab from "./components/DocumentsViewTab";
import PerformanceDashboardViewTab from "./components/PerformanceDashboardViewTab";

// Import edit tab components
import BasicInformationTab from "./components/BasicInformationTab";
import SpecificationsTab from "./components/SpecificationsTab";
import CapacityDetailsTab from "./components/CapacityDetailsTab";
import OwnershipDetailsTab from "./components/OwnershipDetailsTab";
import MaintenanceHistoryTab from "./components/MaintenanceHistoryTab";
import ServiceFrequencyTab from "./components/ServiceFrequencyTab";
import DocumentsTab from "./components/DocumentsTab";

const VehicleDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { currentVehicle, isFetching, isUpdating, error, masterData } = useSelector((state) => state.vehicle);

  const [isEditMode, setIsEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [formData, setFormData] = useState({
    basicInformation: {},
    specifications: {},
    capacityDetails: {},
    ownershipDetails: {},
    maintenanceHistory: {},
    serviceFrequency: {},
    documents: []
  });
  const [validationErrors, setValidationErrors] = useState({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // page theme helpers
  const theme = getPageTheme("tab");

  const tabs = [
    {
      id: 0,
      name: "Basic Information",
      icon: Truck,
      viewComponent: BasicInformationViewTab,
      editComponent: BasicInformationTab,
    },
    {
      id: 1,
      name: "Specifications",
      icon: Settings,
      viewComponent: SpecificationsViewTab,
      editComponent: SpecificationsTab,
    },
    {
      id: 2,
      name: "Capacity Details",
      icon: Package,
      viewComponent: CapacityDetailsViewTab,
      editComponent: CapacityDetailsTab,
    },
    {
      id: 3,
      name: "Ownership Details",
      icon: Building,
      viewComponent: OwnershipDetailsViewTab,
      editComponent: OwnershipDetailsTab,
    },
    {
      id: 4,
      name: "Maintenance & Service History",
      icon: Wrench,
      viewComponent: MaintenanceViewTab,
      editComponent: MaintenanceHistoryTab,
    },
    {
      id: 5,
      name: "Vehicle Service Frequency",
      icon: BarChart3,
      viewComponent: PerformanceDashboardViewTab,
      editComponent: ServiceFrequencyTab,
    },
    {
      id: 6,
      name: "Vehicle Documents",
      icon: FileText,
      viewComponent: DocumentsViewTab,
      editComponent: DocumentsTab,
    },
  ];

  // Load vehicle data
  useEffect(() => {
    if (id) {
      dispatch(fetchVehicleById(id));
      dispatch(fetchMasterData());
    }
  }, [id, dispatch]);

  // Populate formData when entering edit mode
  useEffect(() => {
    if (currentVehicle && isEditMode) {
      setFormData({
        basicInformation: {
          registrationNumber: currentVehicle.registrationNumber || "",
          vin: currentVehicle.vin || "",
          vehicleType: currentVehicle.vehicleType || "",
          transporterId: currentVehicle.transporterId || "",
          transporterName: currentVehicle.transporterName || "",
          make: currentVehicle.make || "",
          model: currentVehicle.model || "",
          year: currentVehicle.year || new Date().getFullYear(),
          leasingFlag: currentVehicle.leasingFlag || false,
          leasedFrom: currentVehicle.leasedFrom || "",
          leaseStartDate: currentVehicle.leaseStartDate || "",
          leaseEndDate: currentVehicle.leaseEndDate || "",
          color: currentVehicle.color || "",
          mileage: currentVehicle.mileage || 0,
          gpsEnabled: currentVehicle.gpsEnabled || false,
          gpsIMEI: currentVehicle.gpsIMEI || "",
          gpsProvider: currentVehicle.gpsProvider || "",
          currentDriver: currentVehicle.currentDriver || "",
          usageType: currentVehicle.usageType || "",
        },
        specifications: {
          engineNumber: currentVehicle.engineNumber || "",
          engineType: currentVehicle.engineType || "",
          fuelType: currentVehicle.fuelType || "",
          fuelTankCapacity: currentVehicle.fuelTankCapacity || 0,
          transmission: currentVehicle.transmission || "",
          noOfGears: currentVehicle.noOfGears || 0,
          wheelbase: currentVehicle.wheelbase || 0,
          noOfAxles: currentVehicle.noOfAxles || 0,
          emissionStandard: currentVehicle.emissionStandard || "",
          financer: currentVehicle.financer || "",
          suspensionType: currentVehicle.suspensionType || "",
        },
        capacityDetails: {
          gvw: currentVehicle.gvw || 0,
          unladenWeight: currentVehicle.unladenWeight || 0,
          payloadCapacity: currentVehicle.payloadCapacity || 0,
          loadingCapacityVolume: currentVehicle.loadingCapacityVolume || 0,
          loadingCapacityUnit: currentVehicle.loadingCapacityUnit || "CBM",
          cargoLength: currentVehicle.cargoLength || 0,
          cargoWidth: currentVehicle.cargoWidth || 0,
          cargoHeight: currentVehicle.cargoHeight || 0,
          doorType: currentVehicle.doorType || "",
          noOfPallets: currentVehicle.noOfPallets || 0,
          seatingCapacity: currentVehicle.seatingCapacity || 0,
          towingCapacity: currentVehicle.towingCapacity || 0,
          vehicleCondition: currentVehicle.vehicleCondition || "",
        },
        ownershipDetails: {
          ownerName: currentVehicle.ownerName || "",
          registrationDate: currentVehicle.registrationDate || "",
          registrationUpto: currentVehicle.registrationUpto || "",
          validFrom: currentVehicle.validFrom || "",
          validTo: currentVehicle.validTo || "",
          purchaseDate: currentVehicle.purchaseDate || "",
          purchasePrice: currentVehicle.purchasePrice || 0,
          stateCode: currentVehicle.stateCode || "",
          rtoCode: currentVehicle.rtoCode || "",
          contactNumber: currentVehicle.contactNumber || "",
          email: currentVehicle.email || "",
        },
        maintenanceHistory: {
          lastServiceDate: currentVehicle.lastServiceDate || "",
          nextServiceDue: currentVehicle.nextServiceDue || "",
          typeOfService: currentVehicle.typeOfService || "",
          totalServiceExpense: currentVehicle.totalServiceExpense || 0,
          maintenanceNotes: currentVehicle.maintenanceNotes || "",
          lastInspectionDate: currentVehicle.lastInspectionDate || "",
        },
        serviceFrequency: {
          serviceIntervalMonths: currentVehicle.serviceIntervalMonths || 6,
          serviceIntervalKM: currentVehicle.serviceIntervalKM || 0,
        },
        documents: currentVehicle.documents || []
      });
      setValidationErrors({});
      setHasUnsavedChanges(false);
    }
  }, [currentVehicle, isEditMode]);

  const handleBack = () => {
    if (hasUnsavedChanges && isEditMode) {
      if (window.confirm("You have unsaved changes. Are you sure you want to leave?")) {
        navigate("/vehicles");
      }
    } else {
      navigate("/vehicles");
    }
  };

  const handleEditToggle = () => {
    if (isEditMode && hasUnsavedChanges) {
      if (window.confirm("You have unsaved changes. Do you want to discard them?")) {
        setIsEditMode(false);
        setHasUnsavedChanges(false);
        setValidationErrors({});
      }
    } else {
      setIsEditMode(!isEditMode);
    }
  };

  const handleFormDataChange = (section, data) => {
    setFormData(prev => ({
      ...prev,
      [section]: data
    }));
    setHasUnsavedChanges(true);
  };

  // Transform frontend formData to backend format
  const transformFormDataForBackend = (frontendData) => {
    const formatDate = (dateStr) => {
      if (!dateStr) return undefined;
      if (dateStr instanceof Date) return dateStr.toISOString().split('T')[0];
      return dateStr;
    };

    const convertYearToMonthYear = (year) => {
      if (!year) return undefined;
      return `${year}-01`;
    };

    return {
      basicInformation: {
        vehicle_registration_number: frontendData.basicInformation.registrationNumber || "",
        maker_brand_description: frontendData.basicInformation.make || "",
        maker_model: frontendData.basicInformation.model || "",
        vin_chassis_no: frontendData.basicInformation.vin || "",
        vehicle_type_id: frontendData.basicInformation.vehicleType || "",
        vehicle_category: "",
        manufacturing_month_year: convertYearToMonthYear(frontendData.basicInformation.year),
        vehicle_colour: frontendData.basicInformation.color || "",
        gps_tracker_imei_number: frontendData.basicInformation.gpsIMEI || "",
        gps_tracker_active_flag: frontendData.basicInformation.gpsEnabled || false,
        usage_type_id: frontendData.basicInformation.usageType || "UT001",
        safety_inspection_date: formatDate(frontendData.basicInformation.safetyInspectionDate),
        taxes_and_fees: frontendData.basicInformation.taxesAndFees || 0,
        mileage: frontendData.basicInformation.mileage || 0,
        leasing_flag: frontendData.basicInformation.leasingFlag || false,
      },
      specifications: {
        engine_type_id: frontendData.specifications.engineType || "",
        engine_number: frontendData.specifications.engineNumber || "",
        fuel_type_id: frontendData.specifications.fuelType || "",
        fuel_tank_capacity: frontendData.specifications.fuelTankCapacity || 0,
        transmission_type: frontendData.specifications.transmission || "",
        financer: frontendData.specifications.financer || "",
        suspension_type: frontendData.specifications.suspensionType || "",
        emission_standard: frontendData.specifications.emissionStandard || "",
        wheelbase: frontendData.specifications.wheelbase || 0,
        no_of_axles: frontendData.specifications.noOfAxles || 0,
      },
      capacityDetails: {
        unloadingWeight: frontendData.capacityDetails.unladenWeight || 0,
        gvw: frontendData.capacityDetails.gvw || 0,
        volumeCapacity: frontendData.capacityDetails.loadingCapacityVolume || 0,
        towingCapacity: frontendData.capacityDetails.towingCapacity || 0,
        vehicleCondition: frontendData.capacityDetails.vehicleCondition || "GOOD",
        fuelTankCapacity: frontendData.specifications.fuelTankCapacity || 0,
        seatingCapacity: frontendData.capacityDetails.seatingCapacity || 0,
        cargoLength: frontendData.capacityDetails.cargoLength || 0,
        cargoWidth: frontendData.capacityDetails.cargoWidth || 0,
        cargoHeight: frontendData.capacityDetails.cargoHeight || 0,
      },
      ownershipDetails: {
        ownershipName: frontendData.ownershipDetails.ownerName || "",
        registrationNumber: frontendData.basicInformation.registrationNumber || "",
        registrationDate: formatDate(frontendData.ownershipDetails.registrationDate),
        registrationUpto: formatDate(frontendData.ownershipDetails.registrationUpto),
        validFrom: formatDate(frontendData.ownershipDetails.validFrom),
        validTo: formatDate(frontendData.ownershipDetails.validTo),
        purchaseDate: formatDate(frontendData.ownershipDetails.purchaseDate),
        saleAmount: frontendData.ownershipDetails.purchasePrice || 0,
        stateCode: frontendData.ownershipDetails.stateCode || "",
        rtoCode: frontendData.ownershipDetails.rtoCode || "",
        contactNumber: frontendData.ownershipDetails.contactNumber || "",
        email: frontendData.ownershipDetails.email || "",
      },
      maintenanceHistory: {
        serviceDate: formatDate(frontendData.maintenanceHistory.lastServiceDate) || new Date().toISOString().split('T')[0],
        upcomingServiceDate: formatDate(frontendData.maintenanceHistory.nextServiceDue) || new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        typeOfService: frontendData.maintenanceHistory.typeOfService || "",
        serviceExpense: frontendData.maintenanceHistory.totalServiceExpense || 0,
        serviceRemark: frontendData.maintenanceHistory.maintenanceNotes || "",
        lastInspectionDate: formatDate(frontendData.maintenanceHistory.lastInspectionDate),
      },
      serviceFrequency: {
        timePeriod: frontendData.serviceFrequency.serviceIntervalMonths 
          ? `${frontendData.serviceFrequency.serviceIntervalMonths} months` 
          : "6 months",
        kmDrove: frontendData.serviceFrequency.serviceIntervalKM || 0,
      },
      documents: (frontendData.documents || []).map(doc => ({
        documentType: doc.documentType || "",
        referenceNumber: doc.documentNumber || doc.referenceNumber || "",
        vehicleMaintenanceId: doc.vehicleMaintenanceId || null,
        permitCategory: doc.permitCategory || "",
        permitCode: doc.permitCode || "",
        documentProvider: doc.documentProvider || "",
        coverageType: doc.coverageType || "",
        premiumAmount: doc.premiumAmount || 0,
        validFrom: formatDate(doc.issueDate || doc.validFrom),
        validTo: formatDate(doc.expiryDate || doc.validTo),
        remarks: doc.remarks || "Document uploaded",
        fileName: doc.fileName || "",
        fileType: doc.fileType || "",
        fileData: doc.fileData || "",
      })).filter(doc => doc.documentType),
    };
  };

  const handleSaveChanges = async () => {
    try {
      // Clear previous errors
      setValidationErrors({});

      // Transform data for backend
      const transformedData = transformFormDataForBackend(formData);

      // Dispatch update action
      const resultAction = await dispatch(updateVehicle({ 
        vehicleId: id, 
        vehicleData: transformedData 
      }));

      if (updateVehicle.fulfilled.match(resultAction)) {
        dispatch(showToast({
          message: "Vehicle updated successfully",
          type: "success"
        }));
        
        // Refresh vehicle data
        await dispatch(fetchVehicleById(id));
        
        // Exit edit mode
        setIsEditMode(false);
        setHasUnsavedChanges(false);
        setValidationErrors({});
      } else {
        const errorMessage = resultAction.payload?.message || "Failed to update vehicle";
        dispatch(showToast({
          message: errorMessage,
          type: "error"
        }));
        
        // Set validation errors if available
        if (resultAction.payload?.errors) {
          setValidationErrors(resultAction.payload.errors);
        }
      }
    } catch (error) {
      console.error("Error updating vehicle:", error);
      dispatch(showToast({
        message: "An unexpected error occurred",
        type: "error"
      }));
    }
  };

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
  };

  const activeTabData = tabs[activeTab];
  const TabViewComponent = activeTabData?.viewComponent;
  const TabEditComponent = activeTabData?.editComponent;

  // Cancel edit handler: revert changes and exit edit mode
  const handleCancelEdit = () => {
    if (hasUnsavedChanges) {
      if (!window.confirm('Discard unsaved changes?')) return;
    }
    setIsEditMode(false);
    setHasUnsavedChanges(false);
    setValidationErrors({});
    // formData will be repopulated when edit mode is re-entered
  };

  // Documents change helper removed — DocumentsTab updates documents via setFormData prop

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
                  onClick={handleCancelEdit}
                  className="group inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm text-white border border-white/20 rounded-xl font-medium text-sm hover:bg-white/20 transition-all duration-300 hover:scale-105"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>

                <button
                  onClick={handleSaveChanges}
                  disabled={isUpdating}
                  className="group inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-[#10B981] to-[#059669] text-white rounded-xl font-medium text-sm hover:from-[#059669] hover:to-[#10B981] transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-green-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUpdating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                      Save Changes
                    </>
                  )}
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
          <CustomSelect
            value={activeTab}
            onChange={(value) => handleTabChange(Number(value))}
            options={tabs.map((tab) => ({ value: tab.id, label: tab.name }))}
            placeholder="Select Tab"
            className="w-full"
          />
        </div>
      </div>

      {/* Modern Content Area */}
      <div className="px-0 py-0">
        {/* Enhanced Tab Content Container */}
        <div className="relative">
          {tabs.map((tab) => {
            const TabComponent = tab.viewComponent;
            const TabEditComponent = tab.editComponent;
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
                    {isEditMode && TabEditComponent ? (
                      // Edit Mode - Render Edit Component
                      React.createElement(TabEditComponent, {
                        formData: formData[
                          tab.id === 0 ? 'basicInformation' :
                          tab.id === 1 ? 'specifications' :
                          tab.id === 2 ? 'capacityDetails' :
                          tab.id === 3 ? 'ownershipDetails' :
                          tab.id === 4 ? 'maintenanceHistory' :
                          tab.id === 5 ? 'serviceFrequency' :
                          'documents'
                        ],
                          // Accept either an updater function (which may expect full formData)
                          setFormData: (dataOrUpdater) => {
                            const sectionKey = (
                              tab.id === 0 ? 'basicInformation' :
                              tab.id === 1 ? 'specifications' :
                              tab.id === 2 ? 'capacityDetails' :
                              tab.id === 3 ? 'ownershipDetails' :
                              tab.id === 4 ? 'maintenanceHistory' :
                              tab.id === 5 ? 'serviceFrequency' :
                              'documents'
                            );

                            if (typeof dataOrUpdater === 'function') {
                              // First try invoking updater with full formData (common pattern used in other pages)
                              const resultIfFull = dataOrUpdater(formData);

                              // Heuristic: if result contains any of the known top-level keys, assume it's a full-form update
                              const topKeys = ['basicInformation','specifications','capacityDetails','ownershipDetails','maintenanceHistory','serviceFrequency','documents'];
                              const isFullForm = resultIfFull && typeof resultIfFull === 'object' && Object.keys(resultIfFull).some(k => topKeys.includes(k));

                              if (isFullForm) {
                                // Replace entire formData
                                setFormData(resultIfFull);
                                setHasUnsavedChanges(true);
                              } else {
                                // Otherwise treat updater as section-updater
                                const currentSectionData = formData[sectionKey];
                                const newSectionData = dataOrUpdater(currentSectionData);
                                handleFormDataChange(sectionKey, newSectionData);
                              }
                            } else {
                              // Directly set section data
                              handleFormDataChange(sectionKey, dataOrUpdater);
                            }
                          },
                        errors: validationErrors,
                        masterData: masterData || {},
                      })
                    ) : (
                      // View Mode - Render View Component
                      TabComponent && <TabComponent vehicle={currentVehicle} />
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
