exports.up = function (knex) {
  return (
    knex.schema
      // Add foreign keys for doc_type_configuration
      .alterTable("doc_type_configuration", function (table) {
        table
          .foreign("doc_name_master_id")
          .references("doc_name_master_id")
          .inTable("document_name_master");
        table
          .foreign("user_type_id")
          .references("user_type_id")
          .inTable("user_type_master");
      })
      // Add foreign keys for warehouse_documents
      .alterTable("warehouse_documents", function (table) {
        table
          .foreign("warehouse_id")
          .references("warehouse_id")
          .inTable("warehouse_basic_information");
        table
          .foreign("document_id")
          .references("document_id")
          .inTable("document_upload");
        table
          .foreign("document_type_id")
          .references("document_type_id")
          .inTable("doc_type_configuration");
      })
      // Add foreign keys for e_bidding_config
      .alterTable("e_bidding_config", function (table) {
        table
          .foreign("freight_unit_id")
          .references("freight_unit_id")
          .inTable("freight_unit_master");
      })
      // Add foreign keys for consignor_general_config_master
      .alterTable("consignor_general_config_master", function (table) {
        table
          .foreign("parameter_name_id")
          .references("parameter_name_key")
          .inTable("consignor_general_config_parameter_name");
      })
      // Add foreign keys for consignor_approval_hierarchy_configuration
      .alterTable(
        "consignor_approval_hierarchy_configuration",
        function (table) {
          table.foreign("role_id").references("role_id").inTable("role_master");
          table
            .foreign("approval_type_id")
            .references("approval_type_id")
            .inTable("approval_type_master");
        }
      )
      // Add foreign keys for consignor_material_master_information
      .alterTable("consignor_material_master_information", function (table) {
        table
          .foreign("packing_type_id")
          .references("packaging_type_id")
          .inTable("packaging_type_master");
      })
  );
};

exports.down = function (knex) {
  return knex.schema
    .alterTable("doc_type_configuration", function (table) {
      table.dropForeign(["doc_name_master_id"]);
      table.dropForeign(["user_type_id"]);
    })
    .alterTable("warehouse_documents", function (table) {
      table.dropForeign(["warehouse_id"]);
      table.dropForeign(["document_id"]);
      table.dropForeign(["document_type_id"]);
    })
    .alterTable("e_bidding_config", function (table) {
      table.dropForeign(["freight_unit_id"]);
    })
    .alterTable("consignor_general_config_master", function (table) {
      table.dropForeign(["parameter_name_id"]);
    })
    .alterTable("consignor_approval_hierarchy_configuration", function (table) {
      table.dropForeign(["role_id"]);
      table.dropForeign(["approval_type_id"]);
    })
    .alterTable("consignor_material_master_information", function (table) {
      table.dropForeign(["packing_type_id"]);
    });
};
