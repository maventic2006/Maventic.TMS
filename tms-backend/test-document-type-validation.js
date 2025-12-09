/**
 * Test the new document type validation function
 */

const knex = require("./config/database");

// Copy the validation function from controller
const validateAndMapDocumentType = async (documentTypeInput) => {
  if (!documentTypeInput) {
    throw new Error("Document type is required");
  }

  try {
    // First, check if the input is already a valid document_type_id for CONSIGNOR
    const validId = await knex("doc_type_configuration")
      .where("document_type_id", documentTypeInput)
      .where("user_type", "CONSIGNOR")
      .where("status", "ACTIVE")
      .first();

    if (validId) {
      console.log(`‚úÖ Document type ID is valid: ${documentTypeInput}`);
      return documentTypeInput;
    }

    // If not a valid ID, try to find by document name
    console.log(`ÔøΩÔøΩ Looking up document type by name: "${documentTypeInput}"`);
    const documentMapping = await knex("doc_type_configuration as dtc")
      .leftJoin("document_name_master as dnm", "dtc.doc_name_master_id", "dnm.doc_name_master_id")
      .select("dtc.document_type_id")
      .where("dnm.document_name", documentTypeInput)
      .where("dtc.user_type", "CONSIGNOR")
      .where("dtc.status", "ACTIVE")
      .first();

    if (documentMapping) {
      console.log(`‚úÖ Mapped document name "${documentTypeInput}" ‚Üí "${documentMapping.document_type_id}"`);
      return documentMapping.document_type_id;
    }

    // If still not found, get all valid consignor document types for error message
    const validTypes = await knex("doc_type_configuration as dtc")
      .leftJoin("document_name_master as dnm", "dtc.doc_name_master_id", "dnm.doc_name_master_id")
      .select("dtc.document_type_id", "dnm.document_name")
      .where("dtc.user_type", "CONSIGNOR")
      .where("dtc.status", "ACTIVE")
      .orderBy("dnm.document_name");

    const validTypesList = validTypes.map(t => `"${t.document_name}" (${t.document_type_id})`).join(", ");
    
    throw new Error(`Invalid document type: "${documentTypeInput}". Valid CONSIGNOR document types are: ${validTypesList}`);
  } catch (error) {
    console.error("‚ùå Document type validation error:", error.message);
    throw error;
  }
};

async function testDocumentTypeValidation() {
  try {
    console.log("Ì∑™ TESTING DOCUMENT TYPE VALIDATION FUNCTION");
    console.log("=" .repeat(60));
    
    // Test 1: Valid document type ID
    console.log("\nÌ∑™ Test 1: Valid document type ID (DTCONS006)");
    const test1 = await validateAndMapDocumentType("DTCONS006");
    console.log(`Result: ${test1}`);
    
    // Test 2: Document name that should be mapped
    console.log("\nÌ∑™ Test 2: Document name mapping ('Any License')");
    const test2 = await validateAndMapDocumentType("Any License");
    console.log(`Result: ${test2}`);
    
    // Test 3: Another valid document name
    console.log("\nÌ∑™ Test 3: Another document name ('PAN Card')");
    const test3 = await validateAndMapDocumentType("PAN Card");
    console.log(`Result: ${test3}`);
    
    // Test 4: Invalid document type
    console.log("\nÌ∑™ Test 4: Invalid document type ('Invalid Type')");
    try {
      const test4 = await validateAndMapDocumentType("Invalid Type");
      console.log(`Result: ${test4}`);
    } catch (error) {
      console.log(`Expected error: ${error.message.substring(0, 100)}...`);
    }
    
    console.log("\n‚úÖ VALIDATION FUNCTION TESTS COMPLETED");
    
  } catch (error) {
    console.error("‚ùå Test failed:", error.message);
  } finally {
    await knex.destroy();
  }
}

testDocumentTypeValidation();
