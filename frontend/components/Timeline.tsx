"use client";

import type { TrackingEvent } from "@/data/mockShipments";

interface TimelineProps {
  events: TrackingEvent[];
}

const statutIcons: Record<string, string> = {
  RAMASSE: "📦",
  EN_CONTENEUR: "🏭",
  PARTI: "🚢",
  ARRIVE: "🇨🇲",
  LIVRE: "✅",
};

export function Timeline({ events }: TimelineProps) {
  return (
    <div className="relative">
      {/* Ligne verticale */}
      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200 -ml-px" />

      <div className="space-y-0">
        {events.map((event, index) => (
          <div key={event.id} className="relative flex gap-6 pb-8 last:pb-0">
            {/* Point */}
            <div
              className={`relative z-10 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                event.completed
                  ? "bg-primary text-white"
                  : "bg-gray-200 text-gray-500"
              }`}
            >
              {event.completed ? (
                <span>{statutIcons[event.statut] || "✓"}</span>
              ) : (
                <span className="w-2 h-2 rounded-full bg-gray-400 animate-pulse" />
              )}
            </div>

            {/* Contenu */}
            <div className="flex-1 min-w-0 pt-0.5">
              <div
                className={`${
                  event.completed ? "text-gray-900" : "text-gray-500"
                }`}
              >
                <p className="font-semibold text-base">{event.label}</p>
                <p className="text-sm mt-0.5">{event.message}</p>
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-gray-500">
                  <span>
                    {event.date} {event.heure !== "--" && `· ${event.heure}`}
                  </span>
                  {event.lieu && (
                    <span className="text-primary font-medium">📍 {event.lieu}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
