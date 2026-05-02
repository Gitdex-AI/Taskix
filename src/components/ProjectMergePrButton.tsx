"use client";

import { Button, Text } from "@mantine/core";
import { GitPullRequestArrow } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function ProjectMergePrButton({
  projectId,
  issueId
}: {
  projectId: string;
  issueId: string;
  prUrl?: string | null;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function mergePr() {
    setPending(true);
    setError("");
    try {
      const response = await fetch(`/api/projects/${projectId}/issues/${issueId}/merge`, { method: "POST" });
      const payload = await response.json() as MergeResponse;
      if (!response.ok) {
        setError([payload.error ?? "Run Merge failed", payload.mergeable ? `GitHub mergeable state: ${payload.mergeable}.` : "", payload.action].filter(Boolean).join(" "));
        return;
      }
      if (payload.jobId) runQueuedJob(payload.jobId);
      router.refresh();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Run Merge failed");
    } finally {
      setPending(false);
    }
  }

  function runQueuedJob(jobId: string) {
    void fetch(`/api/projects/${projectId}/jobs/${jobId}/run`, { method: "POST" })
      .then(async (response) => {
        if (!response.ok) throw new Error(await response.text());
      })
      .catch((error: unknown) => {
        const message = error instanceof Error ? error.message : "Run Merge failed";
        if (!message.includes("not pending")) setError(message);
      })
      .finally(() => {
        router.refresh();
      });
    window.setTimeout(() => router.refresh(), 500);
  }

  return (
    <>
      <Button type="button" color="green" variant="filled" size="compact-xs" radius="xl" leftSection={<GitPullRequestArrow size={14} />} loading={pending} onClick={mergePr}>
        Run Merge
      </Button>
      {error ? <Text size="xs" c="red" maw={220}>{error}</Text> : null}
    </>
  );
}

type MergeResponse = {
  error?: string;
  action?: string;
  architectUrl?: string;
  jobId?: string;
  prUrl?: string | null;
  mergeable?: string | null;
};
