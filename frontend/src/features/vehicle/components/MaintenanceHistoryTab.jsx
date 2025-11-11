import React, { useState, useEffect } from "react";
import { Wrench, Info, Plus, X } from "lucide-react";
import { CustomSelect } from "../../../components/ui/Select";

const MaintenanceHistoryTab = ({ formData, setFormData, errors }) => {
  const [selectedServiceIndex, setSelectedServiceIndex] = useState(0);

  const serviceRecords = formData.maintenanceHistory || [];

  // Initialize with at least one record if none exist
  useEffect(() => {
    if (serviceRecords.length === 0) {
      addService();
    }
  }, []);

  const addService = () => {
    const newService = {
      serviceDate: "",
      upcomingServiceDate: "",
      typeOfService: "",
      serviceExpense: 0,
      serviceRemark: "",
      odometerReading: 0,
      serviceCenter: "",
      technician: "",
      invoiceNumber: "",
      partsReplaced: "",
    };

    const updatedRecords = [...serviceRecords, newService];
    setFormData((prev) => ({
      ...prev,
      maintenanceHistory: updatedRecords,
    }));

    setSelectedServiceIndex(serviceRecords.length);
  };

  const removeService = (index) => {
    if (serviceRecords.length <= 1) return;

    const updatedRecords = serviceRecords.filter((_, i) => i !== index);
    let newSelectedIndex = selectedServiceIndex;
    if (index === selectedServiceIndex) {
      newSelectedIndex = Math.max(0, selectedServiceIndex - 1);
    } else if (index < selectedServiceIndex) {
      newSelectedIndex = selectedServiceIndex - 1;
    }

    setFormData((prev) => ({
      ...prev,
      maintenanceHistory: updatedRecords,
    }));

    setSelectedServiceIndex(newSelectedIndex);
  };

  const updateService = (index, field, value) => {
    const updatedRecords = [...serviceRecords];
    updatedRecords[index] = {
      ...updatedRecords[index],
      [field]: value,
    };

    setFormData((prev) => ({
      ...prev,
      maintenanceHistory: updatedRecords,
    }));
  };

  const serviceTypes = [
    { value: "Routine Maintenance", label: "Routine Maintenance" },
    { value: "Preventive Maintenance", label: "Preventive Maintenance" },
    { value: "Corrective Maintenance", label: "Corrective Maintenance" },
    { value: "Emergency Repair", label: "Emergency Repair" },
    { value: "Oil Change", label: "Oil Change" },
    { value: "Tire Replacement", label: "Tire Replacement" },
    { value: "Brake Service", label: "Brake Service" },
    { value: "Engine Service", label: "Engine Service" },
    { value: "Transmission Service", label: "Transmission Service" },
  ];

  return (
    <div className="">
      <div className="grid grid-cols-1 gap-4">
        {/* Service Records Section */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="bg-[#0D1A33] text-white px-4 py-3 rounded-t-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wrench className="w-5 h-5" />
              <h2 className="text-lg font-bold">Maintenance & Service History</h2>
            </div>
            <button
              onClick={addService}
              className="bg-[#10B981] text-white h-9 px-3 rounded-lg flex items-center gap-2 text-sm hover:bg-[#059669] transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add
            </button>
          </div>

          <div className="p-6">
            {serviceRecords.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px]">
                  <thead>
                    <tr className="text-left text-xs font-medium text-gray-600 border-b border-gray-200">
                      <th className="pb-3 w-12"></th>
                      <th className="pb-3 pl-4 min-w-[150px]">Service Date</th>
                      <th className="pb-3 pl-4 min-w-[150px]">Upcoming Service</th>
                      <th className="pb-3 pl-4 min-w-[200px]">Type of Service</th>
                      <th className="pb-3 pl-4 min-w-[150px]">Odometer Reading</th>
                      <th className="pb-3 pl-4 min-w-[150px]">Service Expense</th>
                      <th className="pb-3 pl-4 min-w-[200px]">Service Center</th>
                      <th className="pb-3 pl-4 min-w-[150px]">Technician</th>
                      <th className="pb-3 pl-4 min-w-[150px]">Invoice Number</th>
                      <th className="pb-3 pl-4 min-w-[250px]">Service Remark</th>
                      <th className="pb-3 w-12"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {serviceRecords.map((service, index) => {
                      const isSelected = index === selectedServiceIndex;

                      return (
                        <tr
                          key={index}
                          className={`${
                            isSelected
                              ? "bg-gray-100 border-l-4 border-l-[#10B981]"
                              : "bg-white"
                          } border-b border-gray-100`}
                          style={{ height: "60px" }}
                        >
                          <td className="px-3">
                            <input
                              type="radio"
                              checked={isSelected}
                              onChange={() => setSelectedServiceIndex(index)}
                              className="w-5 h-5 text-[#10B981] border-gray-300 focus:ring-[#10B981]"
                            />
                          </td>
                          <td className="px-3">
                            <input
                              type="date"
                              value={service.serviceDate || ""}
                              onChange={(e) =>
                                updateService(index, "serviceDate", e.target.value)
                              }
                              className={`min-w-[150px] px-3 py-2 bg-white border rounded-md focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent text-xs ${
                                errors?.maintenanceHistory?.[index]?.serviceDate
                                  ? "border-red-500"
                                  : "border-gray-300"
                              }`}
                            />
                          </td>
                          <td className="px-3">
                            <input
                              type="date"
                              value={service.upcomingServiceDate || ""}
                              onChange={(e) =>
                                updateService(index, "upcomingServiceDate", e.target.value)
                              }
                              className={`min-w-[150px] px-3 py-2 bg-white border rounded-md focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent text-xs ${
                                errors?.maintenanceHistory?.[index]?.upcomingServiceDate
                                  ? "border-red-500"
                                  : "border-gray-300"
                              }`}
                            />
                          </td>
                          <td className="px-3">
                            <CustomSelect
                              key={`serviceType-${index}-${service.typeOfService}`}
                              value={service.typeOfService || ""}
                              onValueChange={(value) =>
                                updateService(index, "typeOfService", value)
                              }
                              options={serviceTypes}
                              placeholder="Select Type"
                              getOptionLabel={(option) => option.label}
                              getOptionValue={(option) => option.value}
                              className={`min-w-[200px] text-xs ${
                                errors?.maintenanceHistory?.[index]?.typeOfService
                                  ? "border-red-500"
                                  : ""
                              }`}
                              error={errors?.maintenanceHistory?.[index]?.typeOfService}
                            />
                          </td>
                          <td className="px-3">
                            <input
                              type="number"
                              value={service.odometerReading || 0}
                              onChange={(e) =>
                                updateService(index, "odometerReading", parseInt(e.target.value) || 0)
                              }
                              placeholder="10000"
                              className={`min-w-[150px] px-3 py-2 bg-white border rounded-md focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent text-xs ${
                                errors?.maintenanceHistory?.[index]?.odometerReading
                                  ? "border-red-500"
                                  : "border-gray-300"
                              }`}
                            />
                          </td>
                          <td className="px-3">
                            <input
                              type="number"
                              value={service.serviceExpense || 0}
                              onChange={(e) =>
                                updateService(index, "serviceExpense", parseFloat(e.target.value) || 0)
                              }
                              placeholder="50000"
                              className={`min-w-[150px] px-3 py-2 bg-white border rounded-md focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent text-xs ${
                                errors?.maintenanceHistory?.[index]?.serviceExpense
                                  ? "border-red-500"
                                  : "border-gray-300"
                              }`}
                            />
                          </td>
                          <td className="px-3">
                            <input
                              type="text"
                              value={service.serviceCenter || ""}
                              onChange={(e) =>
                                updateService(index, "serviceCenter", e.target.value)
                              }
                              placeholder="Service center"
                              className={`min-w-[200px] px-3 py-2 bg-white border rounded-md focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent text-xs ${
                                errors?.maintenanceHistory?.[index]?.serviceCenter
                                  ? "border-red-500"
                                  : "border-gray-300"
                              }`}
                            />
                          </td>
                          <td className="px-3">
                            <input
                              type="text"
                              value={service.technician || ""}
                              onChange={(e) =>
                                updateService(index, "technician", e.target.value)
                              }
                              placeholder="Technician name"
                              className={`min-w-[150px] px-3 py-2 bg-white border rounded-md focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent text-xs ${
                                errors?.maintenanceHistory?.[index]?.technician
                                  ? "border-red-500"
                                  : "border-gray-300"
                              }`}
                            />
                          </td>
                          <td className="px-3">
                            <input
                              type="text"
                              value={service.invoiceNumber || ""}
                              onChange={(e) =>
                                updateService(index, "invoiceNumber", e.target.value)
                              }
                              placeholder="Invoice number"
                              className={`min-w-[150px] px-3 py-2 bg-white border rounded-md focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent text-xs ${
                                errors?.maintenanceHistory?.[index]?.invoiceNumber
                                  ? "border-red-500"
                                  : "border-gray-300"
                              }`}
                            />
                          </td>
                          <td className="px-3">
                            <textarea
                              value={service.serviceRemark || ""}
                              onChange={(e) =>
                                updateService(index, "serviceRemark", e.target.value)
                              }
                              placeholder="Service remarks"
                              rows={2}
                              className={`min-w-[250px] px-3 py-2 bg-white border rounded-md focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent text-xs resize-none ${
                                errors?.maintenanceHistory?.[index]?.serviceRemark
                                  ? "border-red-500"
                                  : "border-gray-300"
                              }`}
                            />
                          </td>
                          <td className="px-3">
                            <button
                              onClick={() => removeService(index)}
                              disabled={serviceRecords.length <= 1}
                              className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Wrench className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">No service records added yet</p>
                <p className="text-sm">Click "Add" to get started</p>
              </div>
            )}
          </div>
        </div>

        {/* Info Panel at Bottom */}
        <div className="mt-6 bg-blue-50/50 border border-blue-200/50 rounded-lg p-3 flex items-start gap-2">
          <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-blue-800">
            <p className="font-semibold mb-1">Maintenance & Service History</p>
            <p>Record service dates, type of service performed, and expenses for better vehicle lifecycle management. Use the table above to add multiple service records.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaintenanceHistoryTab;