"use client";

import { Plus, Users as UsersIcon } from "lucide-react";
import {
  ResourceDashboard,
  type ResourceConfig,
} from "@/components/system";
import { useUserActions, useUsersList } from "@/lib/api/users";
import type { User } from "@/lib/types/domain";
import { userColumns } from "./user-columns";
import { UserSheet } from "./user-sheet";

const usersConfig: ResourceConfig<User> = {
  entityName: "user",
  basePath: "/users",
  icon: UsersIcon,
  title: "Users",
  description:
    "Console accounts. Roles can stack — a single user can hold admin + trainer.",
  useList: useUsersList,
  useActions: useUserActions,
  columns: userColumns,
  defaultSort: "-createdAt",
  defaultLimit: 25,
  sheet: { component: UserSheet },
  headerActions: [
    {
      icon: Plus,
      text: "Add user",
      size: "sm",
      role: "create",
      requiredRoles: ["admin"],
    },
  ],
  permissions: { deleteRoles: ["admin"] },
};

export function UsersClient() {
  return <ResourceDashboard config={usersConfig} />;
}
