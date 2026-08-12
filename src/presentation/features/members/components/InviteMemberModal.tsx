import { useState, type FormEvent } from "react";
import { FormModal } from "@presentation/shared/components/FormModal";

interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  memberName: string;
  /** Prefilled when member already has email */
  defaultEmail?: string;
  onInvite: (email?: string) => Promise<void>;
}

export function InviteMemberModal({ isOpen, onClose, memberName, defaultEmail, onInvite }: InviteMemberModalProps) {
  const needsEmail = !defaultEmail?.trim();
  const [email, setEmail] = useState(defaultEmail ?? "");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const payload = needsEmail ? email.trim() : undefined;
      if (needsEmail && !payload) {
        setError("El email es obligatorio para enviar la invitación.");
        setLoading(false);
        return;
      }
      await onInvite(payload);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo enviar la invitación.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title={defaultEmail ? "Reenviar acceso a la app" : "Dar acceso a la app"}
      onSubmit={handleSubmit}
      submitLabel={loading ? "Enviando…" : "Enviar invitación"}
      loading={loading}
      error={error}
      size="sm"
    >
      <p className="text-sm text-gray-600 mb-4">
        Se enviará un correo a <strong>{memberName}</strong> con un enlace para crear su contraseña (válido 72 horas).
      </p>

      {needsEmail ? (
        <div>
          <label htmlFor="invite-email" className="block text-sm font-semibold text-gray-700 mb-2">
            Email
          </label>
          <input
            id="invite-email"
            type="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            placeholder="correo@ejemplo.com"
            disabled={loading}
          />
        </div>
      ) : (
        <p className="text-sm text-gray-800 bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
          Destino: <strong>{defaultEmail}</strong>
        </p>
      )}
    </FormModal>
  );
}
