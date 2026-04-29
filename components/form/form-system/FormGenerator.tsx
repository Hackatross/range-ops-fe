"use client";

import { FormGenerator as HeadlessFormGenerator, type FormGeneratorProps } from "@classytic/formkit";
import { ShadcnFormSystemProvider } from "./adapters/shadcn-adapter";
import type { FieldValues } from "react-hook-form";

/**
 * FormGenerator - Pre-configured for Shadcn UI
 *
 * Wraps the headless @classytic/formkit FormGenerator with
 * Shadcn-compatible components automatically.
 *
 * @example
 * ```tsx
 * import { useForm } from "react-hook-form";
 * import { FormGenerator } from "@/components/form/form-system";
 *
 * function MyForm() {
 *   const form = useForm();
 *
 *   const schema = {
 *     sections: [{
 *       title: "User Info",
 *       cols: 2,
 *       fields: [
 *         { name: "firstName", type: "text", label: "First Name" },
 *         { name: "email", type: "email", label: "Email" },
 *       ]
 *     }]
 *   };
 *
 *   return (
 *     <form onSubmit={form.handleSubmit(console.log)}>
 *       <FormGenerator schema={schema} control={form.control} />
 *       <button type="submit">Submit</button>
 *     </form>
 *   );
 * }
 * ```
 */
export function FormGenerator<TFieldValues extends FieldValues = FieldValues>(
  props: FormGeneratorProps<TFieldValues>
) {
  return (
    <ShadcnFormSystemProvider>
      <HeadlessFormGenerator {...props} />
    </ShadcnFormSystemProvider>
  );
}

