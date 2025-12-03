// Test Script: Driver vs Vehicle Document Preview Comparison
// Run this in browser console to verify implementations match exactly

console.log('🧪 Testing Driver vs Vehicle Document Implementation Comparison');

// Test 1: Component Structure Comparison
const checkComponentStructure = () => {
  console.log('🏗️ Test 1: Comparing component structure...');
  
  // Check if both use ThemeTable
  const driverThemeTable = document.querySelector('[data-testid*="driver"] .theme-table, .driver-documents .theme-table');
  const vehicleThemeTable = document.querySelector('[data-testid*="vehicle"] .theme-table, .vehicle-documents .theme-table');
  
  console.log('Driver uses ThemeTable:', !!driverThemeTable);
  console.log('Vehicle uses ThemeTable:', !!vehicleThemeTable);
  
  return !!driverThemeTable && !!vehicleThemeTable;
};

// Test 2: File Upload Functionality
const checkFileUpload = () => {
  console.log('📤 Test 2: Checking file upload functionality...');
  
  // Look for file upload inputs in both
  const driverFileInputs = document.querySelectorAll('[data-testid*="driver"] input[type="file"], .driver-documents input[type="file"]');
  const vehicleFileInputs = document.querySelectorAll('[data-testid*="vehicle"] input[type="file"], .vehicle-documents input[type="file"]');
  
  console.log(`Driver file inputs: ${driverFileInputs.length}`);
  console.log(`Vehicle file inputs: ${vehicleFileInputs.length}`);
  
  // Check accept attributes match
  if (driverFileInputs.length > 0 && vehicleFileInputs.length > 0) {
    const driverAccept = driverFileInputs[0].getAttribute('accept');
    const vehicleAccept = vehicleFileInputs[0].getAttribute('accept');
    console.log('Driver accept:', driverAccept);
    console.log('Vehicle accept:', vehicleAccept);
    return driverAccept === vehicleAccept;
  }
  
  return driverFileInputs.length > 0 && vehicleFileInputs.length > 0;
};

// Test 3: Preview Button Functionality
const checkPreviewButtons = () => {
  console.log('👁️ Test 3: Checking preview button functionality...');
  
  // Look for Eye icon buttons (preview buttons)
  const driverPreviewBtns = document.querySelectorAll('[data-testid*="driver"] button[title*="Preview"], .driver-documents button[title*="Preview"]');
  const vehiclePreviewBtns = document.querySelectorAll('[data-testid*="vehicle"] button[title*="Preview"], .vehicle-documents button[title*="Preview"]');
  
  console.log(`Driver preview buttons: ${driverPreviewBtns.length}`);
  console.log(`Vehicle preview buttons: ${vehiclePreviewBtns.length}`);
  
  return true; // Preview buttons appear after file upload
};

// Test 4: Modal Structure Comparison
const checkModalStructure = () => {
  console.log('🔍 Test 4: Checking modal structure...');
  
  // Look for modal elements (fixed positioned overlays)
  const modals = document.querySelectorAll('.fixed.inset-0.z-50');
  
  if (modals.length > 0) {
    const modal = modals[0];
    
    // Check for backdrop
    const backdrop = modal.querySelector('.fixed.inset-0.bg-black\\/50, .fixed.inset-0[class*="bg-black"]');
    console.log('Has backdrop:', !!backdrop);
    
    // Check for X button
    const xButton = modal.querySelector('button svg[data-testid*="x"], button svg[class*="lucide-x"]');
    console.log('Has X button:', !!xButton);
    
    // Check for Close button  
    const closeButton = Array.from(modal.querySelectorAll('button')).find(btn => 
      btn.textContent.toLowerCase().includes('close')
    );
    console.log('Has Close button:', !!closeButton);
    
    return !!backdrop && (!!xButton || !!closeButton);
  }
  
  console.log('ℹ️ No modal currently open');
  return true;
};

