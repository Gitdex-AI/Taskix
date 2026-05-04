import {
  Badge,
  Code,
  Group,
  Table,
  TableScrollContainer,
  TableTbody,
  TableTd,
  TableTh,
  TableThead,
  TableTr,
  Text
} from "@mantine/core";
import { getWorkflowQaStatus } from "@/lib/qa-status";
import type { WorkflowRecord } from "@/lib/types";

export function WorkflowsTable({ workflows }: { workflows: WorkflowRecord[] }) {
  return (
    <TableScrollContainer minWidth={760}>
      <Table highlightOnHover verticalSpacing="sm">
        <TableThead>
          <TableTr>
            <TableTh>ID</TableTh>
            <TableTh>Status</TableTh>
            <TableTh>QA</TableTh>
            <TableTh>Created</TableTh>
            <TableTh>Requirement</TableTh>
          </TableTr>
        </TableThead>
        <TableTbody>
          {workflows.length ? (
            workflows.slice(-10).map((workflow) => (
              <WorkflowRow key={workflow.workflowId} workflow={workflow} />
            ))
          ) : (
            <TableTr>
              <TableTd colSpan={5}>
                <Text c="dimmed" ta="center" py="md">
                  No workflows yet.
                </Text>
              </TableTd>
            </TableTr>
          )}
        </TableTbody>
      </Table>
    </TableScrollContainer>
  );
}

function WorkflowRow({ workflow }: { workflow: WorkflowRecord }) {
  const qaStatus = getWorkflowQaStatus(workflow);

  return (
    <TableTr>
      <TableTd>
        <Code>{workflow.trackingCode ?? workflow.workflowId}</Code>
      </TableTd>
      <TableTd>
        <Badge variant="light">{workflow.status}</Badge>
      </TableTd>
      <TableTd>
        <Group gap={6} wrap="nowrap">
          <Badge color={qaStatus.color} variant="light">{qaStatus.label}</Badge>
          {workflow.issues.length ? (
            <Text size="xs" c="dimmed">{workflow.issues.length} issue{workflow.issues.length === 1 ? "" : "s"}</Text>
          ) : null}
        </Group>
      </TableTd>
      <TableTd>
        <Text size="sm" c="dimmed">
          {formatDateTime(workflow.createdAt)}
        </Text>
      </TableTd>
      <TableTd>
        <Text size="sm" lineClamp={2} maw={520} title={workflow.userRequirement}>
          {workflow.userRequirement}
        </Text>
      </TableTd>
    </TableTr>
  );
}

function formatDateTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}
