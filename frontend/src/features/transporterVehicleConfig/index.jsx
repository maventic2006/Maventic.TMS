import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Layout } from "../../components/layout/Layout";
import { getPageTheme } from "../../theme.config";
import {
  fetchHdrList,
  fetchHdrById,
  fetchVehicleTypes,
  fetchParameters,
  fetchVehicles,
  fetchTransporters,
  fetchConsignors,
  setSelectedHdr,
  clearSelectedHdr
} from "../../redux/slices/transporterVehicleConfigSlice";

const TransporterVehicleConfigPage = () => {
  const dispatch = useDispatch();
  const listTheme = getPageTheme("list");
  
  const {
    hdrList,
    selectedHdr,
    alerts,
    pagination,
    vehicleTypes,
    parameters,
    vehicles,
    transporters,
    consignors,
    loading
  } = useSelector(state => state.transporterVehicleConfig);

  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    dispatch(fetchHdrList({ page: currentPage, limit: 10, search: searchTerm }));
    dispatch(fetchVehicleTypes());
    dispatch(fetchParameters());
    dispatch(fetchVehicles(""));
    dispatch(fetchTransporters(""));
    dispatch(fetchConsignors(""));
  }, [dispatch, currentPage, searchTerm]);

  const handleRowClick = (hdr) => {
    dispatch(fetchHdrById(hdr.vehicle_config_hdr_id));
  };

  return (
    <Layout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6" style={{ color: listTheme.colors.text.primary }}>
          Transporter Vehicle Configuration
        </h1>

        <div className="grid grid-cols-12 gap-6">
          {/* Left Panel - HDR List */}
          <div className="col-span-6">
            <div className="rounded-lg" style={{ backgroundColor: listTheme.colors.card.background, padding: listTheme.card.padding }}>
              <h2 className="text-lg font-semibold mb-4">Configuration List</h2>
              
              {/* Search */}
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Search configurations..."
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* HDR Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b" style={{ backgroundColor: listTheme.colors.header.background }}>
                      <th className="px-4 py-2 text-left text-sm font-semibold">Vehicle</th>
                      <th className="px-4 py-2 text-left text-sm font-semibold">Transporter</th>
                      <th className="px-4 py-2 text-left text-sm font-semibold">Parameter</th>
                      <th className="px-4 py-2 text-left text-sm font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan="4" className="text-center py-8">
                          <div className="flex justify-center items-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                          </div>
                        </td>
                      </tr>
                    ) : hdrList.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="text-center py-8 text-gray-500">
                          No configurations found
                        </td>
                      </tr>
                    ) : (
                      hdrList.map(hdr => (
                        <tr
                          key={hdr.vehicle_config_hdr_id}
                          onClick={() => handleRowClick(hdr)}
                          className="border-b cursor-pointer hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-4 py-3 text-sm">
                            {hdr.vehicle_registration_number || hdr.vehicle_code || "-"}
                          </td>
                          <td className="px-4 py-3 text-sm">{hdr.transporter_name || "-"}</td>
                          <td className="px-4 py-3 text-sm">{hdr.parameter_name || "-"}</td>
                          <td className="px-4 py-3">
                            <span
                              className={`px-2 py-1 rounded text-xs font-medium ${
                                hdr.status === "active"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {hdr.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="mt-4 flex justify-between items-center">
                <span className="text-sm text-gray-600">
                  Page {pagination.currentPage} of {pagination.totalPages} ({pagination.totalRecords} total)
                </span>
                <div className="space-x-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(pagination.totalPages, p + 1))}
                    disabled={currentPage === pagination.totalPages}
                    className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Details */}
          <div className="col-span-6">
            <div className="rounded-lg" style={{ backgroundColor: listTheme.colors.card.background, padding: listTheme.card.padding }}>
              <h2 className="text-lg font-semibold mb-4">Configuration Details</h2>
              
              {selectedHdr ? (
                <div>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-600">Vehicle:</label>
                        <p className="text-sm mt-1">{selectedHdr.vehicle_registration_number || selectedHdr.vehicle_code || "-"}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Vehicle Type:</label>
                        <p className="text-sm mt-1">{selectedHdr.vehicle_type_description || "-"}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-600">Transporter:</label>
                        <p className="text-sm mt-1">{selectedHdr.transporter_name || "-"}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Consignor:</label>
                        <p className="text-sm mt-1">{selectedHdr.consignor_name || "-"}</p>
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <label className="text-sm font-medium text-gray-600">Parameter Name:</label>
                      <p className="text-sm mt-1 font-semibold">{selectedHdr.parameter_name || "-"}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-600">Minimum Value:</label>
                        <p className="text-sm mt-1">{selectedHdr.parameter_value_min || "-"}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Maximum Value:</label>
                        <p className="text-sm mt-1">{selectedHdr.parameter_value_max || "-"}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-600">Valid From:</label>
                        <p className="text-sm mt-1">
                          {selectedHdr.valid_from ? new Date(selectedHdr.valid_from).toLocaleDateString() : "-"}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Valid To:</label>
                        <p className="text-sm mt-1">
                          {selectedHdr.valid_to ? new Date(selectedHdr.valid_to).toLocaleDateString() : "-"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Alerts Section */}
                  <div className="mt-6 border-t pt-4">
                    <h3 className="text-md font-semibold mb-3">
                      Alert Configurations ({alerts.length})
                    </h3>
                    {alerts.length === 0 ? (
                      <p className="text-gray-500 text-sm">No alerts configured for this vehicle configuration</p>
                    ) : (
                      <div className="space-y-2">
                        {alerts.map(alert => (
                          <div
                            key={alert.transporter_alert_itm_id}
                            className="p-3 border rounded bg-gray-50"
                          >
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div>
                                <span className="font-medium text-gray-600">User:</span>{" "}
                                {alert.user_name || "-"}
                              </div>
                              <div>
                                <span className="font-medium text-gray-600">Alert Type:</span>{" "}
                                {alert.alert_type || "-"}
                              </div>
                              <div>
                                <span className="font-medium text-gray-600">Mobile:</span>{" "}
                                {alert.mobile_number || "-"}
                              </div>
                              <div>
                                <span className="font-medium text-gray-600">Email:</span>{" "}
                                {alert.email_id || "-"}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500">
                    Select a configuration from the list to view details
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default TransporterVehicleConfigPage;