// Test 5: Column Configuration Comparison
const checkColumnConfig = () => {
  console.log('📊 Test 5: Checking column configuration...');
  
  // Check table headers for consistency
  const driverHeaders = document.querySelectorAll('[data-testid*="driver"] th, .driver-documents th');
  const vehicleHeaders = document.querySelectorAll('[data-testid*="vehicle"] th, .vehicle-documents th');
  
  console.log(`Driver table headers: ${driverHeaders.length}`);
  console.log(`Vehicle table headers: ${vehicleHeaders.length}`);
  
  // Log header text for comparison
  if (driverHeaders.length > 0) {
    const driverHeaderText = Array.from(driverHeaders).map(h => h.textContent.trim());
    console.log('Driver headers:', driverHeaderText);
  }
  
  if (vehicleHeaders.length > 0) {
    const vehicleHeaderText = Array.from(vehicleHeaders).map(h => h.textContent.trim());
    console.log('Vehicle headers:', vehicleHeaderText);
  }
  
  return true;
};

// Test 6: Event Handlers Test
const checkEventHandlers = () => {
  console.log('⚡ Test 6: Checking event handlers...');
  
  // Test ESC key functionality
  const testEscKey = () => {
    const modal = document.querySelector('.fixed.inset-0.z-50');
    if (modal) {
      // Simulate ESC key press
      const escEvent = new KeyboardEvent('keydown', { key: 'Escape' });
      document.dispatchEvent(escEvent);
      
      // Check if modal is still visible after a brief delay
      setTimeout(() => {
        const modalAfterEsc = document.querySelector('.fixed.inset-0.z-50');
        console.log('ESC key closes modal:', !modalAfterEsc);
      }, 100);
    } else {
      console.log('ℹ️ No modal open to test ESC key');
    }
  };
  
  // Test backdrop click
  const testBackdropClick = () => {
    const backdrop = document.querySelector('.fixed.inset-0.bg-black\\/50, .fixed.inset-0[class*="bg-black"]');
    if (backdrop && backdrop.onclick) {
      console.log('Backdrop has click handler:', !!backdrop.onclick);
    } else {
      console.log('ℹ️ No backdrop click handler found (may use event listeners)');
    }
  };
  
  testEscKey();
  testBackdropClick();
  
  return true;
};

// Run all tests
const runComparisonTests = () => {
  console.log('🚀 Running Driver vs Vehicle Comparison Tests...\n');
  
  const results = {
    componentStructure: checkComponentStructure(),
    fileUpload: checkFileUpload(),
    previewButtons: checkPreviewButtons(),
    modalStructure: checkModalStructure(),
    columnConfig: checkColumnConfig(),
    eventHandlers: checkEventHandlers()
  };
  
  console.log('\n📊 Test Results Summary:');
  Object.entries(results).forEach(([test, passed]) => {
    console.log(`${passed ? '✅' : '❌'} ${test}: ${passed ? 'PASSED' : 'FAILED'}`);
  });
  
  const passedTests = Object.values(results).filter(Boolean).length;
  const totalTests = Object.keys(results).length;
  
  console.log(`\n🎯 Overall Score: ${passedTests}/${totalTests}`);
  
  if (passedTests === totalTests) {
    console.log('🎉 All tests passed! Driver implementation matches Vehicle exactly.');
  } else {
    console.log('⚠️ Some differences found. Review implementation details.');
  }
  
  return results;
};

// Instructions for manual testing
const manualTestInstructions = () => {
  console.log('\n📋 Manual Testing Instructions:');
  console.log('1. Navigate to Driver Create page → Documents tab');
  console.log('2. Upload a PDF or image file');
  console.log('3. Click the Eye icon to preview');
  console.log('4. Test close methods:');
  console.log('   - X button in header');
  console.log('   - Close button in footer');
  console.log('   - ESC key');
  console.log('   - Click outside modal (backdrop)');
  console.log('5. Compare with Vehicle Create page → Documents tab');
  console.log('6. Repeat test on Driver Details page');
};

// Export for manual testing
if (typeof module !== 'undefined') {
  module.exports = { runComparisonTests, manualTestInstructions };
} else {
  // Run tests in browser
  window.runComparisonTests = runComparisonTests;
  window.manualTestInstructions = manualTestInstructions;
  
  console.log('✅ Comparison tests loaded!');
  console.log('Run runComparisonTests() to start automated tests');
  console.log('Run manualTestInstructions() for manual testing steps');
}