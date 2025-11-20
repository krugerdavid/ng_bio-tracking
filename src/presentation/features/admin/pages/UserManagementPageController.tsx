import { useState, useEffect, type FormEvent } from 'react';
import { container } from '@core/container/bindings';
import { TYPES } from '@core/container/DIContainer';
import type { ListUsersUseCase } from '@application/admin/use-cases/ListUsersUseCase';
import type { CreateUserUseCase } from '@application/admin/use-cases/CreateUserUseCase';
import type { DeleteUserUseCase } from '@application/admin/use-cases/DeleteUserUseCase';
import type { UserProfile } from '@domain/user/entities/UserProfile';
import { Role } from '@domain/shared/value-objects/Role';
import { UserManagementPage } from './UserManagementPage';

export default function UserManagementPageController() {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        role: Role.USER as Role
    });

    const listUsersUseCase = container.get<ListUsersUseCase>(TYPES.ListUsersUseCase);
    const createUserUseCase = container.get<CreateUserUseCase>(TYPES.CreateUserUseCase);
    const deleteUserUseCase = container.get<DeleteUserUseCase>(TYPES.DeleteUserUseCase);

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            setLoading(true);
            const userList = await listUsersUseCase.execute();
            setUsers(userList);
        } catch (err: any) {
            setError(err.message || 'Error al cargar usuarios');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            await createUserUseCase.execute(formData);
            setSuccess('Usuario creado exitosamente');
            setFormData({ email: '', password: '', role: Role.USER });
            setShowForm(false);
            await loadUsers();
        } catch (err: any) {
            setError(err.message || 'Error al crear usuario');
        }
    };

    const handleDelete = async (userId: string, email: string) => {
        if (!confirm(`¿Estás seguro de eliminar al usuario ${email}?`)) return;

        try {
            await deleteUserUseCase.execute(userId);
            setSuccess('Usuario eliminado');
            await loadUsers();
        } catch (err: any) {
            setError(err.message || 'Error al eliminar usuario');
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

