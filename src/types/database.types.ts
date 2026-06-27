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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      app_config: {
        Row: {
          avatar_default: string | null
          id: number
          primary_color: string | null
          primary_dark_color: string | null
          primary_darker_color: string | null
          project_logo: string | null
          project_name: string
          secondary_color: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_default?: string | null
          id?: number
          primary_color?: string | null
          primary_dark_color?: string | null
          primary_darker_color?: string | null
          project_logo?: string | null
          project_name?: string
          secondary_color?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_default?: string | null
          id?: number
          primary_color?: string | null
          primary_dark_color?: string | null
          primary_darker_color?: string | null
          project_logo?: string | null
          project_name?: string
          secondary_color?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      banners: {
        Row: {
          action_label: string | null
          created_at: string
          description: string | null
          id: string
          image: string
          page_route: string | null
          params_id: string | null
          screen: string | null
          sort: number | null
          status: string
          title: string | null
        }
        Insert: {
          action_label?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image: string
          page_route?: string | null
          params_id?: string | null
          screen?: string | null
          sort?: number | null
          status?: string
          title?: string | null
        }
        Update: {
          action_label?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image?: string
          page_route?: string | null
          params_id?: string | null
          screen?: string | null
          sort?: number | null
          status?: string
          title?: string | null
        }
        Relationships: []
      }
      congresso_convidados: {
        Row: {
          congresso_id: string
          id: number
          role: string | null
          user_id: string
        }
        Insert: {
          congresso_id: string
          id?: never
          role?: string | null
          user_id: string
        }
        Update: {
          congresso_id?: string
          id?: never
          role?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "congresso_convidados_congresso_id_fkey"
            columns: ["congresso_id"]
            isOneToOne: false
            referencedRelation: "congressos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "congresso_convidados_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      congressos: {
        Row: {
          created_at: string
          date_end: string
          date_start: string
          description: string | null
          id: string
          name: string
          poster: string | null
          primary_color: string | null
          second_color: string | null
          status: string
          status_hospedagem: boolean
          theme: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          date_end: string
          date_start: string
          description?: string | null
          id?: string
          name: string
          poster?: string | null
          primary_color?: string | null
          second_color?: string | null
          status?: string
          status_hospedagem?: boolean
          theme?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          date_end?: string
          date_start?: string
          description?: string | null
          id?: string
          name?: string
          poster?: string | null
          primary_color?: string | null
          second_color?: string | null
          status?: string
          status_hospedagem?: boolean
          theme?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      device_tokens: {
        Row: {
          created_at: string
          id: string
          platform: string | null
          status: boolean
          token: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          platform?: string | null
          status?: boolean
          token: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          platform?: string | null
          status?: boolean
          token?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "device_tokens_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      event_subscriptions: {
        Row: {
          created_at: string
          event_id: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_subscriptions_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          end_date_time: string | null
          event_type: string
          id: string
          image_cover: string | null
          location: string
          organizer: string | null
          organizer_contact_info: string | null
          sort: number | null
          start_date_time: string
          status: string | null
          subtitle: string | null
          title: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_date_time?: string | null
          event_type?: string
          id?: string
          image_cover?: string | null
          location: string
          organizer?: string | null
          organizer_contact_info?: string | null
          sort?: number | null
          start_date_time: string
          status?: string | null
          subtitle?: string | null
          title: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_date_time?: string | null
          event_type?: string
          id?: string
          image_cover?: string | null
          location?: string
          organizer?: string | null
          organizer_contact_info?: string | null
          sort?: number | null
          start_date_time?: string
          status?: string | null
          subtitle?: string | null
          title?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "events_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      hospedagem: {
        Row: {
          anfitriao: string | null
          comodidades: Json | null
          created_at: string
          created_by: string | null
          custo: number | null
          descricao: string | null
          disponibilidade: string | null
          id: number
          regras: string | null
          status: string | null
          tipo: Json | null
          titulo: string | null
          updated_at: string | null
          vagas_disponiveis: number | null
          vagas_ocupadas: number | null
        }
        Insert: {
          anfitriao?: string | null
          comodidades?: Json | null
          created_at?: string
          created_by?: string | null
          custo?: number | null
          descricao?: string | null
          disponibilidade?: string | null
          id?: never
          regras?: string | null
          status?: string | null
          tipo?: Json | null
          titulo?: string | null
          updated_at?: string | null
          vagas_disponiveis?: number | null
          vagas_ocupadas?: number | null
        }
        Update: {
          anfitriao?: string | null
          comodidades?: Json | null
          created_at?: string
          created_by?: string | null
          custo?: number | null
          descricao?: string | null
          disponibilidade?: string | null
          id?: never
          regras?: string | null
          status?: string | null
          tipo?: Json | null
          titulo?: string | null
          updated_at?: string | null
          vagas_disponiveis?: number | null
          vagas_ocupadas?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "hospedagem_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      news: {
        Row: {
          author: string | null
          category: string | null
          content: string
          created_at: string
          created_by: string | null
          excerpt: string | null
          featured: boolean | null
          featured_image: string | null
          id: string
          meta_description: string | null
          meta_title: string | null
          publish_date: string
          reading_time: number | null
          slug: string
          status: string
          title: string
          updated_at: string | null
          updated_by: string | null
          views_count: number | null
        }
        Insert: {
          author?: string | null
          category?: string | null
          content: string
          created_at?: string
          created_by?: string | null
          excerpt?: string | null
          featured?: boolean | null
          featured_image?: string | null
          id?: string
          meta_description?: string | null
          meta_title?: string | null
          publish_date?: string
          reading_time?: number | null
          slug: string
          status?: string
          title: string
          updated_at?: string | null
          updated_by?: string | null
          views_count?: number | null
        }
        Update: {
          author?: string | null
          category?: string | null
          content?: string
          created_at?: string
          created_by?: string | null
          excerpt?: string | null
          featured?: boolean | null
          featured_image?: string | null
          id?: string
          meta_description?: string | null
          meta_title?: string | null
          publish_date?: string
          reading_time?: number | null
          slug?: string
          status?: string
          title?: string
          updated_at?: string | null
          updated_by?: string | null
          views_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "news_author_fkey"
            columns: ["author"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "news_category_fkey"
            columns: ["category"]
            isOneToOne: false
            referencedRelation: "news_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "news_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "news_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      news_categories: {
        Row: {
          color: string | null
          description: string | null
          icon: string | null
          id: string
          name: string
          slug: string
          sort: number | null
        }
        Insert: {
          color?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          slug: string
          sort?: number | null
        }
        Update: {
          color?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          slug?: string
          sort?: number | null
        }
        Relationships: []
      }
      news_news_gallery: {
        Row: {
          file_path: string
          id: number
          news_id: string
          sort: number | null
        }
        Insert: {
          file_path: string
          id?: never
          news_id: string
          sort?: number | null
        }
        Update: {
          file_path?: string
          id?: never
          news_id?: string
          sort?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "news_news_gallery_news_id_fkey"
            columns: ["news_id"]
            isOneToOne: false
            referencedRelation: "news"
            referencedColumns: ["id"]
          },
        ]
      }
      news_news_tags: {
        Row: {
          id: number
          news_id: string
          news_tags_id: string
        }
        Insert: {
          id?: never
          news_id: string
          news_tags_id: string
        }
        Update: {
          id?: never
          news_id?: string
          news_tags_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "news_news_tags_news_id_fkey"
            columns: ["news_id"]
            isOneToOne: false
            referencedRelation: "news"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "news_news_tags_news_tags_id_fkey"
            columns: ["news_tags_id"]
            isOneToOne: false
            referencedRelation: "news_tags"
            referencedColumns: ["id"]
          },
        ]
      }
      news_tags: {
        Row: {
          id: string
          name: string
          slug: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          data: Json | null
          deleted_at: string | null
          id: string
          read: boolean
          read_at: string | null
          status: boolean
          title: string | null
          type: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          data?: Json | null
          deleted_at?: string | null
          id?: string
          read?: boolean
          read_at?: string | null
          status?: boolean
          title?: string | null
          type?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          data?: Json | null
          deleted_at?: string | null
          id?: string
          read?: boolean
          read_at?: string | null
          status?: boolean
          title?: string | null
          type?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          content: string | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          image: string | null
          sort: number | null
          status: string
          tags: string[] | null
          title: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          image?: string | null
          sort?: number | null
          status?: string
          tags?: string[] | null
          title: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          image?: string | null
          sort?: number | null
          status?: string
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "posts_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar: string | null
          birthdate: string | null
          created_at: string
          description: string | null
          email: string
          first_name: string | null
          gender: string | null
          id: string
          language: string | null
          last_access: string | null
          last_name: string | null
          location: string | null
          phone: string | null
          responsible_email: string | null
          responsible_name: string | null
          responsible_phone: string | null
          role: string | null
          sector: string | null
          status: string
          tags: string[] | null
          theme: string | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          avatar?: string | null
          birthdate?: string | null
          created_at?: string
          description?: string | null
          email: string
          first_name?: string | null
          gender?: string | null
          id: string
          language?: string | null
          last_access?: string | null
          last_name?: string | null
          location?: string | null
          phone?: string | null
          responsible_email?: string | null
          responsible_name?: string | null
          responsible_phone?: string | null
          role?: string | null
          sector?: string | null
          status?: string
          tags?: string[] | null
          theme?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar?: string | null
          birthdate?: string | null
          created_at?: string
          description?: string | null
          email?: string
          first_name?: string | null
          gender?: string | null
          id?: string
          language?: string | null
          last_access?: string | null
          last_name?: string | null
          location?: string | null
          phone?: string | null
          responsible_email?: string | null
          responsible_name?: string | null
          responsible_phone?: string | null
          role?: string | null
          sector?: string | null
          status?: string
          tags?: string[] | null
          theme?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_sector_fkey"
            columns: ["sector"]
            isOneToOne: false
            referencedRelation: "sectors"
            referencedColumns: ["id"]
          },
        ]
      }
      repertorios: {
        Row: {
          artist: string
          category: string[] | null
          color: string | null
          content: string | null
          created_at: string
          id: string
          image_cover: string
          mp3: string
          sort: number | null
          status: string
          title: string | null
          updated_at: string | null
        }
        Insert: {
          artist: string
          category?: string[] | null
          color?: string | null
          content?: string | null
          created_at?: string
          id?: string
          image_cover: string
          mp3: string
          sort?: number | null
          status?: string
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          artist?: string
          category?: string[] | null
          color?: string | null
          content?: string | null
          created_at?: string
          id?: string
          image_cover?: string
          mp3?: string
          sort?: number | null
          status?: string
          title?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      sectors: {
        Row: {
          created_at: string
          id: string
          legacy_slug: string | null
          name: string
          sort: number | null
          status: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          legacy_slug?: string | null
          name: string
          sort?: number | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          legacy_slug?: string | null
          name?: string
          sort?: number | null
          status?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      subscribed_hos: {
        Row: {
          accommodation: boolean
          allergies: boolean
          allergies_description: string | null
          blood_type: string | null
          blood_type_rh: string | null
          child_companion: boolean
          created_at: string
          created_by: string | null
          emergency_contact: string | null
          id: number
          member: string
          normas_cinco: boolean
          normas_dez: boolean
          normas_dois: boolean
          normas_nove: boolean
          normas_oito: boolean
          normas_quatro: boolean
          normas_seis: boolean
          normas_sete: boolean
          normas_tres: boolean
          normas_um: boolean
          payment: Json | null
          payment_id: string | null
          payment_status: string | null
          take_medication: boolean
          take_medication_description: string | null
        }
        Insert: {
          accommodation?: boolean
          allergies?: boolean
          allergies_description?: string | null
          blood_type?: string | null
          blood_type_rh?: string | null
          child_companion?: boolean
          created_at?: string
          created_by?: string | null
          emergency_contact?: string | null
          id?: never
          member: string
          normas_cinco?: boolean
          normas_dez?: boolean
          normas_dois?: boolean
          normas_nove?: boolean
          normas_oito?: boolean
          normas_quatro?: boolean
          normas_seis?: boolean
          normas_sete?: boolean
          normas_tres?: boolean
          normas_um?: boolean
          payment?: Json | null
          payment_id?: string | null
          payment_status?: string | null
          take_medication?: boolean
          take_medication_description?: string | null
        }
        Update: {
          accommodation?: boolean
          allergies?: boolean
          allergies_description?: string | null
          blood_type?: string | null
          blood_type_rh?: string | null
          child_companion?: boolean
          created_at?: string
          created_by?: string | null
          emergency_contact?: string | null
          id?: never
          member?: string
          normas_cinco?: boolean
          normas_dez?: boolean
          normas_dois?: boolean
          normas_nove?: boolean
          normas_oito?: boolean
          normas_quatro?: boolean
          normas_seis?: boolean
          normas_sete?: boolean
          normas_tres?: boolean
          normas_um?: boolean
          payment?: Json | null
          payment_id?: string | null
          payment_status?: string | null
          take_medication?: boolean
          take_medication_description?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscribed_hos_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscribed_hos_member_fkey"
            columns: ["member"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      translations: {
        Row: {
          id: string
          key: string
          language: string
          updated_at: string
          value: string
        }
        Insert: {
          id?: string
          key: string
          language: string
          updated_at?: string
          value: string
        }
        Update: {
          id?: string
          key?: string
          language?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      increment_news_views: { Args: { p_id: string }; Returns: undefined }
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
