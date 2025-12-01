const { getConsignorConfigurationData } = require("./controllers/consignorConfigurationController");

async function testControllerDirectly() {
    console.log(" Testing Controller Function Directly...\n");
    
    // Mock request and response objects
    const mockReq = {
        params: { configName: "consignor_material_state_config" },
        query: {
            page: 1,
            limit: 10,
            sortBy: "checklist_config_id", // This used to cause the SQL error
            sortOrder: "desc"
        }
    };
    
    const mockRes = {
        status: function(code) {
            this.statusCode = code;
            return this;
        },
        json: function(data) {
            console.log(` Response Status: ${this.statusCode}`);
            console.log(` Data count: ${data.data?.length || 0}`);
            console.log(` Total: ${data.pagination?.total || 0}`);
            if (data.error) {
                console.log(` Error: ${data.error}`);
            } else {
                console.log(` Success! No SQL error occurred.`);
            }
            console.log("");
        }
    };
    
    try {
        console.log("Testing consignor_material_state_config with invalid sortBy:");
        await getConsignorConfigurationData(mockReq, mockRes);
    } catch (error) {
        console.log(` Controller Error: ${error.message}`);
    }
}

testControllerDirectly().catch(console.error);
