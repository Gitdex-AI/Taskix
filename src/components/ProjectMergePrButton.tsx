"use client";

import { Button, Group, Text } from "@mantine/core";
import { GitMerge } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function ProjectMergePrButton({
  projectId,
  issueId
}: {
  projectId: string;
  issueId: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [messageColor, setMessageColor] = useState<"dimmed" | "red" | "green">("dimmed");

  async function mergePr() {
    setPending(true);
    setMessage("");
    try {
      const response = await fetch(`/api/projects/${projectId}/issues/${issueId}/merge`, { method: "POST" });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error ?? "Merge request failed");
      setMessage("Merged");
      setMessageColor("green");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Merge request failed");
      setMessageColor("red");
    } finally {
      setPending(false);
    }
  }

  return (
    <Group gap={6} wrap="nowrap">
      <Button
        type="button"
        color="green"
        variant="filled"
        size="sm"
        radius="md"
        leftSection={<GitMerge size={14} />}
        loading={pending}
        onClick={mergePr}
      >
        Merge PR
      </Button>
      {message ? (
        <Text size="xs" c={messageColor} lineClamp={1} maw={180} title={message}>
          {message}
        </Text>
      ) : null}
    </Group>
  );
}
