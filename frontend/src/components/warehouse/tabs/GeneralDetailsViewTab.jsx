import React, { useState } from "react";
import {
  Building2,
  Hash,
  User,
  Calendar,
  CheckCircle,
  XCircle,
  MapPin,
  Settings,
  ChevronDown,
  ChevronUp,
  Package,
  Gauge,
  TruckIcon,
  Fuel,
  ClipboardCheck,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const GeneralDetailsViewTab = ({ warehouseData }) => {
  const [expandedSections, setExpandedSections] = useState({
    basic: true,
    facilities: true,
  });

  // Helper function to format date from ISO to readable format
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch (error) {
      return "N/A";
    }
  };

  // Helper function to display boolean as Yes/No with icons
  const displayBoolean = (value) => {
    if (value === true || value === 1) {
      return (
        <div className="flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <span className="text-green-600 font-medium">Yes</span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-2">
        <XCircle className="h-4 w-4 text-gray-400" />
        <span className="text-gray-500 font-medium">No</span>
      </div>
    );
  };

  // Helper function to display value or N/A
  const displayValue = (value) => {
    if (value === null || value === undefined || value === "") {
      return <span className="text-gray-500 italic">N/A</span>;
    }
    return <span className="text-[#0D1A33] font-medium">{value}</span>;
  };

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const CollapsibleSection = ({ title, icon: Icon, sectionKey, children }) => {
    const isExpanded = expandedSections[sectionKey];

    return (
      <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm bg-white">
        <button
          onClick={() => toggleSection(sectionKey)}
          className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Icon className="h-5 w-5 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          </div>
          {isExpanded ? (
            <ChevronUp className="h-5 w-5 text-gray-500" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-500" />
          )}
        </button>

        <AnimatePresence initial={false}>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="px-6 py-4 border-t border-gray-200">
                {children}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <div className="space-y-6 p-2">
      {/* Basic Information Section */}
      <CollapsibleSection
        title="Basic Information"
        icon={Building2}
        sectionKey="basic"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Warehouse ID
            </label>
            <div className="flex items-center gap-2">
              <Hash className="h-4 w-4 text-gray-400" />
              {displayValue(warehouseData?.warehouse_id)}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Consignor ID
            </label>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-gray-400" />
              {displayValue(warehouseData?.consignor_id)}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Warehouse Name 1
            </label>
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-gray-400" />
              {displayValue(warehouseData?.warehouse_name1)}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Warehouse Name 2
            </label>
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-gray-400" />
              {displayValue(warehouseData?.warehouse_name2)}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Warehouse Type
            </label>
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-gray-400" />
              {displayValue(
                warehouseData?.warehouse_type_name ||
                  warehouseData?.warehouse_type
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Material Type
            </label>
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-gray-400" />
              {displayValue(
                warehouseData?.material_type_name ||
                  warehouseData?.material_type_id
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Language
            </label>
            {displayValue(warehouseData?.language)}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Vehicle Capacity
            </label>
            <div className="flex items-center gap-2">
              <TruckIcon className="h-4 w-4 text-gray-400" />
              {displayValue(warehouseData?.vehicle_capacity)}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Speed Limit (KM/H)
            </label>
            <div className="flex items-center gap-2">
              <Gauge className="h-4 w-4 text-gray-400" />
              {displayValue(warehouseData?.speed_limit)}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Virtual Yard In
            </label>
            {displayBoolean(warehouseData?.virtual_yard_in)}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Radius for Virtual Yard In
            </label>
            {displayValue(warehouseData?.radius_for_virtual_yard_in)}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Status
            </label>
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                warehouseData?.status === "ACTIVE"
                  ? "bg-green-100 text-green-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {warehouseData?.status || "N/A"}
            </span>
          </div>
        </div>
      </CollapsibleSection>

      {/* Facilities Section */}
      <CollapsibleSection
        title="Facilities"
        icon={Settings}
        sectionKey="facilities"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Weigh Bridge Available
            </label>
            {displayBoolean(warehouseData?.weigh_bridge_availability)}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Gatepass System Available
            </label>
            {displayBoolean(warehouseData?.gatepass_system_available)}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Fuel Availability
            </label>
            <div className="flex items-center gap-2">
              {displayBoolean(warehouseData?.fuel_availability)}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Staging Area for Goods Organization
            </label>
            {displayBoolean(warehouseData?.staging_area_for_goods_organization)}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Driver Waiting Area
            </label>
            {displayBoolean(warehouseData?.driver_waiting_area)}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Gate In Checklist Auth
            </label>
            <div className="flex items-center gap-2">
              {displayBoolean(warehouseData?.gate_in_checklist_auth)}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Gate Out Checklist Auth
            </label>
            <div className="flex items-center gap-2">
              {displayBoolean(warehouseData?.gate_out_checklist_auth)}
            </div>
          </div>
        </div>
      </CollapsibleSection>
    </div>
  );
};

export default GeneralDetailsViewTab;
