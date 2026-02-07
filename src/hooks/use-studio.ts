"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { StudioOutput, StudioOutputType } from "@/lib/supabase/types";

export function useStudioOutputs(notebookId: string) {
  const supabase = createClient();

  return useQuery({
    queryKey: ["studio-outputs", notebookId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("studio_outputs")
        .select("*")
        .eq("notebook_id", notebookId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as StudioOutput[];
    },
    enabled: !!notebookId,
    refetchInterval: (query) => {
      const hasGenerating = query.state.data?.some(
        (o) => o.generation_status === "generating"
      );
      return hasGenerating ? 2000 : false;
    },
  });
}

export function useGenerateInfographic() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      notebookId: string;
      language: string;
      orientation: string;
      detailLevel: string;
      prompt: string;
    }) => {
      const response = await fetch("/api/studio/infographic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "인포그래픽 생성 실패");
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["studio-outputs", variables.notebookId],
      });
    },
  });
}

export function useGenerateSlides() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      notebookId: string;
      format: string;
      language: string;
      depth: string;
      prompt: string;
    }) => {
      const response = await fetch("/api/studio/slides", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "슬라이드 생성 실패");
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["studio-outputs", variables.notebookId],
      });
    },
  });
}

export function useRetryStudioOutput() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (output: StudioOutput) => {
      // Delete the old record
      await supabase.from("studio_outputs").delete().eq("id", output.id);

      // Re-trigger generation with saved settings
      const settings = output.settings as Record<string, string>;
      const endpoint =
        output.type === "infographic"
          ? "/api/studio/infographic"
          : "/api/studio/slides";

      const body =
        output.type === "infographic"
          ? {
              notebookId: output.notebook_id,
              language: settings.language || "ko",
              orientation: settings.orientation || "landscape",
              detailLevel: settings.detailLevel || "standard",
              prompt: settings.prompt || "",
            }
          : {
              notebookId: output.notebook_id,
              format: settings.format || "detailed",
              language: settings.language || "ko",
              depth: settings.depth || "default",
              prompt: settings.prompt || "",
            };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "재생성 실패");
      }

      return response.json();
    },
    onSuccess: (_, output) => {
      queryClient.invalidateQueries({
        queryKey: ["studio-outputs", output.notebook_id],
      });
    },
  });
}

export function useDeleteStudioOutput() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("studio_outputs")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["studio-outputs"] });
    },
  });
}
