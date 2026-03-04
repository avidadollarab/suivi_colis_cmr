"use client";

import { useState } from "react";
import { Section } from "@/components/Section";
import { FAQ_ITEMS } from "@/data/faq";

export default function FAQPage() {
  const [openId, setOpenId] = useState<string | null>(FAQ_ITEMS[0]?.id ?? null);

  return (
    <Section
      title="Questions fréquentes"
      subtitle="Retrouvez les réponses aux questions les plus courantes."
    >
      <div className="max-w-3xl mx-auto">
        <div className="space-y-3">
          {FAQ_ITEMS.map((item) => {
            const isOpen = openId === item.id;
            return (
              <div
                key={item.id}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden transition-smooth hover:border-primary/20"
              >
                <button
                  onClick={() => setOpenId(isOpen ? null : item.id)}
                  className="w-full flex items-center justify-between p-5 text-left font-semibold text-primary hover:bg-primary/5 transition-colors"
                >
                  <span>{item.question}</span>
                  <span
                    className={`text-2xl transition-transform ${
                      isOpen ? "rotate-45" : ""
                    }`}
                  >
                    +
                  </span>
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-0">
                    <p className="text-gray-600 leading-relaxed">
                      {item.answer}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </Section>
  );
}
