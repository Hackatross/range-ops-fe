import { Cpu, MapPin, Network } from "lucide-react";
import { field, section } from "@/components/form/form-system";

const TYPE_OPTIONS = [
  { value: "laser", label: "Laser sensor" },
  { value: "camera", label: "Camera" },
];

export const createDeviceFormSchema = ({ isEdit }: { isEdit: boolean }) => ({
  sections: [
    section(
      "identity",
      "Identity",
      [
        field.text("device_id", "Device ID", {
          placeholder: "LASER-A-001",
          required: true,
          description:
            "Uppercase code burned into the hardware — used in heartbeats and ingest.",
          disabled: isEdit,
        }),
        field.select("type", "Type", TYPE_OPTIONS, {
          required: true,
          placeholder: "Select type",
        }),
      ],
      { cols: 2, icon: <Cpu className="h-4 w-4" /> },
    ),
    section(
      "network",
      "Network",
      [
        field.text("ip_address", "IP address", {
          placeholder: "192.168.10.21",
        }),
        field.number("port", "Port", {
          placeholder: "9001",
          min: 0,
          max: 65535,
        }),
        field.text("protocol", "Protocol", {
          placeholder: "tcp / udp / mqtt",
        }),
      ],
      { cols: 3, icon: <Network className="h-4 w-4" /> },
    ),
    section(
      "placement",
      "Placement",
      [
        field.text("location", "Location", {
          placeholder: "Lane 1 — 100m line",
          description:
            "Free-form label shown alongside live shots so trainers know where the device sits.",
        }),
      ],
      { cols: 1, icon: <MapPin className="h-4 w-4" /> },
    ),
  ],
});
