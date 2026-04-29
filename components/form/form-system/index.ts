/**
 * Form System - Shadcn + @classytic/formkit Integration
 */

// Re-export from @classytic/formkit
export {
  FormGenerator as HeadlessFormGenerator,
  FormSystemProvider,
  useFormSystem,
  useFieldComponent,
  useLayoutComponent,
  SectionRenderer,
  GridRenderer,
  FieldWrapper,
  cn,
  shallowEqual,
  defineSchema,
  defineField,
  defineSection,
  evaluateCondition,
  extractWatchNames,
  extractDefaultValues,
  buildValidationRules,
  field,
  section,
  sectionUntitled,
  useFormKit,
  type FormSchema,
  type BaseField,
  type Section,
  type FieldComponentProps,
  type FieldOption,
  type FieldOptionGroup,
  type ComponentRegistry,
  type LayoutRegistry,
  type SectionLayoutProps,
  type GridLayoutProps,
  type Variant,
  type InferSchemaValues,
  type SchemaFieldNames,
  type FormElement,
  type DefineField,
  type ValidationRules,
  type Condition,
  type ConditionRule,
  type ConditionConfig,
  type FormGeneratorProps,
  type UseFormKitOptions,
  type UseFormKitReturn,
  type ClassValue,
} from "@classytic/formkit";

// Project-specific exports
export { FormGenerator } from "./FormGenerator";
export { ShadcnFormSystemProvider } from "./adapters/shadcn-adapter";
export { icon } from "./schema-helpers";
export {
  FormSection,
  FormGrid,
  FormFieldArray,
  FormFieldArrayItem,
} from "./components/FormSection";
export { FormFieldsRenderer } from "./components/FormFieldsRenderer";
