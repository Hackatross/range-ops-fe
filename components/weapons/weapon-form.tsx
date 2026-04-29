"use client";

import { useCallback, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { FormErrorSummary } from "@classytic/fluid/forms";
import { FormGenerator } from "@/components/form/form-system";
import { useNotifySubmitState } from "@/lib/hooks/use-form-submit-state";
import { useWeaponActions } from "@/lib/api/weapons";
import type { Weapon } from "@/lib/types/domain";
import { createWeaponFormSchema } from "./weapon-form-schema";

const formSchemaZ = z.object({
  weapon_code: z
    .string()
    .min(3, "Required")
    .regex(/^WPN-[A-Z0-9]+-\d+$/, "Format: WPN-T56-001"),
  type: z.enum(["rifle", "pistol", "smg", "lmg"]),
  model: z.string().min(1, "Required"),
  caliber: z.string().min(1, "Required"),
});

type FormValues = z.infer<typeof formSchemaZ>;

export interface WeaponFormProps {
  weapon?: Weapon | null;
  onSuccess?: () => void;
  onSubmitStateChange?: (state: boolean) => void;
  formId?: string;
}

export function WeaponForm({
  weapon,
  onSuccess,
  onSubmitStateChange,
  formId = "weapon-sheet-form",
}: WeaponFormProps) {
  const isEdit = !!weapon;
  const { create, update, isCreating, isUpdating } = useWeaponActions();
  const isSubmitting = isCreating || isUpdating;
  useNotifySubmitState(isSubmitting, onSubmitStateChange);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchemaZ),
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: useMemo<FormValues>(
      () => ({
        weapon_code: weapon?.weapon_code ?? "",
        type: (weapon?.type as FormValues["type"]) ?? "rifle",
        model: weapon?.model ?? "",
        caliber: weapon?.caliber ?? "",
      }),
      [weapon],
    ),
  });

  const formSchema = useMemo(
    () => createWeaponFormSchema({ isEdit }),
    [isEdit],
  );

  const onSubmit = useCallback(
    async (values: FormValues) => {
      try {
        if (isEdit && weapon) {
          await update({ id: weapon._id, data: values });
        } else {
          await create({ data: values });
        }
        onSuccess?.();
      } catch {
        // mutation factory already toasts
      }
    },
    [isEdit, weapon, create, update, onSuccess],
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
