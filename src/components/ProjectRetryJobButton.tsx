"use client";

import { Button } from "@mantine/core";
import { RotateCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function ProjectRetryJobButton({ projectId, jobId }: { projectId: string; jobId: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function retryJob() {
    setPending(true);
    try {
      await fetch(`/api/projects/${projectId}/jobs/${jobId}/retry`, { method: "POST" });
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <Button type="button" variant="light" color="red" size="compact-xs" radius="xl" leftSection={<RotateCcw size={14} />} loading={pending} onClick={retryJob}>
      Retry
    </Button>
  );
}
