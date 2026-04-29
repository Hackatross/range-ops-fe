"use client";

import { FormSheet } from "@classytic/fluid/client/core";
import { useFormSubmitState } from "@/lib/hooks/use-form-submit-state";
import type { Shooter } from "@/lib/types/domain";
import { ShooterForm } from "./shooter-form";

const FORM_ID = "shooter-sheet-form";

export interface ShooterSheetProps {
  item: Shooter | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ShooterSheet({ item, open, onOpenChange }: ShooterSheetProps) {
  const isEdit = !!item;
  const { isSubmitting, handleSubmitStateChange } = useFormSubmitState();

  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? "Edit shooter" : "Add shooter"}
      description={
        isEdit
          ? "Update rank, unit, or name. Shooter ID is immutable."
          : "Register a new marksman to the range."
      }
      size="lg"
      className="px-4"
      formId={FORM_ID}
      submitLabel={isEdit ? "Save changes" : "Add shooter"}
      cancelLabel="Cancel"
      submitDisabled={isSubmitting}
      submitLoading={isSubmitting}
      onCancel={() => onOpenChange(false)}
    >
      <ShooterForm
        shooter={item}
        formId={FORM_ID}
        onSuccess={() => onOpenChange(false)}
        onSubmitStateChange={handleSubmitStateChange}
      />
    </FormSheet>
  );
}
