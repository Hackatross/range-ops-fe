"use client";

import { useCallback, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { FormErrorSummary } from "@classytic/fluid/forms";
import { FormGenerator } from "@/components/form/form-system";
import { useNotifySubmitState } from "@/lib/hooks/use-form-submit-state";
import { useShooterActions } from "@/lib/api/shooters";
import type { Shooter } from "@/lib/types/domain";
import { createShooterFormSchema } from "./shooter-form-schema";

const formSchemaZ = z.object({
  shooter_id: z
    .string()
    .min(3, "Required")
    .regex(/^[A-Z]{2}-\d{4}-\d{4}$/, "Format: BA-2024-0451"),
  name: z.string().min(2, "Required"),
  rank: z.string().optional().or(z.literal("")),
  unit: z.string().optional().or(z.literal("")),
});

type FormValues = z.infer<typeof formSchemaZ>;

export interface ShooterFormProps {
  shooter?: Shooter | null;
  onSuccess?: () => void;
  onSubmitStateChange?: (state: boolean) => void;
  formId?: string;
}

export function ShooterForm({
  shooter,
  onSuccess,
  onSubmitStateChange,
  formId = "shooter-sheet-form",
}: ShooterFormProps) {
  const isEdit = !!shooter;
  const { create, update, isCreating, isUpdating } = useShooterActions();
  const isSubmitting = isCreating || isUpdating;
  useNotifySubmitState(isSubmitting, onSubmitStateChange);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchemaZ),
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: useMemo<FormValues>(
      () => ({
        shooter_id: shooter?.shooter_id ?? "",
        name: shooter?.name ?? "",
        rank: shooter?.rank ?? "",
        unit: shooter?.unit ?? "",
      }),
      [shooter],
    ),
  });

  const formSchema = useMemo(
    () => createShooterFormSchema({ isEdit }),
    [isEdit],
  );

  const onSubmit = useCallback(
    async (values: FormValues) => {
      try {
        const data = {
          shooter_id: values.shooter_id,
          name: values.name,
          rank: values.rank?.trim() || undefined,
          unit: values.unit?.trim() || undefined,
        };
        if (isEdit && shooter) {
          await update({ id: shooter._id, data });
        } else {
          await create({ data });
        }
        onSuccess?.();
      } catch {
        // arc-next's mutation factory raises a toast; nothing to do here.
      }
    },
    [isEdit, shooter, create, update, onSuccess],
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
