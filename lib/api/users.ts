import { createCrudApi } from "@classytic/arc-next/api";
import { createCrudHooks } from "@classytic/arc-next/hooks";
import { withSoftDelete } from "@classytic/arc-next/presets/soft-delete";
import type { User } from "@/lib/types/domain";

/**
 * Admin user CRUD — the backend `userResource` mounts auto-generated
 * `/users` routes, gated by `adminOnlyPermissions`. Self-service profile
 * lives at `/auth/me` (different resource — see `lib/api/server.ts`).
 */
export interface UserCreatePayload {
  name: string;
  email: string;
  password: string;
  /** Comma-separated string. Use `joinRoles` from `lib/auth/roles.ts`. */
  role: string;
}
export type UserUpdatePayload = Partial<Omit<UserCreatePayload, "password">> & {
  password?: string;
};

export const usersApi = withSoftDelete(
  createCrudApi<User, UserCreatePayload, UserUpdatePayload>("users", {
    basePath: "",
  }),
);

export const {
  KEYS: USERS_KEYS,
  cache: usersCache,
  useList: useUsersList,
  useDetail: useUser,
  useActions: useUserActions,
  useDeleted: useDeletedUsers,
  useNavigation: useUserNavigation,
} = createCrudHooks<User, UserCreatePayload, UserUpdatePayload>({
  api: usersApi,
  entityKey: "users",
  singular: "User",
  plural: "Users",
});
