"use client";

import { FormSheet } from "@classytic/fluid/client/core";
import { useFormSubmitState } from "@/lib/hooks/use-form-submit-state";
import type { HardwareDevice } from "@/lib/types/domain";
import { DeviceForm } from "./device-form";

const FORM_ID = "device-sheet-form";

export interface DeviceSheetProps {
  item: HardwareDevice | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeviceSheet({ item, open, onOpenChange }: DeviceSheetProps) {
  const isEdit = !!item;
  const { isSubmitting, handleSubmitStateChange } = useFormSubmitState();

  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? "Edit device" : "Add device"}
      description={
        isEdit
          ? "Update placement or network details. Device ID is immutable."
          : "Register a new piece of range hardware. Heartbeats flip status to live."
      }
      size="lg"
      className="px-4"
      formId={FORM_ID}
      submitLabel={isEdit ? "Save changes" : "Add device"}
      cancelLabel="Cancel"
      submitDisabled={isSubmitting}
      submitLoading={isSubmitting}
      onCancel={() => onOpenChange(false)}
    >
      <DeviceForm
        device={item}
        formId={FORM_ID}
        onSuccess={() => onOpenChange(false)}
        onSubmitStateChange={handleSubmitStateChange}
      />
    </FormSheet>
  );
}
