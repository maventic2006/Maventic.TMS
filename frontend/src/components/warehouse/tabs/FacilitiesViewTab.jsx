import React from "react";
import {
  Truck,
  Scale,
  Fuel,
  Warehouse,
  Users,
  Wrench,
  CheckCircle,
  XCircle,
  Settings,
  Clock,
} from "lucide-react";

const FacilitiesViewTab = ({ warehouseData }) => {
  // Helper function to display boolean as Yes/No with icons
  const displayBoolean = (value) => {
    if (value === true) {
      return (
        <div className="flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <span className="text-green-600 font-medium">Available</span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-2">
        <XCircle className="h-4 w-4 text-gray-400" />
        <span className="text-gray-500 font-medium">Not Available</span>
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
      {/* Vehicle & Equipment Facilities */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Truck className="h-5 w-5 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              Vehicle & Equipment Facilities
            </h3>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <label className="block text-sm font-medium text-gray-600 mb-3">
                <Scale className="inline h-4 w-4 mr-2" />
                Weigh Bridge
              </label>
              {displayBoolean(warehouseData?.weigh_bridge)}
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <label className="block text-sm font-medium text-gray-600 mb-3">
                <Fuel className="inline h-4 w-4 mr-2" />
                Fuel Availability
              </label>
              {displayBoolean(warehouseData?.fuel_availability)}
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <label className="block text-sm font-medium text-gray-600 mb-3">
                <Truck className="inline h-4 w-4 mr-2" />
                Truck Wash
              </label>
              {displayBoolean(warehouseData?.truck_wash)}
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <label className="block text-sm font-medium text-gray-600 mb-3">
                <Wrench className="inline h-4 w-4 mr-2" />
                Truck Repair
              </label>
              {displayBoolean(warehouseData?.truck_repair)}
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <label className="block text-sm font-medium text-gray-600 mb-3">
                <Warehouse className="inline h-4 w-4 mr-2" />
                Covered Area
              </label>
              {displayBoolean(warehouseData?.covered_area)}
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <label className="block text-sm font-medium text-gray-600 mb-3">
                <Settings className="inline h-4 w-4 mr-2" />
                Loading Dock
              </label>
              {displayBoolean(warehouseData?.loading_dock)}
            </div>
          </div>
        </div>
      </div>

      {/* Operational Facilities */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Settings className="h-5 w-5 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              Operational Facilities
            </h3>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <label className="block text-sm font-medium text-gray-600 mb-3">
                <Warehouse className="inline h-4 w-4 mr-2" />
                Cold Storage
              </label>
              {displayBoolean(warehouseData?.cold_storage)}
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <label className="block text-sm font-medium text-gray-600 mb-3">
                <Users className="inline h-4 w-4 mr-2" />
                Staff Quarters
              </label>
              {displayBoolean(warehouseData?.staff_quarters)}
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <label className="block text-sm font-medium text-gray-600 mb-3">
                <Settings className="inline h-4 w-4 mr-2" />
                Material Handling Equipment
              </label>
              {displayBoolean(warehouseData?.material_handling_equip)}
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <label className="block text-sm font-medium text-gray-600 mb-3">
                <Clock className="inline h-4 w-4 mr-2" />
                24/7 Operations
              </label>
              {displayBoolean(warehouseData?.twenty_four_seven_ops)}
            </div>
          </div>
        </div>
      </div>

      {/* Additional Facility Information */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-purple-50 to-violet-50 px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Warehouse className="h-5 w-5 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              Additional Information
            </h3>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-3">
                Special Facilities
              </label>
              <div className="bg-gray-50 rounded-lg p-4 min-h-[100px]">
                {warehouseData?.special_facilities ? (
                  <p className="text-[#0D1A33] whitespace-pre-wrap">
                    {warehouseData.special_facilities}
                  </p>
                ) : (
                  <span className="text-gray-500 italic">
                    No special facilities listed
                  </span>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-3">
                Equipment Details
              </label>
              <div className="bg-gray-50 rounded-lg p-4 min-h-[100px]">
                {warehouseData?.equipment_details ? (
                  <p className="text-[#0D1A33] whitespace-pre-wrap">
                    {warehouseData.equipment_details}
                  </p>
                ) : (
                  <span className="text-gray-500 italic">
                    No equipment details provided
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Facility Summary */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-orange-50 to-amber-50 px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Settings className="h-5 w-5 text-orange-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              Facility Summary
            </h3>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Count available facilities */}
            {(() => {
              const facilities = [
                warehouseData?.weigh_bridge,
                warehouseData?.fuel_availability,
                warehouseData?.truck_wash,
                warehouseData?.truck_repair,
                warehouseData?.covered_area,
                warehouseData?.loading_dock,
                warehouseData?.cold_storage,
                warehouseData?.staff_quarters,
                warehouseData?.material_handling_equip,
                warehouseData?.twenty_four_seven_ops,
              ];

              const availableCount = facilities.filter(
                (facility) => facility === true
              ).length;
              const totalCount = facilities.length;

              return (
                <>
                  <div className="text-center bg-blue-50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-blue-600">
                      {availableCount}
                    </div>
                    <div className="text-sm text-gray-600">
                      Available Facilities
                    </div>
                  </div>

                  <div className="text-center bg-gray-50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-gray-600">
                      {totalCount - availableCount}
                    </div>
                    <div className="text-sm text-gray-600">Unavailable</div>
                  </div>

                  <div className="text-center bg-green-50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-green-600">
                      {totalCount > 0
                        ? Math.round((availableCount / totalCount) * 100)
                        : 0}
                      %
                    </div>
                    <div className="text-sm text-gray-600">Coverage</div>
                  </div>

                  <div className="text-center bg-purple-50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-purple-600">
                      {totalCount}
                    </div>
                    <div className="text-sm text-gray-600">
                      Total Facilities
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacilitiesViewTab;
