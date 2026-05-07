"use client";

import { Button, Text } from "@mantine/core";
import { ShieldAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function ProjectRunArchitectIssueButton({
  projectId,
  issueId
}: {
  projectId: string;
  issueId: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function runArchitect() {
    setPending(true);
    setError("");
    try {
      const response = await fetch(`/api/projects/${projectId}/issues/${issueId}/run-architect`, { method: "POST" });
      const payload = await response.json() as { error?: string; jobId?: string };
      if (!response.ok) {
        setError(payload.error ?? "Run Architect failed");
        setPending(false);
        return;
      }
      if (payload.jobId) await runQueuedJob(payload.jobId);
      router.refresh();
      if (!payload.jobId) setPending(false);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Run Architect failed");
      setPending(false);
    }
  }

  async function runQueuedJob(jobId: string) {
    try {
      const response = await fetch(`/api/projects/${projectId}/jobs/${jobId}/run`, { method: "POST" });
      if (!response.ok) throw new Error(await response.text());
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Run Architect failed";
      if (!message.includes("not pending")) {
        setError(message);
        setPending(false);
      }
    } finally {
      router.refresh();
    }
    window.setTimeout(() => router.refresh(), 500);
    window.setTimeout(() => setPending(false), 1800);
  }

  return (
    <>
      <Button type="button" variant="filled" size="compact-xs" radius="xl" leftSection={<ShieldAlert size={14} />} loading={pending} onClick={runArchitect}>
        Run Architect
      </Button>
      {error ? <Text size="xs" c="red" maw={220}>{error}</Text> : null}
    </>
  );
}
