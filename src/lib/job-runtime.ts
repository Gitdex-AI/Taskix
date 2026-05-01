import { AsyncLocalStorage } from "node:async_hooks";

const jobRuntime = new AsyncLocalStorage<string>();

export function runWithJobRuntime<T>(jobId: string, callback: () => Promise<T>): Promise<T> {
  return jobRuntime.run(jobId, callback);
}

export function getActiveJobId(): string | null {
  return jobRuntime.getStore() ?? null;
}
