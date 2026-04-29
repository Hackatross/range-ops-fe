"use client";

import { useCallback, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { FormErrorSummary } from "@classytic/fluid/forms";
import { FormGenerator } from "@/components/form/form-system";
import { useNotifySubmitState } from "@/lib/hooks/use-form-submit-state";
import { useDeviceActions } from "@/lib/api/devices";
import type { HardwareDevice } from "@/lib/types/domain";
import { createDeviceFormSchema } from "./device-form-schema";

const formSchemaZ = z.object({
  device_id: z
    .string()
    .min(3, "Required")
    .regex(/^[A-Z0-9-]+$/, "Uppercase letters / digits / dashes only"),
  type: z.enum(["laser", "camera"]),
  ip_address: z.string().optional().or(z.literal("")),
  port: z.number().int().min(0).max(65535).optional().or(z.literal("")),
  protocol: z.string().optional().or(z.literal("")),
  location: z.string().optional().or(z.literal("")),
});

type FormValues = z.infer<typeof formSchemaZ>;

export interface DeviceFormProps {
  device?: HardwareDevice | null;
  onSuccess?: () => void;
  onSubmitStateChange?: (state: boolean) => void;
  formId?: string;
}

export function DeviceForm({
  device,
  onSuccess,
  onSubmitStateChange,
  formId = "device-sheet-form",
}: DeviceFormProps) {
  const isEdit = !!device;
  const { create, update, isCreating, isUpdating } = useDeviceActions();
  const isSubmitting = isCreating || isUpdating;
  useNotifySubmitState(isSubmitting, onSubmitStateChange);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchemaZ),
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: useMemo<FormValues>(
      () => ({
        device_id: device?.device_id ?? "",
        type: (device?.type as FormValues["type"]) ?? "laser",
        ip_address: device?.ip_address ?? "",
        port: (device?.port as number | "" | undefined) ?? "",
        protocol: device?.protocol ?? "",
        location: device?.location ?? "",
      }),
      [device],
    ),
  });

  const formSchema = useMemo(
    () => createDeviceFormSchema({ isEdit }),
    [isEdit],
  );

  const onSubmit = useCallback(
    async (values: FormValues) => {
      try {
        const data = {
          device_id: values.device_id.toUpperCase(),
          type: values.type,
          ip_address: values.ip_address ? values.ip_address.trim() : undefined,
          port: typeof values.port === "number" ? values.port : undefined,
          protocol: values.protocol ? values.protocol.trim() : undefined,
          location: values.location ? values.location.trim() : undefined,
        };

        if (isEdit && device) {
          await update({ id: device._id, data });
        } else {
          await create({ data });
        }
        onSuccess?.();
      } catch {
        // mutation factory toasts on error
      }
    },
    [isEdit, device, create, update, onSuccess],
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
