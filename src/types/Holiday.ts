export interface Holiday {
  id: string;
  user_id: string | null;
  name: string;
  description: string | null;
  destination: string;
  start_date: string; // ISO date string
  end_date: string; // ISO date string
  adults: number | null;
  children: number | null;
  estimated_budget: number | null;
  actual_budget: number | null;
  currency: string | null;
  status: string | null;
  priority: string | null;
  accommodation: string | null;
  transportation: string | null;
  notes: string | null;
  created_at: string | null; // ISO datetime string
  updated_at: string | null; // ISO datetime string
}
