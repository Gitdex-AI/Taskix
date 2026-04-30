"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ActionIcon, Badge, Paper, Stack, Text, Tooltip } from "@mantine/core";
import { ChevronsLeft, ChevronsRight, FolderKanban, Gauge, Settings, Wrench } from "lucide-react";

export function Nav({
  workflowCount,
  projectCount,
  collapsed,
  onToggleCollapsed
}: {
  workflowCount: number;
  projectCount: number;
  collapsed: boolean;
  onToggleCollapsed: () => void;
}) {
  const pathname = usePathname();
  const items = [
    { href: "/", label: "Dashboard", count: workflowCount, icon: Gauge, active: pathname === "/" },
    { href: "/projects", label: "Projects", count: projectCount, icon: FolderKanban, active: pathname.startsWith("/projects") },
    { href: "/tools", label: "Tools", icon: Wrench, active: pathname.startsWith("/tools") },
    { href: "/settings", label: "Settings", icon: Settings, active: pathname.startsWith("/settings") }
  ];

  return (
    <Paper className={`sidebar ${collapsed ? "collapsed" : ""}`} component="nav" aria-label="Primary" p="xs">
      <div className="nav-head">
        {!collapsed && <Text className="nav-kicker">Workspace</Text>}
        <ActionIcon variant="subtle" size="sm" aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"} onClick={onToggleCollapsed}>
          {collapsed ? <ChevronsRight size={16} /> : <ChevronsLeft size={16} />}
        </ActionIcon>
      </div>
      <Stack gap={6}>
        {items.map((item) => {
          const Icon = item.icon;
          const link = (
            <Link key={item.href} href={item.href} className={`side-link ${item.active ? "active" : ""}`}>
              <span className="side-link-main">
                <span className="side-link-icon">
                  <Icon size={17} strokeWidth={2.2} />
                </span>
                {!collapsed && <span>{item.label}</span>}
              </span>
              {!collapsed && typeof item.count === "number" && (
                <Badge size="sm" variant={item.active ? "filled" : "light"} color={item.active ? "blue" : "gray"}>
                  {item.count}
                </Badge>
              )}
            </Link>
          );
          return collapsed ? <Tooltip key={item.href} label={item.label} position="right">{link}</Tooltip> : link;
        })}
      </Stack>
    </Paper>
  );
}
