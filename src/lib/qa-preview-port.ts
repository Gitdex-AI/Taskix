import type { JobRecord } from "@/lib/types";

const defaultQaPreviewStartPort = 8101;
const defaultQaPreviewEndPort = 8199;

export function qaPreviewUrl(port: number): string {
  return `http://127.0.0.1:${port}`;
}

export function allocateQaPreviewPort(jobs: Pick<JobRecord, "type" | "status" | "payload">[], input: {
  startPort?: number;
  endPort?: number;
} = {}): number {
  const startPort = input.startPort ?? defaultQaPreviewStartPort;
  const endPort = input.endPort ?? defaultQaPreviewEndPort;
  const usedPorts = new Set(jobs
    .filter((job) => job.type === "qa_run" && (job.status === "pending" || job.status === "running"))
    .map((job) => job.payload.previewPort)
    .filter((port): port is number => Number.isInteger(port)));

  for (let port = startPort; port <= endPort; port += 1) {
    if (!usedPorts.has(port)) return port;
  }
  throw new Error(`No QA preview ports available in ${startPort}-${endPort}.`);
}
