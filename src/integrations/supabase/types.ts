export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      api_usage: {
        Row: {
          created_at: string
          date: string
          endpoint: string
          id: string
          request_count: number
          user_id: string
        }
        Insert: {
          created_at?: string
          date?: string
          endpoint: string
          id?: string
          request_count?: number
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          endpoint?: string
          id?: string
          request_count?: number
          user_id?: string
        }
        Relationships: []
      }
      lock_contracts: {
        Row: {
          beneficiary_address: string
          contract_address: string
          contract_type: string
          created_at: string
          id: string
          is_multisig: boolean
          lock_amount: number
          lock_duration_days: number
          required_signatures: number | null
          status: string
          token_address: string
          token_symbol: string
          unlock_date: string
          updated_at: string
          user_id: string
        }
        Insert: {
          beneficiary_address: string
          contract_address: string
          contract_type?: string
          created_at?: string
          id?: string
          is_multisig?: boolean
          lock_amount: number
          lock_duration_days: number
          required_signatures?: number | null
          status?: string
          token_address: string
          token_symbol: string
          unlock_date: string
          updated_at?: string
          user_id: string
        }
        Update: {
          beneficiary_address?: string
          contract_address?: string
          contract_type?: string
          created_at?: string
          id?: string
          is_multisig?: boolean
          lock_amount?: number
          lock_duration_days?: number
          required_signatures?: number | null
          status?: string
          token_address?: string
          token_symbol?: string
          unlock_date?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      lock_templates: {
        Row: {
          created_at: string
          default_duration_days: number
          description: string | null
          features: Json
          id: string
          is_active: boolean
          is_multisig_required: boolean
          max_duration_days: number
          min_duration_days: number
          name: string
          security_score: number
          template_type: string
        }
        Insert: {
          created_at?: string
          default_duration_days: number
          description?: string | null
          features?: Json
          id?: string
          is_active?: boolean
          is_multisig_required?: boolean
          max_duration_days: number
          min_duration_days: number
          name: string
          security_score?: number
          template_type: string
        }
        Update: {
          created_at?: string
          default_duration_days?: number
          description?: string | null
          features?: Json
          id?: string
          is_active?: boolean
          is_multisig_required?: boolean
          max_duration_days?: number
          min_duration_days?: number
          name?: string
          security_score?: number
          template_type?: string
        }
        Relationships: []
      }
      lock_transactions: {
        Row: {
          amount: number
          block_number: number | null
          contract_id: string
          created_at: string
          gas_price: number | null
          gas_used: number | null
          id: string
          transaction_hash: string
          transaction_type: string
        }
        Insert: {
          amount: number
          block_number?: number | null
          contract_id: string
          created_at?: string
          gas_price?: number | null
          gas_used?: number | null
          id?: string
          transaction_hash: string
          transaction_type: string
        }
        Update: {
          amount?: number
          block_number?: number | null
          contract_id?: string
          created_at?: string
          gas_price?: number | null
          gas_used?: number | null
          id?: string
          transaction_hash?: string
          transaction_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "lock_transactions_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "lock_contracts"
            referencedColumns: ["id"]
          },
        ]
      }
      lock_verifications: {
        Row: {
          comments: string | null
          contract_id: string
          created_at: string
          id: string
          is_verified: boolean
          rating: number
          user_id: string
          verification_type: string
        }
        Insert: {
          comments?: string | null
          contract_id: string
          created_at?: string
          id?: string
          is_verified?: boolean
          rating: number
          user_id: string
          verification_type: string
        }
        Update: {
          comments?: string | null
          contract_id?: string
          created_at?: string
          id?: string
          is_verified?: boolean
          rating?: number
          user_id?: string
          verification_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "lock_verifications_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "lock_contracts"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          stripe_customer_id: string | null
          subscription_tier: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id?: string
          stripe_customer_id?: string | null
          subscription_tier?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          stripe_customer_id?: string | null
          subscription_tier?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      pulse_analytics: {
        Row: {
          coin_symbol: string
          confidence_percentage: number
          created_at: string
          current_phase: string
          historical_similarity: Json | null
          id: string
          market_cap: number | null
          next_peak_prediction: string | null
          price_usd: number | null
          pulse_score: number
          volume_24h: number | null
        }
        Insert: {
          coin_symbol: string
          confidence_percentage: number
          created_at?: string
          current_phase: string
          historical_similarity?: Json | null
          id?: string
          market_cap?: number | null
          next_peak_prediction?: string | null
          price_usd?: number | null
          pulse_score: number
          volume_24h?: number | null
        }
        Update: {
          coin_symbol?: string
          confidence_percentage?: number
          created_at?: string
          current_phase?: string
          historical_similarity?: Json | null
          id?: string
          market_cap?: number | null
          next_peak_prediction?: string | null
          price_usd?: number | null
          pulse_score?: number
          volume_24h?: number | null
        }
        Relationships: []
      }
      subscription_plans: {
        Row: {
          api_access: boolean
          created_at: string
          features: Json
          historical_depth_days: number | null
          id: string
          max_alerts_per_day: number | null
          max_coins: number | null
          name: string
          price_monthly: number
          price_yearly: number | null
        }
        Insert: {
          api_access?: boolean
          created_at?: string
          features?: Json
          historical_depth_days?: number | null
          id?: string
          max_alerts_per_day?: number | null
          max_coins?: number | null
          name: string
          price_monthly: number
          price_yearly?: number | null
        }
        Update: {
          api_access?: boolean
          created_at?: string
          features?: Json
          historical_depth_days?: number | null
          id?: string
          max_alerts_per_day?: number | null
          max_coins?: number | null
          name?: string
          price_monthly?: number
          price_yearly?: number | null
        }
        Relationships: []
      }
      token_locks: {
        Row: {
          amount_locked: number
          community_vote_threshold: number | null
          contract_id: string
          created_at: string
          id: string
          is_emergency_unlockable: boolean
          lock_type: string
          percentage_of_supply: number | null
          unlock_schedule: Json | null
        }
        Insert: {
          amount_locked: number
          community_vote_threshold?: number | null
          contract_id: string
          created_at?: string
          id?: string
          is_emergency_unlockable?: boolean
          lock_type: string
          percentage_of_supply?: number | null
          unlock_schedule?: Json | null
        }
        Update: {
          amount_locked?: number
          community_vote_threshold?: number | null
          contract_id?: string
          created_at?: string
          id?: string
          is_emergency_unlockable?: boolean
          lock_type?: string
          percentage_of_supply?: number | null
          unlock_schedule?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "token_locks_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "lock_contracts"
            referencedColumns: ["id"]
          },
        ]
      }
      user_alerts: {
        Row: {
          alert_type: string
          coin_symbol: string
          created_at: string
          id: string
          is_active: boolean
          last_triggered: string | null
          notification_channels: string[]
          trigger_value: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          alert_type: string
          coin_symbol: string
          created_at?: string
          id?: string
          is_active?: boolean
          last_triggered?: string | null
          notification_channels?: string[]
          trigger_value?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          alert_type?: string
          coin_symbol?: string
          created_at?: string
          id?: string
          is_active?: boolean
          last_triggered?: string | null
          notification_channels?: string[]
          trigger_value?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_subscriptions: {
        Row: {
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          id: string
          plan_id: string
          status: string
          stripe_subscription_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan_id: string
          status?: string
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan_id?: string
          status?: string
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_subscription_tier: {
        Args: { user_uuid: string }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
