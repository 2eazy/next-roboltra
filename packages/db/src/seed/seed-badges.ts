import { badges } from '../schema';
import { db } from '../index';
import { badgesData } from '@robo/badges';

export async function seedBadges() {
  console.log('🌱 Seeding badges...');
  
  // Insert badges
  for (const badge of badgesData) {
    await db.insert(badges)
      .values(badge)
      .onConflictDoNothing();
  }
  
  console.log(`✅ ${badgesData.length} badges seeded successfully`);
}