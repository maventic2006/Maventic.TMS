import React, { useState, useEffect, useMemo } from "react";
import { Truck } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchVehicleMappings,
  createVehicleMapping,
  updateVehicleMapping,
  deleteVehicleMapping,
  fetchMappingMasterData,
} from "../../../redux/slices/driverSlice";
import { addToast } from "../../../redux/slices/uiSlice";
import { TOAST_TYPES } from "../../../utils/constants";
import ThemeTable from "../../../components/ui/ThemeTable";

const VehicleMappingTab = ({ driverId }) => {
  const dispatch = useDispatch();
  const { vehicleMappings, mappingMasterData, isFetchingMappings } =
    useSelector((state) => state.driver);

  const [mappings, setMappings] = useState([]);

  useEffect(() => {
    if (driverId) {
      dispatch(fetchVehicleMappings(driverId));
      dispatch(fetchMappingMasterData());
    }
  }, [driverId, dispatch]);

  useEffect(() => {
    if (vehicleMappings) {
      // Transform backend data to match table format
      const transformedMappings = vehicleMappings.map((mapping) => ({
        ...mapping,
        vehicle_id: mapping.vehicle_id || "",
        valid_from: mapping.valid_from
          ? new Date(mapping.valid_from).toISOString().split("T")[0]
          : "",
        valid_to: mapping.valid_to
          ? new Date(mapping.valid_to).toISOString().split("T")[0]
          : "",
        active_flag: mapping.active_flag ?? true,
        remark: mapping.remark || "",
      }));
      setMappings(transformedMappings);
    }
  }, [vehicleMappings]);

  // Table column configuration - use useMemo to ensure updates when mappingMasterData changes
  const columns = useMemo(
    () => [
      {
        key: "vehicle_id",
        label: "Vehicle",
        type: "select",
        options: mappingMasterData?.vehicles || [],
        placeholder: "Select Vehicle",
        searchable: true,
        width: "min-w-[250px]",
        required: true,
      },
      {
        key: "valid_from",
        label: "Valid From",
        type: "date",
        width: "min-w-[150px]",
        required: true,
      },
      {
        key: "valid_to",
        label: "Valid To",
        type: "date",
        width: "min-w-[150px]",
      },
      {
        key: "active_flag",
        label: "Active",
        type: "checkbox",
        width: "min-w-[100px]",
      },
      {
        key: "remark",
        label: "Remark",
        type: "textarea",
        placeholder: "Enter remarks...",
        width: "min-w-[200px]",
      },
    ],
    [mappingMasterData]
  );

  const handleDataChange = (updatedMappings) => {
    setMappings(updatedMappings);
  };

  const handleAddMapping = () => {
    const newMapping = {
      vehicle_id: "",
      valid_from: new Date().toISOString().split("T")[0],
      valid_to: "",
      active_flag: true,
      remark: "",
      isNew: true,
      tempId: Date.now(),
    };
    setMappings([...mappings, newMapping]);
  };

  const handleRemoveMapping = async (index) => {
    const mapping = mappings[index];

    // If it's a new unsaved mapping, just remove from state
    if (mapping.isNew) {
      const updated = [...mappings];
      updated.splice(index, 1);
      setMappings(updated);
      return;
    }

    // If it's an existing mapping, delete from backend
    if (window.confirm("Are you sure you want to delete this mapping?")) {
      try {
        await dispatch(
          deleteVehicleMapping({
            driverId,
            mappingId: mapping.vd_mapping_id,
          })
        ).unwrap();

        dispatch(
          addToast({
            type: TOAST_TYPES.SUCCESS,
            message: "Mapping deleted successfully",
          })
        );

        // Refresh the list
        dispatch(fetchVehicleMappings(driverId));
      } catch (error) {
        dispatch(
          addToast({
            type: TOAST_TYPES.ERROR,
            message: error.message || "Failed to delete mapping",
          })
        );
      }
    }
  };

  const handleSaveAll = async () => {
    // Validate that all required fields are filled
    const invalidMappings = mappings.filter((m) => {
      return !m.vehicle_id || !m.valid_from;
    });

    if (invalidMappings.length > 0) {
      dispatch(
        addToast({
          type: TOAST_TYPES.ERROR,
          message: "Please fill all required fields (Vehicle, Valid From)",
        })
      );
      return;
    }

    try {
      // Process new and existing mappings
      for (const mapping of mappings) {
        const mappingData = {
          vehicle_id: mapping.vehicle_id,
          valid_from: mapping.valid_from,
          valid_to: mapping.valid_to || null,
          active_flag: mapping.active_flag,
          remark: mapping.remark,
        };

        if (mapping.isNew) {
          // Create new mapping
          await dispatch(
            createVehicleMapping({ driverId, mappingData })
          ).unwrap();
        } else {
          // Update existing mapping
          await dispatch(
            updateVehicleMapping({
              driverId,
              mappingId: mapping.vd_mapping_id,
              mappingData,
            })
          ).unwrap();
        }
      }

      dispatch(
        addToast({
          type: TOAST_TYPES.SUCCESS,
          message: "Mappings saved successfully",
        })
      );

      // Refresh the list
      dispatch(fetchVehicleMappings(driverId));
    } catch (error) {
      dispatch(
        addToast({
          type: TOAST_TYPES.ERROR,
          message: error.message || "Failed to save mappings",
        })
      );
    }
  };

  if (isFetchingMappings) {
    return (
      <div className="p-6 text-center text-gray-500">Loading mappings...</div>
    );
  }

  return (
    <div className="bg-[#F5F7FA]">
      <ThemeTable
        title="Driver-Vehicle Mappings"
        titleIcon={Truck}
        data={mappings}
        columns={columns}
        onDataChange={handleDataChange}
        onAddRow={handleAddMapping}
        onRemoveRow={handleRemoveMapping}
        hasRowSelection={false}
        canRemoveRows={true}
        canAddRows={true}
        className="w-full"
      />

      {mappings.length > 0 && (
        <div className="mt-4 flex justify-end">
          <button
            onClick={handleSaveAll}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Save All Changes
          </button>
        </div>
      )}
    </div>
  );
};

export default VehicleMappingTab;
