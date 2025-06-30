"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Task } from "@/lib/actions/tasks";

interface TaskListProps {
  tasks: Task[];
}

export function TaskList({ tasks }: TaskListProps) {
  const router = useRouter();
  const [claiming, setIsClaiming] = useState<string | null>(null);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "quick":
        return "bg-blue-100 text-blue-800";
      case "standard":
        return "bg-green-100 text-green-800";
      case "epic":
        return "bg-purple-100 text-purple-800";
      case "legendary":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleClaim = async (taskId: string) => {
    router.push("/tasks");
  };

  if (tasks.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No tasks available right now. Check back later!
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <div
          key={task.id}
          className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => handleClaim(task.id)}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-medium text-gray-900">{task.title}</h3>
                <span className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(task.category)}`}>
                  {task.category}
                </span>
              </div>
              {task.description && (
                <p className="text-sm text-gray-600">{task.description}</p>
              )}
            </div>
            
            <div className="ml-4 text-right">
              <p className="text-lg font-bold text-gray-900">+{task.points}</p>
              <p className="text-xs text-gray-500">⚡ {task.stamina_cost}</p>
            </div>
          </div>

          {claiming === task.id && (
            <div className="mt-3 text-sm text-center text-gray-600">
              Claiming task...
            </div>
          )}
        </div>
      ))}
    </div>
  );
}