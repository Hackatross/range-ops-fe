import { createCrudApi } from "@classytic/arc-next/api";
import { createCrudHooks } from "@classytic/arc-next/hooks";
import { withSoftDelete } from "@classytic/arc-next/presets/soft-delete";
import type { Weapon } from "@/lib/types/domain";

export type WeaponCreate = Omit<Weapon, "_id" | "createdAt" | "updatedAt">;
export type WeaponUpdate = Partial<WeaponCreate>;

export const weaponsApi = withSoftDelete(
  createCrudApi<Weapon, WeaponCreate, WeaponUpdate>("weapons", {
    basePath: "",
  }),
);

export const {
  KEYS: WEAPONS_KEYS,
  cache: weaponsCache,
  useList: useWeaponsList,
  useDetail: useWeapon,
  useActions: useWeaponActions,
  useDeleted: useDeletedWeapons,
  useNavigation: useWeaponNavigation,
} = createCrudHooks<Weapon, WeaponCreate, WeaponUpdate>({
  api: weaponsApi,
  entityKey: "weapons",
  singular: "Weapon",
  plural: "Weapons",
});
