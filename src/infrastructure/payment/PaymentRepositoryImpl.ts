import { injectable, inject } from "inversify";
import { TYPES } from "@core/container/DIContainer";
import { Result } from "@core/types/Result";
import type { Payment, CreatePaymentDTO, UpdatePaymentDTO } from "@domain/payment/entities/Payment";
import type { PaymentRepository } from "@domain/payment/PaymentRepository";
import type { HttpClient } from "@infrastructure/api/HttpClient";
import { ApiError } from "@infrastructure/api/types";

interface PaymentApi {
  id: string;
  member_id: string;
  month: string;
  amount: number;
  payment_date: string;
  status: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

function mapPaymentApiToEntity(api: PaymentApi): Payment {
  return {
    id: api.id,
    memberId: api.member_id,
    month: api.month,
    amount: Number(api.amount),
    paymentDate: parseDate(api.payment_date),
    status: api.status as "paid" | "pending" | "overdue",
    notes: api.notes ?? undefined,
    createdAt: new Date(api.created_at),
    updatedAt: new Date(api.updated_at),
  };
}

function parseDate(dateString: string): Date {
  const parts = dateString.split("-");
  if (parts.length >= 2) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parts[2] ? parseInt(parts[2], 10) : 1;
    return new Date(year, month, day);
  }
  return new Date(dateString);
}

function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

@injectable()
export class PaymentRepositoryImpl implements PaymentRepository {
  constructor(@inject(TYPES.HttpClient) private readonly http: HttpClient) {}

  async create(data: CreatePaymentDTO): Promise<Result<Payment>> {
    try {
      const payload = await this.http.post<PaymentApi>("/payments", {
        member_id: data.memberId,
        month: data.month,
        amount: data.amount,
        payment_date: formatDate(data.paymentDate),
        status: data.status,
        notes: data.notes ?? null,
      });
      return Result.success(mapPaymentApiToEntity(payload));
    } catch (err) {
      return Result.error(err instanceof ApiError ? err.message : "Error creating payment");
    }
  }

  async findById(id: string): Promise<Result<Payment | null>> {
    try {
      const payload = await this.http.get<PaymentApi>(`/payments/${id}`);
      return Result.success(mapPaymentApiToEntity(payload));
    } catch (err) {
      if (err instanceof ApiError && err.statusCode === 404) {
        return Result.success(null);
      }
      return Result.error(err instanceof ApiError ? err.message : "Error finding payment");
    }
  }

  async findByMemberId(memberId: string): Promise<Result<Payment[]>> {
    try {
      const payload = await this.http.get<PaymentApi[] | { data: PaymentApi[] }>(`/members/${memberId}/payments`);
      const list = Array.isArray(payload) ? payload : (payload.data ?? []);
      return Result.success(list.map(mapPaymentApiToEntity));
    } catch (err) {
      return Result.error(err instanceof ApiError ? err.message : "Error fetching payments");
    }
  }

  async findAllByMemberIds(memberIds: string[]): Promise<Result<Payment[]>> {
    if (memberIds.length === 0) {
      return Result.success([]);
    }
    const results = await Promise.all(memberIds.map(id => this.findByMemberId(id)));
    const all: Payment[] = [];
    for (const r of results) {
      if (r.isError()) return r;
      all.push(...r.getValue());
    }
    return Result.success(all);
  }

  async findLatest(limit: number): Promise<Result<Payment[]>> {
    try {
      const payload = await this.http.get<PaymentApi[] | { data: PaymentApi[] }>("/payments", {
        page: 1,
        per_page: limit,
      });
      const list = Array.isArray(payload) ? payload : (payload.data ?? []);
      return Result.success(list.slice(0, limit).map(mapPaymentApiToEntity));
    } catch {
      return Result.success([]);
    }
  }

  async findByMonth(month: string): Promise<Result<Payment[]>> {
    void month; // API does not expose global payments by month
    return Result.success([]);
  }

  async update(id: string, data: UpdatePaymentDTO): Promise<Result<Payment>> {
    try {
      const body: Record<string, unknown> = {};
      if (data.amount !== undefined) body.amount = data.amount;
      if (data.paymentDate !== undefined) body.payment_date = formatDate(data.paymentDate);
      if (data.status !== undefined) body.status = data.status;
      if (data.notes !== undefined) body.notes = data.notes;
      const payload = await this.http.put<PaymentApi>(`/payments/${id}`, body);
      return Result.success(mapPaymentApiToEntity(payload));
    } catch (err) {
      return Result.error(err instanceof ApiError ? err.message : "Error updating payment");
    }
  }

  async delete(id: string): Promise<Result<void>> {
    try {
      await this.http.delete(`/payments/${id}`);
      return Result.success(undefined);
    } catch (err) {
      return Result.error(err instanceof ApiError ? err.message : "Error deleting payment");
    }
  }
}
