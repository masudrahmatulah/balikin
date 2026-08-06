'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { faqItems } from '@/lib/site-content';

function FAQItem({ question, answer, index }: { question: string; answer: string; index: number }) {
  const [isOpen, setIsOpen] = useState(false);
  const panelId = `faq-answer-${index}`;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      className="border-b dark:border-slate-700"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-4 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-slate-800 px-2 rounded transition-colors"
        aria-expanded={isOpen}
        aria-controls={panelId}
      >
        <span className="font-medium text-gray-900 dark:text-white">{question}</span>
        <ChevronDown
          className={`h-5 w-5 text-gray-500 dark:text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>
      {isOpen && (
        <motion.div
          id={panelId}
          role="region"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="pb-4 px-2 text-gray-600 dark:text-gray-300"
        >
          {answer}
        </motion.div>
      )}
    </motion.div>
  );
}

export function FAQSection() {
  return (
    <section className="container mx-auto px-4 py-16">
      <div className="max-w-3xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl font-bold text-center mb-12 dark:text-white"
        >
          Pertanyaan yang Sering Diajukan
        </motion.h2>
        <Card>
          <CardContent className="p-0">
            {faqItems.map((faq, index) => (
              <FAQItem key={index} question={faq.question} answer={faq.answer} index={index} />
            ))}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}