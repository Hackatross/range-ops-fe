import { Crosshair, IdCard } from "lucide-react";
import { field, section } from "@/components/form/form-system";

/**
 * formkit schema for the Shooter create/edit form.
 *
 * Field IDs match the Shooter type — the form's `defaultValues` shape feeds
 * straight into `useShooterActions().create / update`.
 */
export const createShooterFormSchema = ({ isEdit }: { isEdit: boolean }) => ({
  sections: [
    section(
      "identity",
      "Identity",
      [
        field.text("shooter_id", "Shooter ID", {
          placeholder: "BA-2024-0451",
          required: true,
          description: "Format: XX-YYYY-NNNN — service prefix, year, serial.",
          disabled: isEdit, // immutable after create
        }),
        field.text("name", "Full name", {
          placeholder: "Cpl. Karim Hossain",
          required: true,
        }),
      ],
      { cols: 2, icon: <IdCard className="h-4 w-4" /> },
    ),
    section(
      "posting",
      "Posting",
      [
        field.text("rank", "Rank", { placeholder: "Corporal" }),
        field.text("unit", "Unit", { placeholder: "6 East Bengal" }),
      ],
      { cols: 2, icon: <Crosshair className="h-4 w-4" /> },
    ),
  ],
});
