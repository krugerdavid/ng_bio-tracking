import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { MemberListItemDTO } from "@application/member/dtos/MemberListItemDTO";
import { RegisterMemberModal } from "../components/RegisterMemberModal";
import { PageLoader } from "@presentation/shared/components/PageLoader";
import { formatCurrency } from "@presentation/shared/utils/formatters";

interface MemberListPageProps {
  members: MemberListItemDTO[];
  loading: boolean;
  error?: string;
  page: number;
  totalPages: number;
  totalMembers: number;
  onSearch: (value: string) => void;
  onPageChange: (page: number) => void;
  onRefresh: () => void;
  onDelete: (id: string, name: string) => void;
}

export function MemberListPage({
  members,
  loading,
  error,
  page,
  totalPages,
  totalMembers,
  onSearch,
  onPageChange,
  onRefresh,
}: MemberListPageProps) {
  const navigate = useNavigate();
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  if (loading && members.length === 0) {
    return <PageLoader />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-row justify-between items-center gap-4">
        <div className="flex flex-col items-start gap-2">
          <h2 className="text-2xl font-bold text-gray-900 ">Deportistas Registrados</h2>
          <span className="text-sm font-medium text-gray-600 bg-gray-200 px-3 py-1 rounded-full">
            {totalMembers} total
          </span>
        </div>
        <button
          onClick={() => setIsRegisterModalOpen(true)}
          className="
                flex items-center justify-center gap-2
                w-12 h-12 sm:w-auto sm:h-auto
                rounded-full sm:rounded-lg
                p-0 sm:px-6 sm:py-3
                bg-orange-500 text-white font-semibold 
                shadow-lg hover:bg-orange-600 
                active:bg-orange-700 transform hover:-translate-y-0.5 active:translate-y-0 
                transition-all duration-300 touch-manipulation
              "
          aria-label="Registrar Deportista"
        >
          <span className="text-2xl sm:text-xl leading-none mb-1 sm:mb-0">+</span>
          <span className="hidden sm:block">Deportista</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-orange-500 focus:border-orange-500 sm:text-sm transition duration-150 ease-in-out"
          placeholder="Buscar por nombre..."
          onChange={e => onSearch(e.target.value)}
        />
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
          <div className="flex">
            <div className="shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {members.length === 0 && !loading ? (
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-12 text-center">
          <div className="w-24 h-24 bg-gray-100 rounded-full mx-auto mb-6 flex items-center justify-center">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No se encontraron deportistas</h3>
          <p className="text-gray-500 mb-6">Intenta con otra búsqueda o registra un nuevo deportista</p>
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-xl border border-gray-200 overflow-hidden">
          {/* Mobile: card list */}
          <ul role="list" className="md:hidden divide-y divide-gray-100">
            {members.map(member => (
              <li key={member.id}>
                <button
                  type="button"
                  onClick={() => navigate(`/member/${member.id}`)}
                  className={`w-full text-left block p-4 active:bg-gray-50 transition-colors ${
                    member.status === "moroso" ? "bg-red-50/50 active:bg-red-100/50" : "hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="h-11 w-11 shrink-0 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold text-lg">
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-gray-900 truncate">{member.name}</p>
                      <p className="text-sm text-gray-600 truncate mt-0.5">
                        {member.email || "Sin email"} · Doc. {member.documentNumber}
                      </p>
                      <div className="mt-2 flex items-center gap-2 flex-wrap">
                        <span
                          className={`inline-flex text-xs font-semibold rounded-full px-2 py-0.5 ${
                            member.status === "active"
                              ? "bg-green-100 text-green-800"
                              : member.status === "moroso"
                                ? "bg-red-100 text-red-800"
                                : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {member.status === "active"
                            ? "Al día"
                            : member.status === "moroso"
                              ? `Mora: ${formatCurrency(member.debtAmount)}`
                              : "Inactivo"}
                        </span>
                        <span className="text-xs text-gray-500">{member.frequency}</span>
                        <span className="text-xs text-gray-500">{member.age} años</span>
                      </div>
                    </div>
                    <span className="text-orange-600 text-sm font-medium shrink-0 pt-0.5">Ver →</span>
                  </div>
                </button>
              </li>
            ))}
          </ul>

          {/* Desktop: table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Documento</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Frecuencia</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Edad</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                  <th className="px-4 py-3 w-20" />
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {members.map(member => (
                  <tr
                    key={member.id}
                    onClick={() => navigate(`/member/${member.id}`)}
                    className={`cursor-pointer hover:bg-gray-50 transition-colors ${
                      member.status === "moroso" ? "bg-red-50/50 hover:bg-red-100/50" : ""
                    }`}
                  >
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 whitespace-nowrap">{member.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 truncate max-w-[180px]">
                      {member.email || "Sin email"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{member.documentNumber}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{member.frequency}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{member.age} años</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex text-xs font-semibold rounded-full px-2 py-1 ${
                          member.status === "active"
                            ? "bg-green-100 text-green-800"
                            : member.status === "moroso"
                              ? "bg-red-100 text-red-800"
                              : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {member.status === "active"
                          ? "Al día"
                          : member.status === "moroso"
                            ? `Mora: ${formatCurrency(member.debtAmount)}`
                            : "Inactivo"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-orange-600 text-sm font-medium">Ver</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => onPageChange(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 ${
                    page === 1 ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  Anterior
                </button>
                <button
                  onClick={() => onPageChange(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 ${
                    page === totalPages ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  Siguiente
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Página <span className="font-medium">{page}</span> de{" "}
                    <span className="font-medium">{totalPages}</span>
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => onPageChange(Math.max(1, page - 1))}
                      disabled={page === 1}
                      className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 ${
                        page === 1 ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    >
                      <span className="sr-only">Anterior</span>
                      <svg
                        className="h-5 w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                    {/* Page Numbers */}
                    {[...Array(totalPages)].map((_, i) => {
                      const pageNum = i + 1;
                      // Show current, first, last, and neighbors
                      if (pageNum === 1 || pageNum === totalPages || (pageNum >= page - 1 && pageNum <= page + 1)) {
                        return (
                          <button
                            key={pageNum}
                            onClick={() => onPageChange(pageNum)}
                            aria-current={page === pageNum ? "page" : undefined}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              page === pageNum
                                ? "z-10 bg-orange-50 border-orange-500 text-orange-600"
                                : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      } else if (
                        (pageNum === page - 2 && page > 3) ||
                        (pageNum === page + 2 && page < totalPages - 2)
                      ) {
                        return (
                          <span
                            key={pageNum}
                            className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
                          >
                            ...
                          </span>
                        );
                      }
                      return null;
                    })}
                    <button
                      onClick={() => onPageChange(Math.min(totalPages, page + 1))}
                      disabled={page === totalPages}
                      className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 ${
                        page === totalPages ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    >
                      <span className="sr-only">Siguiente</span>
                      <svg
                        className="h-5 w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <RegisterMemberModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        onSuccess={() => {
          setIsRegisterModalOpen(false);
          onRefresh();
        }}
      />
    </div>
  );
}
