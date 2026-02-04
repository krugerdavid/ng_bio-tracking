import { injectable, inject } from "inversify";
import { Result } from "@core/types/Result";
import { TYPES } from "@core/container/DIContainer";
import type { AuditLogRepository } from "@domain/audit/AuditLogRepository";
import type { AuditLog, ListAuditLogsParams, ListAuditLogsResult } from "@domain/audit/entities/AuditLog";
import type { HttpClient } from "@infrastructure/api/HttpClient";
import { unwrapLaravelPaginated } from "@infrastructure/api/laravelPaginated";
import { ApiError } from "@infrastructure/api/types";

interface AuditLogApi {
  id: number;
  event: string;
  auditable_type: string;
  auditable_id: string;
  old_values: Record<string, unknown> | null;
  new_values: Record<string, unknown> | null;
  causer_name?: string | null;
  ip_address?: string | null;
  user_agent?: string | null;
  url?: string | null;
  method?: string | null;
  created_at: string;
}

function mapApiToAuditLog(api: AuditLogApi): AuditLog {
  return {
    id: api.id,
    event: api.event,
    auditableType: api.auditable_type,
    auditableId: api.auditable_id,
    oldValues: api.old_values ?? null,
    newValues: api.new_values ?? null,
    causerName: api.causer_name ?? null,
    ipAddress: api.ip_address ?? null,
    userAgent: api.user_agent ?? null,
    url: api.url ?? null,
    method: api.method ?? null,
    createdAt: new Date(api.created_at),
  };
}

@injectable()
export class AuditLogRepositoryImpl implements AuditLogRepository {
  constructor(@inject(TYPES.HttpClient) private readonly http: HttpClient) {}

  async list(params?: ListAuditLogsParams): Promise<Result<ListAuditLogsResult>> {
    try {
      const query: Record<string, string | number> = {};
      if (params?.page) query.page = params.page;
      if (params?.pageSize) query.page_size = params.pageSize;
      if (params?.auditableType) query.auditable_type = params.auditableType;
      if (params?.event) query.event = params.event;
      if (params?.from) query.from = params.from;
      if (params?.to) query.to = params.to;

      const payload = await this.http.get<
        AuditLogApi[] | { data: AuditLogApi[]; meta?: { total: number; current_page: number; last_page: number } }
      >("audit-logs", query);
      const { items, total, currentPage, lastPage } = unwrapLaravelPaginated(payload);
      const logs = items.map(mapApiToAuditLog);
      return Result.success({ logs, total, currentPage, lastPage });
    } catch (err) {
      if (err instanceof ApiError && err.statusCode === 403) {
        return Result.success({ logs: [], total: 0, currentPage: 1, lastPage: 1 });
      }
      return Result.error(err instanceof ApiError ? err.message : "Error al cargar auditoría");
    }
  }

  async getById(id: number): Promise<Result<AuditLog | null>> {
    try {
      const payload = await this.http.get<AuditLogApi>(`audit-logs/${id}`);
      return Result.success(mapApiToAuditLog(payload));
    } catch (err) {
      if (err instanceof ApiError && err.statusCode === 404) {
        return Result.success(null);
      }
      return Result.error(err instanceof ApiError ? err.message : "Error al cargar registro");
    }
  }
}
