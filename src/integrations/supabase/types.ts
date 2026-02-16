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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      alerts: {
        Row: {
          created_at: string
          id: string
          lat: number | null
          lng: number | null
          message: string
          region: string | null
          severity: string
          source: string | null
          type: string
        }
        Insert: {
          created_at?: string
          id?: string
          lat?: number | null
          lng?: number | null
          message: string
          region?: string | null
          severity?: string
          source?: string | null
          type: string
        }
        Update: {
          created_at?: string
          id?: string
          lat?: number | null
          lng?: number | null
          message?: string
          region?: string | null
          severity?: string
          source?: string | null
          type?: string
        }
        Relationships: []
      }
      chat_history: {
        Row: {
          ai_response: string
          context: Json | null
          created_at: string
          id: string
          message: string
          user_id: string
        }
        Insert: {
          ai_response: string
          context?: Json | null
          created_at?: string
          id?: string
          message: string
          user_id: string
        }
        Update: {
          ai_response?: string
          context?: Json | null
          created_at?: string
          id?: string
          message?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          emergency_contact: string | null
          id: string
          language: string
          location_lat: number | null
          location_lng: number | null
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          emergency_contact?: string | null
          id?: string
          language?: string
          location_lat?: number | null
          location_lng?: number | null
          name?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          emergency_contact?: string | null
          id?: string
          language?: string
          location_lat?: number | null
          location_lng?: number | null
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      report_validations: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          report_id: string
          user_id: string
          vote: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          report_id: string
          user_id: string
          vote: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          report_id?: string
          user_id?: string
          vote?: string
        }
        Relationships: [
          {
            foreignKeyName: "report_validations_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "reports"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          confidence: number | null
          confirm_count: number
          created_at: string
          deny_count: number
          description: string | null
          disaster_type: string
          id: string
          lat: number
          lng: number
          photo_url: string | null
          title: string
          trust_score: number
          user_id: string
          verified: boolean
        }
        Insert: {
          confidence?: number | null
          confirm_count?: number
          created_at?: string
          deny_count?: number
          description?: string | null
          disaster_type?: string
          id?: string
          lat: number
          lng: number
          photo_url?: string | null
          title: string
          trust_score?: number
          user_id: string
          verified?: boolean
        }
        Update: {
          confidence?: number | null
          confirm_count?: number
          created_at?: string
          deny_count?: number
          description?: string | null
          disaster_type?: string
          id?: string
          lat?: number
          lng?: number
          photo_url?: string | null
          title?: string
          trust_score?: number
          user_id?: string
          verified?: boolean
        }
        Relationships: []
      }
      risk_predictions: {
        Row: {
          community_validations: number | null
          created_at: string
          cyclone_risk: number
          explanation: Json | null
          fire_risk: number
          flood_risk: number
          heat_wave_risk: number
          id: string
          landslide_risk: number
          lat: number
          lng: number
          quake_risk: number
          region: string | null
          risk_level: string | null
          trust_score: number | null
        }
        Insert: {
          community_validations?: number | null
          created_at?: string
          cyclone_risk?: number
          explanation?: Json | null
          fire_risk?: number
          flood_risk?: number
          heat_wave_risk?: number
          id?: string
          landslide_risk?: number
          lat: number
          lng: number
          quake_risk?: number
          region?: string | null
          risk_level?: string | null
          trust_score?: number | null
        }
        Update: {
          community_validations?: number | null
          created_at?: string
          cyclone_risk?: number
          explanation?: Json | null
          fire_risk?: number
          flood_risk?: number
          heat_wave_risk?: number
          id?: string
          landslide_risk?: number
          lat?: number
          lng?: number
          quake_risk?: number
          region?: string | null
          risk_level?: string | null
          trust_score?: number | null
        }
        Relationships: []
      }
      shelters: {
        Row: {
          capacity: number
          id: string
          lat: number
          lng: number
          name: string
          occupancy: number
          verified_at: string | null
        }
        Insert: {
          capacity?: number
          id?: string
          lat: number
          lng: number
          name: string
          occupancy?: number
          verified_at?: string | null
        }
        Update: {
          capacity?: number
          id?: string
          lat?: number
          lng?: number
          name?: string
          occupancy?: number
          verified_at?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "citizen" | "responder" | "admin"
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
    Enums: {
      app_role: ["citizen", "responder", "admin"],
    },
  },
} as const
