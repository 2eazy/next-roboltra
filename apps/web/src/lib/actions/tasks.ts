"use server";

import { auth } from "@/lib/auth";
import { db } from "@roboltra/db";
import { sql } from "drizzle-orm";
import { gameEngine, TaskCategory } from "@roboltra/game-engine";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export interface Task {
  id: string;
  title: string;
  description?: string;
  points: number;
  category: TaskCategory;
  stamina_cost: number;
  status: "available" | "claimed" | "completed";
  claimed_by?: string;
  claimed_at?: Date;
  created_by: string;
  created_at: Date;
}

/**
 * Create a new task
 */
export async function createTask(formData: FormData) {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const category = formData.get("category") as TaskCategory;
  
  if (!title || !category) {
    throw new Error("Title and category are required");
  }

  // Get points and stamina cost from game config
  const { gameConfig } = await import("@roboltra/game-engine");
  const points = gameConfig.points.taskCompletion[category];
  const staminaCost = gameConfig.stamina.costs.claimTask[category];

  const query = sql`
    INSERT INTO tasks (
      title,
      description,
      category,
      points,
      stamina_cost,
      status,
      created_by,
      created_at
    ) VALUES (
      ${title},
      ${description || null},
      ${category},
      ${points},
      ${staminaCost},
      'available',
      ${session.user.id},
      NOW()
    )
    RETURNING id
  `;

  const result = await db.execute(query);
  const taskId = result.rows[0]?.id;

  revalidatePath("/tasks");
  revalidatePath("/dashboard");
  
  return { success: true, taskId };
}

/**
 * Get available tasks
 */
export async function getAvailableTasks(): Promise<Task[]> {
  const session = await auth();
  if (!session?.user) {
    return [];
  }

  const query = sql`
    SELECT 
      id,
      title,
      description,
      category,
      points,
      stamina_cost,
      status,
      claimed_by,
      claimed_at,
      created_by,
      created_at
    FROM tasks
    WHERE status = 'available'
       OR (status = 'claimed' AND claimed_by = ${session.user.id})
    ORDER BY created_at DESC
    LIMIT 50
  `;

  const result = await db.execute(query);
  return result.rows as Task[];
}

/**
 * Get user's claimed tasks
 */
export async function getMyTasks(): Promise<Task[]> {
  const session = await auth();
  if (!session?.user) {
    return [];
  }

  const query = sql`
    SELECT 
      id,
      title,
      description,
      category,
      points,
      stamina_cost,
      status,
      claimed_by,
      claimed_at,
      created_by,
      created_at
    FROM tasks
    WHERE claimed_by = ${session.user.id}
      AND status IN ('claimed', 'completed')
    ORDER BY 
      CASE WHEN status = 'claimed' THEN 0 ELSE 1 END,
      claimed_at DESC
    LIMIT 50
  `;

  const result = await db.execute(query);
  return result.rows as Task[];
}

/**
 * Claim a task
 */
export async function claimTask(taskId: string) {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  // Get task details
  const taskQuery = sql`
    SELECT category, status, claimed_by
    FROM tasks
    WHERE id = ${taskId}
  `;
  
  const taskResult = await db.execute(taskQuery);
  const task = taskResult.rows[0];
  
  if (!task) {
    throw new Error("Task not found");
  }
  
  if (task.status !== "available") {
    throw new Error("Task is not available");
  }

  // Check stamina
  const canClaim = await gameEngine.claimTask(session.user.id, task.category as TaskCategory);
  
  if (!canClaim.success) {
    throw new Error(`Insufficient stamina. You have ${canClaim.remaining} stamina.`);
  }

  // Claim the task
  const claimQuery = sql`
    UPDATE tasks
    SET 
      status = 'claimed',
      claimed_by = ${session.user.id},
      claimed_at = NOW()
    WHERE id = ${taskId}
      AND status = 'available'
    RETURNING id
  `;

  const claimResult = await db.execute(claimQuery);
  
  if (claimResult.rows.length === 0) {
    throw new Error("Failed to claim task");
  }

  revalidatePath("/tasks");
  revalidatePath("/dashboard");
  
  return { success: true, remainingStamina: canClaim.remaining };
}

/**
 * Complete a task
 */
export async function completeTask(taskId: string) {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  // Get task details
  const taskQuery = sql`
    SELECT 
      category,
      status,
      claimed_by,
      claimed_at
    FROM tasks
    WHERE id = ${taskId}
  `;
  
  const taskResult = await db.execute(taskQuery);
  const task = taskResult.rows[0];
  
  if (!task) {
    throw new Error("Task not found");
  }
  
  if (task.status !== "claimed" || task.claimed_by !== session.user.id) {
    throw new Error("You can only complete tasks you have claimed");
  }

  // Calculate bonuses
  const claimedAt = new Date(task.claimed_at);
  const now = new Date();
  const minutesElapsed = (now.getTime() - claimedAt.getTime()) / (1000 * 60);
  const isSpeedBonus = minutesElapsed <= 30;

  // Check if this is first task today
  const todayTasksQuery = sql`
    SELECT COUNT(*) as count
    FROM task_completions
    WHERE user_id = ${session.user.id}
      AND completed_at >= CURRENT_DATE
  `;
  
  const todayResult = await db.execute(todayTasksQuery);
  const isFirstDaily = Number(todayResult.rows[0]?.count) === 0;

  // Complete the task in the game engine
  const gameResult = await gameEngine.completeTask(
    session.user.id,
    taskId,
    task.category as TaskCategory,
    {
      isFirstDaily,
      isSpeedBonus,
      skillTree: getSkillTreeForTask(task.category as TaskCategory),
    }
  );

  // Update task status
  const updateQuery = sql`
    UPDATE tasks
    SET status = 'completed'
    WHERE id = ${taskId}
  `;
  
  await db.execute(updateQuery);

  // Record completion
  const completionQuery = sql`
    INSERT INTO task_completions (
      task_id,
      user_id,
      points_earned,
      completed_at
    ) VALUES (
      ${taskId},
      ${session.user.id},
      ${gameResult.points.breakdown.total},
      NOW()
    )
  `;
  
  await db.execute(completionQuery);

  revalidatePath("/tasks");
  revalidatePath("/dashboard");
  
  return {
    success: true,
    points: gameResult.points,
    streak: gameResult.streak,
    leveledUp: gameResult.xp.leveledUp,
    newLevel: gameResult.xp.newLevel,
  };
}

/**
 * Delete a task (only by creator or admin)
 */
export async function deleteTask(taskId: string) {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const deleteQuery = sql`
    DELETE FROM tasks
    WHERE id = ${taskId}
      AND created_by = ${session.user.id}
      AND status = 'available'
  `;

  const result = await db.execute(deleteQuery);
  
  if (result.rowCount === 0) {
    throw new Error("Task not found or cannot be deleted");
  }

  revalidatePath("/tasks");
  revalidatePath("/dashboard");
  
  return { success: true };
}

/**
 * Map task category to skill tree
 */
function getSkillTreeForTask(category: TaskCategory) {
  const mapping = {
    quick: "habits",
    standard: "domestic",
    epic: "logistics",
    legendary: "maintenance",
  } as const;
  
  return mapping[category] || "domestic";
}