"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { Source } from "@/lib/supabase/types";

export function useSources(notebookId: string) {
  const supabase = createClient();

  return useQuery({
    queryKey: ["sources", notebookId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sources")
        .select("*")
        .eq("notebook_id", notebookId)
        .order("sort_order", { ascending: true });

      if (error) throw error;
      return data as Source[];
    },
    enabled: !!notebookId,
  });
}

export function useToggleSource() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      is_enabled,
    }: {
      id: string;
      is_enabled: boolean;
    }) => {
      const { error } = await supabase
        .from("sources")
        .update({ is_enabled })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["sources"],
        predicate: (query) =>
          query.queryKey[0] === "sources",
      });
    },
  });
}

export function useToggleAllSources() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      notebookId,
      is_enabled,
    }: {
      notebookId: string;
      is_enabled: boolean;
    }) => {
      const { error } = await supabase
        .from("sources")
        .update({ is_enabled })
        .eq("notebook_id", notebookId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sources"] });
    },
  });
}

export function useDeleteSource() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("sources").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sources"] });
      queryClient.invalidateQueries({ queryKey: ["notebooks"] });
    },
  });
}

export function useAddTextSource() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      notebookId,
      title,
      content,
    }: {
      notebookId: string;
      title: string;
      content: string;
    }) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("sources")
        .insert({
          notebook_id: notebookId,
          user_id: user.id,
          type: "text" as const,
          title,
          extracted_text: content,
          processing_status: "completed" as const,
        })
        .select()
        .single();

      if (error) throw error;
      return data as Source;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sources"] });
      queryClient.invalidateQueries({ queryKey: ["notebooks"] });
    },
  });
}
