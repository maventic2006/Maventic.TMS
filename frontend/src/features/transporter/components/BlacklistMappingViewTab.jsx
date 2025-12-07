import React, { useState, useEffect } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { fetchBlacklistMappings } from "../../../redux/slices/transporterSlice";

const BlacklistMappingViewTab = ({ transporterId }) => {
  const dispatch = useDispatch();
  const { blacklistMappings, isFetchingMappings } = useSelector(
    (state) => state.transporter
  );
  const [expanded, setExpanded] = useState(true);

  useEffect(() => {
    if (transporterId) dispatch(fetchBlacklistMappings(transporterId));
  }, [transporterId, dispatch]);

  const formatDate = (date) =>
    date ? new Date(date).toLocaleDateString("en-IN") : "N/A";

  return (
    <div className="p-6 space-y-4">
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full px-6 py-4 flex items-center justify-between bg-gray-50 hover:bg-gray-100"
        >
          <h3 className="text-lg font-semibold">Blacklist Mappings</h3>
          {expanded ? (
            <ChevronUp className="w-5 h-5" />
          ) : (
            <ChevronDown className="w-5 h-5" />
          )}
        </button>
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="p-6">
                {isFetchingMappings ? (
                  <div className="text-center py-8 text-gray-500">
                    Loading...
                  </div>
                ) : !blacklistMappings || blacklistMappings.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No blacklist mappings
                  </div>
                ) : (
                  <div className="space-y-4">
                    {blacklistMappings.map((m, i) => (
                      <div
                        key={m.blacklist_mapping_id || i}
                        className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <span className="text-sm font-medium text-gray-500">
                              Blacklisted By
                            </span>
                            <div className="mt-1">
                              <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                Transporter
                              </span>
                            </div>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-500">
                              User Type
                            </span>
                            <p className="text-sm mt-1 capitalize">
                              {m.user_type || "N/A"}
                            </p>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-500">
                              User ID
                            </span>
                            <p className="text-sm mt-1">{m.user_id || "N/A"}</p>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-500">
                              Valid From
                            </span>
                            <p className="text-sm mt-1">
                              {formatDate(m.valid_from)}
                            </p>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-500">
                              Valid To
                            </span>
                            <p className="text-sm mt-1">
                              {formatDate(m.valid_to)}
                            </p>
                          </div>
                          {m.remark && (
                            <div className="md:col-span-3">
                              <span className="text-sm font-medium text-gray-500">
                                Reason
                              </span>
                              <p className="text-sm mt-1">{m.remark}</p>
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

export default BlacklistMappingViewTab;
