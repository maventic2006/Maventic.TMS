const ExcelJS = require('exceljs');
const path = require('path');

async function generateTestExcel(filename, testType = 'valid') {
  const workbook = new ExcelJS.Workbook();
  
  // Sheet 1: General Details
  const generalSheet = workbook.addWorksheet('General Details');
  generalSheet.columns = [
    { header: 'Transporter_Ref_ID', key: 'refId', width: 20 },
    { header: 'Business_Name', key: 'businessName', width: 30 },
    { header: 'Transport_Mode_Road', key: 'road', width: 20 },
    { header: 'Transport_Mode_Rail', key: 'rail', width: 20 },
    { header: 'Transport_Mode_Air', key: 'air', width: 20 },
    { header: 'Transport_Mode_Sea', key: 'sea', width: 20 },
    { header: 'From_Date', key: 'fromDate', width: 15 },
    { header: 'To_Date', key: 'toDate', width: 15 },
    { header: 'Active_Flag', key: 'active', width: 12 }
  ];

  // Sheet 2: Addresses
  const addressSheet = workbook.addWorksheet('Addresses');
  addressSheet.columns = [
    { header: 'Transporter_Ref_ID', key: 'refId', width: 20 },
    { header: 'Address_Type', key: 'addressType', width: 20 },
    { header: 'Street_1', key: 'street1', width: 30 },
    { header: 'Street_2', key: 'street2', width: 30 },
    { header: 'City', key: 'city', width: 20 },
    { header: 'District', key: 'district', width: 20 },
    { header: 'State', key: 'state', width: 20 },
    { header: 'Country', key: 'country', width: 15 },
    { header: 'Postal_Code', key: 'postalCode', width: 15 },
    { header: 'VAT_GST_Number', key: 'vat', width: 20 },
    { header: 'TIN_PAN', key: 'tin', width: 20 },
    { header: 'TAN', key: 'tan', width: 20 },
    { header: 'Is_Primary', key: 'isPrimary', width: 12 }
  ];

  // Sheet 3: Contacts
  const contactSheet = workbook.addWorksheet('Contacts');
  contactSheet.columns = [
    { header: 'Transporter_Ref_ID', key: 'refId', width: 20 },
    { header: 'Address_Type', key: 'addressType', width: 20 },
    { header: 'Contact_Person_Name', key: 'name', width: 25 },
    { header: 'Designation', key: 'designation', width: 20 },
    { header: 'Phone_Number', key: 'phone', width: 20 },
    { header: 'Alt_Phone_Number', key: 'altPhone', width: 20 },
    { header: 'Email_ID', key: 'email', width: 30 },
    { header: 'Alt_Email_ID', key: 'altEmail', width: 30 },
    { header: 'WhatsApp_Number', key: 'whatsapp', width: 20 }
  ];

  // Sheet 4: Serviceable Areas
  const serviceSheet = workbook.addWorksheet('Serviceable Areas');
  serviceSheet.columns = [
    { header: 'Transporter_Ref_ID', key: 'refId', width: 20 },
    { header: 'Service_Country', key: 'country', width: 15 },
    { header: 'Service_States', key: 'states', width: 40 },
    { header: 'Service_Frequency', key: 'frequency', width: 20 }
  ];

  // Sheet 5: Documents
  const documentSheet = workbook.addWorksheet('Documents');
  documentSheet.columns = [
    { header: 'Transporter_Ref_ID', key: 'refId', width: 20 },
    { header: 'Document_Type', key: 'docType', width: 20 },
    { header: 'Document_Name', key: 'docName', width: 25 },
    { header: 'Document_Number', key: 'docNumber', width: 25 },
    { header: 'Issue_Date', key: 'issueDate', width: 15 },
    { header: 'Expiry_Date', key: 'expiryDate', width: 15 },
    { header: 'Issuing_Country', key: 'issuingCountry', width: 15 },
    { header: 'Is_Verified', key: 'isVerified', width: 12 }
  ];

  // Generate test data based on type
  if (testType === 'valid') {
    // 5 valid transporters
    for (let i = 1; i <= 5; i++) {
      const refId = `TEST${String(i).padStart(3, '0')}`;
      
      // General Details
      generalSheet.addRow({
        refId,
        businessName: `Test Transport Company ${i}`,
        road: 'Y',
        rail: i % 2 === 0 ? 'Y' : 'N',
        air: 'N',
        sea: 'N',
        fromDate: '2025-01-01',
        toDate: '2026-12-31',
        active: 'Y'
      });

      // Address (Head Office)
      addressSheet.addRow({
        refId,
        addressType: 'Head Office',
        street1: `${i * 100} Main Street`,
        street2: `Building ${i}`,
        city: 'Mumbai',
        district: 'Mumbai Suburban',
        state: 'Maharashtra',
        country: 'IN',
        postalCode: `40000${i}`,
        vat: `27AABC${i}9603R1ZX`,
        tin: `TIN${i}234567`,
        tan: `TAN${i}234`,
        isPrimary: 'Y'
      });

      // Address (Branch) - for every other transporter
      if (i % 2 === 0) {
        addressSheet.addRow({
          refId,
          addressType: 'Branch',
          street1: `${i * 200} Park Avenue`,
          street2: `Floor ${i}`,
          city: 'Pune',
          district: 'Pune',
          state: 'Maharashtra',
          country: 'IN',
          postalCode: `41100${i}`,
          vat: `27AABC${i}9603R1ZY`,
          tin: `TIN${i}234568`,
          tan: `TAN${i}235`,
          isPrimary: 'N'
        });
      }

      // Contact for Head Office
      contactSheet.addRow({
        refId,
        addressType: 'Head Office',
        name: `Manager ${i}`,
        designation: 'General Manager',
        phone: `+9198765432${i}0`,
        altPhone: `+9198765432${i}1`,
        email: `manager${i}@testcompany${i}.com`,
        altEmail: `gm${i}@testcompany${i}.com`,
        whatsapp: `+9198765432${i}0`
      });

      // Additional contact for every other transporter
      if (i % 2 === 0) {
        contactSheet.addRow({
          refId,
          addressType: 'Branch',
          name: `Branch Head ${i}`,
          designation: 'Branch Manager',
          phone: `+9198765433${i}0`,
          altPhone: '',
          email: `branch${i}@testcompany${i}.com`,
          altEmail: '',
          whatsapp: `+9198765433${i}0`
        });
      }

      // Serviceable Areas
      serviceSheet.addRow({
        refId,
        country: 'IN',
        states: 'Maharashtra,Karnataka,Tamil Nadu',
        frequency: 'Daily'
      });

      // Documents - PAN
      documentSheet.addRow({
        refId,
        docType: 'PAN',
        docName: 'PAN Card',
        docNumber: `AABC${i}9603R`,
        issueDate: '2020-01-01',
        expiryDate: '',
        issuingCountry: 'IN',
        isVerified: 'N'
      });

      // Documents - GST
      documentSheet.addRow({
        refId,
        docType: 'GST',
        docName: 'GST Certificate',
        docNumber: `27AABC${i}9603R1ZX`,
        issueDate: '2021-01-01',
        expiryDate: '2026-01-01',
        issuingCountry: 'IN',
        isVerified: 'N'
      });
    }
  } else if (testType === 'mixed') {
    // 3 valid + 2 invalid transporters
    
    // Valid transporters (TEST001, TEST002, TEST003)
    for (let i = 1; i <= 3; i++) {
      const refId = `TEST${String(i).padStart(3, '0')}`;
      
      generalSheet.addRow({
        refId,
        businessName: `Valid Transport ${i}`,
        road: 'Y',
        rail: 'N',
        air: 'N',
        sea: 'N',
        fromDate: '2025-01-01',
        toDate: '2026-12-31',
        active: 'Y'
      });

      addressSheet.addRow({
        refId,
        addressType: 'Head Office',
        street1: `${i * 100} Valid Street`,
        street2: '',
        city: 'Mumbai',
        district: 'Mumbai Suburban',
        state: 'Maharashtra',
        country: 'IN',
        postalCode: `40000${i}`,
        vat: `27VALID${i}603R1ZX`,
        tin: `TIN${i}234567`,
        tan: `TAN${i}234`,
        isPrimary: 'Y'
      });

      contactSheet.addRow({
        refId,
        addressType: 'Head Office',
        name: `Valid Manager ${i}`,
        designation: 'Manager',
        phone: `+9198765430${i}0`,
        altPhone: '',
        email: `valid${i}@testcompany${i}.com`,
        altEmail: '',
        whatsapp: `+9198765430${i}0`
      });

      serviceSheet.addRow({
        refId,
        country: 'IN',
        states: 'Maharashtra,Gujarat',
        frequency: 'Daily'
      });

      documentSheet.addRow({
        refId,
        docType: 'PAN',
        docName: 'PAN Card',
        docNumber: `VALID${i}603R`,
        issueDate: '2020-01-01',
        expiryDate: '',
        issuingCountry: 'IN',
        isVerified: 'N'
      });
    }

    // Invalid transporter 1 - Missing required fields
    generalSheet.addRow({
      refId: 'TEST004',
      businessName: '', // INVALID - Empty business name
      road: 'N',
      rail: 'N',
      air: 'N',
      sea: 'N', // INVALID - No transport mode selected
      fromDate: '2025-01-01',
      toDate: '2026-12-31',
      active: 'Y'
    });

    addressSheet.addRow({
      refId: 'TEST004',
      addressType: 'Head Office',
      street1: '400 Invalid Street',
      street2: '',
      city: 'Mumbai',
      district: '',
      state: 'Maharashtra',
      country: 'IN',
      postalCode: '400004',
      vat: '',
      tin: '',
      tan: '',
      isPrimary: 'Y'
    });

    contactSheet.addRow({
      refId: 'TEST004',
      addressType: 'Head Office',
      name: 'Invalid Contact',
      designation: '',
      phone: 'invalid-phone', // INVALID - Wrong phone format
      altPhone: '',
      email: 'not-an-email', // INVALID - Wrong email format
      altEmail: '',
      whatsapp: ''
    });

    // Invalid transporter 2 - Missing contact and serviceable area
    generalSheet.addRow({
      refId: 'TEST005',
      businessName: 'Incomplete Transport',
      road: 'Y',
      rail: 'N',
      air: 'N',
      sea: 'N',
      fromDate: '2025-01-01',
      toDate: '2026-12-31',
      active: 'Y'
    });

    addressSheet.addRow({
      refId: 'TEST005',
      addressType: 'Head Office',
      street1: '500 Incomplete Street',
      street2: '',
      city: 'Delhi',
      district: '',
      state: 'Delhi',
      country: 'IN',
      postalCode: '110001',
      vat: '27INCOMP603R1ZX',
      tin: 'TIN5234567',
      tan: 'TAN5234',
      isPrimary: 'Y'
    });

    // Missing contact for TEST005
    // Missing serviceable area for TEST005
    // Missing documents for TEST004 and TEST005
  }

  // Save the file
  const filepath = path.join(__dirname, filename);
  await workbook.xlsx.writeFile(filepath);
  console.log(`✅ Generated: ${filename}`);
  return filepath;
}

// Generate both test files
(async () => {
  try {
    console.log('Generating test Excel files...\n');
    
    await generateTestExcel('test-valid-5-transporters.xlsx', 'valid');
    await generateTestExcel('test-mixed-3valid-2invalid.xlsx', 'mixed');
    
    console.log('\n✅ All test files generated successfully!');
    console.log('\nTest files created:');
    console.log('1. test-valid-5-transporters.xlsx - 5 completely valid transporters');
    console.log('2. test-mixed-3valid-2invalid.xlsx - 3 valid + 2 invalid transporters');
    console.log('\nYou can now upload these files via the frontend to test the bulk upload functionality.');
  } catch (error) {
    console.error('Error generating test files:', error);
    process.exit(1);
  }
})();
