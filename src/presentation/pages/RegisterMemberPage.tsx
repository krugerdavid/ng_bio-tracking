import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerMemberUseCase } from '../../application/di/container';
import type { CreateMemberDTO } from '../../domain/entities/Member';

export default function RegisterMemberPage() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        dateOfBirth: '',
        gender: 'male' as 'male' | 'female' | 'other',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const memberData: CreateMemberDTO = {
                ...formData,
                dateOfBirth: new Date(formData.dateOfBirth),
            };

            await registerMemberUseCase.execute(memberData);
            navigate('/');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error registrando miembro');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
                <h2 className="text-3xl font-bold mb-6 text-gray-900">
                    Registrar Nuevo Miembro
                </h2>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-700 text-sm">{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                            Nombre Completo
                        </label>
                        <input
                            type="text"
                            id="name"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
                            placeholder="Ej. Juan Pérez"
                        />
                    </div>

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
                            placeholder="ejemplo@email.com"
                        />
                    </div>

                    <div>
                        <label htmlFor="dateOfBirth" className="block text-sm font-semibold text-gray-700 mb-2">
                            Fecha de Nacimiento
                        </label>
                        <input
                            type="date"
                            id="dateOfBirth"
                            required
                            value={formData.dateOfBirth}
                            onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
                        />
                    </div>

                    <div>
                        <label htmlFor="gender" className="block text-sm font-semibold text-gray-700 mb-2">
                            Género
                        </label>
                        <select
                            id="gender"
                            required
                            value={formData.gender}
                            onChange={(e) => setFormData({ ...formData, gender: e.target.value as 'male' | 'female' | 'other' })}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
                        >
                            <option value="male">Masculino</option>
                            <option value="female">Femenino</option>
                            <option value="other">Otro</option>
                        </select>
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-6 py-3 bg-orange-500 text-white font-semibold rounded-lg shadow-lg hover:bg-orange-600 transform hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Registrando...' : 'Registrar Miembro'}
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate('/')}
                            className="px-6 py-3 border-2 border-black bg-white text-black font-semibold rounded-lg hover:bg-gray-50 transition-all duration-300"
                        >
                            Cancelar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
