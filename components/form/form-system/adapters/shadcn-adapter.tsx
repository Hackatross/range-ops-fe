"use client";

import { type ReactNode, useMemo } from "react";
import { useWatch, useFieldArray } from "react-hook-form";
import { FormSystemProvider, GridRenderer } from "@classytic/formkit";
import { cn } from "@/lib/utils";

import {
  FormInput,
  FormTextarea,
  SelectInput,
  ComboboxInput,
  SwitchInput,
  CheckboxInput,
  RadioInput,
  DateInput,
  TagInput,
  TagChoiceInput,
  SlugField,
  OTPInput,
  MultiSelect,
  AsyncCombobox,
  AsyncMultiSelect,
  FileUploadInput,
  DateTimeInput,
  FormFieldArray,
  FormFieldArrayItem,
} from "@classytic/fluid/forms";

import { FormSection } from "@/components/form/form-system/components/FormSection";
import { Field, FieldLabel, FieldDescription } from "@/components/ui/field";

// ============ ADAPTER HELPERS ============

const normalizeIconProps = (props: any) => {
  const normalized = { ...props };
  if (props.iconLeft) {
    normalized.IconLeft = props.iconLeft;
    delete normalized.iconLeft;
  }
  if (props.iconRight) {
    normalized.IconRight = props.iconRight;
    delete normalized.iconRight;
  }
  return normalized;
};

function createAdapter(Component: any) {
  function FieldAdapter({ field, control, disabled, error }: any) {
    const { fullWidth, gridColumn, ...fieldProps } = field;
    const normalizedProps = normalizeIconProps(fieldProps);

    return (
      <Component
        {...normalizedProps}
        control={control}
        disabled={disabled}
        error={error}
      />
    );
  }
  return FieldAdapter;
}

function createSelectAdapter(Component: any) {
  function SelectAdapter({ field, control, disabled, error }: any) {
    const { options, fullWidth, gridColumn, ...fieldWithoutOptions } = field;
    const normalizedProps = normalizeIconProps(fieldWithoutOptions);

    return (
      <Component
        {...normalizedProps}
        control={control}
        disabled={disabled}
        items={options || []}
        error={error}
      />
    );
  }
  return SelectAdapter;
}

const DependentSelectAdapter = ({ field, control, disabled, error }: any) => {
  const {
    dependsOn,
    getOptions,
    fullWidth,
    gridColumn,
    searchable = true,
    emptyText = "No options available",
    ...fieldWithoutDeps
  } = field;
  const normalizedProps = normalizeIconProps(fieldWithoutDeps);

  const dependsOnArray = Array.isArray(dependsOn) ? dependsOn : [dependsOn];
  const watchedValues = useWatch({ control, name: dependsOnArray });

  const items = useMemo(() => {
    if (!getOptions) return [];
    if (dependsOnArray.length === 1) {
      return getOptions(watchedValues[0]) || [];
    }
    return getOptions(...watchedValues) || [];
  }, [getOptions, watchedValues, dependsOnArray.length]);

  const isDisabled = disabled || !watchedValues.some((v: any) => v);

  if (searchable) {
    return (
      <ComboboxInput
        {...normalizedProps}
        control={control}
        disabled={isDisabled}
        items={items}
        emptyText={isDisabled ? "Select parent field first" : emptyText}
        error={error}
      />
    );
  }

  return (
    <SelectInput
      {...normalizedProps}
      control={control}
      disabled={isDisabled}
      items={items}
      error={error}
    />
  );
};

// ============ ARRAY & GROUP ADAPTERS ============

const ArrayFieldAdapter = ({ field: fieldDef, control, disabled }: any) => {
  const { name, label, itemFields, description } = fieldDef;
  const { fields, append, remove } = useFieldArray({ control, name });

  const defaultItem = useMemo(() => {
    const item: Record<string, any> = {};
    for (const f of itemFields || []) {
      item[f.name] = f.defaultValue ?? "";
    }
    return item;
  }, [itemFields]);

  return (
    <FormFieldArray
      title={label}
      description={description}
      onAdd={() => append(defaultItem)}
      addLabel="Add Item"
      itemCount={fields.length}
    >
      {fields.map((rhfField, index) => (
        <FormFieldArrayItem
          key={rhfField.id}
          onRemove={() => remove(index)}
          title={`#${index + 1}`}
        >
          <GridRenderer
            fields={itemFields?.map((f: any) => ({
              ...f,
              name: `${name}.${index}.${f.name}`,
            }))}
            cols={itemFields?.length > 1 ? 2 : 1}
            control={control}
            disabled={disabled}
          />
        </FormFieldArrayItem>
      ))}
    </FormFieldArray>
  );
};

