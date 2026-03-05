"use client";

export type TabId = "europe" | "groupage" | "cameroun";

const TABS: { id: TabId; label: string; flag: string }[] = [
  { id: "europe", label: "Europe", flag: "🇪🇺" },
  { id: "groupage", label: "Groupage Premium", flag: "📦" },
  { id: "cameroun", label: "Cameroun", flag: "🇨🇲" },
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
                      "0 0 0 1px rgba(244,176,0,0.6), 0 0 16px rgba(244,176,0,0.25)",
                  }
                : undefined
            }
          >
            <span className="flex items-center gap-2">
              <span className="text-base">{tab.flag}</span>
              <span>{tab.label}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
