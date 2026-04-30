"use client";

import { Button } from "@mantine/core";
import { Pause, Play } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function WorkflowPauseButton({ workflowId, paused }: { workflowId: string; paused: boolean }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function togglePaused() {
    setPending(true);
    try {
      await fetch(`/api/workflows/${workflowId}/pause`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paused: !paused })
      });
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <Button
      type="button"
      variant="subtle"
      size="compact-xs"
      radius="xl"
      leftSection={paused ? <Play size={12} /> : <Pause size={12} />}
      loading={pending}
      onClick={togglePaused}
    >
      {paused ? "Resume" : "Pause"}
    </Button>
  );
}
