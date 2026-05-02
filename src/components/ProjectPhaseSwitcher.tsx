"use client";

import { Badge, Text } from "@mantine/core";
import type { ReactNode } from "react";
import { useState } from "react";

export type ProjectPhase = "requirements" | "github" | "operations";

export function ProjectPhaseSwitcher({
  initialPhase,
  counts,
  content
}: {
  initialPhase: ProjectPhase;
  counts: {
    requirements: number;
    github: number;
    operations: number;
    readyJobs: number;
  };
  content: Record<ProjectPhase, ReactNode>;
}) {
  const [phase, setPhase] = useState<ProjectPhase>(initialPhase);

  function selectPhase(nextPhase: ProjectPhase) {
    setPhase(nextPhase);
    const url = new URL(window.location.href);
    url.searchParams.set("phase", nextPhase);
    window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
  }

  return (
    <>
      <div className="phase-summary" role="tablist" aria-label="Workflow phases">
        <PhaseButton
          phase="requirements"
          selectedPhase={phase}
          title="Requirements"
          value={counts.requirements}
          detail="PM to architect handoff"
          onSelect={selectPhase}
        />
        <PhaseButton
          phase="github"
          selectedPhase={phase}
          title="GitHub issues"
          value={counts.github}
          detail={`${counts.readyJobs} ready job${counts.readyJobs === 1 ? "" : "s"}`}
          onSelect={selectPhase}
        />
        <PhaseButton
          phase="operations"
          selectedPhase={phase}
          title="Operations"
          value={counts.operations}
          detail="DevOps events after merge"
          onSelect={selectPhase}
        />
      </div>
      {content[phase]}
    </>
  );
}

function PhaseButton({
  phase,
  selectedPhase,
  title,
  value,
  detail,
  onSelect
}: {
  phase: ProjectPhase;
  selectedPhase: ProjectPhase;
  title: string;
  value: number;
  detail: string;
  onSelect: (phase: ProjectPhase) => void;
}) {
  const selected = phase === selectedPhase;
  return (
    <button
      type="button"
      className={`phase-stat${selected ? " active" : ""}`}
      role="tab"
      aria-selected={selected}
      onClick={() => onSelect(phase)}
    >
      <span>
        <Text component="span" size="xs" fw={780}>{title}</Text>
        {selected ? <Badge size="xs" variant="light" ml={6}>active</Badge> : null}
      </span>
      <Text size="lg" fw={820}>{value}</Text>
      <Text size="xs" c="dimmed">{detail}</Text>
    </button>
  );
}
