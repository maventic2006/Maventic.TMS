/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
  // Clean existing entries
  await knex("consignor_general_config_parameter_name").del();

  // Insert parameter name data
  await knex("consignor_general_config_parameter_name").insert([
    {
      parameter_name_description: "Auto Assignment of Transporter",
      parameter_name_key_code: "AUTO_ASSIGN_TRANSPORTER",
      probable_values: "Yes/No",
      created_by: "ADMIN",
      updated_by: "ADMIN",
    },
    {
      parameter_name_description: "Indent Acceptance Duration",
      parameter_name_key_code: "INDENT_ACCEPTANCE_DURATION",
      probable_values: "Hours",
      created_by: "ADMIN",
      updated_by: "ADMIN",
    },
    {
      parameter_name_description: "Truck/Driver Assignment Duration",
      parameter_name_key_code: "TRUCK_DRIVER_ASSIGNMENT_DURATION",
      probable_values: "Hours",
      created_by: "ADMIN",
      updated_by: "ADMIN",
    },
    {
      parameter_name_description: "Invoice Details fetching (Trip Update)",
      parameter_name_key_code: "INVOICE_DETAILS_FETCHING",
      probable_values: "Automatic/Manual",
      created_by: "ADMIN",
      updated_by: "ADMIN",
    },
    {
      parameter_name_description: "Default Auction Duration",
      parameter_name_key_code: "DEFAULT_AUCTION_DURATION",
      probable_values: "Minutes",
      created_by: "ADMIN",
      updated_by: "ADMIN",
    },
    {
      parameter_name_description: "Per Slot Max Indent",
      parameter_name_key_code: "PER_SLOT_MAX_INDENT",
      probable_values: "Number",
      created_by: "ADMIN",
      updated_by: "ADMIN",
    },
    {
      parameter_name_description: "EBidding Notification Time",
      parameter_name_key_code: "EBIDDING_NOTIFICATION_TIME",
      probable_values: "Minutes",
      created_by: "ADMIN",
      updated_by: "ADMIN",
    },
    {
      parameter_name_description:
        "e-bidding election type (L1-Rank 1 or Manual)",
      parameter_name_key_code: "EBIDDING_ELECTION_TYPE",
      probable_values: "L1/Manual",
      created_by: "ADMIN",
      updated_by: "ADMIN",
    },
    {
      parameter_name_description: "Checklist Mandatory Flag",
      parameter_name_key_code: "CHECKLIST_MANDATORY_FLAG",
      probable_values: "Yes/No",
      created_by: "ADMIN",
      updated_by: "ADMIN",
    },
    {
      parameter_name_description: "RFQ Validity Duration",
      parameter_name_key_code: "RFQ_VALIDITY_DURATION",
      probable_values: "Days",
      created_by: "ADMIN",
      updated_by: "ADMIN",
    },
    {
      parameter_name_description: "Default Contract Duration",
      parameter_name_key_code: "DEFAULT_CONTRACT_DURATION",
      probable_values: "Months",
      created_by: "ADMIN",
      updated_by: "ADMIN",
    },
  ]);
};
