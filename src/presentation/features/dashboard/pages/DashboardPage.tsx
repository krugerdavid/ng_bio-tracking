import { Link } from "react-router-dom";
import type { DashboardResult } from "@application/dashboard/dtos/DashboardDTO";
import {
  formatCurrency,
  formatLocalDate,
  formatShortMonth,
  formatWithThousandsSeparator,
} from "@presentation/shared/utils/formatters";
import { PageLoader } from "@presentation/shared/components/PageLoader";
import { RevenueChart } from "../components/RevenueChart";

interface DashboardPageProps {
  data: DashboardResult | null;
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
  onApprove: (id: string) => void;
  approvingId: string | null;
}

export function DashboardPage({ data, loading, error, onRefresh, onApprove, approvingId }: DashboardPageProps) {
  if (loading && !data) {
    return <PageLoader />;
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-4 text-red-800">
        <p className="font-medium">Error al cargar el dashboard</p>
        <p className="text-sm mt-1">{error}</p>
        <button
          onClick={onRefresh}
          className="mt-3 px-4 py-2 bg-red-100 hover:bg-red-200 rounded-lg text-sm font-medium"
        >
          Reintentar
        </button>
      </div>
    );
  }

  const d = data!;

  return (
    <div className="space-y-8">
      <div className="flex  items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="px-4 py-2 text-sm font-medium text-orange-600 hover:text-orange-700 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors"
        >
          {loading ? "Actualizando…" : "Actualizar"}
        </button>
      </div>

      {/* Pending approvals */}
      {d.pendingApprovals.length > 0 && (
        <div className="bg-amber-50 rounded-xl border border-amber-300 shadow-sm overflow-hidden">
          <div className="px-4 sm:px-5 py-4 border-b border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <h3 className="text-base sm:text-lg font-semibold text-amber-900">
              Registros pendientes de aprobación ({d.pendingApprovals.length})
            </h3>
            <Link to="/members?status=pending" className="text-sm font-medium text-orange-600 hover:text-orange-700">
              Ver todos
            </Link>
          </div>
          <ul className="divide-y divide-amber-100">
            {d.pendingApprovals.map(p => (
              <li key={p.id} className="p-4 sm:px-5 flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-gray-900 truncate">{p.name}</p>
                  <p className="text-sm text-gray-600 truncate">
                    {p.email}
                    {p.trainingGroup ? ` · Grupo ${p.trainingGroup}` : ""}
                  </p>
                </div>
                <button
                  onClick={() => onApprove(p.id)}
                  disabled={approvingId === p.id}
                  className="shrink-0 px-3 py-1.5 rounded-lg text-sm font-semibold bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-50"
                >
                  {approvingId === p.id ? "Aprobando…" : "Aprobar"}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 col-span-2 lg:col-span-1">
          <p className="text-sm font-medium text-gray-500">Deportistas registrados</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{d.totalMembers}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <p className="text-sm font-medium text-gray-500">En mora</p>
          <p className="mt-1 text-2xl font-bold text-red-600">{d.inArrearsCount}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <p className="text-sm font-medium text-gray-500">Monto total en mora</p>
          <p className="mt-1 text-2xl font-bold text-red-600">{formatCurrency(d.totalAmountInArrears)}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <p className="text-sm font-medium text-gray-500">Saldo a favor total</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{formatCurrency(d.creditBalanceTotal)}</p>
        </div>
      </div>

      {/* Revenue trend */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-5">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Ingresos por mes</h3>
        <RevenueChart data={d.revenueByMonth} />
      </div>

      {/* By frequency (horarios / frecuencia semanal) */}
      {d.membersByFrequency.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <h3 className="px-5 py-4 text-lg font-semibold text-gray-900 border-b border-gray-100">
            Deportistas por frecuencia semanal
          </h3>
          <div className="p-5">
            <div className="flex flex-wrap gap-4">
              {d.membersByFrequency.map(({ frequency, count }) => (
                <div
                  key={frequency}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <span className="font-medium text-gray-900">{frequency}</span>
                  <span className="text-gray-600">({count})</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Last 10 members */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-4 sm:px-5 py-4 border-b border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">Últimos 10 deportistas registrados</h3>
            <Link to="/members" className="text-sm font-medium text-orange-600 hover:text-orange-700 whitespace-nowrap">
              Ver todos
            </Link>
          </div>
          {d.lastMembers.length === 0 ? (
            <p className="p-4 sm:p-5 text-gray-500 text-sm">No hay registros recientes.</p>
          ) : (
            <>
              {/* Mobile: card list */}
              <ul className="md:hidden divide-y divide-gray-100">
                {d.lastMembers.map(m => (
                  <li key={m.id}>
                    <Link
                      to={`/member/${m.id}`}
                      className="block p-4 sm:p-4 active:bg-gray-50 hover:bg-gray-50/80 transition-colors"
                    >
                      <div className="flex justify-between items-start gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-gray-900 truncate">{m.name}</p>
                          <p className="text-sm text-gray-600 mt-0.5">
                            Doc. {formatWithThousandsSeparator(m.documentNumber)}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">{formatLocalDate(m.createdAt)}</p>
                        </div>
                        <span className="text-orange-600 text-sm font-medium shrink-0">Ver →</span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
              {/* Desktop: table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Documento</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Registro</th>
                      <th className="px-4 py-2 w-16" />
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {d.lastMembers.map(m => (
                      <tr key={m.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{m.name}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {formatWithThousandsSeparator(m.documentNumber)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">{formatLocalDate(m.createdAt)}</td>
                        <td className="px-4 py-3">
                          <Link
                            to={`/member/${m.id}`}
                            className="text-orange-600 hover:text-orange-700 text-sm font-medium"
                          >
                            Ver
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        {/* Last 10 payments */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-4 sm:px-5 py-4 border-b border-gray-100">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">Últimos 10 pagos registrados</h3>
          </div>
          {d.lastPayments.length === 0 ? (
            <p className="p-4 sm:p-5 text-gray-500 text-sm">
              No hay pagos recientes o el listado global no está disponible.
            </p>
          ) : (
            <>
              {/* Mobile: card list */}
              <ul className="md:hidden divide-y divide-gray-100">
                {d.lastPayments.map(p => (
                  <li key={p.id}>
                    <Link
                      to={`/member/${p.memberId}`}
                      className="block p-4 sm:p-4 active:bg-gray-50 hover:bg-gray-50/80 transition-colors"
                    >
                      <div className="flex justify-between items-start gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-gray-900 truncate">{p.memberName}</p>
                          <p className="text-sm text-gray-600 mt-0.5">
                            {formatShortMonth(p.month)} · {formatCurrency(p.amount)}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">{formatLocalDate(p.paymentDate)}</p>
                        </div>
                        <span className="text-orange-600 text-sm font-medium shrink-0">Ver →</span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
              {/* Desktop: table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Deportista</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Mes</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Monto</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Fecha pago</th>
                      <th className="px-4 py-2 w-16" />
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {d.lastPayments.map(p => (
                      <tr key={p.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{p.memberName}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{formatShortMonth(p.month)}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{formatCurrency(p.amount)}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">{formatLocalDate(p.paymentDate)}</td>
                        <td className="px-4 py-3">
                          <Link
                            to={`/member/${p.memberId}`}
                            className="text-orange-600 hover:text-orange-700 text-sm font-medium"
                          >
                            Ver
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
