"use client";

import { FormSheet } from "@classytic/fluid/client/core";
import { useFormSubmitState } from "@/lib/hooks/use-form-submit-state";
import type { Weapon } from "@/lib/types/domain";
import { WeaponForm } from "./weapon-form";

const FORM_ID = "weapon-sheet-form";

export interface WeaponSheetProps {
  item: Weapon | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WeaponSheet({ item, open, onOpenChange }: WeaponSheetProps) {
  const isEdit = !!item;
  const { isSubmitting, handleSubmitStateChange } = useFormSubmitState();

  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? "Edit weapon" : "Add weapon"}
      description={
        isEdit
          ? "Update model, caliber, or type. Weapon code is immutable."
          : "Register a new weapon to the armoury."
      }
      size="lg"
      className="px-4"
      formId={FORM_ID}
      submitLabel={isEdit ? "Save changes" : "Add weapon"}
      cancelLabel="Cancel"
      submitDisabled={isSubmitting}
      submitLoading={isSubmitting}
      onCancel={() => onOpenChange(false)}
    >
      <WeaponForm
        weapon={item}
        formId={FORM_ID}
        onSuccess={() => onOpenChange(false)}
        onSubmitStateChange={handleSubmitStateChange}
      />
    </FormSheet>
  );
}
