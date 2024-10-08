
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
      clients: {
        Row: {
          balance: number | null
          created_at: string | null
          id: string
          name: string
          nickname: string | null
        }
        Insert: {
          balance?: number | null
          created_at?: string | null
          id?: string
          name: string
          nickname?: string | null
        }
        Update: {
          balance?: number | null
          created_at?: string | null
          id?: string
          name?: string
          nickname?: string | null
        }
        Relationships: []
      }
      consumptions: {
        Row: {
          amount: number | null
          created_at: string | null
          id: string
          paid: boolean | null
          price: number
          product_name: string
          quantity: number
          session_id: string | null
        }
        Insert: {
          amount?: number | null
          created_at?: string | null
          id?: string
          paid?: boolean | null
          price: number
          product_name: string
          quantity: number
          session_id?: string | null
        }
        Update: {
          amount?: number | null
          created_at?: string | null
          id?: string
          paid?: boolean | null
          price?: number
          product_name?: string
          quantity?: number
          session_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "consumptions_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      debits: {
        Row: {
          amount: number | null
          client_id: string | null
          client_name: string | null
          created_at: string
          id: number
          pc_id: string | null
          pc_number: string | null
          session_id: string | null
          status: boolean | null
        }
        Insert: {
          amount?: number | null
          client_id?: string | null
          client_name?: string | null
          created_at?: string
          id?: number
          pc_id?: string | null
          pc_number?: string | null
          session_id?: string | null
          status?: boolean | null
        }
        Update: {
          amount?: number | null
          client_id?: string | null
          client_name?: string | null
          created_at?: string
          id?: number
          pc_id?: string | null
          pc_number?: string | null
          session_id?: string | null
          status?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "debits_pc_id_fkey"
            columns: ["pc_id"]
            isOneToOne: false
            referencedRelation: "pcs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "debts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      debits_details: {
        Row: {
          amount: number | null
          created_at: string
          debts_id: number | null
          details: string | null
          id: number
          payment_method: string | null
        }
        Insert: {
          amount?: number | null
          created_at?: string
          debts_id?: number | null
          details?: string | null
          id?: number
          payment_method?: string | null
        }
        Update: {
          amount?: number | null
          created_at?: string
          debts_id?: number | null
          details?: string | null
          id?: number
          payment_method?: string | null
        }
        Relationships: []
      }
      mov_contable: {
        Row: {
          amount: number | null
          created_at: string | null
          detail: string | null
          id: number
          type: string | null
        }
        Insert: {
          amount?: number | null
          created_at?: string | null
          detail?: string | null
          id?: number
          type?: string | null
        }
        Update: {
          amount?: number | null
          created_at?: string | null
          detail?: string | null
          id?: number
          type?: string | null
        }
        Relationships: []
      }
      pcgroups: {
        Row: {
          created_at: string
          id: number
          name: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          name?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          name?: string | null
        }
        Relationships: []
      }
      pcs: {
        Row: {
          created_at: string | null
          group: number | null
          id: string
          number: string
          position: Json | null
          status: string | null
        }
        Insert: {
          created_at?: string | null
          group?: number | null
          id?: string
          number: string
          position?: Json | null
          status?: string | null
        }
        Update: {
          created_at?: string | null
          group?: number | null
          id?: string
          number?: string
          position?: Json | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pcs_group_fkey"
            columns: ["group"]
            isOneToOne: false
            referencedRelation: "pcgroups"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          group: number
          id: string
          name: string
          price: number
        }
        Insert: {
          group?: number
          id?: string
          name: string
          price: number
        }
        Update: {
          group?: number
          id?: string
          name?: string
          price?: number
        }
        Relationships: [
          {
            foreignKeyName: "products_group_fkey"
            columns: ["group"]
            isOneToOne: false
            referencedRelation: "pcgroups"
            referencedColumns: ["id"]
          },
        ]
      }
      sessions: {
        Row: {
          advance_payment: number | null
          cash: number | null
          change: number | null
          client_id: string | null
          debt: number | null
          end_time: string | null
          id: string
          mode: string | null
          money_advance: number | null
          observation: string | null
          optional_client: string | null
          pc_id: string | null
          pc_number: string
          plin: number | null
          start_time: string | null
          status: string | null
          total_amount: number | null
          yape: number | null
        }
        Insert: {
          advance_payment?: number | null
          cash?: number | null
          change?: number | null
          client_id?: string | null
          debt?: number | null
          end_time?: string | null
          id?: string
          mode?: string | null
          money_advance?: number | null
          observation?: string | null
          optional_client?: string | null
          pc_id?: string | null
          pc_number: string
          plin?: number | null
          start_time?: string | null
          status?: string | null
          total_amount?: number | null
          yape?: number | null
        }
        Update: {
          advance_payment?: number | null
          cash?: number | null
          change?: number | null
          client_id?: string | null
          debt?: number | null
          end_time?: string | null
          id?: string
          mode?: string | null
          money_advance?: number | null
          observation?: string | null
          optional_client?: string | null
          pc_id?: string | null
          pc_number?: string
          plin?: number | null
          start_time?: string | null
          status?: string | null
          total_amount?: number | null
          yape?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "sessions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sessions_pc_id_fkey"
            columns: ["pc_id"]
            isOneToOne: false
            referencedRelation: "pcs"
            referencedColumns: ["id"]
          },
        ]
      }
      total_day: {
        Row: {
          created_at: string | null
          fecha: string | null
          id: number
          total: number | null
        }
        Insert: {
          created_at?: string | null
          fecha?: string | null
          id?: number
          total?: number | null
        }
        Update: {
          created_at?: string | null
          fecha?: string | null
          id?: number
          total?: number | null
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never
