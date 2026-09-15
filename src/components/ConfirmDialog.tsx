"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

type Props = {
  open: boolean;
  title: string;
  message: string;
  /** Label for the button that carries out the action. */
  confirmLabel?: string;
  cancelLabel?: string;
  /** Styles the confirm button as destructive. */
  destructive?: boolean;
  /** Disables both buttons while the action is running. */
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

/**
 * In-app replacement for window.confirm().
 *
 * The native dialog is styled by the browser, announces itself as
 * "studio.akuannmade.com says", and cannot show progress once the action
 * starts. This one matches the rest of the studio and stays on screen while the
 * work runs.
 */
export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  destructive = false,
  busy = false,
  onConfirm,
  onCancel,
}: Props) {
  const confirmRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Escape closes, and Tab is kept inside the dialog while it is open.
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !busy) {
        onCancel();
        return;
      }
      if (event.key !== "Tab") return;

      const focusable = panelRef.current?.querySelectorAll<HTMLElement>(
        "button:not([disabled])",
      );
      if (!focusable?.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    confirmRef.current?.focus();

    // Stop the page behind the dialog from scrolling.
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, busy, onCancel]);

  // Rendered through a portal so a parent's stacking or overflow context cannot
  // clip or hide it.
  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="no-print fixed inset-0 z-50 flex items-center justify-center p-4"
      onMouseDown={(event) => {
        // Only a click on the backdrop itself dismisses.
        if (event.target === event.currentTarget && !busy) onCancel();
      }}
    >
      <div className="absolute inset-0 bg-neutral-900/40 backdrop-blur-[2px]" aria-hidden="true" />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-message"
        className="relative w-full max-w-md rounded-[28px] border border-neutral-200 bg-white p-8 shadow-2xl"
      >
        <h2
          id="confirm-dialog-title"
          className="text-xl font-bold tracking-tight text-neutral-900"
        >
          {title}
        </h2>
        <p id="confirm-dialog-message" className="mt-3 text-sm leading-relaxed text-neutral-500">
          {message}
        </p>

        <div className="mt-8 flex flex-wrap justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="rounded-full border border-neutral-200 bg-white px-5 py-2 text-xs font-bold text-neutral-600 shadow-sm transition hover:bg-neutral-50 active:scale-95 disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            ref={confirmRef}
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className={
              destructive
                ? "rounded-full bg-red-600 px-5 py-2 text-xs font-bold text-white shadow-md transition hover:bg-red-700 active:scale-95 disabled:opacity-50"
                : "rounded-full bg-neutral-900 px-5 py-2 text-xs font-bold text-white shadow-md transition hover:bg-neutral-800 active:scale-95 disabled:opacity-50"
            }
          >
            {busy ? "Working…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
