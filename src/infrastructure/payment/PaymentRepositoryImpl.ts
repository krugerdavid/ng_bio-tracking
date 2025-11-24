import { injectable, inject } from "inversify";
import { TYPES } from "@core/container/DIContainer";
import { Result } from "@core/types/Result";
import type { Payment, CreatePaymentDTO, UpdatePaymentDTO } from "@domain/payment/entities/Payment";
import type { PaymentRepository } from "@domain/payment/PaymentRepository";
import type { SupabaseClient } from "@supabase/supabase-js";

@injectable()
export class PaymentRepositoryImpl implements PaymentRepository {
  constructor(@inject(TYPES.SupabaseClient) private supabase: SupabaseClient) {}

  async create(data: CreatePaymentDTO): Promise<Result<Payment>> {
    try {
      const { data: payment, error } = await this.supabase
        .from("payments")
        .insert({
          member_id: data.memberId,
          month: data.month,
          amount: data.amount,
          payment_date: this.formatDate(data.paymentDate),
          status: data.status,
          notes: data.notes,
        })
        .select()
        .single();

      if (error) {
        return Result.error(`Error creating payment: ${error.message}`);
      }

      return Result.success(this.mapToPayment(payment));
    } catch (error) {
      return Result.error(error instanceof Error ? error.message : "Unknown error creating payment");
    }
  }

  async findById(id: string): Promise<Result<Payment | null>> {
    try {
      const { data: payment, error } = await this.supabase.from("payments").select("*").eq("id", id).single();

      if (error) {
        if (error.code === "PGRST116") {
          return Result.success(null);
        }
        return Result.error(`Error finding payment: ${error.message}`);
      }

      return Result.success(payment ? this.mapToPayment(payment) : null);
    } catch (error) {
      return Result.error(error instanceof Error ? error.message : "Unknown error finding payment");
    }
  }

  async findByMemberId(memberId: string): Promise<Result<Payment[]>> {
    try {
      const { data: payments, error } = await this.supabase
        .from("payments")
        .select("*")
        .eq("member_id", memberId)
        .order("month", { ascending: false });
      if (error) {
        return Result.error(`Error fetching payments: ${error.message}`);
      }

      return Result.success(payments.map(p => this.mapToPayment(p)));
    } catch (error) {
      return Result.error(error instanceof Error ? error.message : "Unknown error fetching payments");
    }
  }

  async findAllByMemberIds(memberIds: string[]): Promise<Result<Payment[]>> {
    try {
      if (memberIds.length === 0) {
        return Result.success([]);
      }

      const { data: payments, error } = await this.supabase
        .from("payments")
        .select("*")
        .in("member_id", memberIds)
        .order("month", { ascending: false });

      if (error) {
        return Result.error(`Error fetching payments: ${error.message}`);
      }

      return Result.success(payments.map(p => this.mapToPayment(p)));
    } catch (error) {
      return Result.error(error instanceof Error ? error.message : "Unknown error fetching payments");
    }
  }

  async findByMonth(month: string): Promise<Result<Payment[]>> {
    try {
      const { data: payments, error } = await this.supabase
        .from("payments")
        .select("*")
        .eq("month", month)
        .order("created_at", { ascending: false });

      if (error) {
        return Result.error(`Error fetching payments by month: ${error.message}`);
      }

      return Result.success(payments.map(p => this.mapToPayment(p)));
    } catch (error) {
      return Result.error(error instanceof Error ? error.message : "Unknown error fetching payments by month");
    }
  }

  async update(id: string, data: UpdatePaymentDTO): Promise<Result<Payment>> {
    try {
      const updateData: Record<string, unknown> = {};
      if (data.amount !== undefined) updateData.amount = data.amount;
      if (data.paymentDate !== undefined) updateData.payment_date = this.formatDate(data.paymentDate);
      if (data.status !== undefined) updateData.status = data.status;
      if (data.notes !== undefined) updateData.notes = data.notes;

      const { data: payment, error } = await this.supabase
        .from("payments")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        return Result.error(`Error updating payment: ${error.message}`);
      }

      return Result.success(this.mapToPayment(payment));
    } catch (error) {
      return Result.error(error instanceof Error ? error.message : "Unknown error updating payment");
    }
  }

  async delete(id: string): Promise<Result<void>> {
    try {
      const { error } = await this.supabase.from("payments").delete().eq("id", id);

      if (error) {
        return Result.error(`Error deleting payment: ${error.message}`);
      }

      return Result.success(undefined);
    } catch (error) {
      return Result.error(error instanceof Error ? error.message : "Unknown error deleting payment");
    }
  }

  private mapToPayment(data: {
    id: string;
    member_id: string;
    month: string;
    amount: number | string;
    payment_date: string;
    status: string;
    notes: string | null;
    created_at: string;
    updated_at: string;
  }): Payment {
    return {
      id: data.id,
      memberId: data.member_id,
      month: data.month,
      amount: parseFloat(String(data.amount)),
      paymentDate: this.parseDateString(data.payment_date),
      status: data.status as "paid" | "pending" | "overdue",
      notes: data.notes ?? undefined,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }

  private parseDateString(dateString: string): Date {
    const parts = dateString.split("-");
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      return new Date(year, month, day);
    }
    return new Date(dateString);
  }

  private formatDate(date: Date): string {
    return date.toISOString().split("T")[0];
  }
}
