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
      damage_assessments: {
        Row: {
          affected_households: number | null
          affected_population: number | null
          assessed_at: string
          assessor_id: string
          created_at: string
          damage_type: string
          description: string | null
          district: string
          estimated_cost_inr: number | null
          id: string
          incident_id: string | null
          infrastructure_damage: Json | null
          lat: number | null
          lng: number | null
          location_name: string
          notes: string | null
          photo_urls: string[] | null
          priority: string
          recovery_phase: string
          recovery_progress: number | null
          severity: string
          state: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          affected_households?: number | null
          affected_population?: number | null
          assessed_at?: string
          assessor_id: string
          created_at?: string
          damage_type?: string
          description?: string | null
          district: string
          estimated_cost_inr?: number | null
          id?: string
          incident_id?: string | null
          infrastructure_damage?: Json | null
          lat?: number | null
          lng?: number | null
          location_name: string
          notes?: string | null
          photo_urls?: string[] | null
          priority?: string
          recovery_phase?: string
          recovery_progress?: number | null
          severity?: string
          state?: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          affected_households?: number | null
          affected_population?: number | null
          assessed_at?: string
          assessor_id?: string
          created_at?: string
          damage_type?: string
          description?: string | null
          district?: string
          estimated_cost_inr?: number | null
          id?: string
          incident_id?: string | null
          infrastructure_damage?: Json | null
          lat?: number | null
          lng?: number | null
          location_name?: string
          notes?: string | null
          photo_urls?: string[] | null
          priority?: string
          recovery_phase?: string
          recovery_progress?: number | null
          severity?: string
          state?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "damage_assessments_incident_id_fkey"
            columns: ["incident_id"]
            isOneToOne: false
            referencedRelation: "incidents"
            referencedColumns: ["id"]
          },
        ]
      }
      evac_notifications: {
        Row: {
          created_at: string | null
          id: string
          message: string | null
          shelter_id: string | null
          user_lat: number
          user_lng: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          message?: string | null
          shelter_id?: string | null
          user_lat: number
          user_lng: number
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string | null
          shelter_id?: string | null
          user_lat?: number
          user_lng?: number
        }
        Relationships: []
      }
      flood_stations: {
        Row: {
          created_at: string
          current_level: number
          danger_level: number
          forecast_24h: number | null
          forecast_48h: number | null
          forecast_72h: number | null
          id: string
          last_updated: string
          lat: number
          lng: number
          name: string
          rainfall_mm: number | null
          river: string
          state: string
          status: string
          warning_level: number
        }
        Insert: {
          created_at?: string
          current_level?: number
          danger_level?: number
          forecast_24h?: number | null
          forecast_48h?: number | null
          forecast_72h?: number | null
          id?: string
          last_updated?: string
          lat: number
          lng: number
          name: string
          rainfall_mm?: number | null
          river: string
          state: string
          status?: string
          warning_level?: number
        }
        Update: {
          created_at?: string
          current_level?: number
          danger_level?: number
          forecast_24h?: number | null
          forecast_48h?: number | null
          forecast_72h?: number | null
          id?: string
          last_updated?: string
          lat?: number
          lng?: number
          name?: string
          rainfall_mm?: number | null
          river?: string
          state?: string
          status?: string
          warning_level?: number
        }
        Relationships: []
      }
      incident_logs: {
        Row: {
          created_at: string
          created_by: string
          id: string
          incident_id: string
          log_type: string
          message: string
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          incident_id: string
          log_type?: string
          message: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          incident_id?: string
          log_type?: string
          message?: string
        }
        Relationships: [
          {
            foreignKeyName: "incident_logs_incident_id_fkey"
            columns: ["incident_id"]
            isOneToOne: false
            referencedRelation: "incidents"
            referencedColumns: ["id"]
          },
        ]
      }
      incidents: {
        Row: {
          affected_population: number | null
          assigned_to: string | null
          closed_at: string | null
          created_at: string
          created_by: string
          description: string | null
          district: string | null
          id: string
          lat: number | null
          lng: number | null
          location_name: string
          photo_url: string | null
          resources_deployed: string[] | null
          responders_deployed: number | null
          severity: string
          state: string
          status: string
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          affected_population?: number | null
          assigned_to?: string | null
          closed_at?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          district?: string | null
          id?: string
          lat?: number | null
          lng?: number | null
          location_name: string
          photo_url?: string | null
          resources_deployed?: string[] | null
          responders_deployed?: number | null
          severity?: string
          state: string
          status?: string
          title: string
          type?: string
          updated_at?: string
        }
        Update: {
          affected_population?: number | null
          assigned_to?: string | null
          closed_at?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          district?: string | null
          id?: string
          lat?: number | null
          lng?: number | null
          location_name?: string
          photo_url?: string | null
          resources_deployed?: string[] | null
          responders_deployed?: number | null
          severity?: string
          state?: string
          status?: string
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      institutions: {
        Row: {
          category: string
          contact_email: string | null
          contact_person: string | null
          created_at: string
          id: string
          name: string
          state: string | null
        }
        Insert: {
          category?: string
          contact_email?: string | null
          contact_person?: string | null
          created_at?: string
          id?: string
          name: string
          state?: string | null
        }
        Update: {
          category?: string
          contact_email?: string | null
          contact_person?: string | null
          created_at?: string
          id?: string
          name?: string
          state?: string | null
        }
        Relationships: []
      }
      landslide_zones: {
        Row: {
          advisory: string | null
          created_at: string
          district: string
          id: string
          last_updated: string
          rainfall_mm: number | null
          risk_level: string
          risk_score: number
          slope_angle: number | null
          soil_saturation: number | null
          state: string
        }
        Insert: {
          advisory?: string | null
          created_at?: string
          district: string
          id?: string
          last_updated?: string
          rainfall_mm?: number | null
          risk_level?: string
          risk_score?: number
          slope_angle?: number | null
          soil_saturation?: number | null
          state: string
        }
        Update: {
          advisory?: string | null
          created_at?: string
          district?: string
          id?: string
          last_updated?: string
          rainfall_mm?: number | null
          risk_level?: string
          risk_score?: number
          slope_angle?: number | null
          soil_saturation?: number | null
          state?: string
        }
        Relationships: []
      }
      ocean_stations: {
        Row: {
          alert_level: string
          created_at: string
          id: string
          last_updated: string
          lat: number
          lng: number
          name: string
          sea_level_m: number | null
          state: string
          tsunami_probability: number | null
          type: string
          wave_height_m: number | null
          wave_period_s: number | null
        }
        Insert: {
          alert_level?: string
          created_at?: string
          id?: string
          last_updated?: string
          lat: number
          lng: number
          name: string
          sea_level_m?: number | null
          state: string
          tsunami_probability?: number | null
          type?: string
          wave_height_m?: number | null
          wave_period_s?: number | null
        }
        Update: {
          alert_level?: string
          created_at?: string
          id?: string
          last_updated?: string
          lat?: number
          lng?: number
          name?: string
          sea_level_m?: number | null
          state?: string
          tsunami_probability?: number | null
          type?: string
          wave_height_m?: number | null
          wave_period_s?: number | null
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
      resources: {
        Row: {
          category: string
          condition: string
          contact_person: string | null
          contact_phone: string | null
          created_at: string
          created_by: string
          id: string
          lat: number | null
          lng: number | null
          location_name: string
          name: string
          notes: string | null
          owner_org: string
          quantity: number
          state: string
          status: string
          type: string
          unit: string
          updated_at: string
        }
        Insert: {
          category?: string
          condition?: string
          contact_person?: string | null
          contact_phone?: string | null
          created_at?: string
          created_by: string
          id?: string
          lat?: number | null
          lng?: number | null
          location_name: string
          name: string
          notes?: string | null
          owner_org: string
          quantity?: number
          state: string
          status?: string
          type?: string
          unit?: string
          updated_at?: string
        }
        Update: {
          category?: string
          condition?: string
          contact_person?: string | null
          contact_phone?: string | null
          created_at?: string
          created_by?: string
          id?: string
          lat?: number | null
          lng?: number | null
          location_name?: string
          name?: string
          notes?: string | null
          owner_org?: string
          quantity?: number
          state?: string
          status?: string
          type?: string
          unit?: string
          updated_at?: string
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
      training_themes: {
        Row: {
          created_at: string
          description: string | null
          id: string
          theme_name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          theme_name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          theme_name?: string
        }
        Relationships: []
      }
      trainings: {
        Row: {
          created_at: string
          created_by: string
          documents: string[] | null
          end_date: string
          id: string
          institution_id: string | null
          lat: number | null
          level: string
          lng: number | null
          location_name: string
          organizer: string
          outcome_summary: string | null
          participants_female: number
          participants_male: number
          participants_total: number
          start_date: string
          state: string
          theme: string
          title: string
          trainer_names: string | null
          updated_at: string
          verified: boolean
        }
        Insert: {
          created_at?: string
          created_by: string
          documents?: string[] | null
          end_date: string
          id?: string
          institution_id?: string | null
          lat?: number | null
          level?: string
          lng?: number | null
          location_name: string
          organizer: string
          outcome_summary?: string | null
          participants_female?: number
          participants_male?: number
          participants_total?: number
          start_date: string
          state: string
          theme: string
          title: string
          trainer_names?: string | null
          updated_at?: string
          verified?: boolean
        }
        Update: {
          created_at?: string
          created_by?: string
          documents?: string[] | null
          end_date?: string
          id?: string
          institution_id?: string | null
          lat?: number | null
          level?: string
          lng?: number | null
          location_name?: string
          organizer?: string
          outcome_summary?: string | null
          participants_female?: number
          participants_male?: number
          participants_total?: number
          start_date?: string
          state?: string
          theme?: string
          title?: string
          trainer_names?: string | null
          updated_at?: string
          verified?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "trainings_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
        ]
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
