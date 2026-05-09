// @ai-radio/web — Icon-only button with accent hover
// ===================================================================

import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  onClick?: () => void;
  label: string;
  size?: 'sm' | 'md';
  accent?: boolean;
}

export function IconButton({ children, onClick, label, size = 'md', accent }: Props): JSX.Element {
  const sizeClass = size === 'sm' ? 'w-8 h-8' : 'w-10 h-10';
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={`${sizeClass} flex items-center justify-center rounded-full
        ${accent ? 'text-accent hover:bg-accent-dim' : 'text-text-secondary hover:text-text-primary hover:bg-white/5'}
        transition-colors`}
    >
      {children}
    </button>
  );
}
