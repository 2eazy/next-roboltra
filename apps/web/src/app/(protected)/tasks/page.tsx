import { getAvailableTasks, getMyTasks } from "@/lib/actions/tasks";
import { CreateTaskForm } from "@/components/tasks/create-task-form";
import { TaskCard } from "@/components/tasks/task-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default async function TasksPage() {
  const [availableTasks, myTasks] = await Promise.all([
    getAvailableTasks(),
    getMyTasks(),
  ]);

  const claimedTasks = myTasks.filter(t => t.status === "claimed");
  const completedTasks = myTasks.filter(t => t.status === "completed");

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Tasks</h1>
        <CreateTaskForm />
      </div>

      <Tabs defaultValue="available" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="available">
            Available ({availableTasks.length})
          </TabsTrigger>
          <TabsTrigger value="claimed">
            My Tasks ({claimedTasks.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed ({completedTasks.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="available" className="mt-6">
          {availableTasks.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>No tasks available right now.</p>
              <p className="mt-2">Create a new task to get started!</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {availableTasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="claimed" className="mt-6">
          {claimedTasks.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>You haven't claimed any tasks yet.</p>
              <p className="mt-2">Browse available tasks to get started!</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {claimedTasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="mt-6">
          {completedTasks.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>No completed tasks yet.</p>
              <p className="mt-2">Complete your first task to see it here!</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {completedTasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}