import { useState, type FormEvent } from "react";
import type { MemberDetails } from "@application/member/use-cases/GetMemberDetailsUseCase";
import type { CreateBioimpedanceDTO } from "@domain/bioimpedance/entities/Bioimpedance";

interface MemberDetailPageProps {
  details: MemberDetails | null;
  loading: boolean;
  error?: string;
  onSubmit: (bioData: CreateBioimpedanceDTO) => Promise<void>;
}

// Helper function to compare values and return indicator
const getTrendIndicator = (current: number, previous: number | null): { icon: string; color: string } | null => {
  if (previous === null) return null;

  const diff = current - previous;
  if (Math.abs(diff) < 0.01) return null; // Ignore very small differences

  if (diff > 0) {
    return { icon: "▲", color: "text-red-500" };
  } else {
    return { icon: "▼", color: "text-green-500" };
  }
};

// Helper function to render metric with trend indicator
const MetricCard = ({
  label,
  value,
  unit,
  trend,
}: {
  label: string;
  value: number;
  unit: string;
  trend: { icon: string; color: string } | null;
}) => (
  <div className=" border border-gray-200 p-4 rounded-lg shadow-sm">
    <div className="flex items-center justify-between mb-1">
      <p className="text-xs text-gray-600 font-semibold">{label}</p>
    </div>
    <div className="flex items-center justify-between mb-1">
      <p className="text-2xl font-bold text-gray-900 flex items-center gap-2">
        {value} {unit}{" "}
        {trend && (
          <span className={`text-md ${trend.color} font-bold`} title={trend.icon === "▲" ? "Aumentó" : "Disminuyó"}>
            {trend.icon}
          </span>
        )}
      </p>
    </div>
  </div>
);

