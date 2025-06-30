import { pgTable, uuid, text, timestamp, integer, boolean, jsonb, pgEnum } from 'drizzle-orm/pg-core';
import { tasks } from './tasks';
import { users } from './users';

// Task assignment status enum
export const taskAssignmentStatusEnum = pgEnum('task_assignment_status', [
  'claimed',
  'submitted', 
  'completed',
  'rejected',
  'cancelled'
]);

// For the new task management system
export const taskAssignments = pgTable('task_assignments', {
  id: uuid('id').primaryKey().defaultRandom(),
  taskId: uuid('task_id').notNull().references(() => tasks.id),
  userId: uuid('user_id').notNull().references(() => users.id),
  status: taskAssignmentStatusEnum('status').notNull().default('claimed'),
  
  // Assignment tracking
  claimedAt: timestamp('claimed_at').notNull().defaultNow(),
  submittedAt: timestamp('submitted_at'),
  completedAt: timestamp('completed_at'),
  
  // Completion details
  completionNotes: text('completion_notes'),
  completionData: jsonb('completion_data').default({}),
  
  // Approval details
  approvedByUserId: uuid('approved_by_user_id').references(() => users.id),
  approvalNotes: text('approval_notes'),
  pointsAwarded: integer('points_awarded'),
  
  // Co-op support
  coOpGroupId: uuid('coop_group_id'), // Links co-op participants together
  
  // Metadata
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});