import type { AuditLog } from "@domain/audit/entities/AuditLog";
import { PageLoader } from "@presentation/shared/components/PageLoader";

interface AuditLogPageProps {
  logs: AuditLog[];
  loading: boolean;
  error: string;
  total: number;
  currentPage: number;
  lastPage: number;
  onPageChange: (page: number) => void;
}

const eventLabels: Record<string, string> = {
  created: "Creado",
  updated: "Actualizado",
  deleted: "Eliminado",
};

function formatEvent(event: string): string {
  return eventLabels[event] ?? event;
}

function formatType(type: string): string {
  const parts = type.split("\\");
  return parts[parts.length - 1] ?? type;
}

export function AuditLogPage({ logs, loading, error, total, currentPage, lastPage, onPageChange }: AuditLogPageProps) {
  if (loading) {
    return <PageLoader />;
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-900">Auditoría</h2>
        <p className="mt-1 text-sm text-gray-600">Registro de cambios en el sistema (solo root).</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Fecha</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Evento</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Tipo / ID</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Usuario</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Método / URL</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {logs.map(log => (
                <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleString("es-ES")}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                        log.event === "created"
                          ? "bg-green-100 text-green-800"
                          : log.event === "updated"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-red-100 text-red-800"
                      }`}
                    >
                      {formatEvent(log.event)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <span className="font-medium text-gray-700">{formatType(log.auditableType)}</span>
                    <span className="text-gray-500 ml-1">#{log.auditableId}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{log.causerName ?? "—"}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                    {log.method && log.url ? (
                      <span title={log.url}>
                        {log.method} {log.url}
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {logs.length === 0 && !error && (
          <div className="p-12 text-center">
            <p className="text-gray-500">No hay registros de auditoría</p>
          </div>
        )}

        {lastPage > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Mostrando página {currentPage} de {lastPage} ({total} registros)
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage <= 1}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anterior
              </button>
              <button
                type="button"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage >= lastPage}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
