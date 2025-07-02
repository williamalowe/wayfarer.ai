export interface HolidayActivity {
  id: string;
  holiday_id: string | null;
  activity_name: string;
  activity_type: string | null;
  description: string | null;
  venue_name: string | null;
  address: string | null;
  city: string | null;
  state_province: string | null;
  country: string | null;
  postal_code: string | null;
  latitude: number | null;
  longitude: number | null;
  activity_date: string; // ISO date string (YYYY-MM-DD)
  start_time: string | null; // Time string (HH:MM:SS)
  end_time: string | null; // Time string (HH:MM:SS)
  duration_minutes: number | null;
  estimated_cost: number | null;
  actual_cost: number | null;
  cost_per_person: boolean | null;
  currency: string | null; // 3-character currency code
  booking_status: string | null;
  is_booked: boolean | null;
  day_number: number | null;
  sort_order: number | null;
  category: string | null;
  notes: string | null;
  created_at: string | null; // ISO timestamp string
  updated_at: string | null; // ISO timestamp string
}