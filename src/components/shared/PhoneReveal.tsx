import React, { useState } from 'react';
import { Phone, Copy, Check, X } from 'lucide-react';

interface PhoneRevealProps {
  /** Number to display. When empty, the popup shows a "no number" notice. */
  phone?: string;
  /** Optional contact name shown above the number. */
  name?: string;
  /** Classes for the trigger button so each call site keeps its own look. */
  className?: string;
  /** Trigger content (icon and/or label). */
  children: React.ReactNode;
  /** Tooltip / accessible label for the trigger. */
  title?: string;
}

// Click reveals the phone number in a small popup (read + copy) instead of
// launching the device dialer — most agency work happens on desktop where a
// `tel:` link does nothing useful.
export const PhoneReveal: React.FC<PhoneRevealProps> = ({ phone, name, className, children, title }) => {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const hasPhone = !!phone && phone.trim().length > 0;

  const handleOpen = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation(); // don't trigger an enclosing clickable card
    setCopied(false);
    setOpen(true);
  };

  const handleClose = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setOpen(false);
  };

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!hasPhone) return;
    try {
      await navigator.clipboard.writeText(phone!.trim());
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable — number is still shown on screen */
    }
  };

  return (
    <>
      <button type="button" onClick={handleOpen} className={className} title={title ?? 'Afficher le numéro'}>
        {children}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4"
          onClick={handleClose}
        >
          <div
            className="relative w-full max-w-xs bg-white rounded-2xl shadow-xl p-5 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={handleClose}
              className="absolute top-3 right-3 text-gray-300 hover:text-gray-500"
            >
              <X size={16} />
            </button>

            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-primary-light flex items-center justify-center">
              <Phone size={20} className="text-primary" />
            </div>

            {name && <div className="text-sm font-semibold text-gray-900 mb-0.5">{name}</div>}
            <div className="text-xs text-gray-400 mb-2">Numéro de téléphone</div>

            {hasPhone ? (
              <div className="text-xl font-bold text-gray-900 font-mono tracking-wide mb-4 select-all">{phone}</div>
            ) : (
              <div className="text-sm text-gray-400 mb-4">Aucun numéro renseigné</div>
            )}

            {hasPhone && (
              <button
                type="button"
                onClick={handleCopy}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
              >
                {copied ? <><Check size={15} /> Copié !</> : <><Copy size={15} /> Copier le numéro</>}
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
};
