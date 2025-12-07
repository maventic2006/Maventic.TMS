import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { X } from "lucide-react";
import { getPageTheme } from "../../theme.config";
import { CustomSelect } from "../../components/ui/Select";
import {
  createHdr,
  updateHdr,
  fetchHdrList,
} from "../../redux/slices/transporterVehicleConfigSlice";

const ConfigurationFormModal = ({ isOpen, onClose, editData = null }) => {
  const dispatch = useDispatch();
  const theme = getPageTheme("general");

  const {
    vehicles,
    transporters,
    consignors,
    vehicleTypes,
    parameters,
    loading,
  } = useSelector((state) => state.transporterVehicleConfig);

  const [formData, setFormData] = useState({
    vehicle_id_code: "",
    transporter_id: "",
    consignor_id: "",
    vehicle_type_id: "",
    tv_config_parameter_name_id: "",
    parameter_value_min: "",
    parameter_value_max: "",
    valid_from: "",
    valid_to: "",
    status: "active",
  });

  const [errors, setErrors] = useState({});
  const [selectedParameter, setSelectedParameter] = useState(null);

  useEffect(() => {
    if (editData) {
      setFormData({
        vehicle_id_code: editData.vehicle_id_code || "",
        transporter_id: editData.transporter_id || "",
        consignor_id: editData.consignor_id || "",
        vehicle_type_id: editData.vehicle_type_id || "",
        tv_config_parameter_name_id: editData.tv_config_parameter_name_id || "",
        parameter_value_min: editData.parameter_value_min || "",
        parameter_value_max: editData.parameter_value_max || "",
        valid_from: editData.valid_from
          ? new Date(editData.valid_from).toISOString().split("T")[0]
          : "",
        valid_to: editData.valid_to
          ? new Date(editData.valid_to).toISOString().split("T")[0]
          : "",
        status: editData.status || "active",
      });
    } else {
      setFormData({
        vehicle_id_code: "",
        transporter_id: "",
        consignor_id: "",
        vehicle_type_id: "",
        tv_config_parameter_name_id: "",
        parameter_value_min: "",
        parameter_value_max: "",
        valid_from: "",
        valid_to: "",
        status: "active",
      });
    }
    setErrors({});
  }, [editData, isOpen]);

  useEffect(() => {
    if (formData.tv_config_parameter_name_id) {
      const param = parameters?.find(
        (p) =>
          p.tv_config_parameter_name_id === formData.tv_config_parameter_name_id
      );
      setSelectedParameter(param || null);
    } else {
      setSelectedParameter(null);
    }
  }, [formData.tv_config_parameter_name_id, parameters]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.vehicle_id_code)
      newErrors.vehicle_id_code = "Vehicle is required";
    if (!formData.transporter_id)
      newErrors.transporter_id = "Transporter is required";
    if (!formData.tv_config_parameter_name_id)
      newErrors.tv_config_parameter_name_id = "Parameter is required";

    if (selectedParameter) {
      if (
        selectedParameter.is_minimum_required &&
        !formData.parameter_value_min
      ) {
        newErrors.parameter_value_min =
          "Minimum value is required for this parameter";
      }
      if (
        selectedParameter.is_maximum_required &&
        !formData.parameter_value_max
      ) {
        newErrors.parameter_value_max =
          "Maximum value is required for this parameter";
      }
    }

    if (formData.valid_from && formData.valid_to) {
      if (new Date(formData.valid_from) > new Date(formData.valid_to)) {
        newErrors.valid_to =
          "Valid To must be greater than or equal to Valid From";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      if (editData) {
        await dispatch(
          updateHdr({
            id: editData.vehicle_config_hdr_id,
            data: formData,
          })
        ).unwrap();
      } else {
        await dispatch(createHdr(formData)).unwrap();
      }

      // Refresh the list
      dispatch(fetchHdrList({ page: 1, limit: 10, search: "" }));

      onClose();
    } catch (error) {
      console.error("Form submission error:", error);
      setErrors({ submit: error || "Failed to save configuration" });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div
        className="rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        style={{
          backgroundColor: theme.colors.card.background,
          padding: theme.layout.card.padding,
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2
            className="text-xl font-bold"
            style={{ color: theme.colors.text.primary }}
          >
            {editData ? "Edit Configuration" : "Add New Configuration"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-opacity-10"
            style={{
              color: theme.colors.text.secondary,
              backgroundColor: "transparent",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = `${theme.colors.text.secondary}20`)
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "transparent")
            }
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Vehicle Selection */}
            <div>
              <label
                className="block text-sm font-medium mb-1"
                style={{ color: theme.colors.text.secondary }}
              >
                Vehicle <span className="text-red-500">*</span>
              </label>
              <CustomSelect
                value={formData.vehicle_id_code}
                onValueChange={(value) => {
                  setFormData((prev) => ({ ...prev, vehicle_id_code: value }));
                  if (errors.vehicle_id_code) {
                    setErrors((prev) => ({ ...prev, vehicle_id_code: null }));
                  }
                }}
                options={vehicles || []}
                placeholder="Select Vehicle"
                getOptionLabel={(option) =>
                  option.vehicle_registration_number ||
                  option.vehicle_id ||
                  "Unknown"
                }
                getOptionValue={(option) => option.vehicle_id}
                className="w-full text-sm"
                error={errors.vehicle_id_code}
              />
              {errors.vehicle_id_code && (
                <p
                  className="text-xs mt-1"
                  style={{ color: theme.colors.status.error.text }}
                >
                  {errors.vehicle_id_code}
                </p>
              )}
            </div>

            {/* Transporter Selection */}
            <div>
              <label
                className="block text-sm font-medium mb-1"
                style={{ color: theme.colors.text.secondary }}
              >
                Transporter <span className="text-red-500">*</span>
              </label>
              <CustomSelect
                value={formData.transporter_id}
                onValueChange={(value) => {
                  setFormData((prev) => ({ ...prev, transporter_id: value }));
                  if (errors.transporter_id) {
                    setErrors((prev) => ({ ...prev, transporter_id: null }));
                  }
                }}
                options={transporters || []}
                placeholder="Select Transporter"
                getOptionLabel={(option) => option.business_name || "Unknown"}
                getOptionValue={(option) => option.transporter_id}
                className="w-full text-sm"
                error={errors.transporter_id}
              />
              {errors.transporter_id && (
                <p
                  className="text-xs mt-1"
                  style={{ color: theme.colors.status.error.text }}
                >
                  {errors.transporter_id}
                </p>
              )}
            </div>

            {/* Consignor Selection (Optional) */}
            <div>
              <label
                className="block text-sm font-medium mb-1"
                style={{ color: theme.colors.text.secondary }}
              >
                Consignor
              </label>
              <CustomSelect
                value={formData.consignor_id}
                onValueChange={(value) => {
                  setFormData((prev) => ({ ...prev, consignor_id: value }));
                }}
                options={consignors || []}
                placeholder="Select Consignor (Optional)"
                getOptionLabel={(option) => option.customer_name || "Unknown"}
                getOptionValue={(option) => option.consignor_id}
                className="w-full text-sm"
              />
            </div>

            {/* Vehicle Type Selection (Optional) */}
            <div>
              <label
                className="block text-sm font-medium mb-1"
                style={{ color: theme.colors.text.secondary }}
              >
                Vehicle Type
              </label>
              <CustomSelect
                value={formData.vehicle_type_id}
                onValueChange={(value) => {
                  setFormData((prev) => ({ ...prev, vehicle_type_id: value }));
                }}
                options={vehicleTypes || []}
                placeholder="Select Vehicle Type (Optional)"
                getOptionLabel={(option) =>
                  option.vehicle_type_description || "Unknown"
                }
                getOptionValue={(option) => option.vehicle_type_id}
                className="w-full text-sm"
              />
            </div>

            {/* Parameter Selection */}
            <div>
              <label
                className="block text-sm font-medium mb-1"
                style={{ color: theme.colors.text.secondary }}
              >
                Parameter <span className="text-red-500">*</span>
              </label>
              <CustomSelect
                value={formData.tv_config_parameter_name_id}
                onValueChange={(value) => {
                  setFormData((prev) => ({
                    ...prev,
                    tv_config_parameter_name_id: value,
                  }));
                  if (errors.tv_config_parameter_name_id) {
                    setErrors((prev) => ({
                      ...prev,
                      tv_config_parameter_name_id: null,
                    }));
                  }
                }}
                options={parameters || []}
                placeholder="Select Parameter"
                getOptionLabel={(option) => option.parameter_name || "Unknown"}
                getOptionValue={(option) => option.tv_config_parameter_name_id}
                className="w-full text-sm"
                error={errors.tv_config_parameter_name_id}
              />
              {errors.tv_config_parameter_name_id && (
                <p
                  className="text-xs mt-1"
                  style={{ color: theme.colors.status.error.text }}
                >
                  {errors.tv_config_parameter_name_id}
                </p>
              )}
            </div>

            {/* Parameter Values */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  className="block text-sm font-medium mb-1"
                  style={{ color: theme.colors.text.secondary }}
                >
                  Minimum Value{" "}
                  {selectedParameter?.is_minimum_required && (
                    <span className="text-red-500">*</span>
                  )}
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="parameter_value_min"
                  value={formData.parameter_value_min}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2"
                  style={{
                    borderColor: errors.parameter_value_min
                      ? theme.colors.status.error.border
                      : theme.colors.input.border.default,
                    backgroundColor: theme.colors.input.background,
                  }}
                  placeholder="Enter minimum value"
                />
                {errors.parameter_value_min && (
                  <p
                    className="text-xs mt-1"
                    style={{ color: theme.colors.status.error.text }}
                  >
                    {errors.parameter_value_min}
                  </p>
                )}
              </div>

              <div>
                <label
                  className="block text-sm font-medium mb-1"
                  style={{ color: theme.colors.text.secondary }}
                >
                  Maximum Value{" "}
                  {selectedParameter?.is_maximum_required && (
                    <span className="text-red-500">*</span>
                  )}
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="parameter_value_max"
                  value={formData.parameter_value_max}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2"
                  style={{
                    borderColor: errors.parameter_value_max
                      ? theme.colors.status.error.border
                      : theme.colors.input.border.default,
                    backgroundColor: theme.colors.input.background,
                  }}
                  placeholder="Enter maximum value"
                />
                {errors.parameter_value_max && (
                  <p
                    className="text-xs mt-1"
                    style={{ color: theme.colors.status.error.text }}
                  >
                    {errors.parameter_value_max}
                  </p>
                )}
              </div>
            </div>

            {/* Validity Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  className="block text-sm font-medium mb-1"
                  style={{ color: theme.colors.text.secondary }}
                >
                  Valid From
                </label>
                <input
                  type="date"
                  name="valid_from"
                  value={formData.valid_from}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2"
                  style={{
                    borderColor: theme.colors.input.border.default,
                    backgroundColor: theme.colors.input.background,
                  }}
                />
              </div>

              <div>
                <label
                  className="block text-sm font-medium mb-1"
                  style={{ color: theme.colors.text.secondary }}
                >
                  Valid To
                </label>
                <input
                  type="date"
                  name="valid_to"
                  value={formData.valid_to}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2"
                  style={{
                    borderColor: errors.valid_to
                      ? theme.colors.status.error.border
                      : theme.colors.input.border.default,
                    backgroundColor: theme.colors.input.background,
                  }}
                />
                {errors.valid_to && (
                  <p
                    className="text-xs mt-1"
                    style={{ color: theme.colors.status.error.text }}
                  >
                    {errors.valid_to}
                  </p>
                )}
              </div>
            </div>

            {/* Status */}
            <div>
              <label
                className="block text-sm font-medium mb-1"
                style={{ color: theme.colors.text.secondary }}
              >
                Status
              </label>
              <CustomSelect
                value={formData.status}
                onValueChange={(value) => {
                  setFormData((prev) => ({ ...prev, status: value }));
                }}
                options={[
                  { label: "Active", value: "active" },
                  { label: "Inactive", value: "inactive" },
                ]}
                placeholder="Select Status"
                getOptionLabel={(option) => option.label}
                getOptionValue={(option) => option.value}
                className="w-full text-sm"
              />
            </div>

            {/* Submit Error */}
            {errors.submit && (
              <div
                className="p-3 rounded text-sm"
                style={{
                  backgroundColor: theme.colors.status.error.background,
                  color: theme.colors.status.error.text,
                }}
              >
                {errors.submit}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded font-medium"
              style={{
                backgroundColor: theme.colors.button.secondary.background,
                borderColor: theme.colors.button.secondary.border,
                color: theme.colors.button.secondary.text,
                border: `1px solid ${theme.colors.button.secondary.border}`,
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded font-medium"
              style={{
                backgroundColor: theme.colors.button.primary.background,
                color: theme.colors.button.primary.text,
                opacity: loading ? 0.6 : 1,
              }}
            >
              {loading ? "Saving..." : editData ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ConfigurationFormModal;
