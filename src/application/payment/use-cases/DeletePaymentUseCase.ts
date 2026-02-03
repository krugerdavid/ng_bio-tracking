import { injectable, inject } from "inversify";
import { TYPES } from "@core/container/DIContainer";
import { Result } from "@core/types/Result";
import type { PaymentRepository } from "@domain/payment/PaymentRepository";

@injectable()
export class DeletePaymentUseCase {
  constructor(
    @inject(TYPES.PaymentRepository)
    private paymentRepository: PaymentRepository
  ) {}

  async execute(id: string): Promise<Result<void>> {
    // Basic validation
    if (!id) {
      return Result.error("Payment ID is required");
    }

    // Check if payment exists before deletion
    const paymentResult = await this.paymentRepository.findById(id);

    if (paymentResult.isError()) {
      return Result.error(paymentResult.getError());
    }

    const payment = paymentResult.getValue();
    if (!payment) {
      return Result.error("Payment not found");
    }

    // Perform deletion
    return this.paymentRepository.delete(id);
  }
}
