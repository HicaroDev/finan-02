
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://alqzqapccyclmffdfmlc.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFscXpxYXBjY3ljbG1mZmRmbWxjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYyMTY4OTIsImV4cCI6MjA2MTc5Mjg5Mn0.WAG002hANNqMuqN2BOnvAMG5SsM2T4Wttz9dKrTj2GY'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string | null
          nome: string | null
          email: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
          phone: string | null
          whatsapp: string | null
        }
        Insert: {
          id: string
          username?: string | null
          nome?: string | null
          email?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
          phone?: string | null
          whatsapp?: string | null
        }
        Update: {
          id?: string
          username?: string | null
          nome?: string | null
          email?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
          phone?: string | null
          whatsapp?: string | null
        }
      }
      transacoes: {
        Row: {
          id: number
          created_at: string
          quando: string | null
          estabelecimento: string | null
          valor: number | null
          detalhes: string | null
          tipo: string | null
          categoria: string | null
          userid: string | null
        }
        Insert: {
          id?: number
          created_at?: string
          quando?: string | null
          estabelecimento?: string | null
          valor?: number | null
          detalhes?: string | null
          tipo?: string | null
          categoria?: string | null
          userid?: string | null
        }
        Update: {
          id?: number
          created_at?: string
          quando?: string | null
          estabelecimento?: string | null
          valor?: number | null
          detalhes?: string | null
          tipo?: string | null
          categoria?: string | null
          userid?: string | null
        }
      }
      lembretes: {
        Row: {
          id: number
          created_at: string
          userid: string | null
          descricao: string | null
          data: string | null
          valor: number | null
        }
        Insert: {
          id?: number
          created_at?: string
          userid?: string | null
          descricao?: string | null
          data?: string | null
          valor?: number | null
        }
        Update: {
          id?: number
          created_at?: string
          userid?: string | null
          descricao?: string | null
          data?: string | null
          valor?: number | null
        }
      }
      categorias: {
        Row: {
          id: string
          userid: string
          nome: string
          tags: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          userid: string
          nome: string
          tags?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          userid?: string
          nome?: string
          tags?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
