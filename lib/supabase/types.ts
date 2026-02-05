/**
 * Supabase generated types placeholder.
 * Replace with `supabase gen types typescript ...` output when your database schema is ready.
 */
export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          user_id: string;
          username: string;
          age: number;
          height: number;
          initial_weight: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          username: string;
          age: number;
          height: number;
          initial_weight: number;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
      };
      weight_entries: {
        Row: {
          id: string;
          username: string;
          weight: number;
          recorded_at: string;
        };
        Insert: {
          id?: string;
          username: string;
          weight: number;
          recorded_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["weight_entries"]["Insert"]>;
      };
      wellness_entries: {
        Row: {
          id: string;
          username: string;
          metric: "sleep" | "calories" | "steps";
          value: number;
          date: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          username: string;
          metric: "sleep" | "calories" | "steps";
          value: number;
          date: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["wellness_entries"]["Insert"]>;
      };
    };
  };
}
