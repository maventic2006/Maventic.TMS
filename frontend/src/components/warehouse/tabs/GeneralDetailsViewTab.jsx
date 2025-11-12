import React from "react";
import {
  Building2,
  Hash,
  User,
  Calendar,
  CheckCircle,
  XCircle,
  MapPin,
} from "lucide-react";

const GeneralDetailsViewTab = ({ warehouseData }) => {
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
    if (value === true) {
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

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Basic Information Section */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Building2 className="h-5 w-5 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              Basic Information
            </h3>
          </div>
        </div>
        
        <div className="p-6">
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
                Warehouse Name
              </label>
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-gray-400" />
                {displayValue(warehouseData?.warehouse_name1)}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Alternative Name
              </label>
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-gray-400" />
                {displayValue(warehouseData?.warehouse_name2)}
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
                Warehouse Type
              </label>
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-gray-400" />
                {displayValue(warehouseData?.warehouse_type)}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Language
              </label>
              <div className="flex items-center gap-2">
                {displayValue(warehouseData?.language)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Capacity & Specifications */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Building2 className="h-5 w-5 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              Capacity & Specifications
            </h3>
          </div>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Vehicle Capacity
              </label>
              {displayValue(warehouseData?.vehicle_capacity ? `${warehouseData.vehicle_capacity} vehicles` : null)}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Speed Limit
              </label>
              {displayValue(warehouseData?.speed_limit ? `${warehouseData.speed_limit} km/h` : null)}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Virtual Yard Radius
              </label>
              {displayValue(warehouseData?.radius_for_virtual_yard_in ? `${warehouseData.radius_for_virtual_yard_in} meters` : null)}
            </div>
          </div>
        </div>
      </div>

      {/* Location Information */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-purple-50 to-violet-50 px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <MapPin className="h-5 w-5 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              Location Information
            </h3>
          </div>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Region
              </label>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gray-400" />
                {displayValue(warehouseData?.region)}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Zone
              </label>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gray-400" />
                {displayValue(warehouseData?.zone)}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                City
              </label>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gray-400" />
                {displayValue(warehouseData?.city)}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                State
              </label>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gray-400" />
                {displayValue(warehouseData?.state)}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Country
              </label>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gray-400" />
                {displayValue(warehouseData?.country)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Audit Information */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-gray-50 to-slate-50 px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <Calendar className="h-5 w-5 text-gray-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              Audit Information
            </h3>
          </div>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Created By
              </label>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-400" />
                {displayValue(warehouseData?.created_by)}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Created On
              </label>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                {displayValue(formatDate(warehouseData?.created_at))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Approver
              </label>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-400" />
                {displayValue(warehouseData?.approver)}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Approved On
              </label>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                {displayValue(formatDate(warehouseData?.approved_on))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeneralDetailsViewTab;