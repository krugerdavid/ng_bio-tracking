import { type FormEvent, type ReactNode } from "react";
import { Modal } from "./Modal";

const FOOTER_BUTTON_PRIMARY =
  "flex-1 px-6 py-3 bg-orange-500 text-white font-semibold rounded-lg shadow-lg hover:bg-orange-600 transform hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-70 disabled:pointer-events-none disabled:transform-none";
const FOOTER_BUTTON_SECONDARY =
  "px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 disabled:opacity-70";
const ERROR_BANNER = "mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm";

export interface FormModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  size?: "sm" | "md" | "lg" | "xl";
  /** Form submit handler. Submit button is inside the form so no form id needed. */
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  submitLabel: string;
  cancelLabel?: string;
  loading?: boolean;
  error?: string;
  formClassName?: string;
  children: ReactNode;
}

/**
 * Modal that renders a single form with submit/cancel in a footer.
 * Buttons are inside the form so submit works reliably in all browsers (no form attribute).
 * Use for create/edit flows; keeps presentation DRY and DDD-friendly (no domain in component).
 */
export function FormModal({
  isOpen,
  onClose,
  title,
  size = "md",
  onSubmit,
  submitLabel,
  cancelLabel = "Cancelar",
  loading = false,
  error,
  formClassName,
  children,
}: FormModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size={size}>
      <form onSubmit={onSubmit} className="flex flex-col">
        {error && <div className={ERROR_BANNER}>{error}</div>}
        <div className={formClassName ?? "space-y-4"}>{children}</div>
        <div className="flex items-center gap-3 border-t border-gray-200 pt-4 mt-4 shrink-0">
          <button type="submit" disabled={loading} className={FOOTER_BUTTON_PRIMARY}>
            {submitLabel}
          </button>
          <button type="button" disabled={loading} onClick={onClose} className={FOOTER_BUTTON_SECONDARY}>
            {cancelLabel}
          </button>
        </div>
      </form>
    </Modal>
  );
}
