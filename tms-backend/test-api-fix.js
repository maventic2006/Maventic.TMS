// Test the fixed API endpoint directly
const axios = require("axios");

async function testConfigurationAPI() {
    const baseURL = "http://localhost:5000/api";
    
    // Test configuration types that were problematic
    const configTypes = [
        "consignor_material_state_config",
        "consignor_checklist_config"
    ];
    
    console.log(" Testing Configuration API Endpoints...\n");
    
    for (const configType of configTypes) {
        try {
            console.log(` Testing ${configType}:`);
            
            // Test with problematic sortBy that used to cause SQL errors
            const response = await axios.get(`${baseURL}/consignor-configuration/${configType}`, {
                params: {
                    page: 1,
                    limit: 10,
                    sortBy: "checklist_config_id", // This used to cause the error
                    sortOrder: "desc"
                }
            });
            
            console.log(`   Success - Status: ${response.status}`);
            console.log(`   Data count: ${response.data.data?.length || 0}`);
            console.log(`   Total: ${response.data.pagination?.total || 0}`);
            
        } catch (error) {
            if (error.response) {
                console.log(`   API Error: ${error.response.status} - ${error.response.data?.error || error.response.data?.message}`);
            } else {
                console.log(`   Network Error: ${error.message}`);
            }
        }
        console.log("");
    }
}

testConfigurationAPI().catch(console.error);
