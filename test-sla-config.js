const axios = require('axios');

async function testSLAConfigs() {
    const configs = [
        'sla-master',
        'sla-area-mapping', 
        'sla-measurement-method-mapping'
    ];
    
    console.log('Testing SLA configuration endpoints...');
    
    for (const config of configs) {
        try {
            console.log(`Testing: ${config} metadata`);
            const response = await axios.get(`http://localhost:5000/api/configuration/${config}/metadata`);
            console.log(`SUCCESS - ${config} metadata: ${response.status}`);
            
            console.log(`Testing: ${config} data`);
            const dataResponse = await axios.get(`http://localhost:5000/api/configuration/${config}/data`);
            console.log(`SUCCESS - ${config} data: ${dataResponse.status}`);
            console.log(`Records: ${dataResponse.data.data?.length || 0}`);
        } catch (error) {
            console.log(`FAILED - ${config}`);
            if (error.response?.status === 401) {
                console.log(`Error: 401 Unauthorized - authentication required`);
            } else {
                console.log(`Error: ${error.response?.data?.message || error.message}`);
            }
        }
        console.log('');
    }
}

testSLAConfigs();
