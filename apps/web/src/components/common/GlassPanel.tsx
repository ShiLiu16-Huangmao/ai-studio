// @ai-radio/web — Frosted glass container panel
// ===================================================================

import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  className?: string;
  elevated?: boolean;
}

export function GlassPanel({ children, className = '', elevated }: Props): JSX.Element {
  return (
    <div
      className={`rounded-2xl ${elevated ? 'glass-elevated' : 'glass'} ${className}`}
    >
      {children}
    </div>
  );
}
