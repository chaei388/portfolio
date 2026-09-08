import type { CodeLanguage, PostStatus } from './archive'

export type PostRow = {
  id: string
  owner_id: string
  title: string
  content: string
  language: CodeLanguage | null
  code_text: string | null
  tags: string[] | null
  status: PostStatus
  is_public: boolean
  created_at: string
}

export type AnswerRow = {
  id: string
  post_id: string
  owner_id: string
  content: string
  language: CodeLanguage | null
  code_text: string | null
  created_at: string
}

type Table<Row, Insert, Update = never, Relationships extends unknown[] = []> = {
  Row: Row
  Insert: Insert
  Update: Update
  Relationships: Relationships
}

export interface Database {
  public: {
    Tables: {
      archive_admins: Table<{ user_id: string }, { user_id: string }>
      archive_posts: Table<PostRow, Pick<PostRow, 'title' | 'content'> & Partial<PostRow>, { status?: PostStatus }>
      archive_answers: Table<AnswerRow, Pick<AnswerRow, 'post_id' | 'content'> & Partial<AnswerRow>, never, [{
        foreignKeyName: 'archive_answers_post_id_fkey'
        columns: ['post_id']
        isOneToOne: false
        referencedRelation: 'archive_posts'
        referencedColumns: ['id']
      }]>
    }
    Views: { [_ in never]: never }
    Functions: {
      is_archive_admin: { Args: Record<string, never>; Returns: boolean }
      save_archive_answer: {
        Args: { p_post_id: string; p_content: string; p_language?: CodeLanguage | null; p_code_text?: string | null; p_mark_solved?: boolean }
        Returns: AnswerRow[]
      }
    }
    Enums: { [_ in never]: never }
    CompositeTypes: { [_ in never]: never }
  }
}
