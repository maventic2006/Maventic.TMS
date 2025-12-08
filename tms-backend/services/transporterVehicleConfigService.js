const db = require("../config/database");

/**
 * Get paginated HDR list with search
 */
const getHdrList = async ({ page, limit, search, include_inactive }) => {
  const offset = (page - 1) * limit;

  let query = db("transporter_vehicle_config_data_hdr as hdr")
    .leftJoin(
      "vehicle_basic_information_hdr as veh",
      "hdr.vehicle_id_code",
      "veh.vehicle_id_code_hdr"
    )
    .leftJoin(
      "transporter_general_info as trans",
      "hdr.transporter_id",
      "trans.transporter_id"
    )
    .leftJoin(
      "consignor_basic_information as cons",
      "hdr.consignor_id",
      "cons.customer_id"
    )
    .leftJoin(
      "vehicle_type_master as vtype",
      "hdr.vehicle_type_id",
      "vtype.vehicle_type_id"
    )
    .leftJoin(
      "transporter_vehicle_config_param_name as param",
      "hdr.tv_config_parameter_name_id",
      "param.tv_config_parameter_name_id"
    )
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
    query = query.where(function () {
      this.where("veh.vehicle_registration_number", "like", `%${search}%`)
        .orWhere("trans.business_name", "like", `%${search}%`)
        .orWhere("cons.customer_name", "like", `%${search}%`)
        .orWhere("param.parameter_name", "like", `%${search}%`);
    });
  }

  // Get total count - build a separate simpler query
  let countQuery = db("transporter_vehicle_config_data_hdr as hdr");

  // Apply same status filter
  if (!include_inactive) {
    countQuery = countQuery.where("hdr.status", "active");
  }

  // Apply same search filter if exists
  if (search) {
    countQuery = countQuery
      .leftJoin(
        "vehicle_basic_information_hdr as veh",
        "hdr.vehicle_id_code",
        "veh.vehicle_id_code_hdr"
      )
      .leftJoin(
        "transporter_general_info as trans",
        "hdr.transporter_id",
        "trans.transporter_id"
      )
      .leftJoin(
        "consignor_basic_information as cons",
        "hdr.consignor_id",
        "cons.customer_id"
      )
      .leftJoin(
        "transporter_vehicle_config_param_name as param",
        "hdr.tv_config_parameter_name_id",
        "param.tv_config_parameter_name_id"
      )
      .where(function () {
        this.where("veh.vehicle_registration_number", "like", `%${search}%`)
          .orWhere("trans.business_name", "like", `%${search}%`)
          .orWhere("cons.customer_name", "like", `%${search}%`)
          .orWhere("param.parameter_name", "like", `%${search}%`);
      });
  }

  const [{ total }] = await countQuery.count(
    "hdr.vehicle_config_auto_id as total"
  );

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
      limit,
    },
  };
};

/**
 * Get single HDR by ID with alerts and resolved names
 * Supports both auto_id (numeric) and hdr_id (TVCFG####)
 */
const getHdrById = async (pk) => {
  const hdr = await db("transporter_vehicle_config_data_hdr as hdr")
    .leftJoin(
      "vehicle_basic_information_hdr as veh",
      "hdr.vehicle_id_code",
      "veh.vehicle_id_code_hdr"
    )
    .leftJoin(
      "transporter_general_info as trans",
      "hdr.transporter_id",
      "trans.transporter_id"
    )
    .leftJoin(
      "consignor_basic_information as cons",
      "hdr.consignor_id",
      "cons.customer_id"
    )
    .leftJoin(
      "vehicle_type_master as vtype",
      "hdr.vehicle_type_id",
      "vtype.vehicle_type_id"
    )
    .leftJoin(
      "transporter_vehicle_config_param_name as param",
      "hdr.tv_config_parameter_name_id",
      "param.tv_config_parameter_name_id"
    )
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
    .where(function () {
      this.where("hdr.vehicle_config_auto_id", pk).orWhere(
        "hdr.vehicle_config_hdr_id",
        pk
      );
    })
    .first();

  if (!hdr) return null;

  // Get associated alerts
  const alerts = await getAlertsByHdrId(hdr.vehicle_config_hdr_id);
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

  // Generate vehicle_config_hdr_id
  const lastRecord = await db("transporter_vehicle_config_data_hdr")
    .select("vehicle_config_hdr_id")
    .whereNotNull("vehicle_config_hdr_id")
    .orderBy("vehicle_config_auto_id", "desc")
    .first();

  let nextId = "TVCFG0001";
  if (lastRecord && lastRecord.vehicle_config_hdr_id) {
    const lastNum = parseInt(
      lastRecord.vehicle_config_hdr_id.replace("TVCFG", ""),
      10
    );
    nextId = `TVCFG${String(lastNum + 1).padStart(4, "0")}`;
  }

  const now = new Date();
  const record = {
    ...hdrData,
    vehicle_config_hdr_id: nextId,
    created_at: now,
    created_on: now,
    updated_at: now,
    updated_on: now,
    status: hdrData.status || "active",
  };

  const [id] = await db("transporter_vehicle_config_data_hdr").insert(record);

  return await getHdrById(id);
};

/**
 * Update existing HDR record
 */
