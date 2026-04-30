"use client";

import { Button } from "@mantine/core";
import { Play } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function ProjectRunJobsForm({ projectId }: { projectId: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function runJob() {
    setPending(true);
    try {
      await fetch(`/api/projects/${projectId}/jobs/run`, { method: "POST" });
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <Button type="button" variant="light" size="xs" radius="xl" leftSection={<Play size={14} />} loading={pending} onClick={runJob}>
      Run Jobs
    </Button>
  );
}
