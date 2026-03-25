import useSWR from "swr";
import { api, fetcher } from "@/lib/api";

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
  return await api.patch<AISettingsSummary>("/ai/settings", { settings });
}
