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
    PostgrestVersion: "13.0.4";
  };
  public: {
    Tables: {
      drink_categories: {
        Row: {
          created_at: string | null;
          description: string | null;
          display_order: number;
          id: string;
          is_active: boolean;
          name: string;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          description?: string | null;
          display_order?: number;
          id?: string;
          is_active?: boolean;
          name: string;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          description?: string | null;
          display_order?: number;
          id?: string;
          is_active?: boolean;
          name?: string;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      drink_options: {
        Row: {
          created_at: string | null;
          default_option_value_id: string | null;
          drink_id: string;
          id: string;
          option_category_id: string;
        };
        Insert: {
          created_at?: string | null;
          default_option_value_id?: string | null;
          drink_id: string;
          id?: string;
          option_category_id: string;
        };
        Update: {
          created_at?: string | null;
          default_option_value_id?: string | null;
          drink_id?: string;
          id?: string;
          option_category_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "drink_options_default_option_value_id_fkey";
            columns: ["default_option_value_id"];
            isOneToOne: false;
            referencedRelation: "option_values";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "drink_options_drink_id_fkey";
            columns: ["drink_id"];
            isOneToOne: false;
            referencedRelation: "drinks";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "drink_options_drink_id_fkey";
            columns: ["drink_id"];
            isOneToOne: false;
            referencedRelation: "drinks_with_categories";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "drink_options_option_category_id_fkey";
            columns: ["option_category_id"];
            isOneToOne: false;
            referencedRelation: "option_categories";
            referencedColumns: ["id"];
          },
        ];
      };
      drinks: {
        Row: {
          category_id: string;
          created_at: string | null;
          description: string | null;
          display_order: number;
          id: string;
          is_active: boolean;
          name: string;
          preparation_time_minutes: number | null;
          updated_at: string | null;
        };
        Insert: {
          category_id: string;
          created_at?: string | null;
          description?: string | null;
          display_order?: number;
          id?: string;
          is_active?: boolean;
          name: string;
          preparation_time_minutes?: number | null;
          updated_at?: string | null;
        };
        Update: {
          category_id?: string;
          created_at?: string | null;
          description?: string | null;
          display_order?: number;
          id?: string;
          is_active?: boolean;
          name?: string;
          preparation_time_minutes?: number | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "drinks_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "drink_categories";
            referencedColumns: ["id"];
          },
        ];
      };
      option_categories: {
        Row: {
          created_at: string | null;
          description: string | null;
          display_order: number;
          id: string;
          is_required: boolean;
          name: string;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          description?: string | null;
          display_order?: number;
          id?: string;
          is_required?: boolean;
          name: string;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          description?: string | null;
          display_order?: number;
          id?: string;
          is_required?: boolean;
          name?: string;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      option_values: {
        Row: {
          created_at: string | null;
          description: string | null;
          display_order: number;
          id: string;
          is_active: boolean;
          name: string;
          option_category_id: string;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          description?: string | null;
          display_order?: number;
          id?: string;
          is_active?: boolean;
          name: string;
          option_category_id: string;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          description?: string | null;
          display_order?: number;
          id?: string;
          is_active?: boolean;
          name?: string;
          option_category_id?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "option_values_option_category_id_fkey";
            columns: ["option_category_id"];
            isOneToOne: false;
            referencedRelation: "option_categories";
            referencedColumns: ["id"];
          },
        ];
      };
      order_options: {
        Row: {
          created_at: string | null;
          id: string;
          option_category_id: string;
          option_value_id: string;
          order_id: string;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          option_category_id: string;
          option_value_id: string;
          order_id: string;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          option_category_id?: string;
          option_value_id?: string;
          order_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "order_options_option_category_id_fkey";
            columns: ["option_category_id"];
            isOneToOne: false;
            referencedRelation: "option_categories";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "order_options_option_value_id_fkey";
            columns: ["option_value_id"];
            isOneToOne: false;
            referencedRelation: "option_values";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "order_options_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "order_options_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders_with_details";
            referencedColumns: ["id"];
          },
        ];
      };
      orders: {
        Row: {
          created_at: string | null;
          drink_id: string;
          guest_name: string;
          id: string;
          queue_number: number | null;
          special_request: string | null;
          status: Database["public"]["Enums"]["order_status"] | null;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          drink_id: string;
          guest_name: string;
          id?: string;
          queue_number?: number | null;
          special_request?: string | null;
          status?: Database["public"]["Enums"]["order_status"] | null;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          drink_id?: string;
          guest_name?: string;
          id?: string;
          queue_number?: number | null;
          special_request?: string | null;
          status?: Database["public"]["Enums"]["order_status"] | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "orders_drink_id_fkey";
            columns: ["drink_id"];
            isOneToOne: false;
            referencedRelation: "drinks";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "orders_drink_id_fkey";
            columns: ["drink_id"];
            isOneToOne: false;
            referencedRelation: "drinks_with_categories";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      drinks_with_categories: {
        Row: {
          category_description: string | null;
          category_display_order: number | null;
          category_name: string | null;
          description: string | null;
          display_order: number | null;
          id: string | null;
          is_active: boolean | null;
          name: string | null;
          preparation_time_minutes: number | null;
        };
        Relationships: [];
      };
      orders_with_details: {
        Row: {
          category_name: string | null;
          created_at: string | null;
          drink_name: string | null;
          guest_name: string | null;
          id: string | null;
          preparation_time_minutes: number | null;
          queue_number: number | null;
          selected_options: string | null;
          status: Database["public"]["Enums"]["order_status"] | null;
          updated_at: string | null;
        };
        Relationships: [];
      };
    };
    Functions: {
      calculate_queue_number: {
        Args: { order_created_at: string };
        Returns: number;
      };
    };
    Enums: {
      order_status: "pending" | "completed" | "cancelled";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema =
  DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  } ? keyof (
      & DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]][
        "Tables"
      ]
      & DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]][
        "Views"
      ]
    )
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
} ? (
    & DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]][
      "Tables"
    ]
    & DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]][
      "Views"
    ]
  )[TableName] extends {
    Row: infer R;
  } ? R
  : never
  : DefaultSchemaTableNameOrOptions extends keyof (
    & DefaultSchema["Tables"]
    & DefaultSchema["Views"]
  ) ? (
      & DefaultSchema["Tables"]
      & DefaultSchema["Views"]
    )[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R;
    } ? R
    : never
  : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  } ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]][
      "Tables"
    ]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
} ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]][
    "Tables"
  ][TableName] extends {
    Insert: infer I;
  } ? I
  : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Insert: infer I;
    } ? I
    : never
  : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  } ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]][
      "Tables"
    ]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
} ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]][
    "Tables"
  ][TableName] extends {
    Update: infer U;
  } ? U
  : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Update: infer U;
    } ? U
    : never
  : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  } ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]][
      "Enums"
    ]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
} ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][
    EnumName
  ]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  } ? keyof DatabaseWithoutInternals[
      PublicCompositeTypeNameOrOptions["schema"]
    ]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
} ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]][
    "CompositeTypes"
  ][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never;

export const Constants = {
  public: {
    Enums: {
      order_status: ["pending", "completed", "cancelled"],
    },
  },
} as const;
