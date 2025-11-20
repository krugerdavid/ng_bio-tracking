import { useState, useEffect, type FormEvent } from "react";
import { container } from "@core/container/bindings";
import { TYPES } from "@core/container/DIContainer";
import type { ListUsersUseCase } from "@application/admin/use-cases/ListUsersUseCase";
import type { CreateUserUseCase } from "@application/admin/use-cases/CreateUserUseCase";
import type { DeleteUserUseCase } from "@application/admin/use-cases/DeleteUserUseCase";
import type { UserProfile } from "@domain/user/entities/UserProfile";
import { Role } from "@domain/shared/value-objects/Role";
import { UserManagementPage } from "./UserManagementPage";

export default function UserManagementPageController() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: Role.USER as Role,
  });

  const listUsersUseCase = container.get<ListUsersUseCase>(TYPES.ListUsersUseCase);
  const createUserUseCase = container.get<CreateUserUseCase>(TYPES.CreateUserUseCase);
  const deleteUserUseCase = container.get<DeleteUserUseCase>(TYPES.DeleteUserUseCase);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError("");
      const result = await listUsersUseCase.execute();

      if (result.isError()) {
        setError(result.getError());
      } else {
        setUsers(result.getValue());
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar usuarios");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const result = await createUserUseCase.execute(formData);

      if (result.isError()) {
        setError(result.getError());
      } else {
        setSuccess("Usuario creado exitosamente");
        setFormData({ email: "", password: "", role: Role.USER });
        setShowForm(false);
        await loadUsers();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear usuario");
    }
  };

  const handleDelete = async (userId: string, email: string) => {
    if (!confirm(`¿Estás seguro de eliminar al usuario ${email}?`)) return;

    try {
      const result = await deleteUserUseCase.execute(userId);

      if (result.isError()) {
        setError(result.getError());
      } else {
        setSuccess("Usuario eliminado");
        await loadUsers();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar usuario");
    }
  };

  return (
    <UserManagementPage
      users={users}
      loading={loading}
      showForm={showForm}
      error={error}
      success={success}
      formData={formData}
      onToggleForm={() => setShowForm(!showForm)}
      onSubmit={handleSubmit}
      onDelete={handleDelete}
      onFormDataChange={setFormData}
    />
  );
}
