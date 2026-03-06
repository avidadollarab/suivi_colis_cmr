"use client";

import { IconLocation, IconBox, IconAnchor } from "./icons";

export type TabId = "europe" | "groupage" | "cameroun";

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: "europe", label: "Europe", icon: <IconLocation size={18} strokeWidth={2} /> },
  { id: "groupage", label: "Groupage Premium", icon: <IconBox size={18} strokeWidth={2} /> },
  { id: "cameroun", label: "Cameroun", icon: <IconAnchor size={18} strokeWidth={2} /> },
];

interface HeroTabsProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  enableAnimations?: boolean;
}

export function HeroTabs({
  activeTab,
  onTabChange,
}: HeroTabsProps) {
  return (
    <div className="inline-flex items-center gap-1 p-1.5 rounded-xl border bg-white/5 backdrop-blur-sm border-white/20 shadow-lg">
      {TABS.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={`
              relative px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
              ${isActive
                ? "bg-white/25 text-white font-bold"
                : "bg-transparent text-white/75 hover:text-white hover:bg-white/10"
              }
            `}
            style={
              isActive
                ? {
                    boxShadow:
                      "0 0 0 1px rgba(255,197,51,0.6), 0 0 16px rgba(255,197,51,0.3)",
                  }
                : undefined
            }
          >
            <span className="flex items-center gap-2">
              <span className="flex items-center justify-center">{tab.icon}</span>
              <span>{tab.label}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
