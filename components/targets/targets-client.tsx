"use client";

import { Plus, Target as TargetIcon } from "lucide-react";
import { ResourceDashboard, type ResourceConfig } from "@/components/system";
import { useTargetsList, useTargetActions } from "@/lib/api/targets";
import type { Target } from "@/lib/types/domain";
import { targetColumns } from "./target-columns";
import { TargetSheet } from "./target-sheet";

const targetsConfig: ResourceConfig<Target> = {
  entityName: "target",
  basePath: "/targets",
  icon: TargetIcon,
  title: "Targets",
  description:
    "Range targets — rings drive scoring. Soft-deleted targets keep historical sessions intact.",
  useList: useTargetsList,
  useActions: useTargetActions,
  columns: targetColumns,
  defaultSort: "-createdAt",
  defaultLimit: 25,
  sheet: { component: TargetSheet },
  headerActions: [
    {
      icon: Plus,
      text: "Add target",
      size: "sm",
      role: "create",
      requiredRoles: ["admin", "trainer"],
    },
  ],
  permissions: { deleteRoles: ["admin"] },
};

export function TargetsClient() {
  return <ResourceDashboard config={targetsConfig} />;
}
