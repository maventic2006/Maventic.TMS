/**
 * COMPREHENSIVE CONSIGNOR EDIT FUNCTIONALITY TEST
 * 
 * This script verifies all edit functionality in ConsignorDetailsPage
 * and compares it with TransporterDetailsPage for consistency
 */

const fs = require('fs');
const path = require('path');

// File paths
const CONSIGNOR_DETAILS_PATH = path.join(__dirname, 'frontend/src/features/consignor/pages/ConsignorDetailsPage.jsx');
const TRANSPORTER_DETAILS_PATH = path.join(__dirname, 'frontend/src/features/transporter/TransporterDetailsPage.jsx');
const CONSIGNOR_SLICE_PATH = path.join(__dirname, 'frontend/src/redux/slices/consignorSlice.js');
const TRANSPORTER_SLICE_PATH = path.join(__dirname, 'frontend/src/redux/slices/transporterSlice.js');
const CONSIGNOR_SERVICE_PATH = path.join(__dirname, 'frontend/src/services/consignorService.js');
const CONSIGNOR_CONTROLLER_PATH = path.join(__dirname, 'tms-backend/controllers/consignorController.js');
const CONSIGNOR_ROUTES_PATH = path.join(__dirname, 'tms-backend/routes/consignor.js');

// Test results storage
const testResults = {
  editFunctionality: [],
  draftWorkflow: [],
  permissionLogic: [],
  componentPattern: [],
  apiIntegration: [],
  comparisonWithTransporter: []
};

console.log('\n��� ===== COMPREHENSIVE CONSIGNOR EDIT FUNCTIONALITY TEST =====\n');

// Test 1: Core Edit Functionality
function testCoreEditFunctionality() {
  console.log('1️⃣ Testing Core Edit Functionality...');
  
  const consignorContent = fs.readFileSync(CONSIGNOR_DETAILS_PATH, 'utf8');
  
  const coreFeatures = [
    { name: 'Edit Button', pattern: /Edit.*Details|Edit.*Draft/, required: true },
    { name: 'Cancel Button', pattern: /onClick={handleEditToggle}.*Cancel|<X.*Cancel/, required: true },
    { name: 'Save Button', pattern: /Save.*Changes.*onClick={handleSaveChanges}|<Save.*Save Changes/, required: true },
    { name: 'Edit Mode State', pattern: /const \[isEditMode, setIsEditMode\]/, required: true },
    { name: 'Form Data State', pattern: /const \[editFormData, setEditFormData\]/, required: true },
    { name: 'Validation Errors State', pattern: /const \[validationErrors, setValidationErrors\]/, required: true },
    { name: 'Tab Errors State', pattern: /const \[tabErrors, setTabErrors\]/, required: true },
    { name: 'Unsaved Changes Detection', pattern: /hasUnsavedChanges/, required: true },
    { name: 'Edit Toggle Handler', pattern: /const handleEditToggle = \(\) => {/, required: true },
    { name: 'Save Changes Handler', pattern: /const handleSaveChanges = async \(\) => {/, required: true },
    { name: 'Permission Logic (canEdit)', pattern: /const canEdit = React\.useMemo\(\(\) => {/, required: true }
  ];
  
  coreFeatures.forEach(feature => {
    const found = feature.pattern.test(consignorContent);
    testResults.editFunctionality.push({
      feature: feature.name,
      status: found ? '✅ FOUND' : (feature.required ? '❌ MISSING' : '⚠️  OPTIONAL'),
      required: feature.required
    });
    
    if (found) {
      console.log(`   ✅ ${feature.name}: FOUND`);
    } else {
      console.log(`   ${feature.required ? '❌' : '⚠️ '} ${feature.name}: ${feature.required ? 'MISSING (REQUIRED)' : 'NOT FOUND (OPTIONAL)'}`);
    }
  });
}

// Test 2: Draft Workflow
function testDraftWorkflow() {
  console.log('\n2️⃣ Testing Draft Workflow...');
  
  const consignorContent = fs.readFileSync(CONSIGNOR_DETAILS_PATH, 'utf8');
  
  const draftFeatures = [
    { name: 'Update Draft Handler', pattern: /const handleUpdateDraft = async \(\) => {/, required: true },
    { name: 'Submit Draft Handler', pattern: /const handleSubmitForApproval = async \(\) => {/, required: true },
    { name: 'Draft Modal State', pattern: /const \[showSubmitModal, setShowSubmitModal\]/, required: true },
    { name: 'Draft Status Detection', pattern: /isDraftConsignor.*SAVE_AS_DRAFT/, required: true },
    { name: 'Redux Draft Actions Import', pattern: /updateConsignorDraft.*submitConsignorFromDraft/, required: true },
    { name: 'Submit Draft Modal Component', pattern: /<SubmitDraftModal/, required: true },
    { name: 'Draft Edit Button Text', pattern: /Edit Draft.*Edit Details/, required: true }
  ];
  
  draftFeatures.forEach(feature => {
    const found = feature.pattern.test(consignorContent);
    testResults.draftWorkflow.push({
      feature: feature.name,
      status: found ? '✅ FOUND' : '❌ MISSING',
      required: feature.required
    });
    
    console.log(`   ${found ? '✅' : '❌'} ${feature.name}: ${found ? 'FOUND' : 'MISSING'}`);
  });
}

// Test 3: Permission Logic
function testPermissionLogic() {
  console.log('\n3️⃣ Testing Permission Logic...');
  
  const consignorContent = fs.readFileSync(CONSIGNOR_DETAILS_PATH, 'utf8');
  
  const permissionFeatures = [
    { name: 'Creator Detection Logic', pattern: /const isCreator =[\s\S]*?String\(.*createdBy.*===.*String\(.*user_id/, required: true },
    { name: 'Approver Detection Logic', pattern: /const isApprover =[\s\S]*?Product Owner.*admin.*UT001/, required: true },
    { name: 'Draft Permission (isCreator)', pattern: /if \(isDraftConsignor\)[\s\S]*?return isCreator/, required: true },
    { name: 'Inactive Permission (isCreator)', pattern: /if \(status === "INACTIVE"\)[\s\S]*?return isCreator/, required: true },
    { name: 'Pending Permission (false)', pattern: /if \(status === "PENDING"\)[\s\S]*?return false/, required: true },
    { name: 'Active Permission (isApprover)', pattern: /if \(status === "ACTIVE"\)[\s\S]*?return isApprover/, required: true },
    { name: 'Edit Button Conditional Rendering', pattern: /!isEditMode &&\s*canEdit &&[\s\S]*?Edit.*Details/, required: true }
  ];
  
  permissionFeatures.forEach(feature => {
    const found = feature.pattern.test(consignorContent);
    testResults.permissionLogic.push({
      feature: feature.name,
      status: found ? '✅ FOUND' : '❌ MISSING',
      required: feature.required
    });
    
    console.log(`   ${found ? '✅' : '❌'} ${feature.name}: ${found ? 'FOUND' : 'MISSING'}`);
  });
}

// Test 4: Dual Component Pattern
function testDualComponentPattern() {
  console.log('\n4️⃣ Testing Dual Component Pattern...');
  
  const consignorContent = fs.readFileSync(CONSIGNOR_DETAILS_PATH, 'utf8');
  
  const componentPairs = [
    { edit: 'GeneralInfoTab', view: 'GeneralInfoViewTab' },
    { edit: 'ContactTab', view: 'ContactViewTab' },
    { edit: 'OrganizationTab', view: 'OrganizationViewTab' },
    { edit: 'DocumentsTab', view: 'DocumentsViewTab' },
    { edit: 'WarehouseListTab', view: 'WarehouseListViewTab' }
  ];
  
  componentPairs.forEach(pair => {
    const editFound = consignorContent.includes(pair.edit);
    const viewFound = consignorContent.includes(pair.view);
    const bothFound = editFound && viewFound;
    
    testResults.componentPattern.push({
      component: `${pair.edit}/${pair.view}`,
      editFound,
      viewFound,
      status: bothFound ? '✅ COMPLETE' : '❌ INCOMPLETE'
    });
    
    console.log(`   ${bothFound ? '✅' : '❌'} ${pair.edit}/${pair.view}: ${bothFound ? 'COMPLETE PAIR' : 'INCOMPLETE'}`);
    if (!editFound) console.log(`      - Missing: ${pair.edit}`);
    if (!viewFound) console.log(`      - Missing: ${pair.view}`);
  });
  
  // Test tab configuration with dual components
  const tabConfigPattern = /tabs\s*=\s*\[[\s\S]*?editComponent:.*?viewComponent:[\s\S]*?\]/;
  const tabConfigFound = tabConfigPattern.test(consignorContent);
  
  testResults.componentPattern.push({
    component: 'Tab Configuration',
    status: tabConfigFound ? '✅ FOUND' : '❌ MISSING'
  });
  
  console.log(`   ${tabConfigFound ? '✅' : '❌'} Tab Configuration with Edit/View Components: ${tabConfigFound ? 'FOUND' : 'MISSING'}`);
}

// Test 5: API Integration
function testAPIIntegration() {
  console.log('\n5️⃣ Testing API Integration...');
  
  const consignorSliceContent = fs.readFileSync(CONSIGNOR_SLICE_PATH, 'utf8');
  const consignorServiceContent = fs.readFileSync(CONSIGNOR_SERVICE_PATH, 'utf8');
  const consignorControllerContent = fs.readFileSync(CONSIGNOR_CONTROLLER_PATH, 'utf8');
  const consignorRoutesContent = fs.readFileSync(CONSIGNOR_ROUTES_PATH, 'utf8');
  
  const apiFeatures = [
    { 
      name: 'Redux updateConsignor Action', 
      file: 'consignorSlice.js',
      pattern: /export const updateConsignor = createAsyncThunk/,
      content: consignorSliceContent 
    },
    { 
      name: 'Redux updateConsignorDraft Action', 
      file: 'consignorSlice.js',
      pattern: /export const updateConsignorDraft = createAsyncThunk/,
      content: consignorSliceContent 
    },
    { 
      name: 'Redux submitConsignorFromDraft Action', 
      file: 'consignorSlice.js',
      pattern: /export const submitConsignorFromDraft = createAsyncThunk/,
      content: consignorSliceContent 
    },
    { 
      name: 'Service updateConsignor Method', 
      file: 'consignorService.js',
      pattern: /export const updateConsignor = async/,
      content: consignorServiceContent 
    },
    { 
      name: 'Service updateConsignorDraft Method', 
      file: 'consignorService.js',
      pattern: /export const updateConsignorDraft = async/,
      content: consignorServiceContent 
    },
    { 
      name: 'Service submitConsignorDraft Method', 
      file: 'consignorService.js',
      pattern: /export const submitConsignorDraft = async/,
      content: consignorServiceContent 
    },
    { 
      name: 'Controller updateConsignor Function', 
      file: 'consignorController.js',
      pattern: /const updateConsignor = async \(req, res\) => {/,
      content: consignorControllerContent 
    },
    { 
      name: 'Controller updateConsignorDraft Function', 
      file: 'consignorController.js',
      pattern: /const updateConsignorDraft = async \(req, res\) => {/,
      content: consignorControllerContent 
    },
    { 
      name: 'Controller submitConsignorFromDraft Function', 
      file: 'consignorController.js',
      pattern: /const submitConsignorFromDraft = async \(req, res\) => {/,
      content: consignorControllerContent 
    },
    { 
      name: 'Route PUT /:id (update)', 
      file: 'consignor.js',
      pattern: /router\.put\(\s*["']\/\$\{?:id\}?["']/,
      content: consignorRoutesContent 
    },
    { 
      name: 'Route PUT /:id/update-draft', 
      file: 'consignor.js',
      pattern: /router\.put\(\s*["']\/\$\{?:id\}?\/update-draft["']/,
      content: consignorRoutesContent 
    },
    { 
      name: 'Route PUT /:id/submit-draft', 
      file: 'consignor.js',
      pattern: /router\.put\(\s*["']\/\$\{?:id\}?\/submit-draft["']/,
      content: consignorRoutesContent 
    }
  ];
  
  apiFeatures.forEach(feature => {
    const found = feature.pattern.test(feature.content);
    testResults.apiIntegration.push({
      feature: feature.name,
      file: feature.file,
      status: found ? '✅ FOUND' : '❌ MISSING'
    });
    
    console.log(`   ${found ? '✅' : '❌'} ${feature.name} (${feature.file}): ${found ? 'FOUND' : 'MISSING'}`);
  });
}

// Test 6: Comparison with Transporter
function testComparisonWithTransporter() {
  console.log('\n6️⃣ Testing Comparison with Transporter...');
  
  const consignorContent = fs.readFileSync(CONSIGNOR_DETAILS_PATH, 'utf8');
  const transporterContent = fs.readFileSync(TRANSPORTER_DETAILS_PATH, 'utf8');
  
  const comparisonFeatures = [
    { name: 'Edit Mode State Pattern', pattern: /const \[isEditMode, setIsEditMode\] = useState\(false\)/ },
    { name: 'Edit Form Data Pattern', pattern: /const \[editFormData, setEditFormData\] = useState\(null\)/ },
    { name: 'Validation Errors Pattern', pattern: /const \[validationErrors, setValidationErrors\] = useState\(\{\}\)/ },
    { name: 'Tab Errors Pattern', pattern: /const \[tabErrors, setTabErrors\] = useState\(\{/ },
    { name: 'Unsaved Changes Pattern', pattern: /const \[hasUnsavedChanges, setHasUnsavedChanges\] = useState\(false\)/ },
    { name: 'Submit Modal Pattern', pattern: /const \[showSubmitModal, setShowSubmitModal\] = useState\(false\)/ },
    { name: 'Permission Logic Pattern', pattern: /const canEdit = React\.useMemo\(\(\) => \{/ },
    { name: 'Edit Toggle Pattern', pattern: /const handleEditToggle = \(\) => \{/ },
    { name: 'Save Changes Pattern', pattern: /const handleSaveChanges = async \(\) => \{/ },
    { name: 'Dual Component Conditional Rendering', pattern: /isEditMode\s*\?\s*tab\.editComponent\s*:\s*tab\.viewComponent/ }
  ];
  
  comparisonFeatures.forEach(feature => {
    const consignorHas = feature.pattern.test(consignorContent);
    const transporterHas = feature.pattern.test(transporterContent);
    const matches = consignorHas === transporterHas;
    
    testResults.comparisonWithTransporter.push({
      feature: feature.name,
      consignorHas,
      transporterHas,
      matches,
      status: matches ? (consignorHas ? '✅ BOTH HAVE' : '⚠️  BOTH MISSING') : '❌ MISMATCH'
    });
    
    console.log(`   ${matches ? (consignorHas ? '✅' : '⚠️ ') : '❌'} ${feature.name}: ${
      matches 
        ? (consignorHas ? 'BOTH HAVE' : 'BOTH MISSING') 
        : `MISMATCH (Consignor: ${consignorHas ? 'HAS' : 'MISSING'}, Transporter: ${transporterHas ? 'HAS' : 'MISSING'})`
    }`);
  });
}

// Run all tests
function runAllTests() {
  try {
    testCoreEditFunctionality();
    testDraftWorkflow();
    testPermissionLogic();
    testDualComponentPattern();
    testAPIIntegration();
    testComparisonWithTransporter();
    
    // Generate summary report
    generateSummaryReport();
    
  } catch (error) {
    console.error('❌ Test execution failed:', error.message);
    process.exit(1);
  }
}

// Generate summary report
function generateSummaryReport() {
  console.log('\n��� ===== TEST SUMMARY REPORT =====\n');
  
  // Count results by category
  const categories = [
    { name: 'Core Edit Functionality', results: testResults.editFunctionality },
    { name: 'Draft Workflow', results: testResults.draftWorkflow },
    { name: 'Permission Logic', results: testResults.permissionLogic },
    { name: 'Component Pattern', results: testResults.componentPattern },
    { name: 'API Integration', results: testResults.apiIntegration },
    { name: 'Transporter Comparison', results: testResults.comparisonWithTransporter }
  ];
  
  let overallScore = 0;
  let totalTests = 0;
  
  categories.forEach(category => {
    const passed = category.results.filter(r => r.status.includes('✅') || r.status.includes('BOTH HAVE')).length;
    const total = category.results.length;
    const percentage = total > 0 ? Math.round((passed / total) * 100) : 0;
    
    console.log(`${category.name}: ${passed}/${total} (${percentage}%)`);
    
    overallScore += passed;
    totalTests += total;
  });
  
  const overallPercentage = totalTests > 0 ? Math.round((overallScore / totalTests) * 100) : 0;
  
  console.log(`\n��� OVERALL SCORE: ${overallScore}/${totalTests} (${overallPercentage}%)`);
  
  if (overallPercentage >= 90) {
    console.log('��� EXCELLENT: Consignor edit functionality is comprehensive and matches transporter!');
  } else if (overallPercentage >= 75) {
    console.log('✅ GOOD: Most functionality is implemented, minor improvements needed.');
  } else if (overallPercentage >= 50) {
    console.log('⚠️  FAIR: Basic functionality is there, but significant features are missing.');
  } else {
    console.log('❌ POOR: Major functionality is missing, significant work needed.');
  }
  
  // Detailed failure report
  const failures = [];
  categories.forEach(category => {
    category.results.forEach(result => {
      if (result.status.includes('❌') || result.status.includes('MISSING')) {
        failures.push(`${category.name}: ${result.feature || result.component}`);
      }
    });
  });
  
  if (failures.length > 0) {
    console.log('\n��� AREAS NEEDING ATTENTION:');
    failures.forEach(failure => {
      console.log(`   - ${failure}`);
    });
  } else {
    console.log('\n��� NO ISSUES FOUND: All tests passed!');
  }
  
  console.log('\n✅ TEST COMPLETED');
}

// Execute tests
runAllTests();
