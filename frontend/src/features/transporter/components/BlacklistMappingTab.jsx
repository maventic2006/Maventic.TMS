import React, { useState, useEffect } from "react";
import { Ban } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchBlacklistMappings,
  createBlacklistMapping,
  updateBlacklistMapping,
  deleteBlacklistMapping,
  fetchMappingMasterData,
} from "../../../redux/slices/transporterSlice";
import { addToast } from "../../../redux/slices/uiSlice";
import { TOAST_TYPES } from "../../../utils/constants";
import ThemeTable from "../../../components/ui/ThemeTable";

const BlacklistMappingTab = ({ transporterId }) => {
  const dispatch = useDispatch();
  const { blacklistMappings, mappingMasterData, isFetchingMappings } =
    useSelector((state) => state.transporter);

  const [mappings, setMappings] = useState([]);

  useEffect(() => {
    if (transporterId) {
      dispatch(fetchBlacklistMappings(transporterId));
      dispatch(fetchMappingMasterData());
    }
  }, [transporterId, dispatch]);

  useEffect(() => {
    if (blacklistMappings) {
      // Transform backend data to match table format
      const transformedMappings = blacklistMappings.map((mapping) => ({
        ...mapping,
        user_type: mapping.user_type || "",
        user_id: mapping.user_id || "",
        valid_from: mapping.valid_from
          ? new Date(mapping.valid_from).toISOString().split("T")[0]
          : "",
        valid_to: mapping.valid_to
          ? new Date(mapping.valid_to).toISOString().split("T")[0]
          : "",
        remark: mapping.remark || "",
      }));
      setMappings(transformedMappings);
    }
  }, [blacklistMappings]);

  // Get filtered users based on user type
  const getFilteredUsers = (userType) => {
    if (userType === "vehicle") return mappingMasterData?.vehicles || [];
    if (userType === "driver") return mappingMasterData?.drivers || [];
    return [];
  };

  // Table column configuration
  const columns = [
    {
      key: "user_type",
      label: "User Type",
      type: "select",
      options: mappingMasterData?.userTypes || [],
      placeholder: "Select Type",
      width: "min-w-[200px]",
      required: true,
    },
    {
      key: "user_id",
      label: "User ID",
      type: "select",
      options: [], // Will be dynamically updated based on user_type
      placeholder: "Select User",
      searchable: true,
      width: "min-w-[250px]",
      required: true,
      // Custom options getter based on row data
      getDynamicOptions: (rowData) => getFilteredUsers(rowData?.user_type),
      getDisabled: (rowData) => !rowData?.user_type,
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
      key: "remark",
      label: "Reason",
      type: "textarea",
      placeholder: "Enter blacklist reason...",
      width: "min-w-[250px]",
      required: true,
    },
  ];

  const handleDataChange = (updatedMappings) => {
    // When user_type changes, clear user_id
    const sanitizedMappings = updatedMappings.map((mapping, index) => {
      const oldMapping = mappings[index];
      if (oldMapping && mapping.user_type !== oldMapping.user_type) {
        return { ...mapping, user_id: "" };
      }
      return mapping;
    });
    setMappings(sanitizedMappings);
  };

  const handleAddMapping = () => {
    const newMapping = {
      user_type: "",
      user_id: "",
      valid_from: new Date().toISOString().split("T")[0],
      valid_to: "",
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
    if (
      window.confirm("Are you sure you want to remove this blacklist entry?")
    ) {
      try {
        await dispatch(
          deleteBlacklistMapping({
            transporterId,
            mappingId: mapping.blacklist_mapping_id,
          })
        ).unwrap();
        dispatch(
          addToast({
            type: TOAST_TYPES.SUCCESS,
            message: "Blacklist mapping deleted successfully",
          })
        );
        dispatch(fetchBlacklistMappings(transporterId));
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
      return !m.user_type || !m.user_id || !m.valid_from || !m.remark;
    });

    if (invalidMappings.length > 0) {
      dispatch(
        addToast({
          type: TOAST_TYPES.ERROR,
          message:
            "Please fill all required fields (User Type, User, Valid From, and Reason) for all blacklist mappings",
        })
      );
      return;
    }

    try {
      // Save each mapping
      for (const mapping of mappings) {
        if (mapping.isNew) {
          await dispatch(
            createBlacklistMapping({
              transporterId,
              mappingData: mapping,
            })
          ).unwrap();
        } else if (mapping.blacklist_mapping_id) {
          await dispatch(
            updateBlacklistMapping({
              transporterId,
              mappingId: mapping.blacklist_mapping_id,
              mappingData: mapping,
            })
          ).unwrap();
        }
      }

      dispatch(
        addToast({
          type: TOAST_TYPES.SUCCESS,
          message: "Blacklist mappings saved successfully",
        })
      );
      dispatch(fetchBlacklistMappings(transporterId));
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
        title="Blacklist Mappings"
        titleIcon={Ban}
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

export default BlacklistMappingTab;
