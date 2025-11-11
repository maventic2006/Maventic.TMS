import React, { useState, useEffect } from "react";
import { Calendar, Info, Plus, X } from "lucide-react";
import { CustomSelect } from "../../../components/ui/Select";

const ServiceFrequencyTab = ({ formData, setFormData, errors }) => {
  const [selectedFrequencyIndex, setSelectedFrequencyIndex] = useState(0);

  const frequencyRecords = formData.serviceFrequency || [];

  // Initialize with at least one record if none exist
  useEffect(() => {
    if (frequencyRecords.length === 0) {
      addFrequency();
    }
  }, []);

  const addFrequency = () => {
    const newFrequency = {
      sequenceNumber: "", // Will be auto-generated
      serviceName: "",
      timePeriod: "",
      kmDrove: 0,
      frequency: "",
      lastServiceKm: 0,
      nextServiceKm: 0,
      lastServiceDate: "",
      nextServiceDate: "",
    };

    const updatedRecords = [...frequencyRecords, newFrequency];
    setFormData((prev) => ({
      ...prev,
      serviceFrequency: updatedRecords,
    }));

    setSelectedFrequencyIndex(frequencyRecords.length);
  };

  const removeFrequency = (index) => {
    if (frequencyRecords.length <= 1) return;

    const updatedRecords = frequencyRecords.filter((_, i) => i !== index);
    let newSelectedIndex = selectedFrequencyIndex;
    if (index === selectedFrequencyIndex) {
      newSelectedIndex = Math.max(0, selectedFrequencyIndex - 1);
    } else if (index < selectedFrequencyIndex) {
      newSelectedIndex = selectedFrequencyIndex - 1;
    }

    setFormData((prev) => ({
      ...prev,
      serviceFrequency: updatedRecords,
    }));

    setSelectedFrequencyIndex(newSelectedIndex);
  };

  const updateFrequency = (index, field, value) => {
    const updatedRecords = [...frequencyRecords];
    updatedRecords[index] = {
      ...updatedRecords[index],
      [field]: value,
    };

    setFormData((prev) => ({
      ...prev,
      serviceFrequency: updatedRecords,
    }));
  };

  const serviceNames = [
    { value: "Engine Oil Change", label: "Engine Oil Change" },
    { value: "Air Filter Replacement", label: "Air Filter Replacement" },
    { value: "Brake Pad Inspection", label: "Brake Pad Inspection" },
    { value: "Tire Rotation", label: "Tire Rotation" },
    { value: "Transmission Fluid", label: "Transmission Fluid" },
    { value: "Coolant Flush", label: "Coolant Flush" },
    { value: "Spark Plug Replacement", label: "Spark Plug Replacement" },
    { value: "Battery Check", label: "Battery Check" },
  ];

  const frequencyOptions = [
    { value: "Every 5,000 km", label: "Every 5,000 km" },
    { value: "Every 10,000 km", label: "Every 10,000 km" },
    { value: "Every 15,000 km", label: "Every 15,000 km" },
    { value: "Every 20,000 km", label: "Every 20,000 km" },
    { value: "Every 30,000 km", label: "Every 30,000 km" },
    { value: "Every 40,000 km", label: "Every 40,000 km" },
    { value: "Every 50,000 km", label: "Every 50,000 km" },
  ];

  return (
    <div className="">
      <div className="grid grid-cols-1 gap-4">
        {/* Service Frequency Records Section */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="bg-[#0D1A33] text-white px-4 py-3 rounded-t-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              <h2 className="text-lg font-bold">Vehicle Service Frequency</h2>
            </div>
            <button
              onClick={addFrequency}
              className="bg-[#10B981] text-white h-9 px-3 rounded-lg flex items-center gap-2 text-sm hover:bg-[#059669] transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add
            </button>
          </div>

          <div className="p-6">
            {frequencyRecords.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px]">
                  <thead>
                    <tr className="text-left text-xs font-medium text-gray-600 border-b border-gray-200">
                      <th className="pb-3 w-12"></th>
                      <th className="pb-3 pl-4 min-w-[200px]">Service Name</th>
                      <th className="pb-3 pl-4 min-w-[150px]">Frequency</th>
                      <th className="pb-3 pl-4 min-w-[150px]">Time Period</th>
                      <th className="pb-3 pl-4 min-w-[150px]">Last Service (km)</th>
                      <th className="pb-3 pl-4 min-w-[150px]">Next Service (km)</th>
                      <th className="pb-3 pl-4 min-w-[150px]">Last Service Date</th>
                      <th className="pb-3 pl-4 min-w-[150px]">Next Service Date</th>
                      <th className="pb-3 pl-4 min-w-[150px]">KM Drove</th>
                      <th className="pb-3 w-12"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {frequencyRecords.map((frequency, index) => {
                      const isSelected = index === selectedFrequencyIndex;

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
                              onChange={() => setSelectedFrequencyIndex(index)}
                              className="w-5 h-5 text-[#10B981] border-gray-300 focus:ring-[#10B981]"
                            />
                          </td>
                          <td className="px-3">
                            <CustomSelect
                              key={`serviceName-${index}-${frequency.serviceName}`}
                              value={frequency.serviceName || ""}
                              onValueChange={(value) =>
                                updateFrequency(index, "serviceName", value)
                              }
                              options={serviceNames}
                              placeholder="Select Service"
                              getOptionLabel={(option) => option.label}
                              getOptionValue={(option) => option.value}
                              className={`min-w-[200px] text-xs ${
                                errors?.serviceFrequency?.[index]?.serviceName
                                  ? "border-red-500"
                                  : ""
                              }`}
                              error={errors?.serviceFrequency?.[index]?.serviceName}
                            />
                          </td>
                          <td className="px-3">
                            <CustomSelect
                              key={`frequency-${index}-${frequency.frequency}`}
                              value={frequency.frequency || ""}
                              onValueChange={(value) =>
                                updateFrequency(index, "frequency", value)
                              }
                              options={frequencyOptions}
                              placeholder="Select Frequency"
                              getOptionLabel={(option) => option.label}
                              getOptionValue={(option) => option.value}
                              className={`min-w-[150px] text-xs ${
                                errors?.serviceFrequency?.[index]?.frequency
                                  ? "border-red-500"
                                  : ""
                              }`}
                              error={errors?.serviceFrequency?.[index]?.frequency}
                            />
                          </td>
                          <td className="px-3">
                            <input
                              type="text"
                              value={frequency.timePeriod || ""}
                              onChange={(e) =>
                                updateFrequency(index, "timePeriod", e.target.value)
                              }
                              placeholder="6 months"
                              className={`min-w-[150px] px-3 py-2 bg-white border rounded-md focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent text-xs ${
                                errors?.serviceFrequency?.[index]?.timePeriod
                                  ? "border-red-500"
                                  : "border-gray-300"
                              }`}
                            />
                          </td>
                          <td className="px-3">
                            <input
                              type="number"
                              value={frequency.lastServiceKm || 0}
                              onChange={(e) =>
                                updateFrequency(index, "lastServiceKm", parseInt(e.target.value) || 0)
                              }
                              placeholder="40000"
                              className={`min-w-[150px] px-3 py-2 bg-white border rounded-md focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent text-xs ${
                                errors?.serviceFrequency?.[index]?.lastServiceKm
                                  ? "border-red-500"
                                  : "border-gray-300"
                              }`}
                            />
                          </td>
                          <td className="px-3">
                            <input
                              type="number"
                              value={frequency.nextServiceKm || 0}
                              onChange={(e) =>
                                updateFrequency(index, "nextServiceKm", parseInt(e.target.value) || 0)
                              }
                              placeholder="50000"
                              className={`min-w-[150px] px-3 py-2 bg-white border rounded-md focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent text-xs ${
                                errors?.serviceFrequency?.[index]?.nextServiceKm
                                  ? "border-red-500"
                                  : "border-gray-300"
                              }`}
                            />
                          </td>
                          <td className="px-3">
                            <input
                              type="date"
                              value={frequency.lastServiceDate || ""}
                              onChange={(e) =>
                                updateFrequency(index, "lastServiceDate", e.target.value)
                              }
                              className={`min-w-[150px] px-3 py-2 bg-white border rounded-md focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent text-xs ${
                                errors?.serviceFrequency?.[index]?.lastServiceDate
                                  ? "border-red-500"
                                  : "border-gray-300"
                              }`}
                            />
                          </td>
                          <td className="px-3">
                            <input
                              type="date"
                              value={frequency.nextServiceDate || ""}
                              onChange={(e) =>
                                updateFrequency(index, "nextServiceDate", e.target.value)
                              }
                              className={`min-w-[150px] px-3 py-2 bg-white border rounded-md focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent text-xs ${
                                errors?.serviceFrequency?.[index]?.nextServiceDate
                                  ? "border-red-500"
                                  : "border-gray-300"
                              }`}
                            />
                          </td>
                          <td className="px-3">
                            <input
                              type="number"
                              value={frequency.kmDrove || 0}
                              onChange={(e) =>
                                updateFrequency(index, "kmDrove", parseInt(e.target.value) || 0)
                              }
                              placeholder="10000"
                              className={`min-w-[150px] px-3 py-2 bg-white border rounded-md focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent text-xs ${
                                errors?.serviceFrequency?.[index]?.kmDrove
                                  ? "border-red-500"
                                  : "border-gray-300"
                              }`}
                            />
                          </td>
                          <td className="px-3">
                            <button
                              onClick={() => removeFrequency(index)}
                              disabled={frequencyRecords.length <= 1}
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
                <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">No service frequency records added yet</p>
                <p className="text-sm">Click "Add" to get started</p>
              </div>
            )}
          </div>
        </div>

        {/* Info Panel at Bottom */}
        <div className="mt-6 bg-blue-50/50 border border-blue-200/50 rounded-lg p-3">
          <div className="flex items-start gap-2 mb-2">
            <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <p className="text-xs font-semibold text-blue-800">Service Frequency Guidelines</p>
          </div>
          <ul className="space-y-1.5 text-xs text-blue-800 ml-6">
            <li className="flex items-start gap-2">
              <span className="text-[#10B981] font-bold">•</span>
              <span>Track service intervals based on both time period and kilometers driven</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#10B981] font-bold">•</span>
              <span>Sequence number is auto-generated for tracking multiple service entries</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#10B981] font-bold">•</span>
              <span>Regular maintenance helps extend vehicle lifespan and maintain performance</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ServiceFrequencyTab;