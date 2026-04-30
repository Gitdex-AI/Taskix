"use client";

import { Button, Text } from "@mantine/core";
import { GitBranch, LoaderCircle } from "lucide-react";
import { useFormStatus } from "react-dom";
import type { PmHandoffPayload } from "@/lib/pm-handoff";

export function ProjectHandoffForm({ projectId, payload }: { projectId: string; payload: PmHandoffPayload | null }) {
  if (!payload) {
    return (
      <div className="handoff-box muted">
        <Text size="sm" fw={700}>Start Workflow</Text>
        <Text size="xs" c="dimmed">
          The button appears after PM outputs ready_for_architect JSON.
        </Text>
      </div>
    );
  }

  return (
    <form method="post" action={`/api/projects/${projectId}/handoff`} className="handoff-form">
      <input type="hidden" name="payload" value={JSON.stringify(payload)} />
      <HandoffButton payload={payload} />
    </form>
  );
}

function HandoffButton({ payload }: { payload: PmHandoffPayload }) {
  const { pending } = useFormStatus();

  return (
    <div className="handoff-box">
      <Text size="sm" fw={700}>Start Workflow</Text>
      <Text size="xs" c="dimmed">
        PM marked this requirement ready.
      </Text>
      <Text size="sm" fw={720} mt="xs" lineClamp={2}>{payload.requirement}</Text>
      <Button
        type="submit"
        fullWidth
        mt="sm"
        radius="xl"
        variant="filled"
        leftSection={pending ? <LoaderCircle size={15} className="chat-composer-spinner" /> : <GitBranch size={15} />}
        disabled={pending}
      >
        {pending ? "Queueing workflow..." : "Start Workflow"}
      </Button>
    </div>
  );
}
