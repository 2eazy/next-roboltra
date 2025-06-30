import { db } from './index.js';
import { users, communities, userCommunities } from './schema/users.js';
import { userStats, userLabs, badges, userBadges } from './schema/gamification.js';
import { tasks } from './schema/tasks.js';
import { seasons, bootcampProgress } from './schema/seasons.js';
import { subscriptions } from './schema/system.js';
import { seedSkills } from './seed/seed-skills.js';
import { seedLabs } from './seed/seed-labs.js';
import { seedBadges } from './seed/seed-badges.js';
import bcrypt from 'bcrypt';

async function seed() {
  console.log('Seeding database...');
  
  try {
    // Create test community
    const [testCommunity] = await db.insert(communities).values({
      name: 'Test Community',
      slug: 'test-community',
      inviteCode: 'TEST123',
      description: 'A test community for development',
      isPublic: false,
      maxMembers: 10,
    }).returning();
    
    console.log('Created community:', testCommunity.name);
    
    // Create platform admin user
    const passwordHash = await bcrypt.hash('password123', 10);
    const [adminUser] = await db.insert(users).values({
      email: 'admin@robo.app',
      name: 'Platform Admin',
      passwordHash,
      platformRole: 'super_admin',
    }).returning();
    
    console.log('Created platform admin');
    
    // Create test users
    const testUsers = [
      { email: 'captain@test.com', name: 'Captain Carlos', platformRole: 'user' as const },
      { email: 'commander@test.com', name: 'Commander Maria', platformRole: 'user' as const },
      { email: 'officer@test.com', name: 'Officer Olivia', platformRole: 'user' as const },
      { email: 'crew1@test.com', name: 'Crew Member Max', platformRole: 'user' as const },
      { email: 'crew2@test.com', name: 'Crew Member Emma', platformRole: 'user' as const },
    ];
    
    const insertedUsers = await db.insert(users).values(
      testUsers.map(user => ({
        ...user,
        passwordHash,
      }))
    ).returning();
    
    console.log(`Created ${insertedUsers.length} users`);
    
    // Add users to community with their ranks
    const communityRanks = ['R5', 'R4', 'R3', 'R2', 'R2'] as const;
    await db.insert(userCommunities).values(
      insertedUsers.map((user, index) => ({
        userId: user.id,
        communityId: testCommunity.id,
        rank: communityRanks[index],
      }))
    );
    
    console.log('Added users to community');
    
    // Create user stats for all users
    await db.insert(userStats).values(
      insertedUsers.map(user => ({
        userId: user.id,
        totalPoints: Math.floor(Math.random() * 1000),
        totalTasksCompleted: Math.floor(Math.random() * 50),
        currentStreak: Math.floor(Math.random() * 7),
        longestStreak: Math.floor(Math.random() * 14),
      }))
    );
    
    // Create user skills
    const skillTrees = ['culinary', 'domestic', 'logistics', 'maintenance', 'habits'] as const;
    const userSkillsData = [];
    for (const user of insertedUsers) {
      for (const skillTree of skillTrees) {
        userSkillsData.push({
          userId: user.id,
          skillTree,
          level: Math.floor(Math.random() * 3) + 1,
          xp: Math.floor(Math.random() * 300),
        });
      }
    }
    await db.insert(userSkills).values(userSkillsData);
    
    // Create user labs
    await db.insert(userLabs).values(
      insertedUsers.map(user => ({
        userId: user.id,
        level: Math.floor(Math.random() * 2) + 1,
      }))
    );
    
    // Seed skill trees and perks
    await seedSkills();
    
    // Seed lab items and themes
    await seedLabs();
    
    // Seed badges
    await seedBadges();
    
    // Initialize user skills for all community members
    const { SkillService } = await import('@robo/skills');
    const skillService = new SkillService({ db, schema: await import('./schema/index.js') });
    
    for (const user of allUsersInCommunity) {
      await skillService.initializeUserSkills(user.userId, testCommunity.id);
    }
    
    
    // Create bootcamp progress for users
    await db.insert(bootcampProgress).values(
      insertedUsers.map((user, index) => ({
        userId: user.id,
        day: Math.min(index + 1, 7),
        unlocks: ['mini_game_1', 'skill_trees'],
      }))
    );
    
    // Create subscription for the community
    await db.insert(subscriptions).values({
      communityId: testCommunity.id,
      plan: 'premium_5',
      status: 'active',
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    });
    
    // Create a season
    await db.insert(seasons).values({
      code: 'spring_cleaning_2024',
      name: 'Spring Cleaning',
      description: 'Time for a fresh start! Clean, organize, and refresh your spaces.',
      theme: 'cleaning',
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      isActive: true,
    });
    
    // Create some sample tasks
    const taskData = [
      { title: 'Make breakfast', points: 15, category: 'quick_strike' as const, skillTree: 'culinary' as const },
      { title: 'Clean kitchen', points: 30, category: 'standard' as const, skillTree: 'domestic' as const },
      { title: 'Grocery shopping', points: 50, category: 'epic' as const, skillTree: 'logistics' as const },
      { title: 'Fix leaky faucet', points: 75, category: 'epic' as const, skillTree: 'maintenance' as const },
      { title: 'Morning workout', points: 25, category: 'standard' as const, skillTree: 'habits' as const },
    ];
    
    await db.insert(tasks).values(
      taskData.map(task => ({
        ...task,
        communityId: testCommunity.id,
        createdBy: insertedUsers[0].id, // Captain creates tasks
        staminaCost: Math.ceil(task.points / 5),
      }))
    );
    
    console.log('\\nTest credentials:');
    console.log('Platform Admin:');
    console.log('  Email: admin@robo.app');
    console.log('  Password: password123');
    console.log('\\nCommunity Member (Captain):');
    console.log('  Email: captain@test.com');
    console.log('  Password: password123');
    console.log('\\nSeeding completed successfully!');
    
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seed();