const GroupFieldAdapter = ({ field: fieldDef, control, disabled }: any) => {
  const { name, label, itemFields, description } = fieldDef;

  return (
    <Field>
      {label && <FieldLabel>{label}</FieldLabel>}
      {description && <FieldDescription>{description}</FieldDescription>}
      <div className="rounded-lg border p-4">
        <GridRenderer
          fields={itemFields?.map((f: any) => ({
            ...f,
            name: `${name}.${f.name}`,
          }))}
          cols={itemFields?.length > 2 ? 2 : 1}
          control={control}
          disabled={disabled}
        />
      </div>
    </Field>
  );
};

// ============ COMPONENT MAPPING ============

const components: Record<string, any> = {
  text: createAdapter(FormInput),
  email: createAdapter(FormInput),
  url: createAdapter(FormInput),
  tel: createAdapter(FormInput),
  number: createAdapter(FormInput),
  password: createAdapter(FormInput),

  textarea: createAdapter(FormTextarea),

  select: createSelectAdapter(SelectInput),
  combobox: createSelectAdapter(ComboboxInput),
  multiselect: createSelectAdapter(MultiSelect),
  tagChoice: createSelectAdapter(TagChoiceInput),
  dependentSelect: DependentSelectAdapter,

  otp: createAdapter(OTPInput),

  asyncCombobox: ({ field, control, disabled, error }: any) => {
    const { onSearch, debounceMs, minChars, initialItems, fullWidth, gridColumn, ...fieldProps } = field;
    const normalizedProps = normalizeIconProps(fieldProps);
    return (
      <AsyncCombobox
        {...normalizedProps}
        control={control}
        disabled={disabled}
        onSearch={onSearch}
        debounceMs={debounceMs}
        minChars={minChars}
        initialItems={initialItems}
        error={error}
      />
    );
  },

  asyncMultiselect: ({ field, control, disabled, error }: any) => {
    const { onSearch, debounceMs, minChars, initialItems, maxSelections, fullWidth, gridColumn, ...fieldProps } = field;
    const normalizedProps = normalizeIconProps(fieldProps);
    return (
      <AsyncMultiSelect
        {...normalizedProps}
        control={control}
        disabled={disabled}
        onSearch={onSearch}
        debounceMs={debounceMs}
        minChars={minChars}
        initialItems={initialItems}
        maxSelections={maxSelections}
        error={error}
      />
    );
  },

  dateTime: ({ field, control, disabled, error }: any) => {
    const { mode, minDate, maxDate, timeSlotInterval, hourFormat, fullWidth, gridColumn, ...fieldProps } = field;
    const normalizedProps = normalizeIconProps(fieldProps);
    return (
      <DateTimeInput
        {...normalizedProps}
        control={control}
        disabled={disabled}
        mode={mode}
        minDate={minDate}
        maxDate={maxDate}
        timeSlotInterval={timeSlotInterval}
        hourFormat={hourFormat}
        error={error}
      />
    );
  },

  file: createAdapter(FileUploadInput),

  switch: createAdapter(SwitchInput),
  checkbox: createAdapter(CheckboxInput),

  radio: createAdapter(RadioInput),

  date: createAdapter(DateInput),

  tag: createAdapter(TagInput),
  tags: createAdapter(TagInput),

  slug: createAdapter(SlugField),

  array: ArrayFieldAdapter,
  group: GroupFieldAdapter,

  custom: ({ field, control, disabled, error }: any) => {
    const { render } = field || {};
    return typeof render === "function" ? render({ control, disabled, error }) : render;
  },

  default: createAdapter(FormInput),
};

// ============ LAYOUT MAPPING ============

const layouts: Record<string, any> = {
  section: ({ title, description, icon, variant, className, children, ...props }: any) => {
    if (variant === "transparent") {
      return <div className={className}>{children}</div>;
    }

    return (
      <FormSection
        title={title}
        description={description}
        icon={icon}
        variant={variant || "default"}
        className={className}
        {...props}
      >
        {children}
      </FormSection>
    );
  },

  grid: ({ cols = 1, children }: any) => {
    const colsClass: Record<number, string> = {
      1: "grid-cols-1",
      2: "grid-cols-1 md:grid-cols-2",
      3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
      4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
    };

    return (
      <div className={cn("grid gap-4", colsClass[cols] || "grid-cols-1 md:grid-cols-2")}>
        {children}
      </div>
    );
  },
};

/**
 * Pre-configured Provider for Shadcn
 */
export function ShadcnFormSystemProvider({ children }: { children: ReactNode }) {
  return (
    <FormSystemProvider components={components} layouts={layouts}>
      {children}
    </FormSystemProvider>
  );
}
