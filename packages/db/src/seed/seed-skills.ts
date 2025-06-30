import { skills, skillPerks } from '../schema';
import { db } from '../index';
import { skillTreesData, skillPerksData } from '@robo/skills';

export async function seedSkills() {
  console.log('🌱 Seeding skill perks...');
  
  // Insert skill perks first
  for (const perk of skillPerksData) {
    await db.insert(skillPerks)
      .values(perk)
      .onConflictDoNothing();
  }
  
  console.log('🌱 Seeding skill trees...');
  
  // Insert skills for each tree
  for (const treeData of skillTreesData) {
    const skillsByLevel = new Map<number, string>();
    
    // Insert skills level by level to handle parent relationships
    for (let level = 1; level <= 10; level++) {
      const levelSkills = treeData.skills.filter(s => s.level === level);
      
      for (const skill of levelSkills) {
        // Set parent skill ID if level > 1
        let parentSkillId = null;
        if (level > 1) {
          // Get the parent from the previous level
          // For simplicity, we'll make it linear (each skill has the previous level as parent)
          parentSkillId = skillsByLevel.get(level - 1) || null;
        }
        
        const [insertedSkill] = await db.insert(skills)
          .values({
            ...skill,
            parentSkillId
          })
          .onConflictDoNothing()
          .returning();
        
        if (insertedSkill) {
          skillsByLevel.set(level, insertedSkill.id);
        }
      }
    }
  }
  
  console.log('✅ Skills seeded successfully');
}