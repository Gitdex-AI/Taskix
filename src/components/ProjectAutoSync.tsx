"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

const syncCooldownMs = 30_000;

export function ProjectAutoSync({ projectId }: { projectId: string }) {
  const router = useRouter();

  useEffect(() => {
    const key = `gitdex:auto-sync:${projectId}`;
    const lastSyncedAt = Number(window.sessionStorage.getItem(key) ?? "0");
    if (Date.now() - lastSyncedAt < syncCooldownMs) return;
    window.sessionStorage.setItem(key, String(Date.now()));

    fetch(`/api/projects/${projectId}/sync`, { method: "POST" })
      .then((response) => {
        if (response.ok) router.refresh();
      })
      .catch(() => {
        // GitHub triage exposes the manual refresh path when background sync fails.
      });
  }, [projectId, router]);

  return null;
}
