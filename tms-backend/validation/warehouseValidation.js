// Warehouse validation functions

const validateWarehouseListQuery = (query) => {
  const errors = [];

  if (
    query.page &&
    (!Number.isInteger(Number(query.page)) || Number(query.page) < 1)
  ) {
    errors.push({ field: "page", message: "Page must be a positive integer" });
  }

  if (
    query.limit &&
    (!Number.isInteger(Number(query.limit)) ||
      Number(query.limit) < 1 ||
      Number(query.limit) > 100)
  ) {
    errors.push({ field: "limit", message: "Limit must be between 1 and 100" });
  }

  const validStatuses = [
    "ACTIVE",
    "INACTIVE",
    "PENDING",
    "APPROVED",
    "REJECTED",
    "SAVE_AS_DRAFT", // ✅ Added draft status support
  ];
  if (query.status && !validStatuses.includes(query.status.toUpperCase())) {
    errors.push({ field: "status", message: "Invalid status value" });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

const validateWarehouseCreate = (data) => {
  const errors = [];

  // ✅ Support both camelCase and snake_case field names
  const consignorId = data.consignorId || data.consignor_id;
  const warehouseName1 = data.warehouseName1 || data.warehouse_name1;

  if (!consignorId || consignorId.trim() === "") {
    errors.push({ field: "consignorId", message: "Consignor ID is required" });
  }

  if (!warehouseName1 || warehouseName1.trim() === "") {
    errors.push({
      field: "warehouseName1",
      message: "Warehouse name is required",
    });
  }

  if (warehouseName1 && warehouseName1.length > 100) {
    errors.push({
      field: "warehouseName1",
      message: "Warehouse name cannot exceed 100 characters",
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

const validateWarehouseUpdate = (data) => {
  // For update, all fields are optional
  const errors = [];

  if (data.warehouseName1 && data.warehouseName1.length > 100) {
    errors.push({
      field: "warehouseName1",
      message: "Warehouse name cannot exceed 100 characters",
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

module.exports = {
  validateWarehouseListQuery,
  validateWarehouseCreate,
  validateWarehouseUpdate,
};
