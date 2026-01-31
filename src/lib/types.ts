export interface User {
  id: string;
  email: string;
  full_name?: string;
  plan_tier: string;
}

export interface Watch {
  id: string;
  user_id: string;
  target_url: string;
  name?: string;
  selector?: string;
  check_interval_seconds: number;
  is_active: boolean;
  last_checked_at?: string;
  next_check_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Change {
  id: string;
  watch_id: string;
  change_summary: string;
  detected_at: string;
  importance_score?: number;
  user_feedback?: 'noise' | 'useful' | 'critical';
  watch?: {
    name?: string;
    target_url: string;
  };
}

export interface WatchWithChanges extends Watch {
  changes: Change[];
}
