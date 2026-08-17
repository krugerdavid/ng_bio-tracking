import type { Member } from "@domain/member/entities/Member";
import type { Bioimpedance } from "@domain/bioimpedance/entities/Bioimpedance";
import type { PaymentStatusResult } from "@application/payment/use-cases/GetPaymentStatusUseCase";
import { PageLoader } from "@presentation/shared/components/PageLoader";
import { formatCurrency, formatLocalDate } from "@presentation/shared/utils/formatters";

interface MemberHomePageProps {
  member: Member | null;
  bioimpedances: Bioimpedance[];
  paymentStatus: PaymentStatusResult | null;
  loading: boolean;
  error?: string;
}

export function MemberHomePage({ member, bioimpedances, paymentStatus, loading, error }: MemberHomePageProps) {
  if (loading) {
    return <PageLoader />;
  }

  if (error || !member) {
    return (
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 text-center">
        <p className="text-gray-600">{error || "No pudimos cargar tu ficha."}</p>
      </div>
    );
  }

  const sortedBio = [...bioimpedances].sort((a, b) => b.date.getTime() - a.date.getTime());
  const latest = sortedBio[0];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900">Hola, {member.name.split(" ")[0]}</h2>
        {member.trainingGroup && <p className="text-gray-600 mt-1">Grupo {member.trainingGroup}</p>}
      </div>

      {paymentStatus && (
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-3">Estado de cuenta</h3>
          {paymentStatus.isOverdue ? (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm font-semibold">Mora: {formatCurrency(paymentStatus.totalDebt)}</p>
              {paymentStatus.overdueMonths.length > 0 && (
                <p className="text-red-600 text-xs mt-1">Meses adeudados: {paymentStatus.overdueMonths.join(", ")}</p>
              )}
            </div>
          ) : (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-700 text-sm font-semibold">Estás al día</p>
            </div>
          )}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-3">Bioimpedancia</h3>
        {latest ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
            <div>
              <p className="text-xs text-gray-500">Peso</p>
              <p className="text-lg font-semibold text-gray-900">{latest.weight} kg</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">IMC</p>
              <p className="text-lg font-semibold text-gray-900">{latest.imc}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">% Grasa</p>
              <p className="text-lg font-semibold text-gray-900">{latest.bodyFatPercentage}%</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">% Músculo</p>
              <p className="text-lg font-semibold text-gray-900">{latest.muscleMassPercentage}%</p>
            </div>
          </div>
        ) : (
          <p className="text-gray-500 text-sm mb-4">Todavía no tenés mediciones cargadas.</p>
        )}

        {sortedBio.length > 0 && (
          <div className="border-t border-gray-100 pt-4">
            <p className="text-xs font-medium text-gray-500 uppercase mb-2">Historial</p>
            <ul className="divide-y divide-gray-100">
              {sortedBio.map(b => (
                <li key={b.id} className="py-2 flex justify-between text-sm">
                  <span className="text-gray-600">{formatLocalDate(b.date)}</span>
                  <span className="text-gray-900 font-medium">{b.weight} kg</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
