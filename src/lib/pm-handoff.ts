import type { AgentSessionRecord } from "@/lib/types";

export type PmHandoffPayload = {
  status: "ready_for_architect";
  requirement: string;
  constraints: string[];
  acceptanceCriteria: string[];
  openQuestions: string[];
};

export function findReadyForArchitectPayload(session: AgentSessionRecord | null): PmHandoffPayload | null {
  const assistantMessages = (session?.messages ?? []).filter((message) => message.role === "assistant").reverse();
  for (const message of assistantMessages) {
    const payload = parseReadyForArchitectPayload(message.content);
    if (payload) return payload;
  }
  return null;
}

export function parseReadyForArchitectPayload(content: string): PmHandoffPayload | null {
  for (const candidate of jsonCandidates(content)) {
    try {
      const parsed = JSON.parse(candidate) as Partial<PmHandoffPayload>;
      if (
        parsed.status === "ready_for_architect" &&
        typeof parsed.requirement === "string" &&
        Array.isArray(parsed.constraints) &&
        Array.isArray(parsed.acceptanceCriteria) &&
        Array.isArray(parsed.openQuestions) &&
        parsed.openQuestions.length === 0
      ) {
        return {
          status: "ready_for_architect",
          requirement: parsed.requirement,
          constraints: parsed.constraints.map(String),
          acceptanceCriteria: parsed.acceptanceCriteria.map(String),
          openQuestions: []
        };
      }
    } catch {
      // Ignore non-JSON fragments in natural-language PM replies.
    }
  }
  return null;
}

export function formatPmHandoffPayload(payload: PmHandoffPayload): string {
  return [
    payload.requirement,
    "",
    "Constraints:",
    ...(payload.constraints.length ? payload.constraints.map((item) => `- ${item}`) : ["- none"]),
    "",
    "Acceptance Criteria:",
    ...payload.acceptanceCriteria.map((item) => `- ${item}`)
  ].join("\n");
}

function jsonCandidates(content: string): string[] {
  const fenced = [...content.matchAll(/```(?:json)?\s*([\s\S]*?)```/gi)].map((match) => match[1].trim());
  const objectStart = content.indexOf("{");
  const objectEnd = content.lastIndexOf("}");
  const inline = objectStart >= 0 && objectEnd > objectStart ? [content.slice(objectStart, objectEnd + 1)] : [];
  return [...fenced, ...inline];
}
