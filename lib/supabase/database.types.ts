// Generated Supabase types (public schema)
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
      links: {
        Row: {
          created_at: string
          description: string | null
          id: string
          list_id: string
          order: number
          title: string | null
          url: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          list_id: string
          order?: number
          title?: string | null
          url: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          list_id?: string
          order?: number
          title?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "links_list_id_fkey"
            columns: ["list_id"]
            isOneToOne: false
            referencedRelation: "lists"
            referencedColumns: ["id"]
          }
        ]
      }
      lists: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_public: boolean
          slug: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean
          slug: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean
          slug?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: { [_ in never]: never }
    Functions: { [_ in never]: never }
    Enums: { [_ in never]: never }
    CompositeTypes: { [_ in never]: never }
  }
}

export type PublicTables = Database['public']['Tables']
export type ListRow = PublicTables['lists']['Row']
export type LinkRow = PublicTables['links']['Row']

export interface DraftLink {
  id: string
  url: string
  title: string | null
  description: string | null
  order: number
  isFetchingMetadata?: boolean
  metadataError?: string | null
  imageUrl?: string | null
}

export interface DraftList {
  slug: string
  description: string
  is_public: boolean
  links: DraftLink[]
  lastUpdated: number
}
