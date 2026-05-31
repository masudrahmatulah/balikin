'use client';

import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface FloatingIconProps {
  icon: LucideIcon;
  className?: string;
  duration?: number;
  delay?: number;
}

export function FloatingIcon({ icon: Icon, className = '', duration = 6, delay = 0 }: FloatingIconProps) {
  return (
    <motion.div
      animate={{ y: [0, -30, 0], rotate: [0, 10, 0] }}
      transition={{ duration, repeat: Infinity, ease: 'easeInOut', delay }}
      className={className}
      aria-hidden="true"
    >
      <Icon />
    </motion.div>
  );
}