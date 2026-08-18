export type PaymentStatus = "paid" | "pending" | "overdue";

export interface Payment {
  id: string;
  memberId: string;
  month: string; // formato: YYYY-MM
  amount: number;
  paymentDate: Date;
  status: PaymentStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type CreatePaymentDTO = Omit<Payment, "id" | "createdAt" | "updatedAt">;
export type UpdatePaymentDTO = Partial<Omit<CreatePaymentDTO, "memberId">>;
