import { Crosshair, Tag } from "lucide-react";
import { field, section } from "@/components/form/form-system";

const TYPE_OPTIONS = [
  { value: "rifle", label: "Rifle" },
  { value: "pistol", label: "Pistol" },
  { value: "smg", label: "SMG" },
  { value: "lmg", label: "LMG" },
];

export const createWeaponFormSchema = ({ isEdit }: { isEdit: boolean }) => ({
  sections: [
    section(
      "identity",
      "Identity",
      [
        field.text("weapon_code", "Weapon code", {
          placeholder: "WPN-T56-001",
          required: true,
          description: "Format: WPN-<MODEL>-<SERIAL>.",
          disabled: isEdit,
        }),
        field.select("type", "Type", TYPE_OPTIONS, {
          required: true,
          placeholder: "Select type",
        }),
      ],
      { cols: 2, icon: <Tag className="h-4 w-4" /> },
    ),
    section(
      "spec",
      "Specification",
      [
        field.text("model", "Model", {
          placeholder: "BD-08",
          required: true,
        }),
        field.text("caliber", "Caliber", {
          placeholder: "7.62×39mm",
          required: true,
        }),
      ],
      { cols: 2, icon: <Crosshair className="h-4 w-4" /> },
    ),
  ],
});
