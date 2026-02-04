import { useState, useEffect, useCallback } from "react";
import { container } from "@core/container/bindings";
import { TYPES } from "@core/container/DIContainer";
import type { ListAuditLogsUseCase } from "@application/audit/use-cases/ListAuditLogsUseCase";
import type { AuditLog } from "@domain/audit/entities/AuditLog";
import { AuditLogPage } from "./AuditLogPage";

export default function AuditLogPageController() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  const listAuditLogsUseCase = container.get<ListAuditLogsUseCase>(TYPES.ListAuditLogsUseCase);

  const loadLogs = useCallback(
    async (page = 1) => {
      setError("");
      setLoading(true);
      try {
        const result = await listAuditLogsUseCase.execute({
          page,
          pageSize: 15,
        });
        if (result.isError()) {
          setError(result.getError());
          setLogs([]);
        } else {
          const data = result.getValue();
          setLogs(data.logs);
          setTotal(data.total);
          setCurrentPage(data.currentPage);
          setLastPage(data.lastPage);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al cargar auditoría");
        setLogs([]);
      } finally {
        setLoading(false);
      }
    },
    [listAuditLogsUseCase]
  );

  useEffect(() => {
    loadLogs(1);
  }, [loadLogs]);

  const handlePageChange = (page: number) => {
    loadLogs(page);
  };

  return (
    <AuditLogPage
      logs={logs}
      loading={loading}
      error={error}
      total={total}
      currentPage={currentPage}
      lastPage={lastPage}
      onPageChange={handlePageChange}
    />
  );
}
