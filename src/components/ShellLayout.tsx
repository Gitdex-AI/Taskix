"use client";

import { useEffect, useState } from "react";
import { Nav } from "@/components/Nav";

export function ShellLayout({
  workflowCount,
  projectCount,
  children
}: {
  workflowCount: number;
  projectCount: number;
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    setCollapsed(window.localStorage.getItem("taskix-sidebar-collapsed") === "true");
  }, []);

  function toggleCollapsed() {
    setCollapsed((current) => {
      const next = !current;
      window.localStorage.setItem("taskix-sidebar-collapsed", String(next));
      return next;
    });
  }

  return (
    <div className={`layout ${collapsed ? "layout-collapsed" : ""}`}>
      <Nav workflowCount={workflowCount} projectCount={projectCount} collapsed={collapsed} onToggleCollapsed={toggleCollapsed} />
      <main className="content">{children}</main>
    </div>
  );
}
