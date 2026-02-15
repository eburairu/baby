import useSWR from "swr";
import { fetcher } from "@/lib/api";

export type Note = {
  id: number;
  baby_id: number;
  user_id: number | null;
  content: string;
  note_time: string;
  created_at: string;
  updated_at: string;
};

export function useNotes(babyId: number | null) {
  const { data, error, isLoading, mutate } = useSWR<Note[]>(
    babyId ? `/babies/${babyId}/notes` : null,
    fetcher
  );
  return { notes: data, isLoading, isError: error, mutate };
}

export async function createNote(babyId: number, data: { content: string; note_time: string }): Promise<Note> {
  const res = await fetch(`/api/babies/${babyId}/notes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail ?? "メモの登録に失敗しました");
  }
  return res.json();
}

export async function updateNote(noteId: number, data: { content?: string; note_time?: string }): Promise<Note> {
  const res = await fetch(`/api/notes/${noteId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail ?? "メモの更新に失敗しました");
  }
  return res.json();
}

export async function deleteNote(noteId: number): Promise<void> {
  const res = await fetch(`/api/notes/${noteId}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail ?? "メモの削除に失敗しました");
  }
}
