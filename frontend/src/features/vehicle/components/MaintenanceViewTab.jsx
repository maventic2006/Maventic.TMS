import React, { useState } from "react";
import { Wrench, Calendar, DollarSign, MapPin, Plus, X, FileText, User, Hash, Edit, Trash2 } from "lucide-react";
import { CustomSelect } from "../../../components/ui/Select";
import CollapsibleSection from "../../../components/ui/CollapsibleSection";

const InfoField = ({ label, value }) => (
  <div className="space-y-1">
    <p className="text-xs font-semibold text-[#4A5568] uppercase tracking-wide">{label}</p>
    <p className="text-sm font-medium text-[#0D1A33]">{value || "N/A"}</p>
  </div>
);

const MaintenanceViewTab = ({ vehicle, isEditMode }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newService, setNewService] = useState({
    serviceType: "",
    serviceDate: "",
    odometerReading: "",
    serviceCenter: "",
    technician: "",
    cost: "",
    description: "",
    partsReplaced: "",
    nextServiceDue: "",
    invoiceNumber: "",
  });

  if (isEditMode) {
    return (
      <div className="text-center py-12">
        <p className="text-[#4A5568]">Edit mode for Maintenance History coming soon...</p>
      </div>
    );
  }

  // Get maintenance history array from vehicle object
  const maintenanceHistory = vehicle?.maintenanceHistory || [];

  const handleAddService = () => {
    // TODO: Implement API call to add service record
    console.log("Adding service:", newService);
    setShowAddModal(false);
    // Reset form
    setNewService({
      serviceType: "",
      serviceDate: "",
      odometerReading: "",
      serviceCenter: "",
      technician: "",
      cost: "",
      description: "",
      partsReplaced: "",
      nextServiceDue: "",
      invoiceNumber: "",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#E5E7EB]">
        <div>
          <h3 className="text-lg font-bold text-[#0D1A33]">Maintenance & Service History</h3>
          <p className="text-sm text-[#4A5568] mt-1">Complete service records and maintenance tracking</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#10B981] hover:bg-[#059669] text-white rounded-lg transition-all duration-200 text-sm font-semibold"
        >
          <Plus className="h-4 w-4" />
          Add Service Record
        </button>
      </div>

      {/* Service Records List with Collapsible Sections */}
      {maintenanceHistory.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg border border-[#E5E7EB]">
          <Wrench className="h-16 w-16 text-[#E5E7EB] mx-auto mb-4" />
          <p className="text-[#4A5568] font-medium">No maintenance records found</p>
          <p className="text-sm text-[#4A5568] mt-2">Click "Add Service Record" to add the first entry</p>
        </div>
      ) : (
        <div className="space-y-4">
          {maintenanceHistory.map((record, index) => {
            const formattedServiceDate = record.serviceDate 
              ? new Date(record.serviceDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })
              : 'N/A';
            const formattedUpcomingDate = record.upcomingServiceDate
              ? new Date(record.upcomingServiceDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })
              : 'N/A';
            
            return (
              <CollapsibleSection
                key={index}
                defaultOpen={index === 0}
                gradientFrom="green-50/50"
                gradientTo="emerald-50/50"
                borderColor="green-100/50"
                header={
                  <div className="flex items-center justify-between w-full text-left">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                        <Wrench className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">
                          {record.typeOfService || `Service Record ${index + 1}`}
                        </h3>
                        <p className="text-sm text-gray-600 flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" />
                          {formattedServiceDate}
                        </p>
                      </div>
                    </div>
                    <div className="text-right mr-8">
                      <p className="text-xs text-gray-600 uppercase tracking-wide">Cost</p>
                      <p className="text-lg font-bold text-gray-800">
                        ₹ {record.serviceExpense ? parseFloat(record.serviceExpense).toLocaleString() : "0"}
                      </p>
                    </div>
                  </div>
                }
              >
                {/* Service Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-600">Maintenance ID</label>
                    <div className="bg-white/70 backdrop-blur-sm rounded-lg px-4 py-3 border border-gray-200/50">
                      <p className="text-gray-800">{record.vehicleMaintenanceId || "N/A"}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-600">Service Type</label>
                    <div className="bg-white/70 backdrop-blur-sm rounded-lg px-4 py-3 border border-gray-200/50">
                      <p className="text-gray-800 font-semibold">{record.typeOfService || "N/A"}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-600">Service Date</label>
                    <div className="bg-white/70 backdrop-blur-sm rounded-lg px-4 py-3 border border-gray-200/50 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <p className="text-gray-800">{formattedServiceDate}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-600">Next Service Due</label>
                    <div className="bg-white/70 backdrop-blur-sm rounded-lg px-4 py-3 border border-gray-200/50 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <p className="text-gray-800">{formattedUpcomingDate}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-600">Service Expense</label>
                    <div className="bg-white/70 backdrop-blur-sm rounded-lg px-4 py-3 border border-gray-200/50 flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-gray-500" />
                      <p className="text-gray-800 font-semibold">
                        ₹ {record.serviceExpense ? parseFloat(record.serviceExpense).toLocaleString() : "0"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Service Remark */}
                {record.serviceRemark && (
                  <div className="mt-4 pt-4 border-t border-gray-200/50">
                    <label className="text-sm font-medium text-gray-600 block mb-2">Service Remarks</label>
                    <div className="bg-white/70 backdrop-blur-sm rounded-lg px-4 py-3 border border-gray-200/50">
                      <p className="text-gray-800">{record.serviceRemark}</p>
                    </div>
                  </div>
                )}
              </CollapsibleSection>
            );
          })}
        </div>
      )}

      {/* Add Service Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-[#E5E7EB] sticky top-0 bg-white">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#E0E7FF] rounded-lg">
                  <Wrench className="h-5 w-5 text-[#6366F1]" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#0D1A33]">Add Service Record</h3>
                  <p className="text-sm text-[#4A5568]">Fill in the service details below</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-[#F5F7FA] rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-[#4A5568]" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-[#0D1A33] uppercase tracking-wide mb-2">
                    Service Type *
                  </label>
                  <CustomSelect
                    value={newService.serviceType}
                    onChange={(value) => setNewService({ ...newService, serviceType: value })}
                    options={[
                      { value: "Routine Maintenance", label: "Routine Maintenance" },
                      { value: "Preventive Maintenance", label: "Preventive Maintenance" },
                      { value: "Corrective Maintenance", label: "Corrective Maintenance" },
                      { value: "Emergency Repair", label: "Emergency Repair" },
                    ]}
                    placeholder="Select Service Type"
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0D1A33] uppercase tracking-wide mb-2">
                    Service Date *
                  </label>
                  <input
                    type="date"
                    value={newService.serviceDate}
                    onChange={(e) => setNewService({ ...newService, serviceDate: e.target.value })}
                    className="w-full px-4 py-2.5 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6366F1] text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0D1A33] uppercase tracking-wide mb-2">
                    Odometer Reading (km) *
                  </label>
                  <input
                    type="number"
                    value={newService.odometerReading}
                    onChange={(e) => setNewService({ ...newService, odometerReading: e.target.value })}
                    placeholder="Enter odometer reading"
                    className="w-full px-4 py-2.5 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6366F1] text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0D1A33] uppercase tracking-wide mb-2">
                    Service Center *
                  </label>
                  <input
                    type="text"
                    value={newService.serviceCenter}
                    onChange={(e) => setNewService({ ...newService, serviceCenter: e.target.value })}
                    placeholder="Enter service center name"
                    className="w-full px-4 py-2.5 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6366F1] text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0D1A33] uppercase tracking-wide mb-2">
                    Technician Name
                  </label>
                  <input
                    type="text"
                    value={newService.technician}
                    onChange={(e) => setNewService({ ...newService, technician: e.target.value })}
                    placeholder="Enter technician name"
                    className="w-full px-4 py-2.5 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6366F1] text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0D1A33] uppercase tracking-wide mb-2">
                    Cost (₹) *
                  </label>
                  <input
                    type="number"
                    value={newService.cost}
                    onChange={(e) => setNewService({ ...newService, cost: e.target.value })}
                    placeholder="Enter service cost"
                    className="w-full px-4 py-2.5 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6366F1] text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0D1A33] uppercase tracking-wide mb-2">
                    Invoice Number
                  </label>
                  <input
                    type="text"
                    value={newService.invoiceNumber}
                    onChange={(e) => setNewService({ ...newService, invoiceNumber: e.target.value })}
                    placeholder="Enter invoice number"
                    className="w-full px-4 py-2.5 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6366F1] text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0D1A33] uppercase tracking-wide mb-2">
                    Next Service Due (km)
                  </label>
                  <input
                    type="number"
                    value={newService.nextServiceDue}
                    onChange={(e) => setNewService({ ...newService, nextServiceDue: e.target.value })}
                    placeholder="Enter next service due"
                    className="w-full px-4 py-2.5 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6366F1] text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0D1A33] uppercase tracking-wide mb-2">
                  Service Description
                </label>
                <textarea
                  value={newService.description}
                  onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                  placeholder="Describe the service performed..."
                  rows={3}
                  className="w-full px-4 py-2.5 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6366F1] text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0D1A33] uppercase tracking-wide mb-2">
                  Parts Replaced
                </label>
                <textarea
                  value={newService.partsReplaced}
                  onChange={(e) => setNewService({ ...newService, partsReplaced: e.target.value })}
                  placeholder="List all parts that were replaced..."
                  rows={3}
                  className="w-full px-4 py-2.5 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6366F1] text-sm"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-[#E5E7EB] bg-[#F9FAFB]">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-6 py-2.5 border border-[#E5E7EB] text-[#4A5568] rounded-lg hover:bg-white transition-colors text-sm font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleAddService}
                className="px-6 py-2.5 bg-[#10B981] hover:bg-[#059669] text-white rounded-lg transition-colors text-sm font-semibold"
              >
                Add Service Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MaintenanceViewTab;
