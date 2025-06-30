"use client";

import { useState, useTransition } from "react";
import { claimTask, completeTask, deleteTask } from "@/lib/actions/tasks";
import type { Task } from "@/types/task";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface TaskCardProps {
  task: Task;
  currentUserId?: string;
}

export function TaskCard({ task, currentUserId }: TaskCardProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "quick":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "standard":
        return "bg-green-100 text-green-800 border-green-200";
      case "epic":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "legendary":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const handleClaim = async () => {
    setError(null);
    startTransition(async () => {
      try {
        const result = await claimTask(task.id);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 2000);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to claim task");
      }
    });
  };

  const handleComplete = async () => {
    setError(null);
    startTransition(async () => {
      try {
        const result = await completeTask(task.id);
        setShowSuccess(true);
        
        // Show level up notification if applicable
        if (result.leveledUp) {
          alert(`🎉 Level Up! You're now level ${result.newLevel}!`);
        }
        
        setTimeout(() => {
          setShowSuccess(false);
          router.refresh();
        }, 2000);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to complete task");
      }
    });
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this task?")) return;
    
    setError(null);
    startTransition(async () => {
      try {
        await deleteTask(task.id);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to delete task");
      }
    });
  };

  const isClaimed = task.status === "claimed";
  const isCompleted = task.status === "completed";

  return (
    <div
      className={cn(
        "bg-white rounded-lg shadow-sm border p-4 transition-all",
        isPending && "opacity-75",
        showSuccess && "ring-2 ring-green-500"
      )}
    >
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-medium text-gray-900">{task.title}</h3>
            {task.description && (
              <p className="text-sm text-gray-600 mt-1">{task.description}</p>
            )}
          </div>
          <span
            className={cn(
              "text-xs px-2 py-1 rounded-full ml-2",
              getCategoryColor(task.category)
            )}
          >
            {task.category}
          </span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <span className="font-medium">+{task.points} pts</span>
            <span className="text-gray-500">⚡ {task.stamina_cost}</span>
          </div>
          
          {task.claimed_at && (
            <span className="text-gray-500">
              Claimed {new Date(task.claimed_at).toLocaleDateString()}
            </span>
          )}
        </div>

        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}

        {showSuccess && (
          <p className="text-sm text-green-600">
            {isCompleted ? "Task completed! 🎉" : "Task claimed!"}
          </p>
        )}

        <div className="flex gap-2">
          {task.status === "available" && (
            <button
              onClick={handleClaim}
              disabled={isPending}
              className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isPending ? "Claiming..." : "Claim Task"}
            </button>
          )}

          {task.status === "claimed" && task.claimed_by === currentUserId && (
            <button
              onClick={handleComplete}
              disabled={isPending}
              className="flex-1 px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isPending ? "Completing..." : "Complete Task"}
            </button>
          )}

          {task.status === "completed" && (
            <div className="flex-1 px-3 py-2 bg-gray-100 text-gray-600 text-sm rounded-lg text-center">
              ✓ Completed
            </div>
          )}

          {task.status === "available" && task.created_by === currentUserId && (
            <button
              onClick={handleDelete}
              disabled={isPending}
              className="px-3 py-2 border border-red-300 text-red-600 text-sm rounded-lg hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}