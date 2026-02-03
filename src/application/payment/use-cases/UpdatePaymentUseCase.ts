import { injectable, inject } from "inversify";
import { TYPES } from "@core/container/DIContainer";
import { Result } from "@core/types/Result";
import type { PaymentRepository } from "@domain/payment/PaymentRepository";
import type { Payment, UpdatePaymentDTO } from "@domain/payment/entities/Payment";

@injectable()
export class UpdatePaymentUseCase {
  constructor(
    @inject(TYPES.PaymentRepository)
    private paymentRepository: PaymentRepository
  ) {}

  async execute(id: string, data: UpdatePaymentDTO): Promise<Result<Payment>> {
    // Basic validation
    if (!id) {
      return Result.error("Payment ID is required");
    }

    // Check if payment exists
    const paymentResult = await this.paymentRepository.findById(id);

    if (paymentResult.isError()) {
      return Result.error(paymentResult.getError());
    }

    const payment = paymentResult.getValue();
    if (!payment) {
      return Result.error("Payment not found");
    }

    // Validate amount if provided
    if (data.amount !== undefined && data.amount <= 0) {
      return Result.error("Payment amount must be greater than 0");
    }

    // Validate status if provided
    if (data.status !== undefined && !["paid", "pending", "overdue"].includes(data.status)) {
      return Result.error("Invalid payment status");
    }

    // Perform update
    return this.paymentRepository.update(id, data);
  }
}
