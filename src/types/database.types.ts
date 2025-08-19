export interface Database {
  public: {
    Tables: {
      drinks: {
        Row: Drink
        Insert: DrinkInsert
        Update: DrinkUpdate
      }
      orders: {
        Row: Order
        Insert: OrderInsert
        Update: OrderUpdate
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      order_status: 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled'
    }
  }
}

export interface Drink {
  id: number
  name: string
  options: Record<string, unknown>
  created_at: string
}

export interface DrinkInsert {
  name: string
  options?: Record<string, unknown>
}

export interface DrinkUpdate {
  name?: string
  options?: Record<string, unknown>
}

export interface Order {
  id: number
  name: string
  drink: string
  options: Record<string, unknown>
  status: Database['public']['Enums']['order_status']
  timestamp: string
}

export interface OrderInsert {
  name: string
  drink: string
  options?: Record<string, unknown>
  status?: Database['public']['Enums']['order_status']
}

export interface OrderUpdate {
  name?: string
  drink?: string
  options?: Record<string, unknown>
  status?: Database['public']['Enums']['order_status']
}