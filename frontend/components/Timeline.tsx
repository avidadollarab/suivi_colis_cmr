"use client";

import type { TrackingEvent } from "@/data/mockShipments";
import { TimelineStep } from "./TimelineStep";
import {
  IconBox,
  IconWarehouse,
  IconBoat,
  IconAnchor,
  IconCheck,
} from "./icons";

interface TimelineProps {
  events: TrackingEvent[];
  enableAnimations?: boolean;
}

const STATUT_ICONS: Record<string, React.ReactNode> = {
  RAMASSE: <IconBox size={18} strokeWidth={2} />,
  EN_CONTENEUR: <IconWarehouse size={18} strokeWidth={2} />,
  PARTI: <IconBoat size={18} strokeWidth={2} />,
  ARRIVE: <IconAnchor size={18} strokeWidth={2} />,
  LIVRE: <IconCheck size={18} strokeWidth={2.5} />,
};

export function Timeline({ events, enableAnimations = true }: TimelineProps) {
  return (
    <div className="relative">
      <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-200 -ml-px" />

      <div className="space-y-0">
        {events.map((event, index) => (
          <TimelineStep
            key={event.id}
            label={event.label}
            date={`${event.date} ${event.heure !== "--" ? `· ${event.heure}` : ""}`}
            message={event.message}
            lieu={event.lieu}
            status={event.completed ? "completed" : "current"}
            icon={STATUT_ICONS[event.statut] ?? <IconBox size={18} />}
            index={index}
            enableAnimations={enableAnimations}
            tooltip={event.lieu ? `Votre colis est arrivé à l'entrepôt de ${event.lieu}` : undefined}
          />
        ))}
      </div>
    </div>
  );
}
