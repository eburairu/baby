import useSWR from "swr";
import { fetcher, api } from "@/lib/api";

export type Note = {
  id: number;
  baby_id: number;
  user_id: number | null;
  content: string;
  note_time: string;
  created_at: string;
  updated_at: string;
  recorded_by_display_name?: string | null;
  comment_count?: number;
};

export function useNotes(babyId: number | null) {
  const { data, error, isLoading, mutate } = useSWR<Note[]>(
    babyId ? `/babies/${babyId}/notes` : null,
    fetcher
  );
  return { notes: data, isLoading, isError: error, mutate };
}

export async function createNote(babyId: number, data: { content: string; note_time: string }): Promise<Note> {
  return api.post<Note>(`/babies/${babyId}/notes`, data);
}

export async function updateNote(noteId: number, data: { content?: string; note_time?: string }): Promise<Note> {
  return api.patch<Note>(`/notes/${noteId}`, data);
}

export async function deleteNote(noteId: number): Promise<void> {
  await api.delete(`/notes/${noteId}`);
}
