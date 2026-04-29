"use client";

import { Plus, Users } from "lucide-react";
import { ResourceDashboard, type ResourceConfig } from "@/components/system";
import { useShootersList, useShooterActions } from "@/lib/api/shooters";
import type { Shooter } from "@/lib/types/domain";
import { shooterColumns } from "./shooter-columns";
import { ShooterSheet } from "./shooter-sheet";

const shootersConfig: ResourceConfig<Shooter> = {
  entityName: "shooter",
  basePath: "/shooters",
  icon: Users,
  title: "Shooters",
  description:
    "Personnel registered to the range. Soft-deleted records can be restored within 30 days.",
  useList: useShootersList,
  useActions: useShooterActions,
  columns: shooterColumns,
  defaultSort: "-createdAt",
  defaultLimit: 25,
  sheet: { component: ShooterSheet },
  headerActions: [
    {
      icon: Plus,
      text: "Add shooter",
      size: "sm",
      role: "create",
      requiredRoles: ["admin", "trainer"],
    },
  ],
  permissions: { deleteRoles: ["admin"] },
};

export function ShootersClient() {
  return <ResourceDashboard config={shootersConfig} />;
}
