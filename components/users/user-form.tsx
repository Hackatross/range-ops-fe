"use client";

import { useCallback, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { FormErrorSummary } from "@classytic/fluid/forms";
import { FormGenerator } from "@/components/form/form-system";
import { useNotifySubmitState } from "@/lib/hooks/use-form-submit-state";
import { useUserActions } from "@/lib/api/users";
import { joinRoles, parseRoles } from "@/lib/auth/roles";
import type { User } from "@/lib/types/domain";
import { createUserFormSchema } from "./user-form-schema";

const baseSchema = z.object({
  name: z.string().min(2, "Required"),
  email: z.string().email("Invalid email"),
  roles: z.array(z.enum(["admin", "trainer", "viewer"])).min(1, "Pick at least one role"),
  password: z.string().optional().or(z.literal("")),
});

type FormValues = z.infer<typeof baseSchema>;

export interface UserFormProps {
  user?: User | null;
  onSuccess?: () => void;
  onSubmitStateChange?: (state: boolean) => void;
  formId?: string;
}

export function UserForm({
  user,
  onSuccess,
  onSubmitStateChange,
  formId = "user-sheet-form",
}: UserFormProps) {
  const isEdit = !!user;
  const { create, update, isCreating, isUpdating } = useUserActions();
  const isSubmitting = isCreating || isUpdating;
  useNotifySubmitState(isSubmitting, onSubmitStateChange);

  const form = useForm<FormValues>({
    resolver: zodResolver(baseSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: useMemo<FormValues>(
      () => ({
        name: user?.name ?? "",
        email: user?.email ?? "",
        roles: (parseRoles(user?.role).filter((r) =>
          ["admin", "trainer", "viewer"].includes(r),
        ) as FormValues["roles"]) ?? ["viewer"],
        password: "",
      }),
      [user],
    ),
  });

  const formSchema = useMemo(
    () => createUserFormSchema({ isEdit }),
    [isEdit],
  );

  const onSubmit = useCallback(
    async (values: FormValues) => {
      try {
        const role = joinRoles(values.roles);

        if (isEdit && user) {
          // Edit: omit password if blank so backend leaves it unchanged.
          const data: Record<string, unknown> = {
            name: values.name,
            email: values.email,
            role,
          };
          if (values.password) data.password = values.password;
          await update({ id: user._id, data });
        } else {
          if (!values.password || values.password.length < 8) {
            toast.error("Password must be at least 8 characters.");
            return;
          }
          await create({
            data: {
              name: values.name,
              email: values.email,
              role,
              password: values.password,
            },
          });
        }
        onSuccess?.();
      } catch {
        // mutation factory toasts on error
      }
    },
    [isEdit, user, create, update, onSuccess],
  );

  return (
    <form
      id={formId}
      onSubmit={form.handleSubmit(onSubmit, () =>
        toast.error("Fix the highlighted fields before saving."),
      )}
      className="space-y-6"
    >
      <FormGenerator
        schema={formSchema}
        control={form.control}
        disabled={isSubmitting}
      />
      <FormErrorSummary errors={form.formState.errors} />
    </form>
  );
}
