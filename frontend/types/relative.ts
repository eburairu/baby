export type RelationshipType =
  | "father"
  | "mother"
  | "paternal_grandfather"
  | "paternal_grandmother"
  | "maternal_grandfather"
  | "maternal_grandmother"
  | "paternal_uncle"
  | "paternal_aunt"
  | "maternal_uncle"
  | "maternal_aunt"
  | "older_brother"
  | "older_sister"
  | "younger_brother"
  | "younger_sister"

export interface Relative {
  id: number
  baby_id: number
  name: string
  relationship_type: RelationshipType
  user_id: number | null
  user_display_name: string | null
  notes: string | null
  created_at: string
}

export interface RelativeCreate {
  name: string
  relationship_type: RelationshipType
  user_id?: number | null
  notes?: string | null
}

export interface RelativeUpdate {
  name?: string
  relationship_type?: RelationshipType
  user_id?: number | null
  notes?: string | null
}
