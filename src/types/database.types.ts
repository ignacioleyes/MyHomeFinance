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
      households: {
        Row: {
          id: string;
          name: string;
          created_at: string;
          created_by: string | null;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          created_at?: string;
          created_by?: string | null;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          created_at?: string;
          created_by?: string | null;
          updated_at?: string;
        };
      };
      household_members: {
        Row: {
          id: string;
          household_id: string;
          user_id: string;
          role: "admin" | "member";
          joined_at: string;
        };
        Insert: {
          id?: string;
          household_id: string;
          user_id: string;
          role?: "admin" | "member";
          joined_at?: string;
        };
        Update: {
          id?: string;
          household_id?: string;
          user_id?: string;
          role?: "admin" | "member";
          joined_at?: string;
        };
      };
      expenses: {
        Row: {
          id: string;
          household_id: string;
          user_id: string | null;
          amount: number;
          category: string;
          description: string | null;
          expense_date: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          household_id: string;
          user_id?: string | null;
          amount: number;
          category: string;
          description?: string | null;
          expense_date: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          household_id?: string;
          user_id?: string | null;
          amount?: number;
          category?: string;
          description?: string | null;
          expense_date?: string;
          created_at?: string;
          updated_at?: string;
        };
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
  };
}
