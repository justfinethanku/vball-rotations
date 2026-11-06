'use client';

import { useEffect, useRef, type ReactNode } from 'react';

// Native modality provides initial focus, an inert background, keyboard focus
// containment, and focus restoration. Keep open/close in sync with React state.
export function Modal({ isOpen, onClose, label, children }: {
  isOpen: boolean;
  onClose: () => void;
  label: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (!isOpen) return;
    const dialog = ref.current;
    if (!dialog) return;
    dialog.showModal();
    return () => dialog.close();
  }, [isOpen]);

  return (
    <dialog ref={ref} className="modal-shell" aria-label={label}
      onCancel={(event) => { event.preventDefault(); onClose(); }}
      onKeyDown={(event) => {
        event.stopPropagation();
        // Keep Tab at the dialog boundaries rather than sending it to browser
        // chrome; native modality still makes the rest of the document inert.
        if (event.key !== 'Tab') return;
        const controls = Array.from(event.currentTarget.querySelectorAll<HTMLElement>(
          'button, a[href], input, select, textarea, [tabindex]'
        )).filter(el => el.tabIndex >= 0 && !el.matches(':disabled') && el.getClientRects().length > 0);
        const first = controls[0];
        const last = controls[controls.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }}>
      {children}
    </dialog>
  );
}
