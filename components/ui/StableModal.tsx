// components/ui/StableModal.tsx
'use client';
import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

type Props = {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  zIndex?: number;
};

export default function StableModal({ open, onClose, children, zIndex = 50 }: Props) {
  const portalRef = useRef<HTMLElement | null>(null);
  const ignoreRef = useRef(false); // guard for double-invoke

  useEffect(() => {
    if (!portalRef.current) {
      portalRef.current = document.body;
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!open || !portalRef.current) return null;

  const stop = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  // prevent immediate close if parent re-renders & rebinds handlers
  const safeOnClose = () => {
    if (ignoreRef.current) return;
    ignoreRef.current = true;
    requestAnimationFrame(() => (ignoreRef.current = false));
    onClose?.();
  };

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 flex items-center justify-center"
      style={{ zIndex }}
      onMouseDown={safeOnClose} // backdrop click closes
    >
      <div className="absolute inset-0 bg-black/50" />
      <div
        className="relative bg-white rounded-2xl shadow-2xl p-4 max-w-[90vw] max-h-[90vh] w-[720px] overflow-hidden"
        onMouseDown={stop} // inside clicks do NOT bubble to backdrop
      >
        {children}
      </div>
    </div>,
    portalRef.current
  );
}
