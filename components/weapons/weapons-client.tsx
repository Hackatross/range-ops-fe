"use client";

import { Crosshair, Plus } from "lucide-react";
import { ResourceDashboard, type ResourceConfig } from "@/components/system";
import { useWeaponsList, useWeaponActions } from "@/lib/api/weapons";
import type { Weapon } from "@/lib/types/domain";
import { weaponColumns } from "./weapon-columns";
import { WeaponSheet } from "./weapon-sheet";

const weaponsConfig: ResourceConfig<Weapon> = {
  entityName: "weapon",
  basePath: "/weapons",
  icon: Crosshair,
  title: "Weapons",
  description: "Armoury — every weapon registered for use on the range.",
  useList: useWeaponsList,
  useActions: useWeaponActions,
  columns: weaponColumns,
  defaultSort: "-createdAt",
  defaultLimit: 25,
  sheet: { component: WeaponSheet },
  headerActions: [
    {
      icon: Plus,
      text: "Add weapon",
      size: "sm",
      role: "create",
      requiredRoles: ["admin", "trainer"],
    },
  ],
  permissions: { deleteRoles: ["admin"] },
};

export function WeaponsClient() {
  return <ResourceDashboard config={weaponsConfig} />;
}
