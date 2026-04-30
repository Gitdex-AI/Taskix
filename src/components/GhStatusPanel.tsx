"use client";

import { useEffect, useState, useTransition } from "react";
import { Alert, Badge, Button, Code, Group, Paper, Stack, Text } from "@mantine/core";
import { CircleAlert, CircleCheck, GitBranch, RefreshCw } from "lucide-react";

type GhStatus = {
  ok: boolean;
  checkedAt: string;
  version: CheckResult;
  auth: CheckResult;
  user: CheckResult;
};

type CheckResult = {
  ok: boolean;
  command: string;
  output: string;
  error?: string;
};

export function GhStatusPanel() {
  const [status, setStatus] = useState<GhStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [isPending, startTransition] = useTransition();

  const loadCachedStatus = () => {
    setError(null);
    startTransition(async () => {
      try {
        const response = await fetch("/api/gh/status", { cache: "no-store" });
        if (!response.ok) throw new Error(await response.text());
        const payload = (await response.json()) as { status: GhStatus | null };
        setStatus(payload.status);
      } catch (checkError) {
        setStatus(null);
        setError(checkError instanceof Error ? checkError.message : "GitHub CLI status check failed.");
      } finally {
        setLoaded(true);
      }
    });
  };

  const runCheck = () => {
    setError(null);
    startTransition(async () => {
      try {
        const response = await fetch("/api/gh/status", { method: "POST", cache: "no-store" });
        if (!response.ok) throw new Error(await response.text());
        const payload = (await response.json()) as { status: GhStatus };
        setStatus(payload.status);
        setLoaded(true);
      } catch (checkError) {
        setError(checkError instanceof Error ? checkError.message : "GitHub CLI status check failed.");
      }
    });
  };

  useEffect(() => {
    loadCachedStatus();
  }, []);

  return (
    <Paper mb="md">
      <Group justify="space-between" p="md" className="section-header">
        <div>
          <Group gap="sm">
            <GitBranch size={18} />
            <Text fw={760}>GitHub CLI Status</Text>
            <Badge color={status?.ok ? "green" : "red"} variant="light">
              {status ? (status.ok ? "ready" : "attention") : "not checked"}
            </Badge>
          </Group>
          <Text size="sm" c="dimmed">
            Required for local repo listing, issues, PRs, AGENTS.md updates, and future merge/deploy actions.
          </Text>
        </div>
        <Button variant="light" leftSection={<RefreshCw size={16} />} loading={isPending} onClick={runCheck}>
          Check Now
        </Button>
      </Group>
      <Stack gap="sm" p="md">
        {error && (
          <Alert color="red" icon={<CircleAlert size={16} />}>
            {error}
          </Alert>
        )}
        {status && (
          <>
            <Group gap="sm">
              <Text size="sm" c="dimmed">Checked</Text>
              <Code>{status.checkedAt}</Code>
            </Group>
            <CheckRow label="CLI" result={status.version} />
            <CheckRow label="Auth" result={status.auth} />
            <CheckRow label="User" result={status.user} />
            {!status.ok && (
              <Alert color="yellow" icon={<CircleAlert size={16} />}>
                Run <Code>gh auth login</Code> on this machine, then click Check Now again.
              </Alert>
            )}
          </>
        )}
        {!status && !error && loaded && <Text size="sm" c="dimmed">No GitHub CLI status check has been run yet.</Text>}
        {!status && !error && !loaded && <Text size="sm" c="dimmed">Loading last GitHub CLI status...</Text>}
      </Stack>
    </Paper>
  );
}

function CheckRow({ label, result }: { label: string; result: CheckResult }) {
  const Icon = result.ok ? CircleCheck : CircleAlert;
  return (
    <Alert color={result.ok ? "green" : "red"} icon={<Icon size={16} />}>
      <Text fw={700}>{label}</Text>
      <Text size="sm" c="dimmed">
        <Code>{result.command}</Code>
      </Text>
      {result.output && (
        <Text size="sm" mt={6} style={{ whiteSpace: "pre-wrap" }}>
          {result.output}
        </Text>
      )}
      {result.error && (
        <Text size="sm" c="red" mt={6}>
          {result.error}
        </Text>
      )}
    </Alert>
  );
}
