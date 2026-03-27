'use client';

import { useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

interface ShareButtonProps {
  onShare: () => Promise<string>;
}

export function ShareButton({ onShare }: ShareButtonProps) {
  const [showToast, setShowToast] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleShare = useCallback(async () => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      const url = await onShare();
      await navigator.clipboard.writeText(url);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
    } catch {
      // Clipboard write may fail in some contexts
      console.warn('Failed to copy link to clipboard');
    } finally {
      setIsLoading(false);
    }
  }, [onShare, isLoading]);

  return (
    <>
      <button
        onClick={handleShare}
        disabled={isLoading}
        className="flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-sm text-white transition-colors hover:bg-white/20 disabled:opacity-50"
        aria-label="Share"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
          <polyline points="16 6 12 2 8 6" />
          <line x1="12" y1="2" x2="12" y2="15" />
        </svg>
        Share
      </button>

      {/* Toast notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            className="fixed left-1/2 top-6 z-[100] -translate-x-1/2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-lg"
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          >
            Link copied!
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
