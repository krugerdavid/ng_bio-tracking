import { injectable, inject } from "inversify";
import { TYPES } from "@core/container/DIContainer";
import { Result } from "@core/types/Result";
import type { PaymentRepository } from "@domain/payment/PaymentRepository";
import type { CreatePaymentDTO, Payment } from "@domain/payment/entities/Payment";

@injectable()
export class RecordPaymentUseCase {
  constructor(
    @inject(TYPES.PaymentRepository)
    private paymentRepository: PaymentRepository
  ) {}

  async execute(data: CreatePaymentDTO): Promise<Result<Payment>> {
    try {
      // Validate amount
      if (data.amount <= 0) {
        return Result.error("Payment amount must be greater than 0");
      }

      // Validate month format (YYYY-MM)
      const monthRegex = /^\d{4}-\d{2}$/;
      if (!monthRegex.test(data.month)) {
        return Result.error("Month must be in YYYY-MM format");
      }

      // Create the payment
      const result = await this.paymentRepository.create(data);

      if (result.isError()) {
        return Result.error(result.getError());
      }

      return Result.success(result.getValue());
    } catch (error) {
      return Result.error(error instanceof Error ? error.message : "Unknown error recording payment");
    }
  }
}
