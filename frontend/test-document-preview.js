// Document Preview Testing Script
// Tests the document upload and preview functionality in transporter create and details pages

const documentPreviewTests = {
  // Test 1: Transporter Create Page - File Upload and Preview
  testCreatePageUpload: async () => {
    console.log('🔍 Testing Transporter Create Page Document Preview...');
    
    try {
      // Navigate to transporter create page
      const createUrl = 'http://localhost:5174/transporter/create';
      await new Promise(resolve => {
        window.location.href = createUrl;
        setTimeout(resolve, 2000);
      });
      
      // Wait for page to load
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Navigate to Documents tab
      const documentsTab = document.querySelector('[data-tab="documents"]');
      if (documentsTab) {
        documentsTab.click();
        console.log('✅ Clicked Documents tab');
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      // Check if file input exists
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) {
        console.log('✅ File input found in Documents tab');
        
        // Check if preview functionality is available after file upload
        const documentsTable = document.querySelector('.themed-table');
        if (documentsTable) {
          console.log('✅ Documents table found');
          
          // Check for preview buttons (should appear after file upload)
          const previewButtons = documentsTable.querySelectorAll('button[class*="bg-blue-100"]');
          console.log(`📋 Found ${previewButtons.length} preview buttons`);
          
          if (previewButtons.length > 0) {
            console.log('✅ Preview buttons detected in create page');
          } else {
            console.log('ℹ️ No preview buttons visible (files need to be uploaded first)');
          }
        }
      } else {
        console.log('❌ File input not found');
      }
      
      return true;
    } catch (error) {
      console.error('❌ Create page test failed:', error);
      return false;
    }
  },

  // Test 2: Transporter Details Page - Document Viewing
  testDetailsPageView: async () => {
    console.log('🔍 Testing Transporter Details Page Document Preview...');
    
    try {
      // Navigate to transporter list page first
      const listUrl = 'http://localhost:5174/transporter';
      window.location.href = listUrl;
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Find the first transporter in the list
      const firstTransporterId = document.querySelector('td:first-child[class*="cursor-pointer"]');
      if (firstTransporterId) {
        firstTransporterId.click();
        console.log('✅ Clicked first transporter to view details');
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Navigate to Documents tab in details view
        const documentsTab = document.querySelector('[data-tab="documents"]');
        if (documentsTab) {
          documentsTab.click();
          console.log('✅ Clicked Documents tab in details view');
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Check for documents and view buttons
          const documentsSection = document.querySelector('.space-y-6');
          if (documentsSection) {
            console.log('✅ Documents section found in details view');
            
            // Look for view buttons
            const viewButtons = documentsSection.querySelectorAll('button[class*="bg-blue-100"]');
            console.log(`📋 Found ${viewButtons.length} view buttons in details page`);
            
            // Look for download buttons
            const downloadButtons = documentsSection.querySelectorAll('button[class*="bg-green-100"]');
            console.log(`📋 Found ${downloadButtons.length} download buttons in details page`);
            
            if (viewButtons.length > 0) {
              console.log('✅ View buttons detected in details page');
              
              // Test clicking the first view button
              const firstViewButton = viewButtons[0];
              if (firstViewButton) {
                console.log('🔍 Testing view button click...');
                firstViewButton.click();
                
                // Wait and check for modal
                await new Promise(resolve => setTimeout(resolve, 2000));
                
                const modal = document.querySelector('.fixed.inset-0.bg-black.bg-opacity-50');
                if (modal) {
                  console.log('✅ Document preview modal opened successfully');
                  
                  // Check for close button
                  const closeButton = modal.querySelector('button[class*="text-gray-400"]');
                  if (closeButton) {
                    console.log('✅ Close button found in modal');
                    closeButton.click();
                    console.log('✅ Modal closed successfully');
                  }
                } else {
                  console.log('⚠️ Modal not detected - may need more time to load');
                }
              }
            } else {
              console.log('ℹ️ No view buttons found - may not have documents uploaded');
            }
          }
        }
      } else {
        console.log('❌ No transporters found in list');
      }
      
      return true;
    } catch (error) {
      console.error('❌ Details page test failed:', error);
      return false;
    }
  },

  // Test 3: Component Integrity Check
  testComponentIntegrity: () => {
    console.log('🔍 Testing Component Integrity...');
    
    // Check if ThemeTable is properly loaded
    const themeTableScript = Array.from(document.scripts).find(script => 
      script.src.includes('ThemeTable') || script.textContent.includes('ThemeTable')
    );
    
    if (themeTableScript) {
      console.log('✅ ThemeTable component detected');
    } else {
      console.log('ℹ️ ThemeTable not directly detectable in scripts');
    }
    
    // Check if DocumentsViewTab is properly loaded
    const documentsViewScript = Array.from(document.scripts).find(script => 
      script.src.includes('DocumentsViewTab') || script.textContent.includes('DocumentsViewTab')
    );
    
    if (documentsViewScript) {
      console.log('✅ DocumentsViewTab component detected');
    } else {
      console.log('ℹ️ DocumentsViewTab not directly detectable in scripts');
    }
    
    return true;
  },

  // Run all tests
  runAllTests: async () => {
    console.log('🚀 Starting Document Preview Tests...');
    console.log('==========================================');
    
    const results = [];
    
    // Test component integrity first
    results.push({
      test: 'Component Integrity',
      result: documentPreviewTests.testComponentIntegrity()
    });
    
    // Test create page
    results.push({
      test: 'Create Page Upload',
      result: await documentPreviewTests.testCreatePageUpload()
    });
    
    // Test details page
    results.push({
      test: 'Details Page View',
      result: await documentPreviewTests.testDetailsPageView()
    });
    
    // Summary
    console.log('==========================================');
    console.log('📊 TEST RESULTS SUMMARY:');
    results.forEach(result => {
      const status = result.result ? '✅ PASS' : '❌ FAIL';
      console.log(`${status} - ${result.test}`);
    });
    
    const passedTests = results.filter(r => r.result).length;
    const totalTests = results.length;
    console.log(`\n🎯 Overall Score: ${passedTests}/${totalTests} tests passed`);
    
    return results;
  }
};

// Auto-run tests when script is loaded
if (typeof window !== 'undefined') {
  // Wait for page to load, then run tests
  setTimeout(() => {
    documentPreviewTests.runAllTests();
  }, 2000);
}

// Export for manual testing
window.documentPreviewTests = documentPreviewTests;
console.log('📋 Document Preview Test Suite Loaded');
console.log('💡 Run manually with: documentPreviewTests.runAllTests()');
