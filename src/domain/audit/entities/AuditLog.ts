export interface AuditLog {
  id: number;
  event: string;
  auditableType: string;
  auditableId: string;
  oldValues: Record<string, unknown> | null;
  newValues: Record<string, unknown> | null;
  causerName: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  url: string | null;
  method: string | null;
  createdAt: Date;
}

export interface ListAuditLogsParams {
  page?: number;
  pageSize?: number;
  auditableType?: string;
  event?: string;
  from?: string;
  to?: string;
}

export interface ListAuditLogsResult {
  logs: AuditLog[];
  total: number;
  currentPage: number;
  lastPage: number;
}
