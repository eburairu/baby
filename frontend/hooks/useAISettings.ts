import useSWR from "swr";
import { fetcher } from "@/lib/api";

export type AIModel = {
  id: string;
  name: string;
  description: string;
};

export type AISettings = {
  llm_model: string;
  llm_temperature: number;
  llm_max_tokens: number;
  ai_enabled_chat: boolean;
  ai_enabled_summary: boolean;
  ai_enabled_feedback: boolean;
};

export type AISettingsSummary = {
  settings: AISettings;
  available_models: AIModel[];
};

export function useAISettings() {
  const { data, error, isLoading, mutate } = useSWR<AISettingsSummary>(
    "/ai/settings",
    fetcher
  );

  return {
    data,
    isLoading,
    isError: error,
    mutate,
  };
}

export async function updateAISettings(settings: Record<string, string>) {
  const res = await fetch("/api/ai/settings", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ settings }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || "Failed to update AI settings");
  }

  return res.json();
}
