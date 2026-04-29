"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Sheet ↔ form submit-state bridge.
 *
 * The sheet owns the submit button (footer), the form owns the submission.
 * The form calls `onSubmitStateChange(true|false)` when its mutation flips,
 * the sheet uses that to gate its disabled state and spinner.
 *
 *   // sheet
 *   const { isSubmitting, handleSubmitStateChange } = useFormSubmitState();
 *   <FormSheet submitLoading={isSubmitting} ...>
 *     <Form onSubmitStateChange={handleSubmitStateChange} />
 *   </FormSheet>
 *
 *   // form
 *   useNotifySubmitState(isMutating, onSubmitStateChange);
 */
export function useFormSubmitState() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleSubmitStateChange = useCallback((next: boolean | null | undefined) => {
    setIsSubmitting(Boolean(next));
  }, []);
  return { isSubmitting, handleSubmitStateChange };
}

export function useNotifySubmitState(
  isSubmitting: boolean,
  onSubmitStateChange?: (state: boolean) => void,
) {
  useEffect(() => {
    onSubmitStateChange?.(isSubmitting);
  }, [isSubmitting, onSubmitStateChange]);
}
