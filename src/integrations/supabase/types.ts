export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      card_expenses: {
        Row: {
          amount: number
          billing_month: string
          card_id: string
          category_id: string | null
          created_at: string | null
          current_installment: number | null
          description: string
          id: string
          installments: number | null
          is_installment: boolean | null
          purchase_date: string
          user_id: string
        }
        Insert: {
          amount: number
          billing_month: string
          card_id: string
          category_id?: string | null
          created_at?: string | null
          current_installment?: number | null
          description: string
          id?: string
          installments?: number | null
          is_installment?: boolean | null
          purchase_date: string
          user_id: string
        }
        Update: {
          amount?: number
          billing_month?: string
          card_id?: string
          category_id?: string | null
          created_at?: string | null
          current_installment?: number | null
          description?: string
          id?: string
          installments?: number | null
          is_installment?: boolean | null
          purchase_date?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "card_expenses_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "card_expenses_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      cards: {
        Row: {
          closing_date: number
          created_at: string | null
          due_date: number
          id: string
          name: string
          user_id: string
        }
        Insert: {
          closing_date: number
          created_at?: string | null
          due_date: number
          id?: string
          name: string
          user_id: string
        }
        Update: {
          closing_date?: number
          created_at?: string | null
          due_date?: number
          id?: string
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      cash_expenses: {
        Row: {
          amount: number
          category_id: string | null
          created_at: string | null
          date: string
          description: string
          due_date: string
          id: string
          is_recurring: boolean | null
          recurrence_months: number | null
          user_id: string
        }
        Insert: {
          amount: number
          category_id?: string | null
          created_at?: string | null
          date: string
          description: string
          due_date: string
          id?: string
          is_recurring?: boolean | null
          recurrence_months?: number | null
          user_id: string
        }
        Update: {
          amount?: number
          category_id?: string | null
          created_at?: string | null
          date?: string
          description?: string
          due_date?: string
          id?: string
          is_recurring?: boolean | null
          recurrence_months?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cash_expenses_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          color: string | null
          created_at: string
          icon: string | null
          id: string
          is_system: boolean | null
          name: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          icon?: string | null
          id?: string
          is_system?: boolean | null
          name: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string
          icon?: string | null
          id?: string
          is_system?: boolean | null
          name?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      incomes: {
        Row: {
          amount: number
          category_id: string | null
          created_at: string | null
          date: string
          description: string
          id: string
          is_recurring: boolean | null
          recurrence_months: number | null
          type: string
          user_id: string
        }
        Insert: {
          amount: number
          category_id?: string | null
          created_at?: string | null
          date: string
          description: string
          id?: string
          is_recurring?: boolean | null
          recurrence_months?: number | null
          type: string
          user_id: string
        }
        Update: {
          amount?: number
          category_id?: string | null
          created_at?: string | null
          date?: string
          description?: string
          id?: string
          is_recurring?: boolean | null
          recurrence_months?: number | null
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "incomes_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      investments: {
        Row: {
          average_price: number
          created_at: string | null
          current_price: number | null
          id: string
          last_manual_update: string | null
          quantity: number
          ticker: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          average_price: number
          created_at?: string | null
          current_price?: number | null
          id?: string
          last_manual_update?: string | null
          quantity: number
          ticker: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          average_price?: number
          created_at?: string | null
          current_price?: number | null
          id?: string
          last_manual_update?: string | null
          quantity?: number
          ticker?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      occurrence_overrides: {
        Row: {
          amount: number
          created_at: string
          date: string
          id: string
          occurrence_index: number
          transaction_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          date: string
          id?: string
          occurrence_index: number
          transaction_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          date?: string
          id?: string
          occurrence_index?: number
          transaction_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      savings_goals: {
        Row: {
          created_at: string | null
          current_amount: number | null
          id: string
          initial_amount: number | null
          name: string
          target_amount: number | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          current_amount?: number | null
          id?: string
          initial_amount?: number | null
          name: string
          target_amount?: number | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          current_amount?: number | null
          id?: string
          initial_amount?: number | null
          name?: string
          target_amount?: number | null
          user_id?: string
        }
        Relationships: []
      }
      savings_transactions: {
        Row: {
          amount: number
          created_at: string | null
          date: string
          description: string | null
          goal_id: string
          id: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          date: string
          description?: string | null
          goal_id: string
          id?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          date?: string
          description?: string | null
          goal_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "savings_transactions_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "savings_goals"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicle_payments: {
        Row: {
          created_at: string | null
          due_date: string
          id: string
          installment_number: number
          is_paid: boolean | null
          paid_date: string | null
          user_id: string
          vehicle_id: string
        }
        Insert: {
          created_at?: string | null
          due_date: string
          id?: string
          installment_number: number
          is_paid?: boolean | null
          paid_date?: string | null
          user_id: string
          vehicle_id: string
        }
        Update: {
          created_at?: string | null
          due_date?: string
          id?: string
          installment_number?: number
          is_paid?: boolean | null
          paid_date?: string | null
          user_id?: string
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_vehicle_payments_vehicle_id"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicle_payments_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicles: {
        Row: {
          created_at: string | null
          description: string
          id: string
          installment_value: number
          installments: number
          paid_installments: number
          start_date: string
          total_amount: number
          total_amountii: number
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description: string
          id?: string
          installment_value: number
          installments: number
          paid_installments?: number
          start_date: string
          total_amount: number
          total_amountii: number
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string
          id?: string
          installment_value?: number
          installments?: number
          paid_installments?: number
          start_date?: string
          total_amount?: number
          total_amountii?: number
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
