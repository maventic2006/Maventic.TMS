import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import TMSHeader from "../../components/layout/TMSHeader";
import { getPageTheme } from "../../theme.config";
import { Plus, Edit2, Trash2 } from "lucide-react";
import ConfigurationFormModal from "./ConfigurationFormModal";
import AlertFormModal from "./AlertFormModal";
import {
  fetchHdrList,
  fetchHdrById,
  fetchVehicleTypes,
  fetchParameters,
  fetchVehicles,
  fetchTransporters,
  fetchConsignors,
  fetchUsers,
  setSelectedHdr,
  clearSelectedHdr,
  updateHdrStatus,
  updateAlertStatus,
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
    loading,
  } = useSelector((state) => state.transporterVehicleConfig);

  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [editingAlert, setEditingAlert] = useState(null);
  const [deletingAlert, setDeletingAlert] = useState(null);

  useEffect(() => {
    dispatch(
      fetchHdrList({ page: currentPage, limit: 10, search: searchTerm })
    );
    dispatch(fetchVehicleTypes());
    dispatch(fetchParameters());
    dispatch(fetchVehicles(""));
    dispatch(fetchTransporters(""));
    dispatch(fetchConsignors(""));
    dispatch(fetchUsers(""));
  }, [dispatch, currentPage, searchTerm]);

  const handleRowClick = (hdr) => {
    dispatch(fetchHdrById(hdr.vehicle_config_hdr_id));
  };

  const handleAddNew = () => {
    setEditingConfig(null);
    setIsModalOpen(true);
  };

  const handleEdit = () => {
    if (selectedHdr) {
      setEditingConfig(selectedHdr);
      setIsModalOpen(true);
    }
  };

  const handleDelete = async () => {
    if (selectedHdr) {
      try {
        await dispatch(
          updateHdrStatus({
            id: selectedHdr.vehicle_config_hdr_id,
            status: "inactive",
          })
        ).unwrap();

        // Refresh list and clear selection
        dispatch(
          fetchHdrList({ page: currentPage, limit: 10, search: searchTerm })
        );
        dispatch(clearSelectedHdr());
        setShowDeleteConfirm(false);
      } catch (error) {
        console.error("Delete error:", error);
      }
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingConfig(null);
  };

  const handleAddAlert = () => {
    setEditingAlert(null);
    setIsAlertModalOpen(true);
  };

  const handleEditAlert = (alert) => {
    setEditingAlert(alert);
    setIsAlertModalOpen(true);
  };

  const handleDeleteAlert = async () => {
    if (deletingAlert) {
      try {
        await dispatch(
          updateAlertStatus({
            hdrId: selectedHdr.vehicle_config_hdr_id,
            alertId: deletingAlert.transporter_alert_itm_id,
            status: "inactive",
          })
        ).unwrap();

        // Refresh details
        dispatch(fetchHdrById(selectedHdr.vehicle_config_hdr_id));
        setDeletingAlert(null);
      } catch (error) {
        console.error("Delete alert error:", error);
      }
    }
  };

  const handleAlertModalClose = () => {
    setIsAlertModalOpen(false);
    setEditingAlert(null);
  };

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: listTheme.colors.primary.background }}
    >
      <TMSHeader theme={listTheme} />
      <div className="p-6">
        {/* Header with Add Button */}
        <div className="flex items-center justify-between mb-6">
          <h1
            className="text-2xl font-bold"
            style={{ color: listTheme.colors.text.primary }}
          >
            Transporter Config - Transporter Vehicle Configured Data
          </h1>
          <button
            type="button"
            onClick={handleAddNew}
            className="flex items-center gap-2 px-4 py-2 rounded font-medium transition-opacity hover:opacity-90"
            style={{
              backgroundColor: listTheme.colors.button.primary.background,
              color: listTheme.colors.button.primary.text,
            }}
          >
            <Plus size={20} />
            Add Configuration
          </button>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Left Panel - HDR List */}
          <div className="col-span-6">
            <div
              className="rounded-lg"
              style={{
                backgroundColor: listTheme.colors.card.background,
                padding: listTheme.layout.card.padding,
                borderRadius: listTheme.layout.card.borderRadius,
              }}
            >
              <h2
                className="text-lg font-semibold mb-4"
                style={{ color: listTheme.colors.text.primary }}
              >
                Configuration List
              </h2>

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
                    <tr
                      className="border-b"
                      style={{
                        backgroundColor: listTheme.colors.header.background,
                        color: listTheme.colors.header.text,
                      }}
                    >
                      <th className="px-4 py-2 text-left text-sm font-semibold">
                        Vehicle
                      </th>
                      <th className="px-4 py-2 text-left text-sm font-semibold">
                        Transporter
                      </th>
                      <th className="px-4 py-2 text-left text-sm font-semibold">
                        Parameter
                      </th>
                      <th className="px-4 py-2 text-left text-sm font-semibold">
                        Status
                      </th>
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
                        <td
                          colSpan="4"
                          className="text-center py-8"
                          style={{ color: listTheme.colors.text.secondary }}
                        >
                          No configurations found
                        </td>
                      </tr>
                    ) : (
                      hdrList.map((hdr) => (
                        <tr
                          key={hdr.vehicle_config_hdr_id}
                          onClick={() => handleRowClick(hdr)}
                          className="border-b cursor-pointer transition-colors"
                          style={{
                            backgroundColor:
                              selectedHdr?.vehicle_config_hdr_id ===
                              hdr.vehicle_config_hdr_id
                                ? listTheme.colors.table.row.hover
                                : "transparent",
                          }}
                          onMouseEnter={(e) => {
                            if (
                              selectedHdr?.vehicle_config_hdr_id !==
                              hdr.vehicle_config_hdr_id
                            ) {
                              e.currentTarget.style.backgroundColor =
                                listTheme.colors.table.row.hover;
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (
                              selectedHdr?.vehicle_config_hdr_id !==
                              hdr.vehicle_config_hdr_id
                            ) {
                              e.currentTarget.style.backgroundColor =
                                "transparent";
                            }
                          }}
                        >
                          <td
                            className="px-4 py-3 text-sm"
                            style={{ color: listTheme.colors.text.primary }}
                          >
                            {hdr.vehicle_registration_number ||
                              hdr.vehicle_code ||
                              "-"}
                          </td>
                          <td
                            className="px-4 py-3 text-sm"
                            style={{ color: listTheme.colors.text.primary }}
                          >
                            {hdr.transporter_name || "-"}
                          </td>
                          <td
                            className="px-4 py-3 text-sm"
                            style={{ color: listTheme.colors.text.primary }}
                          >
                            {hdr.parameter_name || "-"}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className="px-2 py-1 rounded text-xs font-medium"
                              style={{
                                backgroundColor:
                                  hdr.status?.toLowerCase() === "active"
                                    ? listTheme.colors.status.success.background
                                    : listTheme.colors.status.pending
                                        .background,
                                color:
                                  hdr.status?.toLowerCase() === "active"
                                    ? listTheme.colors.status.success.text
                                    : listTheme.colors.status.pending.text,
                              }}
                            >
                              {hdr.status || "inactive"}
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
                <span
                  className="text-sm"
                  style={{ color: listTheme.colors.text.secondary }}
                >
                  Page {pagination.currentPage} of {pagination.totalPages} (
                  {pagination.totalRecords} total)
                </span>
                <div className="space-x-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    style={{
                      backgroundColor:
                        listTheme.colors.button.secondary.background,
                      borderColor: listTheme.colors.button.secondary.border,
                      color: listTheme.colors.button.secondary.text,
                    }}
                    onMouseEnter={(e) => {
                      if (currentPage !== 1) {
                        e.currentTarget.style.backgroundColor = "#F9FAFB";
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor =
                        listTheme.colors.button.secondary.background;
                    }}
                  >
                    Previous
                  </button>
                  <button
                    onClick={() =>
                      setCurrentPage((p) =>
                        Math.min(pagination.totalPages, p + 1)
                      )
                    }
                    disabled={currentPage === pagination.totalPages}
                    className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    style={{
                      backgroundColor:
                        listTheme.colors.button.secondary.background,
                      borderColor: listTheme.colors.button.secondary.border,
                      color: listTheme.colors.button.secondary.text,
                    }}
                    onMouseEnter={(e) => {
                      if (currentPage !== pagination.totalPages) {
                        e.currentTarget.style.backgroundColor = "#F9FAFB";
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor =
                        listTheme.colors.button.secondary.background;
                    }}
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Details */}
          <div className="col-span-6">
            <div
              className="rounded-lg"
              style={{
                backgroundColor: listTheme.colors.card.background,
                padding: listTheme.layout.card.padding,
                borderRadius: listTheme.layout.card.borderRadius,
              }}
            >
              {/* Details Header with Action Buttons */}
              <div className="flex items-center justify-between mb-4">
                <h2
                  className="text-lg font-semibold"
                  style={{ color: listTheme.colors.text.primary }}
                >
                  Configuration Details
                </h2>
                {selectedHdr && (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleEdit}
                      className="flex items-center gap-1 px-3 py-1.5 rounded text-sm font-medium transition-opacity hover:opacity-90"
                      style={{
                        backgroundColor:
                          listTheme.colors.button.primary.background,
                        color: listTheme.colors.button.primary.text,
                      }}
                    >
                      <Edit2 size={16} />
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(true)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded text-sm font-medium transition-opacity hover:opacity-90"
                      style={{
                        backgroundColor:
                          listTheme.colors.status.error.background,
                        color: listTheme.colors.status.error.text,
                        border: `1px solid ${listTheme.colors.status.error.border}`,
                      }}
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  </div>
                )}
              </div>

              {selectedHdr ? (
                <div>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label
                          className="text-sm font-medium"
                          style={{ color: listTheme.colors.text.secondary }}
                        >
                          Vehicle:
                        </label>
                        <p
                          className="text-sm mt-1"
                          style={{ color: listTheme.colors.text.primary }}
                        >
                          {selectedHdr.vehicle_registration_number ||
                            selectedHdr.vehicle_code ||
                            "-"}
                        </p>
                      </div>
                      <div>
                        <label
                          className="text-sm font-medium"
                          style={{ color: listTheme.colors.text.secondary }}
                        >
                          Vehicle Type:
                        </label>
                        <p
                          className="text-sm mt-1"
                          style={{ color: listTheme.colors.text.primary }}
                        >
                          {selectedHdr.vehicle_type_description || "-"}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label
                          className="text-sm font-medium"
                          style={{ color: listTheme.colors.text.secondary }}
                        >
                          Transporter:
                        </label>
                        <p
                          className="text-sm mt-1"
                          style={{ color: listTheme.colors.text.primary }}
                        >
                          {selectedHdr.transporter_name || "-"}
                        </p>
                      </div>
                      <div>
                        <label
                          className="text-sm font-medium"
                          style={{ color: listTheme.colors.text.secondary }}
                        >
                          Consignor:
                        </label>
                        <p
                          className="text-sm mt-1"
                          style={{ color: listTheme.colors.text.primary }}
                        >
                          {selectedHdr.consignor_name || "-"}
                        </p>
                      </div>
                    </div>

                    <div
                      className="border-t pt-4"
                      style={{ borderColor: listTheme.colors.card.border }}
                    >
                      <label
                        className="text-sm font-medium"
                        style={{ color: listTheme.colors.text.secondary }}
                      >
                        Parameter Name:
                      </label>
                      <p
                        className="text-sm mt-1 font-semibold"
                        style={{ color: listTheme.colors.text.primary }}
                      >
                        {selectedHdr.parameter_name || "-"}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label
                          className="text-sm font-medium"
                          style={{ color: listTheme.colors.text.secondary }}
                        >
                          Minimum Value:
                        </label>
                        <p
                          className="text-sm mt-1"
                          style={{ color: listTheme.colors.text.primary }}
                        >
                          {selectedHdr.parameter_value_min || "-"}
                        </p>
                      </div>
                      <div>
                        <label
                          className="text-sm font-medium"
                          style={{ color: listTheme.colors.text.secondary }}
                        >
                          Maximum Value:
                        </label>
                        <p
                          className="text-sm mt-1"
                          style={{ color: listTheme.colors.text.primary }}
                        >
                          {selectedHdr.parameter_value_max || "-"}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label
                          className="text-sm font-medium"
                          style={{ color: listTheme.colors.text.secondary }}
                        >
                          Valid From:
                        </label>
                        <p
                          className="text-sm mt-1"
                          style={{ color: listTheme.colors.text.primary }}
                        >
                          {selectedHdr.valid_from
                            ? new Date(
                                selectedHdr.valid_from
                              ).toLocaleDateString()
                            : "-"}
                        </p>
                      </div>
                      <div>
                        <label
                          className="text-sm font-medium"
                          style={{ color: listTheme.colors.text.secondary }}
                        >
                          Valid To:
                        </label>
                        <p
                          className="text-sm mt-1"
                          style={{ color: listTheme.colors.text.primary }}
                        >
                          {selectedHdr.valid_to
                            ? new Date(
                                selectedHdr.valid_to
                              ).toLocaleDateString()
                            : "-"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Alerts Section */}
                  <div
                    className="mt-6 border-t pt-4"
                    style={{ borderColor: listTheme.colors.card.border }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3
                        className="text-md font-semibold"
                        style={{ color: listTheme.colors.text.primary }}
                      >
                        Alert Configurations ({alerts?.length || 0})
                      </h3>
                      <button
                        type="button"
                        onClick={handleAddAlert}
                        className="flex items-center gap-1 px-3 py-1 rounded text-sm font-medium transition-opacity hover:opacity-90"
                        style={{
                          backgroundColor:
                            listTheme.colors.button.primary.background,
                          color: listTheme.colors.button.primary.text,
                        }}
                      >
                        <Plus size={14} />
                        Add Alert
                      </button>
                    </div>
                    {!alerts || alerts.length === 0 ? (
                      <p
                        className="text-sm"
                        style={{ color: listTheme.colors.text.secondary }}
                      >
                        No alerts configured for this vehicle configuration
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {alerts.map((alert) => (
                          <div
                            key={alert.transporter_alert_itm_id}
                            className="p-3 border rounded"
                            style={{
                              backgroundColor: listTheme.colors.card.background,
                              borderColor: listTheme.colors.card.border,
                            }}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <span
                                className="px-2 py-1 rounded text-xs font-medium"
                                style={{
                                  backgroundColor:
                                    alert.status?.toLowerCase() === "active"
                                      ? listTheme.colors.status.success
                                          .background
                                      : listTheme.colors.status.pending
                                          .background,
                                  color:
                                    alert.status?.toLowerCase() === "active"
                                      ? listTheme.colors.status.success.text
                                      : listTheme.colors.status.pending.text,
                                }}
                              >
                                {alert.alert_type}
                              </span>
                              <div className="flex gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleEditAlert(alert)}
                                  className="p-1 rounded hover:bg-opacity-10"
                                  style={{
                                    color:
                                      listTheme.colors.button.primary
                                        .background,
                                  }}
                                >
                                  <Edit2 size={14} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setDeletingAlert(alert)}
                                  className="p-1 rounded hover:bg-opacity-10"
                                  style={{
                                    color: listTheme.colors.status.error.text,
                                  }}
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div>
                                <span
                                  className="font-medium"
                                  style={{
                                    color: listTheme.colors.text.secondary,
                                  }}
                                >
                                  User:
                                </span>{" "}
                                <span
                                  style={{
                                    color: listTheme.colors.text.primary,
                                  }}
                                >
                                  {alert.user_name || "-"}
                                </span>
                              </div>
                              <div>
                                <span
                                  className="font-medium"
                                  style={{
                                    color: listTheme.colors.text.secondary,
                                  }}
                                >
                                  Alert Type:
                                </span>{" "}
                                <span
                                  style={{
                                    color: listTheme.colors.text.primary,
                                  }}
                                >
                                  {alert.alert_type || "-"}
                                </span>
                              </div>
                              <div>
                                <span
                                  className="font-medium"
                                  style={{
                                    color: listTheme.colors.text.secondary,
                                  }}
                                >
                                  Mobile:
                                </span>{" "}
                                <span
                                  style={{
                                    color: listTheme.colors.text.primary,
                                  }}
                                >
                                  {alert.mobile_number || "-"}
                                </span>
                              </div>
                              <div>
                                <span
                                  className="font-medium"
                                  style={{
                                    color: listTheme.colors.text.secondary,
                                  }}
                                >
                                  Email:
                                </span>{" "}
                                <span
                                  style={{
                                    color: listTheme.colors.text.primary,
                                  }}
                                >
                                  {alert.email_id || "-"}
                                </span>
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
                  <p style={{ color: listTheme.colors.text.secondary }}>
                    Select a configuration from the list to view details
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Configuration Form Modal */}
        <ConfigurationFormModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          editData={editingConfig}
        />

        {/* Alert Form Modal */}
        {selectedHdr && (
          <AlertFormModal
            isOpen={isAlertModalOpen}
            onClose={handleAlertModalClose}
            hdrId={selectedHdr.vehicle_config_hdr_id}
            editData={editingAlert}
          />
        )}

        {/* Delete Configuration Confirmation Dialog */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div
              className="rounded-lg p-6 max-w-md w-full"
              style={{
                backgroundColor: listTheme.colors.card.background,
              }}
            >
              <h3
                className="text-lg font-bold mb-4"
                style={{ color: listTheme.colors.text.primary }}
              >
                Confirm Delete
              </h3>
              <p
                className="mb-6"
                style={{ color: listTheme.colors.text.secondary }}
              >
                Are you sure you want to delete this configuration? This will
                mark it as inactive.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 rounded font-medium"
                  style={{
                    backgroundColor:
                      listTheme.colors.button.secondary.background,
                    borderColor: listTheme.colors.button.secondary.border,
                    color: listTheme.colors.button.secondary.text,
                    border: `1px solid ${listTheme.colors.button.secondary.border}`,
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="px-4 py-2 rounded font-medium"
                  style={{
                    backgroundColor: listTheme.colors.status.error.background,
                    color: listTheme.colors.status.error.text,
                    border: `1px solid ${listTheme.colors.status.error.border}`,
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Alert Confirmation Dialog */}
        {deletingAlert && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div
              className="rounded-lg p-6 max-w-md w-full"
              style={{
                backgroundColor: listTheme.colors.card.background,
              }}
            >
              <h3
                className="text-lg font-bold mb-4"
                style={{ color: listTheme.colors.text.primary }}
              >
                Confirm Delete Alert
              </h3>
              <p
                className="mb-6"
                style={{ color: listTheme.colors.text.secondary }}
              >
                Are you sure you want to delete this alert configuration?
              </p>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setDeletingAlert(null)}
                  className="px-4 py-2 rounded font-medium"
                  style={{
                    backgroundColor:
                      listTheme.colors.button.secondary.background,
                    borderColor: listTheme.colors.button.secondary.border,
                    color: listTheme.colors.button.secondary.text,
                    border: `1px solid ${listTheme.colors.button.secondary.border}`,
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteAlert}
                  className="px-4 py-2 rounded font-medium"
                  style={{
                    backgroundColor: listTheme.colors.status.error.background,
                    color: listTheme.colors.status.error.text,
                    border: `1px solid ${listTheme.colors.status.error.border}`,
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransporterVehicleConfigPage;
