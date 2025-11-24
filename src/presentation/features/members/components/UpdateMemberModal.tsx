import { useState } from "react";
import { container } from "@core/container/bindings";
import { TYPES } from "@core/container/DIContainer";
import type { UpdateMemberUseCase } from "@application/member/use-cases/UpdateMemberUseCase";
import type { CreateMemberDTO, Member } from "@domain/member/entities/Member";
import { Modal } from "@presentation/shared/components/Modal";
import { MemberForm, type MemberFormData } from "./MemberForm";

interface UpdateMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  member: Member;
}

export function UpdateMemberModal({ isOpen, onClose, onSuccess, member }: UpdateMemberModalProps) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const updateMemberUseCase = container.get<UpdateMemberUseCase>(TYPES.UpdateMemberUseCase);

  const initialData: Partial<MemberFormData> = {
    name: member.name,
    documentNumber: member.documentNumber,
    email: member.email || "",
    dateOfBirth: member.dateOfBirth ? member.dateOfBirth.toISOString().split("T")[0] : "",
    gender: (member.gender as "male" | "female" | "other") || "",
  };

  const handleSubmit = async (memberData: CreateMemberDTO) => {
    setError("");
    setLoading(true);

    try {
      const result = await updateMemberUseCase.execute(member.id, memberData);

      if (result.isError()) {
        setError(result.getError());
        setLoading(false);
      } else {
        onSuccess();
        onClose();
        setLoading(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error actualizando deportista");
      setLoading(false);
    }
  };

  const handleClose = () => {
    setError("");
    setLoading(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Editar Deportista">
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}
      <MemberForm
        key={member.id}
        initialData={initialData}
        onSubmit={handleSubmit}
        onCancel={handleClose}
        loading={loading}
        submitLabel="Guardar Cambios"
        loadingLabel="Guardando..."
      />
    </Modal>
  );
}
