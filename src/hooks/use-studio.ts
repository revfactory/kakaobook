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
