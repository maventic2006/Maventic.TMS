import React from "react";
import { Briefcase, Plus, X, Calendar } from "lucide-react";

const HistoryTab = ({
  formData,
  setFormData,
  errors = {},
  masterData,
  isLoading,
}) => {
  const history = formData?.history || [];

  const handleHistoryChange = (index, field, value) => {
    setFormData((prev) => {
      const updatedHistory = [...prev.history];
      updatedHistory[index] = {
        ...updatedHistory[index],
        [field]: value,
      };
      return {
        ...prev,
        history: updatedHistory,
      };
    });
  };

  const addHistory = () => {
    setFormData((prev) => ({
      ...prev,
      history: [
        ...prev.history,
        {
          companyName: "",
          position: "",
          fromDate: "",
          toDate: "",
          reasonForLeaving: "",
          vehicleType: "",
        },
      ],
    }));
  };

  const removeHistory = (index) => {
    setFormData((prev) => ({
      ...prev,
      history: prev.history.filter((_, i) => i !== index),
    }));
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm">
        <div className="bg-[#0D1A33] text-white px-4 py-3 rounded-t-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Briefcase className="w-5 h-5" />
            <h2 className="text-lg font-bold">Employment History</h2>
          </div>
          <button
            type="button"
            onClick={addHistory}
            className="bg-[#10B981] text-white h-9 px-3 rounded-lg flex items-center gap-2 text-sm hover:bg-[#059669] transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>

        <div className="p-6">
          {history.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr className="text-left text-xs font-medium text-gray-600 border-b border-gray-200">
                    <th className="pb-3 pl-4 min-w-[200px]">Company Name</th>
                    <th className="pb-3 pl-4 min-w-[200px]">Position</th>
                    <th className="pb-3 pl-4 min-w-[150px]">From Date</th>
                    <th className="pb-3 pl-4 min-w-[150px]">To Date</th>
                    <th className="pb-3 pl-4 min-w-[200px]">Vehicle Type</th>
                    <th className="pb-3 pl-4 min-w-[250px]">
                      Reason for Leaving
                    </th>
                    <th className="pb-3 w-12"></th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((item, index) => (
                    <tr
                      key={index}
                      className="bg-white border-b border-gray-100"
                      style={{ height: "60px" }}
                    >
                      <td className="px-3">
                        <input
                          type="text"
                          value={item.companyName || ""}
                          onChange={(e) =>
                            handleHistoryChange(
                              index,
                              "companyName",
                              e.target.value
                            )
                          }
                          placeholder="Enter company name"
                          className="min-w-[200px] px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent text-xs"
                        />
                      </td>
                      <td className="px-3">
                        <input
                          type="text"
                          value={item.position || ""}
                          onChange={(e) =>
                            handleHistoryChange(
                              index,
                              "position",
                              e.target.value
                            )
                          }
                          placeholder="Enter position"
                          className="min-w-[200px] px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent text-xs"
                        />
                      </td>
                      <td className="px-3">
                        <div className="relative min-w-[150px]">
                          <Calendar className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 pointer-events-none text-gray-400" />
                          <input
                            type="date"
                            value={item.fromDate || ""}
                            onChange={(e) =>
                              handleHistoryChange(
                                index,
                                "fromDate",
                                e.target.value
                              )
                            }
                            className="w-full pl-8 pr-2 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent text-xs"
                          />
                        </div>
                      </td>
                      <td className="px-3">
                        <div className="relative min-w-[150px]">
                          <Calendar className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 pointer-events-none text-gray-400" />
                          <input
                            type="date"
                            value={item.toDate || ""}
                            onChange={(e) =>
                              handleHistoryChange(
                                index,
                                "toDate",
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
                          value={item.vehicleType || ""}
                          onChange={(e) =>
                            handleHistoryChange(
                              index,
                              "vehicleType",
                              e.target.value
                            )
                          }
                          placeholder="Enter vehicle type"
                          className="min-w-[200px] px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent text-xs"
                        />
                      </td>
                      <td className="px-3">
                        <input
                          type="text"
                          value={item.reasonForLeaving || ""}
                          onChange={(e) =>
                            handleHistoryChange(
                              index,
                              "reasonForLeaving",
                              e.target.value
                            )
                          }
                          placeholder="Enter reason"
                          className="min-w-[250px] px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent text-xs"
                        />
                      </td>
                      <td className="px-3">
                        <button
                          type="button"
                          onClick={() => removeHistory(index)}
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
              <Briefcase className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">
                No employment history added yet
              </p>
              <p className="text-sm">Click "Add" to get started</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HistoryTab;
