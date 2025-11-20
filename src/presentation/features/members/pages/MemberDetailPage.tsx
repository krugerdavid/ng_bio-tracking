import { useState, type FormEvent } from 'react';
import type { MemberDetails } from '@application/member/use-cases/GetMemberDetailsUseCase';
import type { CreateBioimpedanceDTO } from '@domain/bioimpedance/entities/Bioimpedance';

interface MemberDetailPageProps {
    details: MemberDetails | null;
    loading: boolean;
    onSubmit: (bioData: CreateBioimpedanceDTO) => Promise<void>;
}

export function MemberDetailPage({ details, loading, onSubmit }: MemberDetailPageProps) {
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        weight: '',
        bodyFatPercentage: '',
        muscleMassPercentage: '',
        waterPercentage: '',
        bmi: '',
        visceralFat: '',
        boneMass: '',
        basalMetabolicRate: '',
        notes: '',
    });

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!details) return;

        try {
            const bioData: CreateBioimpedanceDTO = {
                memberId: details.member.id,
                date: new Date(formData.date),
                weight: parseFloat(formData.weight),
                bodyFatPercentage: parseFloat(formData.bodyFatPercentage),
                muscleMassPercentage: parseFloat(formData.muscleMassPercentage),
                waterPercentage: parseFloat(formData.waterPercentage),
                bmi: parseFloat(formData.bmi),
                visceralFat: parseFloat(formData.visceralFat),
                boneMass: parseFloat(formData.boneMass),
                basalMetabolicRate: parseFloat(formData.basalMetabolicRate),
                notes: formData.notes || undefined,
            };

            await onSubmit(bioData);
            setShowForm(false);
            setFormData({
                date: new Date().toISOString().split('T')[0],
                weight: '',
                bodyFatPercentage: '',
                muscleMassPercentage: '',
                waterPercentage: '',
                bmi: '',
                visceralFat: '',
                boneMass: '',
                basalMetabolicRate: '',
                notes: '',
            });
        } catch (error) {
            console.error('Error recording bioimpedance:', error);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent"></div>
            </div>
        );
    }

    if (!details) {
        return <div>Miembro no encontrado</div>;
    }

    const getAge = (dateOfBirth: Date) => {
        const today = new Date();
        const birthDate = new Date(dateOfBirth);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    return (
        <div>
            {/* Member Header */}
            <div className="mb-8 bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
                <div className="flex items-center space-x-6">
                    <div className="w-24 h-24 bg-orange-500 rounded-full flex items-center justify-center text-white text-4xl font-bold">
                        {details.member.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            {details.member.name}
                        </h1>
                        <p className="text-gray-600 mb-1">{details.member.email}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>{getAge(details.member.dateOfBirth)} años</span>
                            <span>•</span>
                            <span className="capitalize">
                                {details.member.gender === 'male' ? 'Masculino' : details.member.gender === 'female' ? 'Femenino' : 'Otro'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bioimpedance Section */}
            <div className="mb-6 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">
                    Historial de Bioimpedancia
                </h2>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="px-6 py-3 bg-orange-500 text-white font-semibold rounded-lg shadow-lg hover:bg-orange-600 transform hover:-translate-y-0.5 transition-all duration-300">
                    {showForm ? 'Cancelar' : '+ Nuevo Registro'}
                </button>
            </div>

            {/* Form */}
            {showForm && (
                <div className="mb-8 bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
                    <h3 className="text-xl font-bold text-gray-800 mb-6">Registrar Bioimpedancia</h3>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Fecha</label>
                            <input
                                type="date"
                                required
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Peso (kg)</label>
                            <input
                                type="number"
                                step="0.1"
                                required
                                value={formData.weight}
                                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Grasa Corporal (%)</label>
                            <input
                                type="number"
                                step="0.1"
                                required
                                value={formData.bodyFatPercentage}
                                onChange={(e) => setFormData({ ...formData, bodyFatPercentage: e.target.value })}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Masa Muscular (%)</label>
                            <input
                                type="number"
                                step="0.1"
                                required
                                value={formData.muscleMassPercentage}
                                onChange={(e) => setFormData({ ...formData, muscleMassPercentage: e.target.value })}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Agua (%)</label>
                            <input
                                type="number"
                                step="0.1"
                                required
                                value={formData.waterPercentage}
                                onChange={(e) => setFormData({ ...formData, waterPercentage: e.target.value })}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">IMC</label>
                            <input
                                type="number"
                                step="0.1"
                                required
                                value={formData.bmi}
                                onChange={(e) => setFormData({ ...formData, bmi: e.target.value })}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Grasa Visceral (1-59)</label>
                            <input
                                type="number"
                                required
                                value={formData.visceralFat}
                                onChange={(e) => setFormData({ ...formData, visceralFat: e.target.value })}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Masa Ósea (kg)</label>
                            <input
                                type="number"
                                step="0.1"
                                required
                                value={formData.boneMass}
                                onChange={(e) => setFormData({ ...formData, boneMass: e.target.value })}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Tasa Metabólica Basal (kcal/día)</label>
                            <input
                                type="number"
                                required
                                value={formData.basalMetabolicRate}
                                onChange={(e) => setFormData({ ...formData, basalMetabolicRate: e.target.value })}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Notas (opcional)</label>
                            <textarea
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                rows={3}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
                                placeholder="Observaciones adicionales..."
                            />
                        </div>
                        <div className="md:col-span-2">
                            <button
                                type="submit"
                                className="w-full px-6 py-3 bg-orange-500 text-white font-semibold rounded-lg shadow-lg hover:bg-orange-600 transform hover:-translate-y-0.5 transition-all duration-300"
                            >
                                Guardar Registro
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* History */}
            {details.bioimpedances.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-12 text-center">
                    <div className="w-24 h-24 bg-gray-100 rounded-full mx-auto mb-6 flex items-center justify-center">
                        <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">No hay registros de bioimpedancia</h3>
                    <p className="text-gray-500">Comienza agregando el primer registro</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {details.bioimpedances.map((bio) => (
                        <div key={bio.id} className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-lg font-bold text-gray-800">
                                    {new Date(bio.date).toLocaleDateString('es-ES', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </h3>
                                <span className="text-sm text-gray-500">
                                    {new Date(bio.createdAt).toLocaleDateString('es-ES')}
                                </span>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm">
                                    <p className="text-xs text-gray-500 font-semibold mb-1">Peso</p>
                                    <p className="text-2xl font-bold text-gray-900">{bio.weight} kg</p>
                                </div>
                                <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm">
                                    <p className="text-xs text-gray-500 font-semibold mb-1">Grasa</p>
                                    <p className="text-2xl font-bold text-gray-900">{bio.bodyFatPercentage}%</p>
                                </div>
                                <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm">
                                    <p className="text-xs text-gray-500 font-semibold mb-1">Músculo</p>
                                    <p className="text-2xl font-bold text-gray-900">{bio.muscleMassPercentage}%</p>
                                </div>
                                <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm">
                                    <p className="text-xs text-gray-500 font-semibold mb-1">Agua</p>
                                    <p className="text-2xl font-bold text-gray-900">{bio.waterPercentage}%</p>
                                </div>
                                <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm">
                                    <p className="text-xs text-gray-500 font-semibold mb-1">IMC</p>
                                    <p className="text-2xl font-bold text-gray-900">{bio.bmi}</p>
                                </div>
                                <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm">
                                    <p className="text-xs text-gray-500 font-semibold mb-1">Grasa Visceral</p>
                                    <p className="text-2xl font-bold text-gray-900">{bio.visceralFat}</p>
                                </div>
                                <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm">
                                    <p className="text-xs text-gray-500 font-semibold mb-1">Masa Ósea</p>
                                    <p className="text-2xl font-bold text-gray-900">{bio.boneMass} kg</p>
                                </div>
                                <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm">
                                    <p className="text-xs text-gray-500 font-semibold mb-1">TMB</p>
                                    <p className="text-2xl font-bold text-gray-900">{bio.basalMetabolicRate}</p>
                                </div>
                            </div>

                            {bio.notes && (
                                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                                    <p className="text-sm text-gray-600">
                                        <span className="font-semibold">Notas:</span> {bio.notes}
                                    </p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

