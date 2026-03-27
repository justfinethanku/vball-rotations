'use client';

import { useState, useCallback, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';

interface ShareButtonProps {
  onShare: () => Promise<string>;
  teamName: string;
  system: string;
}

export function ShareButton({ onShare, teamName, system }: ShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (error) {
      const t = setTimeout(() => setError(''), 3000);
      return () => clearTimeout(t);
    }
  }, [error]);

  const handleOpen = useCallback(async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      const url = await onShare();
      setShareUrl(url);
      setIsOpen(true);
    } catch {
      setError('Failed to generate share link');
      console.warn('Failed to generate share URL');
    } finally {
      setIsLoading(false);
    }
  }, [onShare, isLoading]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      console.warn('Failed to copy link to clipboard');
    }
  }, [shareUrl]);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    setCopied(false);
  }, []);

  const truncatedUrl =
    shareUrl.length > 60 ? shareUrl.slice(0, 60) + '...' : shareUrl;

  return (
    <>
      <div className="relative">
        <button
          onClick={handleOpen}
          disabled={isLoading}
          className="focus-ring p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 btn-press transition-all disabled:opacity-50"
          aria-label="Share"
        >
          {isLoading ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="animate-spin">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" opacity="0.25" />
              <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          ) : (
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
          )}
        </button>
        {error && (
          <span className="absolute top-full left-1/2 -translate-x-1/2 mt-1 whitespace-nowrap rounded bg-red-600/90 px-2 py-1 text-xs text-white shadow-lg">
            {error}
          </span>
        )}
      </div>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleClose}
            />

            {/* Modal */}
            <motion.div
              className="fixed inset-0 z-[101] flex items-center justify-center p-4"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            >
              <div
                className="w-full max-w-sm rounded-2xl border border-white/10 bg-gray-900 p-6 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Title */}
                <h2 className="text-center text-lg font-semibold text-white">
                  Share with your team
                </h2>

                {/* Subtitle */}
                <p className="mt-1 text-center text-sm text-gray-400">
                  {teamName} &middot; {system.toUpperCase()} System
                </p>

                {/* QR Code */}
                <div className="mt-5 flex justify-center">
                  <div className="rounded-xl bg-white p-4">
                    <QRCodeSVG
                      value={shareUrl}
                      size={200}
                    />
                  </div>
                </div>

                {/* URL */}
                <p className="mt-4 text-center font-mono text-xs text-gray-500 break-all">
                  {truncatedUrl}
                </p>

                {/* Actions */}
                <div className="mt-5 flex gap-3">
                  <button
                    onClick={handleCopy}
                    className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-indigo-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-600"
                  >
                    {copied ? (
                      <>
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
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        Copied!
                      </>
                    ) : (
                      <>
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
                          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                        </svg>
                        Copy Link
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleClose}
                    className="rounded-lg bg-white/10 px-4 py-2.5 text-sm font-medium text-gray-300 transition-colors hover:bg-white/20"
                  >
                    Done
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
