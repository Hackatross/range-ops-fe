"use client";

import { FormSheet } from "@classytic/fluid/client/core";
import { useFormSubmitState } from "@/lib/hooks/use-form-submit-state";
import type { Target } from "@/lib/types/domain";
import { TargetForm } from "./target-form";

const FORM_ID = "target-sheet-form";

export interface TargetSheetProps {
  item: Target | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TargetSheet({ item, open, onOpenChange }: TargetSheetProps) {
  const isEdit = !!item;
  const { isSubmitting, handleSubmitStateChange } = useFormSubmitState();

  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? "Edit target" : "Add target"}
      description={
        isEdit
          ? "Adjust geometry and ring scoring. Target code is immutable."
          : "Define a new target — its rings drive the scoring engine."
      }
      size="xl"
      className="px-4"
      formId={FORM_ID}
      submitLabel={isEdit ? "Save changes" : "Add target"}
      cancelLabel="Cancel"
      submitDisabled={isSubmitting}
      submitLoading={isSubmitting}
      onCancel={() => onOpenChange(false)}
    >
      <TargetForm
        target={item}
        formId={FORM_ID}
        onSuccess={() => onOpenChange(false)}
        onSubmitStateChange={handleSubmitStateChange}
      />
    </FormSheet>
  );
}
