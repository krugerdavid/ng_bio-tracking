import type { Result } from "@core/types/Result";
import type { AuditLog, ListAuditLogsParams, ListAuditLogsResult } from "./entities/AuditLog";

export interface AuditLogRepository {
  list(params?: ListAuditLogsParams): Promise<Result<ListAuditLogsResult>>;
  getById(id: number): Promise<Result<AuditLog | null>>;
}
