export interface Task {
  id: string;
  title: string;
  description?: string;
  points: number;
  category: "quick" | "standard" | "epic" | "legendary";
  stamina_cost: number;
  status: "available" | "claimed" | "completed";
  claimed_by?: string;
  claimed_at?: Date;
  created_by: string;
  created_at: Date;
}