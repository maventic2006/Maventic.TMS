import React from "react";
import { AlertTriangle, Plus, X, Calendar } from "lucide-react";

const AccidentViolationTab = ({
  formData,
  setFormData,
  errors = {},
  masterData,
  isLoading,
}) => {
  const accidents = formData?.accidents || [];

  const handleAccidentChange = (index, field, value) => {
    setFormData((prev) => {
      const updatedAccidents = [...prev.accidents];
      updatedAccidents[index] = { ...updatedAccidents[index], [field]: value };
      return { ...prev, accidents: updatedAccidents };
    });
  };

  const addAccident = () => {
    setFormData((prev) => ({
      ...prev,
      accidents: [
        ...prev.accidents,
        {
          type: "",
          date: "",
          description: "",
          location: "",
          severity: "",
          penaltyAmount: "",
          resolved: false,
        },
      ],
    }));
  };

  const removeAccident = (index) => {
    setFormData((prev) => ({
      ...prev,
      accidents: prev.accidents.filter((_, i) => i !== index),
    }));
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm">
        <div className="bg-[#0D1A33] text-white px-4 py-3 rounded-t-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            <h2 className="text-lg font-bold">Accidents & Violations</h2>
          </div>
          <button
            type="button"
            onClick={addAccident}
            className="bg-[#10B981] text-white h-9 px-3 rounded-lg flex items-center gap-2 text-sm hover:bg-[#059669] transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>

        <div className="p-6">
          {accidents.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr className="text-left text-xs font-medium text-gray-600 border-b border-gray-200">
                    <th className="pb-3 pl-4 min-w-[150px]">Type</th>
                    <th className="pb-3 pl-4 min-w-[150px]">Date</th>
                    <th className="pb-3 pl-4 min-w-[200px]">Location</th>
                    <th className="pb-3 pl-4 min-w-[150px]">Severity</th>
                    <th className="pb-3 pl-4 min-w-[150px]">Penalty Amount</th>
                    <th className="pb-3 pl-4 min-w-[250px]">Description</th>
                    <th className="pb-3 w-12">Resolved</th>
                    <th className="pb-3 w-12"></th>
                  </tr>
                </thead>
                <tbody>
                  {accidents.map((item, index) => (
                    <tr
                      key={index}
                      className="bg-white border-b border-gray-100"
                      style={{ height: "60px" }}
                    >
                      <td className="px-3">
                        <select
                          value={item.type || ""}
                          onChange={(e) =>
                            handleAccidentChange(index, "type", e.target.value)
                          }
                          className="min-w-[150px] px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent text-xs"
                        >
                          <option value="">Select</option>
                          <option value="Accident">Accident</option>
                          <option value="Traffic Violation">
                            Traffic Violation
                          </option>
                          <option value="Safety Violation">
                            Safety Violation
                          </option>
                        </select>
                      </td>
                      <td className="px-3">
                        <div className="relative min-w-[150px]">
                          <Calendar className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 pointer-events-none text-gray-400" />
                          <input
                            type="date"
                            value={item.date || ""}
                            onChange={(e) =>
                              handleAccidentChange(
                                index,
                                "date",
                                e.target.value
                              )
                            }
                            className="w-full pl-8 pr-2 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent text-xs"
                          />
                        </div>
                      </td>
                      <td className="px-3">
                        <input
                          type="text"
                          value={item.location || ""}
                          onChange={(e) =>
                            handleAccidentChange(
                              index,
                              "location",
                              e.target.value
                            )
                          }
                          placeholder="Enter location"
                          className="min-w-[200px] px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent text-xs"
                        />
                      </td>
                      <td className="px-3">
                        <select
                          value={item.severity || ""}
                          onChange={(e) =>
                            handleAccidentChange(
                              index,
                              "severity",
                              e.target.value
                            )
                          }
                          className="min-w-[150px] px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent text-xs"
                        >
                          <option value="">Select</option>
                          <option value="Minor">Minor</option>
                          <option value="Moderate">Moderate</option>
                          <option value="Severe">Severe</option>
                        </select>
                      </td>
                      <td className="px-3">
                        <input
                          type="number"
                          value={item.penaltyAmount || ""}
                          onChange={(e) =>
                            handleAccidentChange(
                              index,
                              "penaltyAmount",
                              e.target.value
                            )
                          }
                          placeholder="Amount"
                          className="min-w-[150px] px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent text-xs"
                        />
                      </td>
                      <td className="px-3">
                        <input
                          type="text"
                          value={item.description || ""}
                          onChange={(e) =>
                            handleAccidentChange(
                              index,
                              "description",
                              e.target.value
                            )
                          }
                          placeholder="Enter description"
                          className="min-w-[250px] px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent text-xs"
                        />
                      </td>
                      <td className="px-3 text-center">
                        <input
                          type="radio"
                          checked={item.resolved || false}
                          onChange={(e) =>
                            handleAccidentChange(
                              index,
                              "resolved",
                              e.target.checked
                            )
                          }
                          className="w-4 h-4 text-green-500 focus:ring-green-500"
                        />
                      </td>
                      <td className="px-3">
                        <button
                          type="button"
                          onClick={() => removeAccident(index)}
                          className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">
                No accident or violation records added yet
              </p>
              <p className="text-sm">Click "Add" to get started</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccidentViolationTab;
