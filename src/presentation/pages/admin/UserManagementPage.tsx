import { useState, useEffect, type FormEvent } from 'react';
import { Role, isAdmin } from '@domain/value-objects/Role';
import {
    createUserUseCase,
    listUsersUseCase,
    deleteUserUseCase
} from '@application/di/container';
import type { UserProfile } from '@domain/entities/UserProfile';

export default function UserManagementPage() {
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

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div>
            <div className="mb-6 flex justify-between items-center">
                <h2 className="text-3xl font-bold text-gray-900">Gestión de Usuarios</h2>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="px-6 py-3 bg-orange-500 text-white font-semibold rounded-lg shadow-lg hover:bg-orange-600 transform hover:-translate-y-0.5 transition-all duration-300"
                >
                    {showForm ? 'Cancelar' : '+ Crear Usuario'}
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

            {showForm && (
                <div className="mb-8 bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
                    <h3 className="text-xl font-bold text-gray-800 mb-6">Crear Nuevo Usuario</h3>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                                Email
                            </label>
                            <input
                                type="email"
                                id="email"
                                required
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
                                placeholder="usuario@example.com"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                                Contraseña
                            </label>
                            <input
                                type="password"
                                id="password"
                                required
                                minLength={6}
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
                                placeholder="Mínimo 6 caracteres"
                            />
                        </div>

                        <div>
                            <label htmlFor="role" className="block text-sm font-semibold text-gray-700 mb-2">
                                Rol
                            </label>
                            <select
                                id="role"
                                value={formData.role}
                                onChange={(e) => setFormData({ ...formData, role: e.target.value as Role })}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
                            >
                                <option value={Role.USER}>Usuario</option>
                                <option value={Role.ADMIN}>Administrador</option>
                            </select>
                        </div>

                        <button
                            type="submit"
                            className="w-full px-6 py-3 bg-orange-500 text-white font-semibold rounded-lg shadow-lg hover:bg-orange-600 transform hover:-translate-y-0.5 transition-all duration-300"
                        >
                            Crear Usuario
                        </button>
                    </form>
                </div>
            )}

            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Email</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Rol</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Creado</th>
                            <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {users.map((user) => (
                            <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 text-sm text-gray-900">{user.email}</td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${isAdmin(user.role)
                                            ? 'bg-orange-100 text-orange-800'
                                            : 'bg-gray-100 text-gray-800'
                                        }`}>
                                        {isAdmin(user.role) ? 'Admin' : 'Usuario'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600">
                                    {new Date(user.createdAt).toLocaleDateString('es-ES')}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button
                                        onClick={() => handleDelete(user.userId, user.email)}
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
