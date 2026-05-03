import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { allocateQaPreviewPort, qaPreviewUrl } from "../src/lib/qa-preview-port.ts";

const job = (status, previewPort = null) => ({
  type: "qa_run",
  status,
  payload: { workflowId: "wf", previewPort }
});

describe("allocateQaPreviewPort", () => {
  it("uses the first QA preview port when no QA jobs are active", () => {
    assert.equal(allocateQaPreviewPort([], { startPort: 8101, endPort: 8103 }), 8101);
  });

  it("skips ports already reserved by pending or running QA jobs", () => {
    const port = allocateQaPreviewPort([
      job("pending", 8101),
      job("running", 8102),
      job("done", 8103)
    ], { startPort: 8101, endPort: 8104 });

    assert.equal(port, 8103);
  });

  it("formats localhost QA preview URLs", () => {
    assert.equal(qaPreviewUrl(8105), "http://127.0.0.1:8105");
  });
});
