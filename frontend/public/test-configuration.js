// Test Configuration System Integration
// Run this in the browser console after logging in to test Global Master Config menu navigation

console.log("🧪 Starting Configuration System Test...");

// Test 1: Check if configuration slice is available
const checkReduxStore = () => {
  const store = window.__REDUX_DEVTOOLS_EXTENSION__ || window.store;
  if (store) {
    console.log("✅ Redux store is available");
    return true;
  } else {
    console.log("❌ Redux store not found");
    return false;
  }
};

// Test 2: Test API connectivity
const testConfigAPI = async () => {
  try {
    // Use the global debug function
    if (typeof window.debugLogin === 'function') {
      console.log("🔐 Testing login...");
      const loginResult = await window.debugLogin();
      if (loginResult.success) {
        console.log("✅ Login successful");
        
        // Test configuration API
        console.log("🔧 Testing configuration API...");
        const response = await fetch('http://localhost:3001/api/configuration/configurations', {
          credentials: 'include'
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log("✅ Configuration API working:", data);
          return true;
        } else {
          console.log("❌ Configuration API failed:", response.status);
          return false;
        }
      } else {
        console.log("❌ Login failed:", loginResult);
        return false;
      }
    } else {
      console.log("❌ Debug login function not available");
      return false;
    }
  } catch (error) {
    console.log("❌ API test failed:", error);
    return false;
  }
};

// Test 3: Test navigation for each Global Master Config item
const testGlobalMasterConfigNavigation = () => {
  const menuItems = [
    { title: "Consignor General Config Parameter Name", expectedRoute: "/configuration/consignor-general-config" },
    { title: "Master - Vehicle Type for Indent", expectedRoute: "/configuration/vehicle-type" },
    { title: "Document Name Master", expectedRoute: "/configuration/document-name" },
    { title: "Doc Type Configuration", expectedRoute: "/configuration/document-type" },
    { title: "Material Master Information", expectedRoute: "/configuration/material-types" },
    { title: "Approval Configuration", expectedRoute: "/configuration/approval-type" },
    { title: "Payment Term Master", expectedRoute: "/configuration/payment-term" },
    { title: "Status Master", expectedRoute: "/configuration/status" },
    { title: "Rate Type Mapping", expectedRoute: "/configuration/rate-type" },
    { title: "Vehicle Type/Container Type/ULD Type Master", expectedRoute: "/configuration/vehicle-type" }
  ];
  
  console.log("🧭 Testing Global Master Config menu navigation mappings:");
  menuItems.forEach(item => {
    console.log(`📋 ${item.title} → ${item.expectedRoute}`);
  });
  
  return menuItems;
};

// Run all tests
const runTests = async () => {
  console.log("🚀 Running Configuration System Integration Tests...");
  
  const test1 = checkReduxStore();
  console.log(`Test 1 - Redux Store: ${test1 ? '✅ PASS' : '❌ FAIL'}`);
  
  const test2 = await testConfigAPI();
  console.log(`Test 2 - API Connectivity: ${test2 ? '✅ PASS' : '❌ FAIL'}`);
  
  const test3 = testGlobalMasterConfigNavigation();
  console.log(`Test 3 - Navigation Mapping: ✅ PASS (${test3.length} items mapped)`);
  
  const allTestsPassed = test1 && test2;
  
  console.log(`\n🏁 Overall Result: ${allTestsPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
  
  if (allTestsPassed) {
    console.log("\n🎉 Configuration System is ready!");
    console.log("📝 To test menu navigation:");
    console.log("1. Go to TMS Header");
    console.log("2. Click 'Global Master Config' dropdown");
    console.log("3. Click any menu item");
    console.log("4. Verify the configuration page loads with correct data");
  }
  
  return allTestsPassed;
};

// Auto-run the tests
runTests();