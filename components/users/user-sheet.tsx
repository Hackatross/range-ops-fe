"use client";

import { FormSheet } from "@classytic/fluid/client/core";
import { useFormSubmitState } from "@/lib/hooks/use-form-submit-state";
import type { User } from "@/lib/types/domain";
import { UserForm } from "./user-form";

const FORM_ID = "user-sheet-form";

export interface UserSheetProps {
  item: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserSheet({ item, open, onOpenChange }: UserSheetProps) {
  const isEdit = !!item;
  const { isSubmitting, handleSubmitStateChange } = useFormSubmitState();

  return (
    <FormSheet
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? "Edit user" : "Add user"}
      description={
        isEdit
          ? "Update name, email, roles, or reset the password. Email must be unique."
          : "Create a new console user. Initial password should be 8+ characters."
      }
      size="lg"
      className="px-4"
      formId={FORM_ID}
      submitLabel={isEdit ? "Save changes" : "Add user"}
      cancelLabel="Cancel"
      submitDisabled={isSubmitting}
      submitLoading={isSubmitting}
      onCancel={() => onOpenChange(false)}
    >
      <UserForm
        user={item}
        formId={FORM_ID}
        onSuccess={() => onOpenChange(false)}
        onSubmitStateChange={handleSubmitStateChange}
      />
    </FormSheet>
  );
}
