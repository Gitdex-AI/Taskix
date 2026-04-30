"use client";

import { Button } from "@mantine/core";
import { RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function ProjectSyncForm({ projectId }: { projectId: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function sync() {
    setPending(true);
    try {
      await fetch(`/api/projects/${projectId}/sync`, { method: "POST" });
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <Button type="button" variant="light" size="xs" radius="xl" leftSection={<RefreshCw size={14} />} loading={pending} onClick={sync}>
      Sync GitHub
    </Button>
  );
}
