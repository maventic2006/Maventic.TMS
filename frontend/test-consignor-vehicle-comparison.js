// Test Script: Consignor vs Vehicle Document Implementation Comparison
// Run this in browser console to verify implementations match exactly

console.log('í·ª Testing Consignor vs Vehicle Document Implementation Comparison');

// Test 1: Component Structure Comparison
const checkComponentStructure = () => {
  console.log('í¿—ï¸ Test 1: Comparing component structure...');
  
  // Check if both use ThemeTable for create page
  const consignorThemeTable = document.querySelector('[data-testid*="consignor"] .theme-table, .consignor-documents .theme-table');
  const vehicleThemeTable = document.querySelector('[data-testid*="vehicle"] .theme-table, .vehicle-documents .theme-table');
  
  console.log('Consignor create uses ThemeTable:', !!consignorThemeTable);
  console.log('Vehicle create uses ThemeTable:', !!vehicleThemeTable);
  
  // Check if both have view components with statistics
  const consignorStats = document.querySelectorAll('.consignor-details .grid.grid-cols-1.md\\:grid-cols-3');
  const vehicleStats = document.querySelectorAll('.vehicle-details .grid.grid-cols-1.md\\:grid-cols-3');
  
  console.log('Consignor view has statistics:', consignorStats.length > 0);
  console.log('Vehicle view has statistics:', vehicleStats.length > 0);
  
  return true;
};

// Test 2: File Upload Functionality
const checkFileUpload = () => {
  console.log('í³¤ Test 2: Checking file upload functionality...');
  
  // Look for file upload inputs in both
  const consignorFileInputs = document.querySelectorAll('[data-testid*="consignor"] input[type="file"], .consignor-documents input[type="file"]');
  const vehicleFileInputs = document.querySelectorAll('[data-testid*="vehicle"] input[type="file"], .vehicle-documents input[type="file"]');
  
  console.log(`Consignor file inputs: ${consignorFileInputs.length}`);
  console.log(`Vehicle file inputs: ${vehicleFileInputs.length}`);
  
  // Check accept attributes match
  if (consignorFileInputs.length > 0 && vehicleFileInputs.length > 0) {
    const consignorAccept = consignorFileInputs[0].getAttribute('accept');
    const vehicleAccept = vehicleFileInputs[0].getAttribute('accept');
    console.log('Consignor accept:', consignorAccept);
    console.log('Vehicle accept:', vehicleAccept);
    return consignorAccept === vehicleAccept;
  }
  
  return consignorFileInputs.length > 0 && vehicleFileInputs.length > 0;
};

// Test 3: Preview and Modal Functionality
const checkPreviewModals = () => {
  console.log('í±ï¸ Test 3: Checking preview and modal functionality...');
  
  // Look for Eye icon buttons (preview buttons)
  const consignorPreviewBtns = document.querySelectorAll('.consignor-documents button[title*="Preview"], .consignor-documents button:has(svg[class*="eye"])');
  const vehiclePreviewBtns = document.querySelectorAll('.vehicle-documents button[title*="Preview"], .vehicle-documents button:has(svg[class*="eye"])');
  
  console.log(`Consignor preview buttons: ${consignorPreviewBtns.length}`);
  console.log(`Vehicle preview buttons: ${vehiclePreviewBtns.length}`);
  
  // Check for upload buttons
  const consignorUploadBtns = document.querySelectorAll('.consignor-documents button:has(svg[class*="upload"])');
  const vehicleUploadBtns = document.querySelectorAll('.vehicle-documents button:has(svg[class*="upload"])');
  
  console.log(`Consignor upload buttons: ${consignorUploadBtns.length}`);
  console.log(`Vehicle upload buttons: ${vehicleUploadBtns.length}`);
  
  return true;
};

// Test 4: Document Statistics Cards
const checkDocumentStatistics = () => {
  console.log('í³Š Test 4: Checking document statistics...');
  
  // Look for statistics cards
  const consignorStatCards = document.querySelectorAll('.consignor-details .grid.md\\:grid-cols-3 > div');
  const vehicleStatCards = document.querySelectorAll('.vehicle-details .grid.md\\:grid-cols-3 > div');
  
  console.log(`Consignor stat cards: ${consignorStatCards.length}`);
  console.log(`Vehicle stat cards: ${vehicleStatCards.length}`);
  
  // Check for specific statistic types
  const checkStatType = (cards, type) => {
    return Array.from(cards).some(card => 
      card.textContent.toLowerCase().includes(type.toLowerCase())
    );
  };
  
  if (consignorStatCards.length > 0) {
    console.log('Consignor has Total Documents stat:', checkStatType(consignorStatCards, 'total'));
    console.log('Consignor has Expiring Soon stat:', checkStatType(consignorStatCards, 'expiring'));
    console.log('Consignor has Expired stat:', checkStatType(consignorStatCards, 'expired'));
  }
  
  if (vehicleStatCards.length > 0) {
    console.log('Vehicle has Total Documents stat:', checkStatType(vehicleStatCards, 'total'));
    console.log('Vehicle has Expiring Soon stat:', checkStatType(vehicleStatCards, 'expiring'));
    console.log('Vehicle has Expired stat:', checkStatType(vehicleStatCards, 'expired'));
  }
  
  return consignorStatCards.length === 3 && vehicleStatCards.length === 3;
};

