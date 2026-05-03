"use client";

import { Button, Text } from "@mantine/core";
import { ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function ProjectArchitectReviewButton({
  projectId,
  issueId
}: {
  projectId: string;
  issueId: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function reviewPr() {
    setPending(true);
    setError("");
    try {
      const response = await fetch(`/api/projects/${projectId}/issues/${issueId}/architect-review`, { method: "POST" });
      const payload = await response.json() as ReviewResponse;
      if (!response.ok) {
        setError([payload.error ?? "Run Review failed", payload.action].filter(Boolean).join(" "));
        setPending(false);
        return;
      }
      if (payload.jobId) await runQueuedJob(payload.jobId);
      router.refresh();
      if (!payload.jobId) setPending(false);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Run Review failed");
      setPending(false);
    }
  }

  async function runQueuedJob(jobId: string) {
    try {
      const response = await fetch(`/api/projects/${projectId}/jobs/${jobId}/run`, { method: "POST" });
      if (!response.ok) throw new Error(await response.text());
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Run Review failed";
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
      <Button type="button" variant="light" color="blue" size="compact-xs" radius="xl" leftSection={<ShieldCheck size={14} />} loading={pending} onClick={reviewPr}>
        Run Review
      </Button>
      {error ? <Text size="xs" c="red" maw={220}>{error}</Text> : null}
    </>
  );
}

type ReviewResponse = {
  error?: string;
  action?: string;
  jobId?: string;
  message?: string;
};