export function MemberDetailPage({ details, loading, onSubmit }: MemberDetailPageProps) {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    height: "",
    weight: "",
    imc: "",
    bodyFatPercentage: "",
    muscleMassPercentage: "",
    kcal: "",
    metabolicAge: "",
    visceralFatPercentage: "",
    notes: "",
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!details) return;

    try {
      const bioData: CreateBioimpedanceDTO = {
        memberId: details.member.id,
        date: new Date(formData.date),
        height: parseFloat(formData.height),
        weight: parseFloat(formData.weight),
        imc: parseFloat(formData.imc),
        bodyFatPercentage: parseFloat(formData.bodyFatPercentage),
        muscleMassPercentage: parseFloat(formData.muscleMassPercentage),
        kcal: parseFloat(formData.kcal),
        metabolicAge: parseFloat(formData.metabolicAge),
        visceralFatPercentage: parseFloat(formData.visceralFatPercentage),
        notes: formData.notes || undefined,
      };

      await onSubmit(bioData);
      setShowForm(false);
      setFormData({
        date: new Date().toISOString().split("T")[0],
        height: "",
        weight: "",
        imc: "",
        bodyFatPercentage: "",
        muscleMassPercentage: "",
        kcal: "",
        metabolicAge: "",
        visceralFatPercentage: "",
        notes: "",
      });
    } catch (error) {
      console.error("Error recording bioimpedance:", error);
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

  // Get the most recent bioimpedance record
  const latestBioimpedance = details.bioimpedances.length > 0 ? details.bioimpedances[0] : null;
  // Get the previous record for comparison
  const previousBioimpedance = details.bioimpedances.length > 1 ? details.bioimpedances[1] : null;
  // Get historical records (excluding the latest one)
  const historicalRecords = details.bioimpedances.slice(1);

  return (
    <div>
      {/* Member Header */}
      <div className="mb-8 bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
        <div className="flex items-center space-x-6">
          <div className="w-24 h-24 bg-orange-500 rounded-full flex items-center justify-center text-white text-4xl font-bold">
            {details.member.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{details.member.name}</h1>
            <p className="text-gray-600 mb-1">{details.member.email}</p>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span>{getAge(details.member.dateOfBirth)} años</span>
              <span>•</span>
              <span className="capitalize">
                {details.member.gender === "male"
                  ? "Masculino"
                  : details.member.gender === "female"
                    ? "Femenino"
                    : "Otro"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bioimpedance Section */}
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Bioimpedancia</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-6 py-3 bg-orange-500 text-white font-semibold rounded-lg shadow-lg hover:bg-orange-600 transform hover:-translate-y-0.5 transition-all duration-300"
        >
          {showForm ? "Cancelar" : "+ Nuevo Registro"}
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
                onChange={e => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Estatura (cm)</label>
              <input
                type="number"
                step="0.1"
                required
                value={formData.height}
                onChange={e => setFormData({ ...formData, height: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
                placeholder="Ej: 175"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Peso (kg)</label>
              <input
                type="number"
                step="0.1"
                required
                value={formData.weight}
                onChange={e => setFormData({ ...formData, weight: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">IMC</label>
              <input
                type="number"
                step="0.1"
                required
                value={formData.imc}
                onChange={e => setFormData({ ...formData, imc: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">% de Grasa</label>
              <input
                type="number"
                step="0.1"
                required
                value={formData.bodyFatPercentage}
                onChange={e => setFormData({ ...formData, bodyFatPercentage: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">% de Músculo</label>
              <input
                type="number"
                step="0.1"
                required
                value={formData.muscleMassPercentage}
                onChange={e => setFormData({ ...formData, muscleMassPercentage: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">KCAL</label>
              <input
                type="number"
                required
                value={formData.kcal}
                onChange={e => setFormData({ ...formData, kcal: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
                placeholder="Calorías"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Edad Metabólica</label>
              <input
                type="number"
                required
                value={formData.metabolicAge}
                onChange={e => setFormData({ ...formData, metabolicAge: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
                placeholder="Años"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">% Grasa Visceral</label>
              <input
                type="number"
                step="0.1"
                required
                value={formData.visceralFatPercentage}
                onChange={e => setFormData({ ...formData, visceralFatPercentage: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Notas (opcional)</label>
              <textarea
                value={formData.notes}
                onChange={e => setFormData({ ...formData, notes: e.target.value })}
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

      {/* Latest Bioimpedance Values */}
      {latestBioimpedance ? (
        <div className="mb-8 bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-xl font-bold text-gray-800">Últimos Valores</h3>
              <p className="text-sm text-gray-500 mt-1">
                {new Date(latestBioimpedance.date).toLocaleDateString("es-ES", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <MetricCard
              label="Estatura"
              value={latestBioimpedance.height}
              unit="cm"
              trend={getTrendIndicator(latestBioimpedance.height, previousBioimpedance?.height ?? null)}
            />
            <MetricCard
              label="Peso"
              value={latestBioimpedance.weight}
              unit="kg"
              trend={getTrendIndicator(latestBioimpedance.weight, previousBioimpedance?.weight ?? null)}
            />
            <MetricCard
              label="IMC"
              value={latestBioimpedance.imc}
              unit=""
              trend={getTrendIndicator(latestBioimpedance.imc, previousBioimpedance?.imc ?? null)}
            />
            <MetricCard
              label="% Grasa"
              value={latestBioimpedance.bodyFatPercentage}
              unit="%"
              trend={getTrendIndicator(
                latestBioimpedance.bodyFatPercentage,
                previousBioimpedance?.bodyFatPercentage ?? null
              )}
            />
            <MetricCard
              label="% Músculo"
              value={latestBioimpedance.muscleMassPercentage}
              unit="%"
              trend={getTrendIndicator(
                latestBioimpedance.muscleMassPercentage,
                previousBioimpedance?.muscleMassPercentage ?? null
              )}
            />
            <MetricCard
              label="KCAL"
              value={latestBioimpedance.kcal}
              unit=""
              trend={getTrendIndicator(latestBioimpedance.kcal, previousBioimpedance?.kcal ?? null)}
            />
            <MetricCard
              label="Edad Metabólica"
              value={latestBioimpedance.metabolicAge}
              unit="años"
              trend={getTrendIndicator(latestBioimpedance.metabolicAge, previousBioimpedance?.metabolicAge ?? null)}
            />
            <MetricCard
              label="% Grasa Visceral"
              value={latestBioimpedance.visceralFatPercentage}
              unit="%"
              trend={getTrendIndicator(
                latestBioimpedance.visceralFatPercentage,
                previousBioimpedance?.visceralFatPercentage ?? null
              )}
            />
          </div>

          {latestBioimpedance.notes && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                <span className="font-semibold">Notas:</span> {latestBioimpedance.notes}
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="mb-8 bg-white rounded-2xl shadow-xl border border-gray-200 p-12 text-center">
          <div className="w-24 h-24 bg-gray-100 rounded-full mx-auto mb-6 flex items-center justify-center">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No hay registros de bioimpedancia</h3>
          <p className="text-gray-500">Comienza agregando el primer registro</p>
        </div>
      )}

      {/* Historical Records */}
      {historicalRecords.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Historial</h3>
          <div className="space-y-4">
            {historicalRecords.map(bio => (
              <div
                key={bio.id}
                className="bg-white rounded-xl shadow-md border border-gray-200 p-5 hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-between items-start mb-3">
                  <h4 className="text-lg font-semibold text-gray-800">
                    {new Date(bio.date).toLocaleDateString("es-ES", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </h4>
                  <span className="text-xs text-gray-500">{new Date(bio.createdAt).toLocaleDateString("es-ES")}</span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
                  <div className="text-center">
                    <p className="text-xs text-gray-500 font-medium mb-1">Estatura</p>
                    <p className="text-sm font-bold text-gray-900">{bio.height} cm</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500 font-medium mb-1">Peso</p>
                    <p className="text-sm font-bold text-gray-900">{bio.weight} kg</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500 font-medium mb-1">IMC</p>
                    <p className="text-sm font-bold text-gray-900">{bio.imc}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500 font-medium mb-1">% Grasa</p>
                    <p className="text-sm font-bold text-gray-900">{bio.bodyFatPercentage}%</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500 font-medium mb-1">% Músculo</p>
                    <p className="text-sm font-bold text-gray-900">{bio.muscleMassPercentage}%</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500 font-medium mb-1">KCAL</p>
                    <p className="text-sm font-bold text-gray-900">{bio.kcal}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500 font-medium mb-1">Edad Metab.</p>
                    <p className="text-sm font-bold text-gray-900">{bio.metabolicAge}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500 font-medium mb-1">% Visceral</p>
                    <p className="text-sm font-bold text-gray-900">{bio.visceralFatPercentage}%</p>
                  </div>
                </div>

                {bio.notes && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-xs text-gray-600">
                      <span className="font-semibold">Notas:</span> {bio.notes}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