const updateHdr = async (pk, hdrData) => {
  // Check if record exists - support both auto_id and hdr_id
  const existing = await db("transporter_vehicle_config_data_hdr")
    .where(function () {
      this.where("vehicle_config_auto_id", pk).orWhere(
        "vehicle_config_hdr_id",
        pk
      );
    })
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
    updated_on: now,
  };

  // Remove fields that shouldn't be updated
  delete updateData.vehicle_config_hdr_id;
  delete updateData.vehicle_config_auto_id;
  delete updateData.created_at;
  delete updateData.created_on;
  delete updateData.created_by;

  await db("transporter_vehicle_config_data_hdr")
    .where("vehicle_config_auto_id", existing.vehicle_config_auto_id)
    .update(updateData);

  return await getHdrById(existing.vehicle_config_auto_id);
};

/**
 * Update HDR status (soft delete/reactivate)
 */
const updateHdrStatus = async (pk, status, userId) => {
  const now = new Date();

  // Get the HDR record to find the hdr_id
  const hdr = await db("transporter_vehicle_config_data_hdr")
    .where(function () {
      this.where("vehicle_config_auto_id", pk).orWhere(
        "vehicle_config_hdr_id",
        pk
      );
    })
    .first();

  if (!hdr) {
    throw new Error("HDR record not found");
  }

  // Get ITM count if deactivating
  let itmCount = 0;
  if (status === "inactive") {
    const result = await db("transporter_vehicle_config_data_itm")
      .where("vehicle_config_hdr_id", hdr.vehicle_config_hdr_id)
      .where("status", "active")
      .count("transporter_alert_itm_id as count")
      .first();
    itmCount = result.count;
  }

  await db("transporter_vehicle_config_data_hdr")
    .where("vehicle_config_auto_id", hdr.vehicle_config_auto_id)
    .update({
      status,
      updated_at: now,
      updated_on: now,
      updated_by: userId,
    });

  return {
    success: true,
    status,
    itmCount,
    message:
      itmCount > 0
        ? `HDR has ${itmCount} active alerts. They will remain active.`
        : null,
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
      "user.user_full_name as user_name",
      "user.email_id as user_email"
    )
    .where("itm.vehicle_config_hdr_id", hdrId)
    .orderBy("itm.created_at", "desc");
};

/**
 * Create new alert
 */
const createAlert = async (alertData) => {
  // Generate transporter_alert_itm_id
  const lastRecord = await db("transporter_vehicle_config_data_itm")
    .select("transporter_alert_itm_id")
    .whereNotNull("transporter_alert_itm_id")
    .orderBy("alert_itm_auto_id", "desc")
    .first();

  let nextId = "TAI001";
  if (lastRecord && lastRecord.transporter_alert_itm_id) {
    const lastNum = parseInt(
      lastRecord.transporter_alert_itm_id.replace("TAI", ""),
      10
    );
    nextId = `TAI${String(lastNum + 1).padStart(3, "0")}`;
  }

  const now = new Date();
  const record = {
    ...alertData,
    transporter_alert_itm_id: nextId,
    created_at: now,
    created_on: now,
    updated_at: now,
    updated_on: now,
    status: alertData.status || "active",
  };

  const [id] = await db("transporter_vehicle_config_data_itm").insert(record);

  return await db("transporter_vehicle_config_data_itm")
    .where("alert_itm_auto_id", id)
    .first();
};

/**
 * Update existing alert
 */
const updateAlert = async (itmPk, alertData) => {
  const existing = await db("transporter_vehicle_config_data_itm")
    .where(function () {
      this.where("alert_itm_auto_id", itmPk).orWhere(
        "transporter_alert_itm_id",
        itmPk
      );
    })
    .first();

  if (!existing) return null;

  const now = new Date();
  const updateData = {
    ...alertData,
    updated_at: now,
    updated_on: now,
  };

  // Remove fields that shouldn't be updated
  delete updateData.transporter_alert_itm_id;
  delete updateData.alert_itm_auto_id;
  delete updateData.vehicle_config_hdr_id;
  delete updateData.created_at;
  delete updateData.created_on;
  delete updateData.created_by;

  await db("transporter_vehicle_config_data_itm")
    .where("alert_itm_auto_id", existing.alert_itm_auto_id)
    .update(updateData);

  return await db("transporter_vehicle_config_data_itm")
    .where("alert_itm_auto_id", existing.alert_itm_auto_id)
    .first();
};

/**
 * Update alert status
 */
const updateAlertStatus = async (itmPk, status, userId) => {
  const now = new Date();

  const existing = await db("transporter_vehicle_config_data_itm")
    .where(function () {
      this.where("alert_itm_auto_id", itmPk).orWhere(
        "transporter_alert_itm_id",
        itmPk
      );
    })
    .first();

  if (!existing) {
    throw new Error("Alert not found");
  }

  await db("transporter_vehicle_config_data_itm")
    .where("alert_itm_auto_id", existing.alert_itm_auto_id)
    .update({
      status,
      updated_at: now,
      updated_on: now,
      updated_by: userId,
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
    .select(
      "tv_config_parameter_name_id",
      "parameter_name",
      "is_minimum_required",
      "is_maximum_required"
    )
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

  return types.map((t) => ({ alert_type: t.alert_type }));
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
    query = query.where(function () {
      this.where("vehicle_registration_number", "like", `%${search}%`).orWhere(
        "vehicle_id_code_hdr",
        "like",
        `%${search}%`
      );
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
    .select("user_id", "user_full_name as user_name", "email_id")
    .where("status", "active");

  if (search) {
    query = query.where(function () {
      this.where("user_full_name", "like", `%${search}%`).orWhere(
        "email_id",
        "like",
        `%${search}%`
      );
    });
  }

  return await query.limit(50).orderBy("user_full_name");
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
  getUsers,
};
