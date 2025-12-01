const db = require("../config/database");

/**
 * Get paginated HDR list with search
 */
const getHdrList = async ({ page, limit, search, include_inactive }) => {
  const offset = (page - 1) * limit;
  
  let query = db("transporter_vehicle_config_data_hdr as hdr")
    .leftJoin("vehicle_basic_information_hdr as veh", "hdr.vehicle_id_code", "veh.vehicle_id_code_hdr")
    .leftJoin("transporter_general_info as trans", "hdr.transporter_id", "trans.transporter_id")
    .leftJoin("consignor_basic_information as cons", "hdr.consignor_id", "cons.customer_id")
    .leftJoin("vehicle_type_master as vtype", "hdr.vehicle_type_id", "vtype.vehicle_type_id")
    .leftJoin("transporter_vehicle_config_param_name as param", "hdr.vehicle_config_hdr_id", "param.tv_config_parameter_name_id")
    .select(
      "hdr.*",
      "veh.vehicle_registration_number",
      "veh.vehicle_id_code_hdr as vehicle_code",
      "trans.business_name as transporter_name",
      "cons.customer_name as consignor_name",
      "vtype.vehicle_type_description",
      "param.parameter_name"
    );
  
  // Filter by status
  if (!include_inactive) {
    query = query.where("hdr.status", "active");
  }
  
  // Search filter
  if (search) {
    query = query.where(function() {
      this.where("veh.vehicle_registration_number", "like", `%${search}%`)
        .orWhere("trans.business_name", "like", `%${search}%`)
        .orWhere("cons.customer_name", "like", `%${search}%`)
        .orWhere("param.parameter_name", "like", `%${search}%`);
    });
  }
  
  // Get total count
  const totalQuery = query.clone();
  const [{ total }] = await totalQuery.count("hdr.vehicle_config_hdr_id as total");
  
  // Get paginated records
  const records = await query
    .orderBy("hdr.created_at", "desc")
    .limit(limit)
    .offset(offset);
  
  return {
    data: records,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalRecords: total,
      limit
    }
  };
};

/**
 * Get single HDR by ID with alerts and resolved names
 */
const getHdrById = async (pk) => {
  const hdr = await db("transporter_vehicle_config_data_hdr as hdr")
    .leftJoin("vehicle_basic_information_hdr as veh", "hdr.vehicle_id_code", "veh.vehicle_id_code_hdr")
    .leftJoin("transporter_general_info as trans", "hdr.transporter_id", "trans.transporter_id")
    .leftJoin("consignor_basic_information as cons", "hdr.consignor_id", "cons.customer_id")
    .leftJoin("vehicle_type_master as vtype", "hdr.vehicle_type_id", "vtype.vehicle_type_id")
    .leftJoin("transporter_vehicle_config_param_name as param", "hdr.vehicle_config_hdr_id", "param.tv_config_parameter_name_id")
    .select(
      "hdr.*",
      "veh.vehicle_registration_number",
      "veh.vehicle_id_code_hdr as vehicle_code",
      "trans.business_name as transporter_name",
      "cons.customer_name as consignor_name",
      "vtype.vehicle_type_description",
      "param.parameter_name",
      "param.is_minimum_required",
      "param.is_maximum_required"
    )
    .where("hdr.vehicle_config_hdr_id", pk)
    .first();
  
  if (!hdr) return null;
  
  // Get associated alerts
  const alerts = await getAlertsByHdrId(pk);
  hdr.alerts = alerts;
  
  return hdr;
};

/**
 * Create new HDR record
 */
