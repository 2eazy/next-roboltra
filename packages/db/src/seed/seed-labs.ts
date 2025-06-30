import { labItems, labThemes, labUpgrades } from '../schema';
import { db } from '../index';
import { labItemsData, labThemesData, labUpgradesData } from '@robo/labs';

export async function seedLabs() {
  console.log('🌱 Seeding lab themes...');
  
  // Insert lab themes
  for (const theme of labThemesData) {
    await db.insert(labThemes)
      .values(theme)
      .onConflictDoNothing();
  }
  
  console.log('🌱 Seeding lab items...');
  
  // Insert lab items
  for (const item of labItemsData) {
    await db.insert(labItems)
      .values(item)
      .onConflictDoNothing();
  }
  
  console.log('🌱 Seeding lab upgrades...');
  
  // Insert lab upgrades
  for (const upgrade of labUpgradesData) {
    await db.insert(labUpgrades)
      .values(upgrade)
      .onConflictDoNothing();
  }
  
  console.log('✅ Labs seeded successfully');
}