import { db } from './index.js';
import { users, communities, userCommunities } from './schema/users.js';
import { userStats } from './schema/gamification.js';
import { bootcampProgress } from './schema/seasons.js';
import bcrypt from 'bcryptjs';
import { sql } from 'drizzle-orm';

async function simpleSeed() {
  console.log('🌱 Running simple seed...');
  
  try {
    // Check if we already have data
    const existingUsers = await db.select().from(users).limit(1);
    if (existingUsers.length > 0) {
      console.log('✅ Database already has users. Skipping seed.');
      return;
    }

    // Create test community
    const [testCommunity] = await db.insert(communities).values({
      name: 'Default Community',
      slug: 'default',
      inviteCode: 'DEFAULT',
      description: 'The default community',
      isPublic: true,
      maxMembers: 100,
      createdBy: 'system',
    }).returning();
    
    console.log('✅ Created community:', testCommunity.name);
    
    // Create test user
    const passwordHash = await bcrypt.hash('password123', 10);
    const [testUser] = await db.insert(users).values({
      email: 'test@example.com',
      passwordHash,
      name: 'Test User',
      displayName: 'Test User',
      platformRole: 'user',
      defaultCommunityId: testCommunity.id,
    }).returning();
    
    console.log('✅ Created user:', testUser.email);
    
    // Add user to community
    await db.insert(userCommunities).values({
      userId: testUser.id,
      communityId: testCommunity.id,
      rank: 'R1',
    });
    
    // Create user stats
    await db.insert(userStats).values({
      userId: testUser.id,
      communityId: testCommunity.id,
      totalPoints: 0,
      currentStreak: 0,
      longestStreak: 0,
      currentStamina: 100,
      maxStamina: 100,
      level: 1,
      xp: 0,
      tasksCompleted: 0,
      badgesEarned: 0,
    });
    
    // Create bootcamp progress
    await db.insert(bootcampProgress).values({
      userId: testUser.id,
      communityId: testCommunity.id,
      currentPhase: 1,
      completedTasks: [],
      unlockedFeatures: ['dashboard', 'tasks'],
      startedAt: new Date(),
    });
    
    console.log('\n✅ Seed completed successfully!');
    console.log('\n📝 Test credentials:');
    console.log('   Email: test@example.com');
    console.log('   Password: password123');
    
  } catch (error) {
    console.error('❌ Seed failed:', error);
    throw error;
  }
}

// Run the seed
simpleSeed()
  .then(() => {
    console.log('\n👋 Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });