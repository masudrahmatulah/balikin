'use client';

import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface BadgeProps {
  icon: LucideIcon;
  text: string;
  colorClass: string;
  delay?: number;
}

export function Badge({ icon: Icon, text, colorClass, delay = 0 }: BadgeProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay }}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${colorClass} font-medium`}
    >
      <Icon className="h-5 w-5" />
      {text}
    </motion.div>
  );
}