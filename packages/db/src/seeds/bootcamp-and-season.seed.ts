import { db } from '../index';
import { seasons } from '../schema/seasons';
import { onboardingTasks, bootcampMilestones } from '../schema/onboarding';
// Inline Spring Cleaning season data for now
const springCleaningSeason = {
  id: 'spring-cleaning-2024',
  name: 'Spring Cleaning',
  description: 'Fresh start with organizing and cleaning challenges',
  theme: 'spring-cleaning',
  startDate: '2024-03-01',
  endDate: '2024-03-31',
  tasks: [
    { title: 'Deep Clean Kitchen', week: 1, points: 100 },
    { title: 'Organize Closet', week: 1, points: 75 },
    { title: 'Clean Windows', week: 2, points: 50 },
    { title: 'Declutter Living Room', week: 2, points: 60 },
    { title: 'Garage Organization', week: 3, points: 120 },
    { title: 'Digital Cleanup', week: 3, points: 40 },
    { title: 'Garden Preparation', week: 4, points: 80 },
    { title: 'Final Deep Clean', week: 4, points: 100 }
  ],
  badges: [
    { id: 'spring-starter', name: 'Spring Starter', rarity: 'common' },
    { id: 'clean-machine', name: 'Clean Machine', rarity: 'rare' },
    { id: 'organization-pro', name: 'Organization Pro', rarity: 'epic' },
    { id: 'declutter-master', name: 'Declutter Master', rarity: 'legendary' },
    { id: 'spring-champion', name: 'Spring Champion', rarity: 'legendary' }
  ],
  labItems: [
    { id: 'spring-plant', name: 'Spring Plant', category: 'decoration' },
    { id: 'cleaning-robot', name: 'Cleaning Robot', category: 'furniture' },
    { id: 'organized-shelf', name: 'Organized Shelf', category: 'furniture' },
    { id: 'fresh-flowers', name: 'Fresh Flowers', category: 'decoration' },
    { id: 'spring-rug', name: 'Spring Rug', category: 'floor' },
    { id: 'window-blinds', name: 'Window Blinds', category: 'window' },
    { id: 'storage-box', name: 'Storage Box', category: 'furniture' },
    { id: 'spring-wallpaper', name: 'Spring Wallpaper', category: 'wall' },
    { id: 'cleaning-caddy', name: 'Cleaning Caddy', category: 'decoration' },
    { id: 'fresh-air-diffuser', name: 'Fresh Air Diffuser', category: 'decoration' }
  ],
  challenges: [
    { id: 'speed-clean', name: 'Speed Clean Challenge', duration: 48 },
    { id: 'family-organize', name: 'Family Organization', duration: 72 },
    { id: 'eco-clean', name: 'Eco-Friendly Cleaning', duration: 168 }
  ]
};

export async function seedBootcampAndSeasons() {
  console.log('🌱 Seeding bootcamp tasks and seasons...');

  // Seed bootcamp tasks
  const bootcampTasks = [
    // Day 1
    { id: 'bootcamp-task-1', title: 'Complete your first task', description: 'Claim and complete any available task', day: 1, order: 1, points: 10 },
    { id: 'bootcamp-task-2', title: 'Play your first mini-game', description: 'Try out Robo Runner and score at least 100 points', day: 1, order: 2, points: 15 },
    
    // Day 2
    { id: 'bootcamp-task-3', title: 'Explore skill trees', description: 'Open the skills section and view all 5 skill trees', day: 2, order: 1, points: 10 },
    { id: 'bootcamp-task-4', title: 'Earn your first skill point', description: 'Complete a task that awards XP to any skill', day: 2, order: 2, points: 20 },
    
    // Day 3
    { id: 'bootcamp-task-5', title: 'Visit your Personal Lab', description: 'Check out your starter lab space', day: 3, order: 1, points: 10 },
    { id: 'bootcamp-task-6', title: 'Earn your first badge', description: 'Complete the requirements for any badge', day: 3, order: 2, points: 25 },
    
    // Day 4
    { id: 'bootcamp-task-7', title: 'Join a co-op task', description: 'Team up with family members on a collaborative task', day: 4, order: 1, points: 20 },
    { id: 'bootcamp-task-8', title: 'Try all mini-games', description: 'Play each of the 4 mini-games at least once', day: 4, order: 2, points: 30 },
    
    // Day 5
    { id: 'bootcamp-task-9', title: 'Give your first reaction', description: 'React to a family member\'s achievement', day: 5, order: 1, points: 10 },
    { id: 'bootcamp-task-10', title: 'Start a streak', description: 'Complete tasks on 2 consecutive days', day: 5, order: 2, points: 20 },
    
    // Day 6
    { id: 'bootcamp-task-11', title: 'Customize your lab', description: 'Place your first decoration in your Personal Lab', day: 6, order: 1, points: 15 },
    { id: 'bootcamp-task-12', title: 'Reach level 5', description: 'Gain enough XP to reach level 5 in any skill', day: 6, order: 2, points: 40 },
    
    // Day 7
    { id: 'bootcamp-task-13', title: 'Complete 20 tasks', description: 'Reach a total of 20 completed tasks', day: 7, order: 1, points: 30 },
    { id: 'bootcamp-task-14', title: 'Graduate from bootcamp', description: 'Complete all bootcamp requirements', day: 7, order: 2, points: 50 },
  ];

  await db.insert(onboardingTasks).values(bootcampTasks).onConflictDoNothing();

  // Seed bootcamp milestones
  const milestones = [
    { id: 'bootcamp-milestone-1', name: 'First Steps', description: 'Complete your first bootcamp task', requiredTasks: 1, order: 1, reward: { type: 'points', value: 25 } },
    { id: 'bootcamp-milestone-2', name: 'Getting Started', description: 'Complete 5 bootcamp tasks', requiredTasks: 5, order: 2, reward: { type: 'badge', value: 'bootcamp_starter' } },
    { id: 'bootcamp-milestone-3', name: 'Halfway There', description: 'Complete 10 bootcamp tasks', requiredTasks: 10, order: 3, reward: { type: 'points', value: 100 } },
    { id: 'bootcamp-milestone-4', name: 'Bootcamp Graduate', description: 'Complete all bootcamp tasks', requiredTasks: 14, order: 4, reward: { type: 'badge', value: 'bootcamp_graduate' } },
  ];

  await db.insert(bootcampMilestones).values(milestones).onConflictDoNothing();

  // Seed Spring Cleaning season
  const springCleaning = {
    code: springCleaningSeason.id,
    name: springCleaningSeason.name,
    description: springCleaningSeason.description,
    startDate: new Date(springCleaningSeason.startDate),
    endDate: new Date(springCleaningSeason.endDate),
    theme: springCleaningSeason.theme,
    isActive: true,
    rewards: springCleaningSeason.badges.map(badge => ({
      type: 'badge',
      value: badge
    })),
    specialBadges: springCleaningSeason.badges.map(b => b.id),
  };

  await db.insert(seasons).values(springCleaning).onConflictDoNothing();

  console.log('✅ Bootcamp and season data seeded successfully!');
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedBootcampAndSeasons()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Failed to seed bootcamp and seasons:', error);
      process.exit(1);
    });
}