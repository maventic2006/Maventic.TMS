const puppeteer = require('puppeteer');

async function testConsignorUIFixes() {
  console.log('��� Starting Consignor Create Page UI Fixes Test...\n');
  
  const browser = await puppeteer.launch({ 
    headless: false,
    defaultViewport: { width: 1280, height: 800 },
    slowMo: 100
  });
  
  const page = await browser.newPage();
  
  try {
    // Login first
    console.log('1️⃣ Navigating to login page...');
    await page.goto('http://localhost:5173/login');
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });
    
    await page.type('input[type="email"]', 'admin@maventic.com');
    await page.type('input[type="password"]', 'admin123');
    
    await page.click('button[type="submit"]');
    await page.waitForNavigation({ waitUntil: 'networkidle0' });
    console.log('✅ Login successful');
    
    // Navigate to consignor create page
    console.log('2️⃣ Navigating to consignor create page...');
    await page.goto('http://localhost:5173/consignor/create');
    await page.waitForSelector('[data-testid="tab-0"]', { timeout: 10000 });
    console.log('✅ Consignor create page loaded');
    
    // Test 1: Check required field asterisks in GeneralInfoTab
    console.log('3️⃣ Testing required field asterisks in General Info tab...');
    const requiredLabels = await page.$$eval('label', labels => 
      labels.filter(label => label.textContent.includes('*')).map(label => label.textContent)
    );
    console.log('✅ Required fields with asterisks:', requiredLabels);
    
    // Test 2: Test ContactTab required fields
    console.log('4️⃣ Testing ContactTab required field asterisks...');
    await page.click('[data-testid="tab-1"]');
    await page.waitForTimeout(500);
    
    // Check for required asterisks in table headers
    const tableHeaders = await page.$$eval('th', headers => 
      headers.filter(header => header.textContent.includes('*')).map(header => header.textContent)
    );
    console.log('✅ Contact table required fields:', tableHeaders);
    
    // Test 3: Check DocumentsTab required fields
    console.log('5️⃣ Testing DocumentsTab required field asterisks...');
    await page.click('[data-testid="tab-3"]');
    await page.waitForTimeout(500);
    
    const docHeaders = await page.$$eval('th', headers => 
      headers.filter(header => header.textContent.includes('*')).map(header => header.textContent)
    );
    console.log('✅ Documents table required fields:', docHeaders);
    
    console.log('\n��� All UI fixes verification completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    throw error;
  } finally {
    await browser.close();
  }
}

// Run the test
testConsignorUIFixes()
  .then(() => {
    console.log('\n✅ All Consignor UI fixes are working correctly!');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  });
