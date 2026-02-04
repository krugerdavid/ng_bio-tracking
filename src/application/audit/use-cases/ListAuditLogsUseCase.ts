import { injectable, inject } from "inversify";
import { Result } from "@core/types/Result";
import type { AuditLogRepository } from "@domain/audit/AuditLogRepository";
import type { ListAuditLogsParams, ListAuditLogsResult } from "@domain/audit/entities/AuditLog";
import { TYPES } from "@core/container/DIContainer";

@injectable()
export class ListAuditLogsUseCase {
  constructor(@inject(TYPES.AuditLogRepository) private auditLogRepository: AuditLogRepository) {}

  async execute(params?: ListAuditLogsParams): Promise<Result<ListAuditLogsResult>> {
    return this.auditLogRepository.list(params);
  }
}
