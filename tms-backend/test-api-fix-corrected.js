const axios = require("axios");

async function testConfigurationAPI() {
    console.log(" Testing Configuration API (with proper route)...\n");
    
    const baseURL = "http://localhost:5000/api";
    const configTypes = ["consignor_material_state_config", "consignor_checklist_config"];
    
    for (const configType of configTypes) {
        try {
            console.log(` Testing ${configType}:`);
            
            const response = await axios.get(`${baseURL}/consignor-configuration/${configType}/data`, {
                params: {
                    page: 1,
                    limit: 10,
                    sortBy: "checklist_config_id",
                    sortOrder: "desc"
                }
            });
            
            console.log(`   Success - Status: ${response.status}`);
            console.log(`   Data count: ${response.data.data?.length || 0}`);
            console.log(`   Total: ${response.data.pagination?.total || 0}`);
            
        } catch (error) {
            if (error.response) {
                console.log(`   API Error: ${error.response.status} - ${error.response.data?.error || error.response.data?.message || error.response.statusText}`);
            } else {
                console.log(`   Network Error: ${error.message}`);
            }
        }
        console.log("");
    }
}

testConfigurationAPI().catch(console.error);
