"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useState, useCallback } from "react";
import type { ChatMessage } from "@/lib/supabase/types";

export function useChatMessages(notebookId: string) {
  const supabase = createClient();

  return useQuery({
    queryKey: ["chat-messages", notebookId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("notebook_id", notebookId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data as ChatMessage[];
    },
    enabled: !!notebookId,
  });
}

export function useSendMessage(notebookId: string) {
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const queryClient = useQueryClient();

  const sendMessage = useCallback(
    async (content: string) => {
      setIsStreaming(true);
      setStreamingContent("");

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ notebookId, message: content }),
        });

        if (!response.ok) throw new Error("Chat request failed");

        const reader = response.body?.getReader();
        if (!reader) throw new Error("No response body");

        const decoder = new TextDecoder();
        let fullContent = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          fullContent += chunk;
          setStreamingContent(fullContent);
        }

        // Refresh chat messages after streaming is complete
        queryClient.invalidateQueries({
          queryKey: ["chat-messages", notebookId],
        });
      } finally {
        setIsStreaming(false);
        setStreamingContent("");
      }
    },
    [notebookId, queryClient]
  );

  return { sendMessage, isStreaming, streamingContent };
}
