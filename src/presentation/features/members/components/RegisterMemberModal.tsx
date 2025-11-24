import { useState } from "react";
import { container } from "@core/container/bindings";
import { TYPES } from "@core/container/DIContainer";
import type { RegisterMemberUseCase } from "@application/member/use-cases/RegisterMemberUseCase";
import type { CreateMemberDTO } from "@domain/member/entities/Member";
import { Modal } from "@presentation/shared/components/Modal";
import { MemberForm } from "./MemberForm";

interface RegisterMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function RegisterMemberModal({ isOpen, onClose, onSuccess }: RegisterMemberModalProps) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const registerMemberUseCase = container.get<RegisterMemberUseCase>(TYPES.RegisterMemberUseCase);

  const handleSubmit = async (memberData: CreateMemberDTO) => {
    setError("");
    setLoading(true);

    try {
      const result = await registerMemberUseCase.execute(memberData);

      if (result.isError()) {
        setError(result.getError());
        setLoading(false);
      } else {
        onSuccess();
        handleClose();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error registrando deportista");
      setLoading(false);
    }
  };

  const handleClose = () => {
    setError("");
    setLoading(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Registrar Nuevo Deportista">
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}
      <MemberForm
        onSubmit={handleSubmit}
        onCancel={handleClose}
        loading={loading}
        submitLabel="Registrar Deportista"
        loadingLabel="Guardando..."
      />
    </Modal>
  );
}
