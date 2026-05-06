import type { AgentSessionRecord } from "./types";

const agentMessageContentLimit = 12000;
const agentExecutionLogContentLimit = 12000;

export function sanitizeAgentSession(session: AgentSessionRecord): AgentSessionRecord {
  return {
    ...session,
    messages: session.messages.map(sanitizeAgentMessage),
    executionLogs: session.executionLogs?.map(sanitizeAgentExecutionLog)
  };
}

function sanitizeAgentMessage(message: AgentSessionRecord["messages"][number]): AgentSessionRecord["messages"][number] {
  return {
    ...message,
    content: truncateForPromptHistory(message.content, agentMessageContentLimit),
    executionLogs: message.executionLogs?.map(sanitizeAgentExecutionLog)
  };
}

function sanitizeAgentExecutionLog(log: NonNullable<AgentSessionRecord["executionLogs"]>[number]): NonNullable<AgentSessionRecord["executionLogs"]>[number] {
  return {
    ...log,
    content: truncateForPromptHistory(log.content, agentExecutionLogContentLimit)
  };
}

function truncateForPromptHistory(content: string, maxChars: number): string {
  if (content.length <= maxChars) return content;
  return `${content.slice(0, maxChars)}\n\n[truncated ${content.length - maxChars} chars; full output remains in job runtime logs when available]`;
}
