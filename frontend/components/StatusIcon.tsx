"use client";

import {
  IconBox,
  IconWarehouse,
  IconBoat,
  IconAnchor,
  IconCheckCircle,
} from "./icons";

export type ShipmentStatus =
  | "RAMASSE"
  | "EN_CONTENEUR"
  | "PARTI"
  | "ARRIVE"
  | "LIVRE";

interface StatusIconProps {
  status: ShipmentStatus;
  active?: boolean;
  completed?: boolean;
  size?: number;
  className?: string;
  ariaLabel?: string;
}

const STATUS_ICONS: Record<
  ShipmentStatus,
  React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>
> = {
  RAMASSE: IconBox,
  EN_CONTENEUR: IconWarehouse,
  PARTI: IconBoat,
  ARRIVE: IconAnchor,
  LIVRE: IconCheckCircle,
};

const STATUS_LABELS: Record<ShipmentStatus, string> = {
  RAMASSE: "Ramassé",
  EN_CONTENEUR: "En conteneur",
  PARTI: "Parti de France",
  ARRIVE: "Arrivé au Cameroun",
  LIVRE: "Livré",
};

export function StatusIcon({
  status,
  active = false,
  completed = false,
  size = 24,
  className = "",
  ariaLabel,
}: StatusIconProps) {
  const IconComponent = STATUS_ICONS[status] ?? IconBox;
  const label = ariaLabel ?? STATUS_LABELS[status];

  return (
    <span
      className={className}
      role="img"
      aria-label={label}
    >
      <IconComponent
        size={size}
        strokeWidth={status === "LIVRE" ? 2.5 : 2}
        className="w-full h-full"
      />
    </span>
  );
}

export { STATUS_LABELS as STATUS_ICON_LABELS };
