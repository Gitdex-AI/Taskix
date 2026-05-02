import type { AgentSessionRecord, IssueRecord, QaPrReviewResult } from "@/lib/types";

export function normalizeQaFailureType(result: QaPrReviewResult): QaPrReviewResult["failureType"] {
  if (result.passed) return "none";
  if (result.failureType === "spec") return "spec";
  return isQaSpecBlockerText([result.summary, ...result.findings].join("\n")) ? "spec" : result.failureType;
}

export function isIssueSpecBlocked(issue: IssueRecord, qaSession?: AgentSessionRecord | null): boolean {
  const labels = [...(issue.labels ?? []), ...(issue.prLabels ?? [])].map((label) => label.toLowerCase());
  if (labels.includes("taskix:spec-blocked")) return true;
  const latestQaMessage = [...(qaSession?.messages ?? [])].reverse().find((message) => message.role === "assistant")?.content ?? "";
  return isQaSpecBlockerText(latestQaMessage);
}

export function isQaSpecBlockerText(text: string): boolean {
  const normalized = text.toLowerCase();
  const describesMissingNextCallerAddress = normalized.includes("nextrequest")
    && (
      normalized.includes("neither `ip` nor `remoteaddress`")
      || normalized.includes("neither ip nor remoteaddress")
      || normalized.includes("does not expose `ip` or `remoteaddress`")
      || normalized.includes("does not expose ip or remoteaddress")
      || normalized.includes("ip` and `remoteaddress` are absent")
      || normalized.includes("ip and remoteaddress are absent")
      || normalized.includes("no `ip` or `remoteaddress`")
      || normalized.includes("no ip or remoteaddress")
    );
  const requiresRouteLocalhostAcceptance = normalized.includes("localhost")
    && (
      normalized.includes("route caller")
      || normalized.includes("route-shaped")
      || normalized.includes("route path")
      || normalized.includes("update/restart")
      || normalized.includes("selfupdateguard")
      || normalized.includes("self-update")
    );

  return describesMissingNextCallerAddress && requiresRouteLocalhostAcceptance;
}
