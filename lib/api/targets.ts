import { createCrudApi } from "@classytic/arc-next/api";
import { createCrudHooks } from "@classytic/arc-next/hooks";
import { withSoftDelete } from "@classytic/arc-next/presets/soft-delete";
import type { Target } from "@/lib/types/domain";

export type TargetCreate = Omit<Target, "_id" | "createdAt" | "updatedAt">;
export type TargetUpdate = Partial<TargetCreate>;

export const targetsApi = withSoftDelete(
  createCrudApi<Target, TargetCreate, TargetUpdate>("targets", {
    basePath: "",
  }),
);

export const {
  KEYS: TARGETS_KEYS,
  cache: targetsCache,
  useList: useTargetsList,
  useDetail: useTarget,
  useActions: useTargetActions,
  useDeleted: useDeletedTargets,
  useNavigation: useTargetNavigation,
} = createCrudHooks<Target, TargetCreate, TargetUpdate>({
  api: targetsApi,
  entityKey: "targets",
  singular: "Target",
  plural: "Targets",
});
