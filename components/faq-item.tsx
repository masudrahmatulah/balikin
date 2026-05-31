"use client";

import { useState, useCallback } from "react";
import { ChevronDown } from "lucide-react";

interface FAQItemProps {
  question: string;
  answer: string;
  index: number;
}

export function FAQItem({ question, answer, index }: FAQItemProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggle = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const buttonId = `faq-button-${index}`;
  const contentId = `faq-content-${index}`;

  return (
    <section
      className="mb-4 rounded-2xl border border-gray-200 bg-white shadow-sm transition-shadow duration-200 hover:shadow-md"
      aria-labelledby={buttonId}
    >
      <button
        type="button"
        id={buttonId}
        onClick={toggle}
        aria-expanded={isOpen}
        aria-controls={contentId}
        className="flex w-full items-center justify-between gap-4 rounded-2xl p-6 text-left focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-inset"
      >
        <span className="text-lg font-semibold text-gray-900">{question}</span>
        <ChevronDown
          className={`h-5 w-5 shrink-0 text-gray-500 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>
      <div
        id={contentId}
        role="region"
        aria-labelledby={buttonId}
        className={`overflow-hidden transition-all duration-200 ${isOpen ? "max-h-96 px-6 pb-6" : "max-h-0"}`}
        hidden={!isOpen}
      >
        <p className="text-gray-600">{answer}</p>
      </div>
    </section>
  );
}