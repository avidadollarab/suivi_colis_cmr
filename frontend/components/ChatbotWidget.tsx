"use client";

import { useState, useRef, useEffect } from "react";
import { IconChat } from "./icons";
import { CHATBOT_CONFIG } from "@/data/chatbotConfig";

type Message = { role: "user" | "bot"; text: string };

function findIntent(userInput: string): { response: string } | null {
  const normalized = userInput
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
  if (!normalized) return null;

  for (const intent of CHATBOT_CONFIG.intents) {
    const matchCount = intent.keywords.filter((kw) =>
      normalized.includes(kw.toLowerCase())
    ).length;
    if (matchCount > 0) {
      return { response: intent.response };
    }
  }
  return null;
}

function getIntentResponse(intentId: string): string | null {
  const intent = CHATBOT_CONFIG.intents.find((i) => i.id === intentId);
  return intent ? intent.response : null;
}

export function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const addBotMessage = (text: string) => {
    setMessages((prev) => [...prev, { role: "bot", text }]);
  };

  const handleQuickButton = (intentId: string) => {
    const response = getIntentResponse(intentId);
    if (response) {
      const quickLabel = CHATBOT_CONFIG.quickButtons.find(
        (q) => q.intentId === intentId
      )?.label;
      if (quickLabel) {
        setMessages((prev) => [...prev, { role: "user", text: quickLabel }]);
      }
      addBotMessage(response);
    }
  };

  const handleSend = () => {
    const text = inputValue.trim();
    if (!text) return;

    setMessages((prev) => [...prev, { role: "user", text }]);
    setInputValue("");

    const intent = findIntent(text);
    if (intent) {
      addBotMessage(intent.response);
    } else {
      addBotMessage(CHATBOT_CONFIG.fallbackMessage);
    }
  };

  const handleOpen = () => {
    setIsOpen(true);
    if (messages.length === 0) {
      addBotMessage(CHATBOT_CONFIG.welcomeMessage);
    }
  };

  return (
    <>
      {/* Bulle flottante */}
      <button
        onClick={handleOpen}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-primary shadow-lg hover:bg-primary-dark hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center text-white"
        aria-label="Ouvrir l'assistant"
      >
        <IconChat size={24} strokeWidth={2} />
      </button>

      {/* Fenêtre de chat */}
      {isOpen && (
        <div
          className="fixed bottom-24 right-6 z-50 w-[calc(100vw-3rem)] max-w-md h-[480px] max-h-[70vh] flex flex-col bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden"
          role="dialog"
          aria-label="Chat assistant"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-primary text-white">
            <span className="font-semibold">ELISÉE XPRESS LOG</span>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg hover:bg-white/20 transition-colors"
              aria-label="Fermer"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] px-4 py-2 rounded-2xl text-sm ${
                    msg.role === "user"
                      ? "bg-primary text-white rounded-br-md"
                      : "bg-white border border-gray-200 text-gray-800 rounded-bl-md"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {messages.length === 1 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {CHATBOT_CONFIG.quickButtons.map((btn) => (
                  <button
                    key={btn.intentId}
                    onClick={() => handleQuickButton(btn.intentId)}
                    className="px-3 py-1.5 rounded-full text-xs font-medium bg-gold/20 text-primary border border-gold/40 hover:bg-gold/30 transition-colors"
                  >
                    {btn.label}
                  </button>
                ))}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Bouton WhatsApp — mis en avant après un fallback */}
          {messages.some(
            (m) => m.role === "bot" && m.text.includes("+41774428549")
          ) && (
            <div className="px-4 pb-2">
              <a
                href={`${CHATBOT_CONFIG.whatsappUrl}?text=Bonjour, j'ai une question`}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full py-2.5 rounded-xl bg-green-500 hover:bg-green-600 text-white font-semibold text-center text-sm transition-colors"
              >
                Contacter un conseiller sur WhatsApp
              </a>
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t border-gray-200 bg-white">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Posez votre question..."
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm"
              />
              <button
                onClick={handleSend}
                className="px-4 py-2.5 bg-primary hover:bg-primary-dark text-white font-semibold rounded-xl transition-colors text-sm"
              >
                Envoyer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
