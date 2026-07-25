'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function StatCard({ title, value, subtitle, icon: Icon, trend, colorGradient = 'from-blue-500/10 to-indigo-500/5' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'relative overflow-hidden rounded-xl border border-border/60 bg-gradient-to-br p-5 shadow-sm backdrop-blur-md',
        colorGradient
      )}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-muted-foreground">{title}</p>
          <h3 className="mt-2 text-2xl font-extrabold tracking-tight text-foreground">{value}</h3>
          {subtitle && <p className="mt-1 text-[11px] text-muted-foreground">{subtitle}</p>}
        </div>
        {Icon && (
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-card border border-border/80 text-primary shadow-sm">
            <Icon className="h-6 w-6" />
          </div>
        )}
      </div>

      {trend && (
        <div className="mt-3 flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
          <span>{trend}</span>
        </div>
      )}
    </motion.div>
  );
}
