"use client";

import type { Control, FieldValues } from "react-hook-form";
import type { BaseField, FormSchema } from "@classytic/formkit";
import { FormGenerator } from "../FormGenerator";

interface FormFieldsRendererProps {
  fields: BaseField[];
  control?: Control<FieldValues>;
  disabled?: boolean;
  cols?: 1 | 2 | 3 | 4 | number;
}

/**
 * FormFieldsRenderer
 *
 * Renders a grid of fields using the FormGenerator system.
 * Useful for rendering fields without section wrappers.
 *
 * @example
 * ```tsx
 * <FormFieldsRenderer
 *   fields={[
 *     { name: "firstName", type: "text", label: "First Name" },
 *     { name: "lastName", type: "text", label: "Last Name" },
 *   ]}
 *   control={form.control}
 *   cols={2}
 * />
 * ```
 */
export function FormFieldsRenderer({
  fields,
  control,
  disabled,
  cols = 2,
}: FormFieldsRendererProps) {
  if (!fields || fields.length === 0) return null;

  const schema: FormSchema = {
    sections: [
      {
        fields,
        cols,
        variant: "transparent" as const,
      },
    ],
  };

  return <FormGenerator schema={schema} control={control} disabled={disabled} />;
}
