import type { CodeLanguage, PostStatus } from './archive'

// archive_posts 테이블 행(row) 하나의 데이터 구조
export type PostRow = {
  id: string
  owner_id: string
  title: string
  content: string
  language: CodeLanguage | null // 필수 X
  code_text: string | null // 필수 X
  tags: string[] | null // 필수 X
  status: PostStatus
  is_public: boolean
  created_at: string
}

// archive_answers 테이블 행(row) 하나의 데이터 구조
export type AnswerRow = {
  id: string
  post_id: string // 답변과 연결된 게시글을 나타냄
  owner_id: string
  content: string
  language: CodeLanguage | null
  code_text: string | null
  created_at: string
}

// Table이라는 공통 타입
 // Update: 따로 전달X 시 기본적으로 never 사용
 // Relationships: 반드시 배열 형태, 전달X 시 빈 배열[] 사용
type Table<Row, Insert, Update = never, Relationships extends unknown[] = []> = {
  Row: Row
  Insert: Insert
  Update: Update
  Relationships: Relationships
}

// 실제 Supabase DB 구조
export interface Database {
  public: {
    Tables: { // public 안에 존재하는 테이블들을 정의

      // 관리자 테이블
      archive_admins: Table<
        { user_id: string }, // Row: user_id 하나 존재
        { user_id: string } // Insert: 추가할 때도 user_id 필요
        // Update: never
        // Relationships: []
      >

      // 게시글 테이블
      archive_posts: Table<
        PostRow, // Row: 아까 PostRow에 정의한 모든 컬럼이 존재
        Pick<PostRow, 'title' | 'content'> & Partial<PostRow>, // Insert: title, content 필수
        { status?: PostStatus } // Update: status(해결상태)만 변경하도록 제한
      >
      
      // 답변 테이블
      archive_answers: Table<
        AnswerRow, // Row: 아까 AnswerRow에 정의한 모든 컬럼이 존재
        Pick<AnswerRow, 'post_id' | 'content'> & Partial<AnswerRow>, // Insert: post_id, content 필수
        never, // Update: never
        // Relationships (외래키FK 관계를 TypeScript에게 알려주는 부분)
        // 답변의 post_id는 게시글의 id를 참조
        [{
          foreignKeyName: 'archive_answers_post_id_fkey'
          columns: ['post_id']
          isOneToOne: false
          referencedRelation: 'archive_posts'
          referencedColumns: ['id']
        }]>
    }
    Views: { [_ in never]: never } // Supabase에 View를 쓰지 않으니까 빈 타입을 표현

    // Supabase PostgreSQL 안에 만들어둔 DB 함수를 정의해놓은 부분
    Functions: {

      // 현재 로그인한 사용자가 Archive 관리자인지 검사하는 함수
      is_archive_admin: { 
        Args: Record<string, never>; // 받는 인자 없음
        Returns: boolean // 결과는 true, false 중 하나
      }

      // 답변 저장 + 게시글 상태 변경 함수
      save_archive_answer: {
        Args: {
          p_post_id: string; p_content: string; // 필수인자: p_post_id, p_content
          p_language?: CodeLanguage | null; p_code_text?: string | null; p_mark_solved?: boolean 
        }
        Returns: AnswerRow[] // 답변 데이터들을 배열 형태로 돌려줌
      }
    }

    // DB에는 Enums, CompositeTypes 정의된 게 없음
    Enums: { [_ in never]: never }
    CompositeTypes: { [_ in never]: never }
  }
}