const createHdr = async (hdrData) => {
  // Validate based on parameter requirements
  if (hdrData.tv_config_parameter_name_id) {
    const param = await db("transporter_vehicle_config_param_name")
      .where("tv_config_parameter_name_id", hdrData.tv_config_parameter_name_id)
      .first();
    
    if (param) {
      if (param.is_minimum_required && !hdrData.parameter_value_min) {
        throw new Error("Minimum value is required for this parameter");
      }
      if (param.is_maximum_required && !hdrData.parameter_value_max) {
        throw new Error("Maximum value is required for this parameter");
      }
    }
  }
  
  // Validate valid_from <= valid_to
  if (hdrData.valid_from && hdrData.valid_to) {
    if (new Date(hdrData.valid_from) > new Date(hdrData.valid_to)) {
      throw new Error("valid_from must be less than or equal to valid_to");
    }
  }
  
  const now = new Date();
  const record = {
    ...hdrData,
    created_at: now,
    created_on: now,
    updated_at: now,
    updated_on: now,
    status: hdrData.status || "active"
  };
  
  const [id] = await db("transporter_vehicle_config_data_hdr").insert(record);
  
  return await getHdrById(id);
};

/**
 * Update existing HDR record
 */
const updateHdr = async (pk, hdrData) => {
  // Check if record exists
  const existing = await db("transporter_vehicle_config_data_hdr")
    .where("vehicle_config_hdr_id", pk)
    .first();
  
  if (!existing) return null;
  
  // Validate based on parameter requirements
  if (hdrData.tv_config_parameter_name_id) {
    const param = await db("transporter_vehicle_config_param_name")
      .where("tv_config_parameter_name_id", hdrData.tv_config_parameter_name_id)
      .first();
    
    if (param) {
      if (param.is_minimum_required && !hdrData.parameter_value_min) {
        throw new Error("Minimum value is required for this parameter");
      }
      if (param.is_maximum_required && !hdrData.parameter_value_max) {
        throw new Error("Maximum value is required for this parameter");
      }
    }
  }
  
  // Validate valid_from <= valid_to
  if (hdrData.valid_from && hdrData.valid_to) {
    if (new Date(hdrData.valid_from) > new Date(hdrData.valid_to)) {
      throw new Error("valid_from must be less than or equal to valid_to");
    }
  }
  
  const now = new Date();
  const updateData = {
    ...hdrData,
    updated_at: now,
    updated_on: now
  };
  
  // Remove fields that shouldn't be updated
  delete updateData.vehicle_config_hdr_id;
  delete updateData.created_at;
  delete updateData.created_on;
  delete updateData.created_by;
  
  await db("transporter_vehicle_config_data_hdr")
    .where("vehicle_config_hdr_id", pk)
    .update(updateData);
  
  return await getHdrById(pk);
};

/**
 * Update HDR status (soft delete/reactivate)
 */
const updateHdrStatus = async (pk, status, userId) => {
  const now = new Date();
  
  // Get ITM count if deactivating
  let itmCount = 0;
  if (status === "inactive") {
    const result = await db("transporter_vehicle_config_data_itm")
      .where("vehicle_config_hdr_id", pk)
      .where("status", "active")
      .count("transporter_alert_itm_id as count")
      .first();
    itmCount = result.count;
  }
  
  await db("transporter_vehicle_config_data_hdr")
    .where("vehicle_config_hdr_id", pk)
    .update({
      status,
      updated_at: now,
      updated_on: now,
      updated_by: userId
    });
  
  return {
    success: true,
    status,
    itmCount,
    message: itmCount > 0 ? `HDR has ${itmCount} active alerts. They will remain active.` : null
  };
};

/**
 * Get all alerts for an HDR
 */
const getAlertsByHdrId = async (hdrId) => {
  return await db("transporter_vehicle_config_data_itm as itm")
    .leftJoin("user_master as user", "itm.user_id", "user.user_id")
    .select(
      "itm.*",
      "user.user_name",
      "user.email_address as user_email"
    )
    .where("itm.vehicle_config_hdr_id", hdrId)
    .orderBy("itm.created_at", "desc");
};

/**
 * Create new alert
 */
const createAlert = async (alertData) => {
  const now = new Date();
  const record = {
    ...alertData,
    created_at: now,
    created_on: now,
    updated_at: now,
    updated_on: now,
    status: alertData.status || "active"
  };
  
  const [id] = await db("transporter_vehicle_config_data_itm").insert(record);
  
  return await db("transporter_vehicle_config_data_itm")
    .where("transporter_alert_itm_id", id)
    .first();
};

/**
 * Update existing alert
 */
