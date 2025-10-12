exports.seed = async function(knex) {
  try {
    console.log('🌱 Seeding master tables with sample data...');

    // Delete existing entries
    await knex('required_vehicle_type_master').del();
    await knex('indent_status_master').del();
    await knex('for_activity_master').del();
    await knex('checklist_item_master').del();
    await knex('checklist_fail_action_master').del();
    await knex('freight_unit_master').del();
    await knex('document_type_master').del();
    await knex('replacement_type_master').del();

    // 1. Required Vehicle Type Master
    await knex('required_vehicle_type_master').insert([
      {
        required_vehicle_type_id: 'RVT001',
        required_vehicle_type: 'Heavy Duty Truck',
        created_by: 'SYSTEM',
        status: 'ACTIVE'
      },
      {
        required_vehicle_type_id: 'RVT002',
        required_vehicle_type: 'Transit Mixer',
        created_by: 'SYSTEM',
        status: 'ACTIVE'
      },
      {
        required_vehicle_type_id: 'RVT003',
        required_vehicle_type: 'Container Truck',
        created_by: 'SYSTEM',
        status: 'ACTIVE'
      },
      {
        required_vehicle_type_id: 'RVT004',
        required_vehicle_type: 'Flatbed Truck',
        created_by: 'SYSTEM',
        status: 'ACTIVE'
      },
      {
        required_vehicle_type_id: 'RVT005',
        required_vehicle_type: 'Refrigerated Truck',
        created_by: 'SYSTEM',
        status: 'ACTIVE'
      }
    ]);

    // 2. Indent Status Master
    await knex('indent_status_master').insert([
      {
        indent_status_id: 'IST001',
        indent_status: 'DRAFT',
        created_by: 'SYSTEM',
        status: 'ACTIVE'
      },
      {
        indent_status_id: 'IST002',
        indent_status: 'PENDING',
        created_by: 'SYSTEM',
        status: 'ACTIVE'
      },
      {
        indent_status_id: 'IST003',
        indent_status: 'APPROVED',
        created_by: 'SYSTEM',
        status: 'ACTIVE'
      },
      {
        indent_status_id: 'IST004',
        indent_status: 'ASSIGNED',
        created_by: 'SYSTEM',
        status: 'ACTIVE'
      },
      {
        indent_status_id: 'IST005',
        indent_status: 'IN_PROGRESS',
        created_by: 'SYSTEM',
        status: 'ACTIVE'
      },
      {
        indent_status_id: 'IST006',
        indent_status: 'COMPLETED',
        created_by: 'SYSTEM',
        status: 'ACTIVE'
      },
      {
        indent_status_id: 'IST007',
        indent_status: 'CANCELLED',
        created_by: 'SYSTEM',
        status: 'ACTIVE'
      }
    ]);

    // 3. For Activity Master
    await knex('for_activity_master').insert([
      {
        for_activity_id: 'ACT001',
        for_activity: 'Loading',
        created_by: 'SYSTEM',
        status: 'ACTIVE'
      },
      {
        for_activity_id: 'ACT002',
        for_activity: 'Unloading',
        created_by: 'SYSTEM',
        status: 'ACTIVE'
      },
      {
        for_activity_id: 'ACT003',
        for_activity: 'Transit',
        created_by: 'SYSTEM',
        status: 'ACTIVE'
      },
      {
        for_activity_id: 'ACT004',
        for_activity: 'Gate Entry',
        created_by: 'SYSTEM',
        status: 'ACTIVE'
      },
      {
        for_activity_id: 'ACT005',
        for_activity: 'Gate Exit',
        created_by: 'SYSTEM',
        status: 'ACTIVE'
      },
      {
        for_activity_id: 'ACT006',
        for_activity: 'Weighment',
        created_by: 'SYSTEM',
        status: 'ACTIVE'
      }
    ]);

    // 4. Checklist Item Master
    await knex('checklist_item_master').insert([
      {
        checklist_item_id: 'CHK001',
        checklist_item: 'Vehicle Documents Check',
        created_by: 'SYSTEM',
        status: 'ACTIVE'
      },
      {
        checklist_item_id: 'CHK002',
        checklist_item: 'Driver License Verification',
        created_by: 'SYSTEM',
        status: 'ACTIVE'
      },
      {
        checklist_item_id: 'CHK003',
        checklist_item: 'Vehicle Physical Inspection',
        created_by: 'SYSTEM',
        status: 'ACTIVE'
      },
      {
        checklist_item_id: 'CHK004',
        checklist_item: 'Load Verification',
        created_by: 'SYSTEM',
        status: 'ACTIVE'
      },
      {
        checklist_item_id: 'CHK005',
        checklist_item: 'Safety Equipment Check',
        created_by: 'SYSTEM',
        status: 'ACTIVE'
      }
    ]);

    // 5. Checklist Fail Action Master
    await knex('checklist_fail_action_master').insert([
      {
        checklist_fail_action_id: 'CFA001',
        checklist_fail_action: 'Block Entry',
        created_by: 'SYSTEM',
        status: 'ACTIVE'
      },
      {
        checklist_fail_action_id: 'CFA002',
        checklist_fail_action: 'Warning Only',
        created_by: 'SYSTEM',
        status: 'ACTIVE'
      },
      {
        checklist_fail_action_id: 'CFA003',
        checklist_fail_action: 'Hold for Verification',
        created_by: 'SYSTEM',
        status: 'ACTIVE'
      },
      {
        checklist_fail_action_id: 'CFA004',
        checklist_fail_action: 'Reject and Return',
        created_by: 'SYSTEM',
        status: 'ACTIVE'
      }
    ]);

    // 6. Freight Unit Master
    await knex('freight_unit_master').insert([
      {
        freight_unit_id: 'FU001',
        freight_unit: 'PER_KM',
        description: 'Per Kilometer',
        created_by: 'SYSTEM',
        status: 'ACTIVE'
      },
      {
        freight_unit_id: 'FU002',
        freight_unit: 'PER_TON',
        description: 'Per Ton',
        created_by: 'SYSTEM',
        status: 'ACTIVE'
      },
      {
        freight_unit_id: 'FU003',
        freight_unit: 'FIXED_RATE',
        description: 'Fixed Rate',
        created_by: 'SYSTEM',
        status: 'ACTIVE'
      },
      {
        freight_unit_id: 'FU004',
        freight_unit: 'PER_TRIP',
        description: 'Per Trip',
        created_by: 'SYSTEM',
        status: 'ACTIVE'
      }
    ]);

    // 7. Document Type Master
    await knex('document_type_master').insert([
      {
        document_type_id: 'DOC001',
        document_type: 'Invoice',
        description: 'Invoice Document',
        created_by: 'SYSTEM',
        status: 'ACTIVE'
      },
      {
        document_type_id: 'DOC002',
        document_type: 'LR Copy',
        description: 'Lorry Receipt Copy',
        created_by: 'SYSTEM',
        status: 'ACTIVE'
      },
      {
        document_type_id: 'DOC003',
        document_type: 'POD',
        description: 'Proof of Delivery',
        created_by: 'SYSTEM',
        status: 'ACTIVE'
      },
      {
        document_type_id: 'DOC004',
        document_type: 'E-Way Bill',
        description: 'Electronic Way Bill',
        created_by: 'SYSTEM',
        status: 'ACTIVE'
      }
    ]);

    // 8. Replacement Type Master
    await knex('replacement_type_master').insert([
      {
        replacement_type_id: 'REP001',
        replacement_type: 'VEHICLE',
        description: 'Vehicle Replacement',
        created_by: 'SYSTEM',
        status: 'ACTIVE'
      },
      {
        replacement_type_id: 'REP002',
        replacement_type: 'DRIVER',
        description: 'Driver Replacement',
        created_by: 'SYSTEM',
        status: 'ACTIVE'
      },
      {
        replacement_type_id: 'REP003',
        replacement_type: 'BOTH',
        description: 'Vehicle and Driver Replacement',
        created_by: 'SYSTEM',
        status: 'ACTIVE'
      }
    ]);

    console.log('✅ Master tables seeded successfully!');
    
  } catch (error) {
    console.error('❌ Error seeding master tables:', error.message);
    throw error;
  }
};