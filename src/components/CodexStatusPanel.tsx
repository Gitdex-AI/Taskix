"use client";

import { useEffect, useState, useTransition } from "react";
import { Alert, Badge, Button, Code, Group, Paper, Stack, Text } from "@mantine/core";
import { Bot, CircleAlert, CircleCheck, RefreshCw } from "lucide-react";

type CodexStatus = {
  ok: boolean;
  checkedAt: string;
  binary: string;
  codexHome: string;
  model: string;
  version: CheckResult;
  exec: CheckResult;
};

type CheckResult = {
  ok: boolean;
  command: string;
  output: string;
  error?: string;
};

export function CodexStatusPanel() {
  const [status, setStatus] = useState<CodexStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [isPending, startTransition] = useTransition();

  const loadCachedStatus = () => {
    setError(null);
    startTransition(async () => {
      try {
        const response = await fetch("/api/codex/status", { cache: "no-store" });
        if (!response.ok) throw new Error(await response.text());
        const payload = (await response.json()) as { status: CodexStatus | null };
        setStatus(payload.status);
      } catch (checkError) {
        setStatus(null);
        setError(checkError instanceof Error ? checkError.message : "Codex status check failed.");
      } finally {
        setLoaded(true);
      }
    });
  };

  const runCheck = () => {
    setError(null);
    startTransition(async () => {
      try {
        const response = await fetch("/api/codex/status", { method: "POST", cache: "no-store" });
        if (!response.ok) throw new Error(await response.text());
        const payload = (await response.json()) as { status: CodexStatus };
        setStatus(payload.status);
        setLoaded(true);
      } catch (checkError) {
        setError(checkError instanceof Error ? checkError.message : "Codex status check failed.");
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
            <Bot size={18} />
            <Text fw={760}>Codex Status</Text>
            <Badge color={status?.ok ? "green" : "red"} variant="light">
              {status ? (status.ok ? "ready" : "attention") : "not checked"}
            </Badge>
          </Group>
          <Text size="sm" c="dimmed">
            Shows the last saved check. It only runs codex when you click Check Now.
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
              <Text size="sm" c="dimmed">Binary</Text>
              <Code>{status.binary}</Code>
              <Text size="sm" c="dimmed">Model</Text>
              <Code>{status.model}</Code>
              <Text size="sm" c="dimmed">Codex Home</Text>
              <Code>{status.codexHome}</Code>
              <Text size="sm" c="dimmed">Checked</Text>
              <Code>{status.checkedAt}</Code>
            </Group>
            <CheckRow label="CLI" result={status.version} />
            <CheckRow label="Exec" result={status.exec} />
          </>
        )}
        {!status && !error && loaded && (
          <Text size="sm" c="dimmed">
            No Codex status check has been run yet.
          </Text>
        )}
        {!status && !error && !loaded && (
          <Text size="sm" c="dimmed">
            Loading last Codex status...
          </Text>
        )}
      </Stack>
    </Paper>
  );
}

function CheckRow({ label, result }: { label: string; result: CheckResult }) {
  const Icon = result.ok ? CircleCheck : CircleAlert;
  return (
    <Alert color={result.ok ? "green" : "red"} icon={<Icon size={16} />}>
      <Group justify="space-between" align="flex-start">
        <div>
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
        </div>
      </Group>
    </Alert>
  );
}