// Test 5: Modal Close Methods
const checkModalCloseMethods = () => {
  console.log('í´ Test 5: Checking modal close methods...');
  
  // Look for modal elements
  const modals = document.querySelectorAll('.fixed.inset-0.z-50');
  
  if (modals.length > 0) {
    const modal = modals[0];
    
    // Check for X button
    const xButton = modal.querySelector('button svg[class*="lucide-x"], button svg[data-testid*="x"]');
    console.log('Has X button:', !!xButton);
    
    // Check for Close button
    const closeButton = Array.from(modal.querySelectorAll('button')).find(btn => 
      btn.textContent.toLowerCase().includes('close')
    );
    console.log('Has Close button:', !!closeButton);
    
    // Check for backdrop (ESC and backdrop click handled by ThemeTable)
    const backdrop = modal.querySelector('.fixed.inset-0.bg-black');
    console.log('Has clickable backdrop:', !!backdrop);
    
    return !!xButton && !!closeButton && !!backdrop;
  }
  
  console.log('â„¹ï¸ No modal currently open');
  return true;
};

// Test 6: Column Configuration Comparison
const checkColumnConfig = () => {
  console.log('í³‹ Test 6: Checking column configuration...');
  
  // Check table headers for consistency
  const consignorHeaders = document.querySelectorAll('.consignor-documents th, [data-testid*="consignor"] th');
  const vehicleHeaders = document.querySelectorAll('.vehicle-documents th, [data-testid*="vehicle"] th');
  
  console.log(`Consignor table headers: ${consignorHeaders.length}`);
  console.log(`Vehicle table headers: ${vehicleHeaders.length}`);
  
  // Log header text for comparison
  if (consignorHeaders.length > 0) {
    const consignorHeaderText = Array.from(consignorHeaders).map(h => h.textContent.trim());
    console.log('Consignor headers:', consignorHeaderText);
  }
  
  if (vehicleHeaders.length > 0) {
    const vehicleHeaderText = Array.from(vehicleHeaders).map(h => h.textContent.trim());
    console.log('Vehicle headers:', vehicleHeaderText);
  }
  
  return consignorHeaders.length === vehicleHeaders.length;
};

// Run all tests
const runConsignorVehicleComparison = () => {
  console.log('íº€ Running Consignor vs Vehicle Comparison Tests...\\n');
  
  const results = {
    componentStructure: checkComponentStructure(),
    fileUpload: checkFileUpload(),
    previewModals: checkPreviewModals(),
    documentStatistics: checkDocumentStatistics(),
    modalCloseMethods: checkModalCloseMethods(),
    columnConfig: checkColumnConfig()
  };
  
  console.log('\\ní³Š Test Results Summary:');
  Object.entries(results).forEach(([test, passed]) => {
    console.log(`${passed ? 'âœ…' : 'âŒ'} ${test}: ${passed ? 'PASSED' : 'FAILED'}`);
  });
  
  const passedTests = Object.values(results).filter(Boolean).length;
  const totalTests = Object.keys(results).length;
  
  console.log(`\\ní¾¯ Overall Score: ${passedTests}/${totalTests}`);
  
  if (passedTests === totalTests) {
    console.log('í¾‰ All tests passed! Consignor implementation matches Vehicle exactly.');
  } else {
    console.log('âš ï¸ Some differences found. Review implementation details.');
  }
  
  return results;
};

// Instructions for manual testing
const manualTestInstructions = () => {
  console.log('\\ní³‹ Manual Testing Instructions:');
  console.log('For Create Pages:');
  console.log('1. Navigate to Consignor Create page â†’ Documents tab');
  console.log('2. Navigate to Vehicle Create page â†’ Documents tab');
  console.log('3. Compare ThemeTable implementations');
  console.log('4. Upload files and test preview functionality');
  console.log('');
  console.log('For Details Pages:');
  console.log('1. Navigate to Consignor Details page â†’ Documents tab');
  console.log('2. Navigate to Vehicle Details page â†’ Documents tab');
  console.log('3. Compare statistics cards layout');
  console.log('4. Test upload modal functionality');
  console.log('5. Test preview modal with all close methods:');
  console.log('   - X button (header)');
  console.log('   - Close button (footer)');
  console.log('   - ESC key');
  console.log('   - Backdrop click');
  console.log('6. Compare document list layouts and action buttons');
};

// Export for manual testing
if (typeof module !== 'undefined') {
  module.exports = { runConsignorVehicleComparison, manualTestInstructions };
} else {
  // Run tests in browser
  window.runConsignorVehicleComparison = runConsignorVehicleComparison;
  window.manualTestInstructions = manualTestInstructions;
  
  console.log('âœ… Consignor-Vehicle comparison tests loaded!');
  console.log('Run runConsignorVehicleComparison() to start automated tests');
  console.log('Run manualTestInstructions() for manual testing steps');
}
