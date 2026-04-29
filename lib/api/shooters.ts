import { createCrudApi } from "@classytic/arc-next/api";
import { createCrudHooks } from "@classytic/arc-next/hooks";
import { withSoftDelete } from "@classytic/arc-next/presets/soft-delete";
import type { Shooter } from "@/lib/types/domain";

export type ShooterCreate = Omit<
  Shooter,
  "_id" | "createdAt" | "updatedAt"
>;
export type ShooterUpdate = Partial<ShooterCreate>;

export const shootersApi = withSoftDelete(
  createCrudApi<Shooter, ShooterCreate, ShooterUpdate>("shooters", {
    basePath: "",
  }),
);

export const {
  KEYS: SHOOTERS_KEYS,
  cache: shootersCache,
  useList: useShootersList,
  useDetail: useShooter,
  useActions: useShooterActions,
  useDeleted: useDeletedShooters,
  useNavigation: useShooterNavigation,
} = createCrudHooks<Shooter, ShooterCreate, ShooterUpdate>({
  api: shootersApi,
  entityKey: "shooters",
  singular: "Shooter",
  plural: "Shooters",
});
