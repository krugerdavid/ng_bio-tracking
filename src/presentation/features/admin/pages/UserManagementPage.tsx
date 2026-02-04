import { type FormEvent } from "react";
import type { UserProfile } from "@domain/user/entities/UserProfile";
import { Role, isAdmin, isRoot } from "@domain/shared/value-objects/Role";
import { PageLoader } from "@/presentation/shared/components/PageLoader";
import { PasswordInput } from "@/presentation/shared/components/PasswordInput";
import { FormModal } from "@/presentation/shared/components/FormModal";

interface UserManagementPageProps {
  users: UserProfile[];
  loading: boolean;
  showForm: boolean;
  error: string;
  success: string;
  formData: {
    name: string;
    email: string;
    password: string;
    role: Role;
  };
  /** Solo root puede crear usuarios admin y editar; admin solo puede crear miembros */
  canCreateAdmin: boolean;
  /** Usuario en edición (solo root); null = no editando */
  editingUser: UserProfile | null;
  editFormData: { name: string; email: string; role: Role; password: string };
  onToggleForm: () => void;
  onSubmit: (e: FormEvent) => Promise<void>;
  onDelete: (userId: string, email: string) => Promise<void>;
  onFormDataChange: (data: { name: string; email: string; password: string; role: Role }) => void;
  onEdit: (user: UserProfile) => void;
  onCancelEdit: () => void;
  onEditFormChange: (data: { name: string; email: string; role: Role; password: string }) => void;
  onSubmitEdit: (e: FormEvent) => Promise<void>;
  isSubmittingCreate?: boolean;
  isSubmittingEdit?: boolean;
}

export function UserManagementPage({
  users,
  loading,
  showForm,
  error,
  success,
  formData,
  canCreateAdmin,
  editingUser,
  editFormData,
  onToggleForm,
  onSubmit,
  onDelete,
  onFormDataChange,
  onEdit,
  onCancelEdit,
  onEditFormChange,
  onSubmitEdit,
  isSubmittingCreate = false,
  isSubmittingEdit = false,
}: UserManagementPageProps) {
  if (loading) {
    return <PageLoader />;
  }

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-900">Gestión de Usuarios</h2>
        <button
          type="button"
          onClick={onToggleForm}
          className="px-6 py-3 bg-orange-500 text-white font-semibold rounded-lg shadow-lg hover:bg-orange-600 transform hover:-translate-y-0.5 transition-all duration-300"
        >
          + Crear Usuario
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-700 text-sm">{success}</p>
        </div>
      )}

      <FormModal
        isOpen={showForm}
        onClose={onToggleForm}
        title={canCreateAdmin ? "Crear Nuevo Usuario (Admin o Miembro)" : "Crear Nuevo Miembro"}
        size="md"
        onSubmit={onSubmit}
        submitLabel="Crear Usuario"
        cancelLabel="Cancelar"
        loading={isSubmittingCreate}
        error={error}
        formClassName="space-y-4"
      >
        <div>
          <label htmlFor="create-name" className="block text-sm font-semibold text-gray-700 mb-2">
            Nombre completo
          </label>
          <input
            type="text"
            id="create-name"
            value={formData.name}
            onChange={e => onFormDataChange({ ...formData, name: e.target.value })}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
            placeholder="Ej. Juan Pérez"
          />
        </div>
        <div>
          <label htmlFor="create-email" className="block text-sm font-semibold text-gray-700 mb-2">
            Email
          </label>
          <input
            type="email"
            id="create-email"
            required
            value={formData.email}
            onChange={e => onFormDataChange({ ...formData, email: e.target.value })}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
            placeholder="usuario@example.com"
          />
        </div>
        <PasswordInput
          id="create-password"
          label="Contraseña"
          value={formData.password}
          onChange={password => onFormDataChange({ ...formData, password })}
          placeholder="Mínimo 6 caracteres"
          required
          minLength={6}
        />
        {canCreateAdmin ? (
          <div>
            <label htmlFor="create-role" className="block text-sm font-semibold text-gray-700 mb-2">
              Rol
            </label>
            <select
              id="create-role"
              value={formData.role}
              onChange={e => onFormDataChange({ ...formData, role: e.target.value as Role })}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
            >
              <option value={Role.USER}>Miembro</option>
              <option value={Role.ADMIN}>Administrador</option>
            </select>
          </div>
        ) : (
          <p className="text-sm text-gray-600">
            Se creará un usuario con rol <strong>Miembro</strong>.
          </p>
        )}
      </FormModal>

      {canCreateAdmin && (
        <FormModal
          isOpen={!!editingUser}
          onClose={onCancelEdit}
          title="Editar usuario"
          size="md"
          onSubmit={onSubmitEdit}
          submitLabel="Guardar cambios"
          cancelLabel="Cancelar"
          loading={isSubmittingEdit}
          error={error}
          formClassName="space-y-4"
        >
          <div>
            <label htmlFor="edit-name" className="block text-sm font-semibold text-gray-700 mb-2">
              Nombre completo
            </label>
            <input
              type="text"
              id="edit-name"
              value={editFormData.name}
              onChange={e => onEditFormChange({ ...editFormData, name: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
              placeholder="Ej. Juan Pérez"
            />
          </div>
          <div>
            <label htmlFor="edit-email" className="block text-sm font-semibold text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              id="edit-email"
              required
              value={editFormData.email}
              readOnly
              className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 text-gray-600"
              title="El email no se puede modificar"
            />
          </div>
          <div>
            <label htmlFor="edit-role" className="block text-sm font-semibold text-gray-700 mb-2">
              Rol
            </label>
            <select
              id="edit-role"
              value={editFormData.role}
              onChange={e => onEditFormChange({ ...editFormData, role: e.target.value as Role })}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
            >
              <option value={Role.USER}>Miembro</option>
              <option value={Role.ADMIN}>Administrador</option>
            </select>
          </div>
          <PasswordInput
            id="edit-password"
            label="Nueva contraseña (opcional)"
            value={editFormData.password}
            onChange={password => onEditFormChange({ ...editFormData, password })}
            placeholder="Dejar vacío para no cambiar"
          />
        </FormModal>
      )}

      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Nombre</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Email</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Rol</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Creado</th>
              <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {users.map(user => (
              <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-sm text-gray-900">{user.name || "—"}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{user.email}</td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                      isRoot(user.role)
                        ? "bg-purple-100 text-purple-800"
                        : isAdmin(user.role)
                          ? "bg-orange-100 text-orange-800"
                          : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {isRoot(user.role) ? "Root" : isAdmin(user.role) ? "Admin" : "Miembro"}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {new Date(user.createdAt).toLocaleDateString("es-ES")}
                </td>
                <td className="px-6 py-4 text-right">
                  {canCreateAdmin && (
                    <button
                      type="button"
                      onClick={() => onEdit(user)}
                      className="px-4 py-2 text-sm text-orange-600 hover:text-orange-800 font-semibold mr-2"
                    >
                      Editar
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => onDelete(user.userId, user.email)}
                    className="px-4 py-2 text-sm text-red-600 hover:text-red-800 font-semibold"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {users.length === 0 && (
          <div className="p-12 text-center">
            <p className="text-gray-500">No hay usuarios registrados aún</p>
          </div>
        )}
      </div>
    </div>
  );
}
