"use client";

import { useCallback, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { FormErrorSummary } from "@classytic/fluid/forms";
import { FormGenerator } from "@/components/form/form-system";
import { useNotifySubmitState } from "@/lib/hooks/use-form-submit-state";
import { useTargetActions } from "@/lib/api/targets";
import type { Target } from "@/lib/types/domain";
import { createTargetFormSchema } from "./target-form-schema";

const ringSchema = z.object({
  ring: z.number().int().min(1, "≥ 1"),
  radius_cm: z.number().positive("Required"),
  points: z.number().int().min(0, "≥ 0"),
  is_bullseye: z.boolean(),
});

const formSchemaZ = z.object({
  target_code: z
    .string()
    .min(3, "Required")
    .regex(/^TGT-[A-Z0-9]+-[A-Z0-9]+$/, "Format: TGT-100M-STD"),
  name: z.string().min(2, "Required"),
  distance_meters: z.number().int().min(1, "Required"),
  dimensions: z.object({
    width_cm: z.number().positive("Required"),
    height_cm: z.number().positive("Required"),
  }),
  rings: z.array(ringSchema).min(1, "At least one ring is required"),
});

type FormValues = z.infer<typeof formSchemaZ>;

const DEFAULT_RING = {
  ring: 10,
  radius_cm: 5,
  points: 10,
  is_bullseye: true,
};

export interface TargetFormProps {
  target?: Target | null;
  onSuccess?: () => void;
  onSubmitStateChange?: (state: boolean) => void;
  formId?: string;
}

export function TargetForm({
  target,
  onSuccess,
  onSubmitStateChange,
  formId = "target-sheet-form",
}: TargetFormProps) {
  const isEdit = !!target;
  const { create, update, isCreating, isUpdating } = useTargetActions();
  const isSubmitting = isCreating || isUpdating;
  useNotifySubmitState(isSubmitting, onSubmitStateChange);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchemaZ),
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: useMemo<FormValues>(
      () => ({
        target_code: target?.target_code ?? "",
        name: target?.name ?? "",
        distance_meters: target?.distance_meters ?? 100,
        dimensions: {
          width_cm: target?.dimensions?.width_cm ?? 60,
          height_cm: target?.dimensions?.height_cm ?? 60,
        },
        rings: target?.rings?.length ? target.rings : [DEFAULT_RING],
      }),
      [target],
    ),
  });

  const formSchema = useMemo(
    () => createTargetFormSchema({ isEdit }),
    [isEdit],
  );

  const onSubmit = useCallback(
    async (values: FormValues) => {
      // Backend expects exactly one bullseye — surface this client-side
      // for instant feedback rather than waiting for a 422.
      const bullseyes = values.rings.filter((r) => r.is_bullseye).length;
      if (bullseyes !== 1) {
        toast.error(
          bullseyes === 0
            ? "Mark one ring as Bullseye."
            : "Only one ring can be the Bullseye.",
        );
        return;
      }

      try {
        if (isEdit && target) {
          await update({ id: target._id, data: values });
        } else {
          await create({ data: values });
        }
        onSuccess?.();
      } catch {
        // mutation factory toasts on error
      }
    },
    [isEdit, target, create, update, onSuccess],
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
