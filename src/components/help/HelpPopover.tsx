'use client';

import { useState, useRef, useEffect, type ReactNode } from 'react';

interface HelpPopoverProps {
  id: string;
  title: string;
  content: string;
  dismissed: boolean;
  onDismiss: (id: string) => void;
  children?: ReactNode;
}

export function HelpPopover({ id, title, content, dismissed, onDismiss, children }: HelpPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isOpen]);

  if (dismissed) {
    return children ? (
      <div className="flex items-center gap-1.5 mb-1.5">{children}</div>
    ) : null;
  }

  return (
    <div ref={ref} onKeyDown={(event) => {
      if (event.key === 'Escape' && isOpen) {
        event.stopPropagation();
        setIsOpen(false);
        ref.current?.querySelector('button')?.focus();
      }
    }}>
      <div className="flex items-center gap-1.5 mb-1.5">
        {children}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="focus-ring flex h-5 w-5 items-center justify-center rounded-full bg-white/10 text-gray-400 text-[10px] font-bold hover:bg-white/20 hover:text-white transition-colors"
          aria-label={`Help: ${title}`}
          aria-expanded={isOpen}
          aria-controls={`${id}-content`}
        >
          ?
        </button>
      </div>
      {isOpen && (
        <div id={`${id}-content`} className="rounded-xl border border-white/10 bg-gray-800 p-3 shadow-lg mb-2">
          <h4 className="text-sm font-semibold text-white mb-1">{title}</h4>
          <p className="text-xs text-gray-300 leading-relaxed">{content}</p>
          <button
            onClick={() => { onDismiss(id); setIsOpen(false); }}
            className="mt-2 text-[10px] text-gray-400 hover:text-gray-300 transition-colors"
          >
            Got it, don&apos;t show again
          </button>
        </div>
      )}
    </div>
  );
}
