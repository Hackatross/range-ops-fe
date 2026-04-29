import { Crosshair, Layers, Ruler } from "lucide-react";
import { field, section } from "@/components/form/form-system";

export const createTargetFormSchema = ({ isEdit }: { isEdit: boolean }) => ({
  sections: [
    section(
      "identity",
      "Identity",
      [
        field.text("target_code", "Target code", {
          placeholder: "TGT-100M-STD",
          required: true,
          description: "Format: TGT-<DISTANCE>-<STYLE>.",
          disabled: isEdit,
        }),
        field.text("name", "Display name", {
          placeholder: "Standard 10-ring 100m",
          required: true,
        }),
      ],
      { cols: 2, icon: <Crosshair className="h-4 w-4" /> },
    ),

    section(
      "geometry",
      "Geometry",
      [
        field.number("distance_meters", "Distance (m)", {
          required: true,
          min: 1,
          max: 1000,
          placeholder: "100",
        }),
        field.number("dimensions.width_cm", "Width (cm)", {
          required: true,
          min: 1,
          placeholder: "60",
        }),
        field.number("dimensions.height_cm", "Height (cm)", {
          required: true,
          min: 1,
          placeholder: "60",
        }),
      ],
      { cols: 3, icon: <Ruler className="h-4 w-4" /> },
    ),

    section(
      "rings",
      "Scoring rings",
      [
        field.array(
          "rings",
          "Rings",
          [
            field.number("ring", "Ring", {
              required: true,
              min: 1,
              placeholder: "10",
            }),
            field.number("radius_cm", "Radius (cm)", {
              required: true,
              min: 0.1,
              step: 0.1,
              placeholder: "5",
            }),
            field.number("points", "Points", {
              required: true,
              min: 0,
              placeholder: "10",
            }),
            field.switch("is_bullseye", "Bullseye"),
          ],
          {
            description:
              "Order from highest score (innermost) to lowest. Exactly one ring should be marked Bullseye.",
          },
        ),
      ],
      { cols: 1, icon: <Layers className="h-4 w-4" /> },
    ),
  ],
});
