import { useState, useEffect, type FormEvent } from "react";
import { container } from "@core/container/bindings";
import { TYPES } from "@core/container/DIContainer";
import type { ListUsersUseCase } from "@application/admin/use-cases/ListUsersUseCase";
import type { CreateUserUseCase } from "@application/admin/use-cases/CreateUserUseCase";
import type { UpdateUserUseCase } from "@application/admin/use-cases/UpdateUserUseCase";
import type { DeleteUserUseCase } from "@application/admin/use-cases/DeleteUserUseCase";
import type { UserProfile } from "@domain/user/entities/UserProfile";
import { Role, isRoot } from "@domain/shared/value-objects/Role";
import { useAuth } from "@presentation/shared/hooks/useAuth";
import { UserManagementPage } from "./UserManagementPage";

export default function UserManagementPageController() {
  const { authState } = useAuth();
  const currentUser = authState.user;
  const canCreateAdmin = Boolean(currentUser && isRoot(currentUser.role));

  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: Role.USER as Role,
  });
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [editFormData, setEditFormData] = useState({
    name: "",
    email: "",
    role: Role.USER as Role,
    password: "",
  });
  const [isSubmittingCreate, setIsSubmittingCreate] = useState(false);
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);

  const listUsersUseCase = container.get<ListUsersUseCase>(TYPES.ListUsersUseCase);
  const createUserUseCase = container.get<CreateUserUseCase>(TYPES.CreateUserUseCase);
  const updateUserUseCase = container.get<UpdateUserUseCase>(TYPES.UpdateUserUseCase);
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
    setIsSubmittingCreate(true);

    const payload = canCreateAdmin ? formData : { ...formData, role: Role.USER as Role };

    try {
      const result = await createUserUseCase.execute(payload);

      if (result.isError()) {
        setError(result.getError());
      } else {
        setSuccess("Usuario creado exitosamente");
        setFormData({ name: "", email: "", password: "", role: Role.USER });
        setShowForm(false);
        await loadUsers();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear usuario");
    } finally {
      setIsSubmittingCreate(false);
    }
  };

  const handleEdit = (user: UserProfile) => {
    setShowForm(false);
    setError("");
    setSuccess("");
    setEditingUser(user);
    setEditFormData({
      name: user.name ?? "",
      email: user.email,
      role: user.role,
      password: "",
    });
  };

  const handleCancelEdit = () => {
    setError("");
    setEditingUser(null);
    setEditFormData({ name: "", email: "", role: Role.USER, password: "" });
  };

  const handleToggleForm = () => {
    setError("");
    setShowForm(prev => !prev);
  };

  const handleSubmitEdit = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setError("");
    setSuccess("");
    setIsSubmittingEdit(true);

    try {
      const updatePayload: { name?: string; role?: Role; password?: string } = {
        name: editFormData.name.trim() || undefined,
        role: editFormData.role,
      };
      if (editFormData.password.trim()) updatePayload.password = editFormData.password;

      const result = await updateUserUseCase.execute(editingUser.userId, updatePayload);

      if (result.isError()) {
        setError(result.getError());
      } else {
        setSuccess("Usuario actualizado");
        setEditingUser(null);
        setEditFormData({ name: "", email: "", role: Role.USER, password: "" });
        await loadUsers();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al actualizar usuario");
    } finally {
      setIsSubmittingEdit(false);
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
      canCreateAdmin={canCreateAdmin}
      editingUser={editingUser}
      editFormData={editFormData}
      onToggleForm={handleToggleForm}
      onSubmit={handleSubmit}
      onDelete={handleDelete}
      onFormDataChange={setFormData}
      onEdit={handleEdit}
      onCancelEdit={handleCancelEdit}
      onEditFormChange={setEditFormData}
      onSubmitEdit={handleSubmitEdit}
      isSubmittingCreate={isSubmittingCreate}
      isSubmittingEdit={isSubmittingEdit}
    />
  );
}
