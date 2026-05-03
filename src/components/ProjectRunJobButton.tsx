"use client";

import { Button, Text } from "@mantine/core";
import { Play } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function ProjectRunJobButton({
  projectId,
  jobId,
  label
}: {
  projectId: string;
  jobId: string;
  label: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function runJob() {
    setPending(true);
    setError("");
    try {
      const response = await fetch(`/api/projects/${projectId}/jobs/${jobId}/run`, { method: "POST" });
      if (!response.ok) throw new Error(await response.text());
      router.refresh();
      window.setTimeout(() => router.refresh(), 500);
      window.setTimeout(() => setPending(false), 1800);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Run job failed.");
      setPending(false);
    }
  }

  return (
    <>
      <Button type="button" variant="filled" size="compact-xs" radius="xl" leftSection={<Play size={14} />} loading={pending} onClick={runJob}>
        {label}
      </Button>
      {error ? <Text size="xs" c="red" maw={220}>{error}</Text> : null}
    </>
  );
}
