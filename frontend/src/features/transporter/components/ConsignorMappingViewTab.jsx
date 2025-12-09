import React, { useState, useEffect } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { fetchConsignorMappings, fetchMappingMasterData } from "../../../redux/slices/transporterSlice";

const ConsignorMappingViewTab = ({ transporterId }) => {
  const dispatch = useDispatch();
  const { consignorMappings, isFetchingMappings } = useSelector((state) => state.transporter);
  const [expandedSections, setExpandedSections] = useState({ mappings: true });

  useEffect(() => {
    if (transporterId) {
      dispatch(fetchConsignorMappings(transporterId));
      dispatch(fetchMappingMasterData());
    }
  }, [transporterId, dispatch]);

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-IN");
  };

  return (
    <div className="p-6 space-y-4">
      <div
        className="bg-white rounded-lg border border-gray-200 overflow-hidden"
        style={{ boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.05)" }}
      >
        <button
          onClick={() => toggleSection("mappings")}
          className="w-full px-6 py-4 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
        >
          <h3 className="text-lg font-semibold text-gray-900">Consignor Mappings</h3>
          {expandedSections.mappings ? (
            <ChevronUp className="w-5 h-5 text-gray-600" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-600" />
          )}
        </button>

        <AnimatePresence>
          {expandedSections.mappings && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="p-6">
                {isFetchingMappings ? (
                  <div className="text-center py-8 text-gray-500">Loading mappings...</div>
                ) : !consignorMappings || consignorMappings.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">No consignor mappings available</div>
                ) : (
                  <div className="space-y-4">
                    {consignorMappings.map((mapping, index) => (
                      <div key={mapping.tc_mapping_id || index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <span className="text-sm font-medium text-gray-500">Consignor</span>
                            <p className="text-sm text-gray-900 mt-1">{mapping.consignor_name || "N/A"}</p>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-500">Valid From</span>
                            <p className="text-sm text-gray-900 mt-1">{formatDate(mapping.valid_from)}</p>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-500">Valid To</span>
                            <p className="text-sm text-gray-900 mt-1">{formatDate(mapping.valid_to)}</p>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-500">Status</span>
                            <div className="mt-1">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${mapping.active_flag ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                                {mapping.active_flag ? "Active" : "Inactive"}
                              </span>
                            </div>
                          </div>
                          {mapping.remark && (
                            <div className="md:col-span-3">
                              <span className="text-sm font-medium text-gray-500">Remark</span>
                              <p className="text-sm text-gray-900 mt-1">{mapping.remark}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ConsignorMappingViewTab;
