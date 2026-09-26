// Generated from Supabase project zmlkjhlpxrkuwcukfezo after Phase 2A migrations.
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      fruits: {
        Row: {
          active: boolean;
          created_at: string;
          id: string;
          image: string;
          money_price: number;
          name: string;
          rarity: string;
          robux_price: number | null;
          slug: string;
          type: string;
          updated_at: string;
        };
        Insert: {
          active?: boolean;
          created_at?: string;
          id?: string;
          image: string;
          money_price: number;
          name: string;
          rarity: string;
          robux_price?: number | null;
          slug: string;
          type: string;
          updated_at?: string;
        };
        Update: {
          active?: boolean;
          created_at?: string;
          id?: string;
          image?: string;
          money_price?: number;
          name?: string;
          rarity?: string;
          robux_price?: number | null;
          slug?: string;
          type?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      stock_items: {
        Row: {
          fruit_id: string;
          position: number;
          rotation_id: string;
        };
        Insert: {
          fruit_id: string;
          position?: number;
          rotation_id: string;
        };
        Update: {
          fruit_id?: string;
          position?: number;
          rotation_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "stock_items_fruit_id_fkey";
            columns: ["fruit_id"];
            isOneToOne: false;
            referencedRelation: "fruits";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "stock_items_rotation_id_fkey";
            columns: ["rotation_id"];
            isOneToOne: false;
            referencedRelation: "stock_rotations";
            referencedColumns: ["id"];
          },
        ];
      };
      stock_rotations: {
        Row: {
          content_hash: string | null;
          created_at: string;
          dealer: string;
          fetched_at: string;
          id: string;
          raw_payload: Json | null;
          rotation_end: string;
          rotation_start: string;
          slot_key: string;
          source: string;
          source_updated_at: string | null;
          status: string;
        };
        Insert: {
          content_hash?: string | null;
          created_at?: string;
          dealer: string;
          fetched_at?: string;
          id?: string;
          raw_payload?: Json | null;
          rotation_end: string;
          rotation_start: string;
          slot_key: string;
          source: string;
          source_updated_at?: string | null;
          status: string;
        };
        Update: {
          content_hash?: string | null;
          created_at?: string;
          dealer?: string;
          fetched_at?: string;
          id?: string;
          raw_payload?: Json | null;
          rotation_end?: string;
          rotation_start?: string;
          slot_key?: string;
          source?: string;
          source_updated_at?: string | null;
          status?: string;
        };
        Relationships: [];
      };
      sync_runs: {
        Row: {
          attempted_at: string;
          completed_at: string | null;
          duration_ms: number | null;
          error: string | null;
          id: string;
          metadata: Json | null;
          source: string | null;
          success: boolean;
        };
        Insert: {
          attempted_at?: string;
          completed_at?: string | null;
          duration_ms?: number | null;
          error?: string | null;
          id?: string;
          metadata?: Json | null;
          source?: string | null;
          success?: boolean;
        };
        Update: {
          attempted_at?: string;
          completed_at?: string | null;
          duration_ms?: number | null;
          error?: string | null;
          id?: string;
          metadata?: Json | null;
          source?: string | null;
          success?: boolean;
        };
        Relationships: [];
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
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
