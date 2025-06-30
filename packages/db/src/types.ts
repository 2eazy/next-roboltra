import type { InferSelectModel } from 'drizzle-orm';
import type { pointTransactions } from './schema/gamification';

export type PointTransactionType = 
  | 'task_completion'
  | 'mini_game'
  | 'reaction_given'
  | 'reaction_received'
  | 'bonus'
  | 'purchase'
  | 'refund'
  | 'admin_adjustment';

export type PointTransaction = InferSelectModel<typeof pointTransactions>;