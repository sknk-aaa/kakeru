export type GoalType = "recurring" | "oneoff";
export type GoalInstanceStatus =
  | "pending"
  | "achieved"
  | "failed"
  | "skipped"
  | "cancelled";
export type PenaltyStatus = "pending" | "charged" | "failed";

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          stripe_customer_id: string | null;
          stripe_payment_method_id: string | null;
          weight_kg: number | null;
          monthly_distance_goal_km: number | null;
          skip_count_this_month: number;
          skip_reset_at: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          stripe_customer_id?: string | null;
          stripe_payment_method_id?: string | null;
          weight_kg?: number | null;
          monthly_distance_goal_km?: number | null;
          skip_count_this_month?: number;
          skip_reset_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          stripe_customer_id?: string | null;
          stripe_payment_method_id?: string | null;
          weight_kg?: number | null;
          monthly_distance_goal_km?: number | null;
          skip_count_this_month?: number;
          skip_reset_at?: string | null;
          created_at?: string;
        };
      };
      goals: {
        Row: {
          id: string;
          user_id: string;
          type: GoalType;
          days_of_week: number[] | null;
          scheduled_date: string | null;
          distance_km: number | null;
          duration_minutes: number | null;
          penalty_amount: number;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: GoalType;
          days_of_week?: number[] | null;
          scheduled_date?: string | null;
          distance_km?: number | null;
          duration_minutes?: number | null;
          penalty_amount: number;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: GoalType;
          days_of_week?: number[] | null;
          scheduled_date?: string | null;
          distance_km?: number | null;
          duration_minutes?: number | null;
          penalty_amount?: number;
          is_active?: boolean;
          created_at?: string;
        };
      };
      goal_instances: {
        Row: {
          id: string;
          goal_id: string;
          user_id: string;
          scheduled_date: string;
          status: GoalInstanceStatus;
          created_at: string;
        };
        Insert: {
          id?: string;
          goal_id: string;
          user_id: string;
          scheduled_date: string;
          status?: GoalInstanceStatus;
          created_at?: string;
        };
        Update: {
          id?: string;
          goal_id?: string;
          user_id?: string;
          scheduled_date?: string;
          status?: GoalInstanceStatus;
          created_at?: string;
        };
      };
      runs: {
        Row: {
          id: string;
          goal_instance_id: string | null;
          user_id: string;
          distance_km: number;
          duration_seconds: number;
          pace_seconds_per_km: number | null;
          calories: number | null;
          best_pace_seconds_per_km: number | null;
          gps_path: { lat: number; lng: number; timestamp: number }[] | null;
          started_at: string;
          finished_at: string;
        };
        Insert: {
          id?: string;
          goal_instance_id?: string | null;
          user_id: string;
          distance_km: number;
          duration_seconds: number;
          pace_seconds_per_km?: number | null;
          calories?: number | null;
          best_pace_seconds_per_km?: number | null;
          gps_path?: { lat: number; lng: number; timestamp: number }[] | null;
          started_at: string;
          finished_at: string;
        };
        Update: {
          id?: string;
          goal_instance_id?: string | null;
          user_id?: string;
          distance_km?: number;
          duration_seconds?: number;
          pace_seconds_per_km?: number | null;
          calories?: number | null;
          best_pace_seconds_per_km?: number | null;
          gps_path?: { lat: number; lng: number; timestamp: number }[] | null;
          started_at?: string;
          finished_at?: string;
        };
      };
      penalties: {
        Row: {
          id: string;
          user_id: string;
          goal_instance_id: string;
          amount: number;
          stripe_payment_intent_id: string | null;
          status: PenaltyStatus;
          charged_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          goal_instance_id: string;
          amount: number;
          stripe_payment_intent_id?: string | null;
          status?: PenaltyStatus;
          charged_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          goal_instance_id?: string;
          amount?: number;
          stripe_payment_intent_id?: string | null;
          status?: PenaltyStatus;
          charged_at?: string | null;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
