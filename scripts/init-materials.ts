import { config } from 'dotenv';
config({ path: '.env.local' });

import { db } from '../db';
import { materialInventory } from '../db/schema';

async function initMaterials() {
  try {
    console.log('🔄 Initializing material inventory...');

    const materials = [
      {
        id: crypto.randomUUID(),
        app_id: 'balikin_id',
        materialType: 'acrylic',
        quantity: 50,
        unit: 'sheets',
        lowStockThreshold: 10,
        notes: 'A3 acrylic sheets for laser cutting',
      },
      {
        id: crypto.randomUUID(),
        app_id: 'balikin_id',
        materialType: 'vinyl',
        quantity: 25,
        unit: 'rolls',
        lowStockThreshold: 5,
        notes: 'Premium vinyl rolls for sticker printing',
      },
    ];

    for (const material of materials) {
      await db.insert(materialInventory).values(material);
      console.log(`   ✅ Added ${material.materialType}: ${material.quantity} ${material.unit}`);
    }

    console.log('\n✅ Material inventory initialized successfully!');
    console.log('📊 You can now test the Material Logs feature at /admin/material-logs');

    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to initialize materials:', error);
    process.exit(1);
  }
}

initMaterials();
