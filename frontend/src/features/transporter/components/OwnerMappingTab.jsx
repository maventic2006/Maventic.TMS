import React, { useState, useEffect } from "react";
import { Users } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchOwnerMappings,
  createOwnerMapping,
  updateOwnerMapping,
  deleteOwnerMapping,
  fetchMappingMasterData,
} from "../../../redux/slices/transporterSlice";
import { addToast } from "../../../redux/slices/uiSlice";
import { TOAST_TYPES } from "../../../utils/constants";
import ThemeTable from "../../../components/ui/ThemeTable";

const OwnerMappingTab = ({ transporterId }) => {
  const dispatch = useDispatch();
  const { ownerMappings, mappingMasterData, isFetchingMappings } = useSelector(
    (state) => state.transporter
  );

  const [mappings, setMappings] = useState([]);

  useEffect(() => {
    if (transporterId) {
      dispatch(fetchOwnerMappings(transporterId));
      dispatch(fetchMappingMasterData());
    }
  }, [transporterId, dispatch]);

  useEffect(() => {
    if (ownerMappings) {
      // Transform backend data to match table format
      const transformedMappings = ownerMappings.map((mapping) => ({
        ...mapping,
        owner_id: mapping.owner_id || "",
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
  }, [ownerMappings]);

  // Table column configuration
  const columns = [
    {
      key: "owner_id",
      label: "Owner",
      type: "select",
      options: mappingMasterData?.owners || [],
      placeholder: "Select Owner",
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
  ];

  const handleDataChange = (updatedMappings) => {
    setMappings(updatedMappings);
  };

  const handleAddMapping = () => {
    const newMapping = {
      owner_id: "",
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
      const updatedMappings = mappings.filter((_, i) => i !== index);
      setMappings(updatedMappings);
      return;
    }

    // If it's an existing mapping, delete from backend
    if (window.confirm("Are you sure you want to delete this mapping?")) {
      try {
        await dispatch(
          deleteOwnerMapping({
            transporterId,
            mappingId: mapping.to_mapping_id,
          })
        ).unwrap();
        dispatch(
          addToast({
            type: TOAST_TYPES.SUCCESS,
            message: "Owner mapping deleted successfully",
          })
        );
        dispatch(fetchOwnerMappings(transporterId));
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
      return !m.owner_id || !m.valid_from;
    });

    if (invalidMappings.length > 0) {
      dispatch(
        addToast({
          type: TOAST_TYPES.ERROR,
          message:
            "Please fill all required fields (Owner and Valid From) for all mappings",
        })
      );
      return;
    }

    try {
      // Save each mapping
      for (const mapping of mappings) {
        if (mapping.isNew) {
          await dispatch(
            createOwnerMapping({
              transporterId,
              mappingData: mapping,
            })
          ).unwrap();
        } else if (mapping.to_mapping_id) {
          await dispatch(
            updateOwnerMapping({
              transporterId,
              mappingId: mapping.to_mapping_id,
              mappingData: mapping,
            })
          ).unwrap();
        }
      }

      dispatch(
        addToast({
          type: TOAST_TYPES.SUCCESS,
          message: "Owner mappings saved successfully",
        })
      );
      dispatch(fetchOwnerMappings(transporterId));
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
        title="Transporter-Owner Mappings"
        titleIcon={Users}
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

export default OwnerMappingTab;
