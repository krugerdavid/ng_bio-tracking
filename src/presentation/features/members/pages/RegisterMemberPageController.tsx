import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { container } from "@core/container/bindings";
import { TYPES } from "@core/container/DIContainer";
import type { RegisterMemberUseCase } from "@application/member/use-cases/RegisterMemberUseCase";
import type { CreateMemberDTO } from "@domain/member/entities/Member";
import { RegisterMemberPage } from "./RegisterMemberPage";

export default function RegisterMemberPageController() {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const registerMemberUseCase = container.get<RegisterMemberUseCase>(TYPES.RegisterMemberUseCase);

  const handleSubmit = async (
    e: FormEvent,
    formData: { name: string; email: string; dateOfBirth: string; gender: "male" | "female" | "other" }
  ) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const memberData: CreateMemberDTO = {
        name: formData.name,
        email: formData.email,
        dateOfBirth: new Date(formData.dateOfBirth),
        gender: formData.gender,
      } as CreateMemberDTO;

      const result = await registerMemberUseCase.execute(memberData);

      if (result.isError()) {
        setError(result.getError());
      } else {
        navigate("/");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error registrando miembro");
    } finally {
      setLoading(false);
    }
  };

  return <RegisterMemberPage onSubmit={handleSubmit} error={error} loading={loading} />;
}
