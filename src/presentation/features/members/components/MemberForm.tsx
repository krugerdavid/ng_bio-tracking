import { useState, type FormEvent } from "react";
import type { CreateMemberDTO } from "@domain/member/entities/Member";
import { TrainingGroupSelect } from "@presentation/shared/components/TrainingGroupSelect";

export interface MemberFormData {
  name: string;
  documentNumber: string;
  email: string;
  dateOfBirth: string;
  gender: "male" | "female" | "other" | "";
  trainingGroup: string;
}

interface MemberFormProps {
  initialData?: Partial<MemberFormData>;
  onSubmit: (data: CreateMemberDTO) => Promise<void>;
  onCancel: () => void;
  loading: boolean;
  submitLabel: string;
  loadingLabel: string;
}

export function MemberForm({ initialData, onSubmit, onCancel, loading, submitLabel, loadingLabel }: MemberFormProps) {
  const [formData, setFormData] = useState<MemberFormData>({
    name: initialData?.name || "",
    documentNumber: initialData?.documentNumber || "",
    email: initialData?.email || "",
    dateOfBirth: initialData?.dateOfBirth || "",
    gender: initialData?.gender || "",
    trainingGroup: initialData?.trainingGroup || "",
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const memberData: CreateMemberDTO = {
      name: formData.name,
      documentNumber: formData.documentNumber,
      email: formData.email || undefined,
      dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth) : undefined,
      gender: formData.gender || undefined,
      trainingGroup: formData.trainingGroup || undefined,
    };

    await onSubmit(memberData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Mandatory Fields */}
        <div className="col-span-1 md:col-span-2">
          <h3 className="text-sm font-medium text-gray-500 mb-4 uppercase tracking-wider">Datos Obligatorios</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                Nombre Completo <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                required
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
                placeholder="Ej. Juan Pérez"
              />
            </div>

            <div>
              <label htmlFor="documentNumber" className="block text-sm font-semibold text-gray-700 mb-2">
                Número de Documento <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="documentNumber"
                required
                value={formData.documentNumber}
                onChange={e => setFormData({ ...formData, documentNumber: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
                placeholder="Ej. 1234567"
              />
            </div>
          </div>
        </div>

        {/* Optional Fields */}
        <div className="col-span-1 md:col-span-2 border-t border-gray-100 pt-6">
          <h3 className="text-sm font-medium text-gray-500 mb-4 uppercase tracking-wider">Datos Opcionales</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
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
                value={formData.dateOfBirth}
                onChange={e => setFormData({ ...formData, dateOfBirth: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
              />
            </div>

            <div>
              <label htmlFor="gender" className="block text-sm font-semibold text-gray-700 mb-2">
                Género
              </label>
              <select
                id="gender"
                value={formData.gender}
                onChange={e => setFormData({ ...formData, gender: e.target.value as "male" | "female" | "other" | "" })}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
              >
                <option value="">Seleccionar...</option>
                <option value="male">Masculino</option>
                <option value="female">Femenino</option>
                <option value="other">Otro</option>
              </select>
            </div>

            <TrainingGroupSelect
              id="trainingGroup"
              value={formData.trainingGroup || undefined}
              onChange={value => setFormData({ ...formData, trainingGroup: value || "" })}
            />
          </div>
        </div>
      </div>

      <div className="flex gap-4 pt-4 border-t border-gray-100">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 px-6 py-3 bg-orange-500 text-white font-semibold rounded-lg shadow-lg hover:bg-orange-600 transform hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
        >
          {loading ? (
            <>
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <span>{loadingLabel}</span>
            </>
          ) : (
            submitLabel
          )}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="px-6 py-3 border-2 border-gray-300 bg-white text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-all duration-300 disabled:opacity-50"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
