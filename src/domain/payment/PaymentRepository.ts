import type { Result } from "@core/types/Result";
import type { Payment, CreatePaymentDTO, UpdatePaymentDTO } from "./entities/Payment";

export interface PaymentRepository {
  create(data: CreatePaymentDTO): Promise<Result<Payment>>;
  findById(id: string): Promise<Result<Payment | null>>;
  findByMemberId(memberId: string): Promise<Result<Payment[]>>;
  findByMonth(month: string): Promise<Result<Payment[]>>;
  update(id: string, data: UpdatePaymentDTO): Promise<Result<Payment>>;
  delete(id: string): Promise<Result<void>>;
}
