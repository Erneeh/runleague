export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      runs: {
        Row: {
          id: string;
          user_id: string;
          distance_km: number;
          time_minutes: number;
          date: string; // ISO date string (YYYY-MM-DD)
          xp: number;
          // optional metadata for external sources like Strava
          source: string | null;
          source_activity_id: string | null;
          elevation_gain: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          distance_km: number;
          time_minutes: number;
          date: string;
          xp: number;
          source?: string | null;
          source_activity_id?: string | null;
          elevation_gain?: number | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["runs"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "runs_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      profiles: {
        Row: {
          id: string;
          nickname: string | null;
          avatar_url: string | null;
          first_name: string | null;
          last_name: string | null;
          phone: string | null;
          country_code: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          nickname?: string | null;
          avatar_url?: string | null;
          first_name?: string | null;
          last_name?: string | null;
          phone?: string | null;
          country_code?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey";
            columns: ["id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      strava_connections: {
        Row: {
          user_id: string;
          athlete_id: number | null;
          access_token: string;
          refresh_token: string;
          expires_at: string; // ISO timestamp
          created_at: string;
          updated_at: string;
          avatar_url: string | null;
        };
        Insert: {
          user_id: string;
          athlete_id?: number | null;
          access_token: string;
          refresh_token: string;
          expires_at: string;
          created_at?: string;
          updated_at?: string;
          avatar_url?: string | null;
        };
        Update: Partial<
          Database["public"]["Tables"]["strava_connections"]["Insert"]
        >;
        Relationships: [
          {
            foreignKeyName: "strava_connections_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