const updateAlert = async (itmPk, alertData) => {
  const existing = await db("transporter_vehicle_config_data_itm")
    .where("transporter_alert_itm_id", itmPk)
    .first();
  
  if (!existing) return null;
  
  const now = new Date();
  const updateData = {
    ...alertData,
    updated_at: now,
    updated_on: now
  };
  
  // Remove fields that shouldn't be updated
  delete updateData.transporter_alert_itm_id;
  delete updateData.vehicle_config_hdr_id;
  delete updateData.created_at;
  delete updateData.created_on;
  delete updateData.created_by;
  
  await db("transporter_vehicle_config_data_itm")
    .where("transporter_alert_itm_id", itmPk)
    .update(updateData);
  
  return await db("transporter_vehicle_config_data_itm")
    .where("transporter_alert_itm_id", itmPk)
    .first();
};

/**
 * Update alert status
 */
const updateAlertStatus = async (itmPk, status, userId) => {
  const now = new Date();
  
  await db("transporter_vehicle_config_data_itm")
    .where("transporter_alert_itm_id", itmPk)
    .update({
      status,
      updated_at: now,
      updated_on: now,
      updated_by: userId
    });
  
  return { success: true, status };
};

/**
 * Get vehicle types
 */
const getVehicleTypes = async () => {
  return await db("vehicle_type_master")
    .select("vehicle_type_id", "vehicle_type_description")
    .where("status", "active")
    .orderBy("vehicle_type_description");
};

/**
 * Get parameters
 */
const getParameters = async () => {
  return await db("transporter_vehicle_config_param_name")
    .select("tv_config_parameter_name_id", "parameter_name", "is_minimum_required", "is_maximum_required")
    .where("status", "active")
    .orderBy("parameter_name");
};

/**
 * Get alert types (distinct from ITM table)
 */
const getAlertTypes = async () => {
  const types = await db("transporter_vehicle_config_data_itm")
    .distinct("alert_type")
    .whereNotNull("alert_type")
    .orderBy("alert_type");
  
  return types.map(t => ({ alert_type: t.alert_type }));
};

/**
 * Get vehicles for dropdown
 */
const getVehicles = async (search) => {
  let query = db("vehicle_basic_information_hdr")
    .select(
      "vehicle_id_code_hdr as vehicle_id",
      "vehicle_registration_number",
      "vehicle_type_id"
    )
    .where("status", "active");
  
  if (search) {
    query = query.where(function() {
      this.where("vehicle_registration_number", "like", `%${search}%`)
        .orWhere("vehicle_id_code_hdr", "like", `%${search}%`);
    });
  }
  
  return await query.limit(50).orderBy("vehicle_registration_number");
};

/**
 * Get transporters for dropdown
 */
const getTransporters = async (search) => {
  let query = db("transporter_general_info")
    .select("transporter_id", "business_name")
    .where("status", "active");
  
  if (search) {
    query = query.where("business_name", "like", `%${search}%`);
  }
  
  return await query.limit(50).orderBy("business_name");
};

/**
 * Get consignors for dropdown
 */
const getConsignors = async (search) => {
  let query = db("consignor_basic_information")
    .select("customer_id as consignor_id", "customer_name")
    .where("status", "active");
  
  if (search) {
    query = query.where("customer_name", "like", `%${search}%`);
  }
  
  return await query.limit(50).orderBy("customer_name");
};

/**
 * Get users for dropdown
 */
const getUsers = async (search) => {
  let query = db("user_master")
    .select("user_id", "user_name", "email_address")
    .where("status", "active");
  
  if (search) {
    query = query.where(function() {
      this.where("user_name", "like", `%${search}%`)
        .orWhere("email_address", "like", `%${search}%`);
    });
  }
  
  return await query.limit(50).orderBy("user_name");
};

module.exports = {
  getHdrList,
  getHdrById,
  createHdr,
  updateHdr,
  updateHdrStatus,
  getAlertsByHdrId,
  createAlert,
  updateAlert,
  updateAlertStatus,
  getVehicleTypes,
  getParameters,
  getAlertTypes,
  getVehicles,
  getTransporters,
  getConsignors,
  getUsers
};
