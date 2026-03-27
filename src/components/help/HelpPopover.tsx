'use client';

import { useState, useRef, useEffect } from 'react';

interface HelpPopoverProps {
  id: string;
  title: string;
  content: string;
  dismissed: boolean;
  onDismiss: (id: string) => void;
}

export function HelpPopover({ id, title, content, dismissed, onDismiss }: HelpPopoverProps) {
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

  if (dismissed) return null;

  return (
    <div className="relative inline-flex" ref={ref}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="focus-ring flex h-5 w-5 items-center justify-center rounded-full bg-white/10 text-gray-400 text-[10px] font-bold hover:bg-white/20 hover:text-white transition-colors"
        aria-label={`Help: ${title}`}
      >
        ?
      </button>
      {isOpen && (
        <div className="absolute z-50 top-7 left-0 w-64 rounded-xl border border-white/10 bg-gray-800 p-3 shadow-2xl shadow-black/40">
          <h4 className="text-sm font-semibold text-white mb-1">{title}</h4>
          <p className="text-xs text-gray-300 leading-relaxed">{content}</p>
          <button
            onClick={() => { onDismiss(id); setIsOpen(false); }}
            className="mt-2 text-[10px] text-gray-500 hover:text-gray-300 transition-colors"
          >
            Got it, don't show again
          </button>
        </div>
      )}
    </div>
  );
}
