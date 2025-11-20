import type { Payment, PaymentStatus } from "./entities/Payment";
import type { MembershipPlan } from "./entities/MembershipPlan";

export class PaymentDomainService {
  /**
   * Determines the payment status based on the current date and payment date
   * Payment is overdue if it's after the 10th of the month and hasn't been paid
   */
  static calculatePaymentStatus(month: string, paymentDate: Date | null): PaymentStatus {
    const now = new Date();
    const [year, monthStr] = month.split("-");
    const monthNumber = parseInt(monthStr, 10);
    const yearNumber = parseInt(year, 10);

    // Date on the 10th of the payment month
    const dueDate = new Date(yearNumber, monthNumber - 1, 10, 23, 59, 59);

    // If payment has been made
    if (paymentDate) {
      return "paid";
    }

    // If we're past the due date and no payment has been made
    if (now > dueDate) {
      return "overdue";
    }

    // Payment is pending but not yet overdue
    return "pending";
  }

  /**
   * Gets all overdue months for a member based on their plan start date
   * Returns array of months in YYYY-MM format that are overdue
   */
  static getOverdueMonths(membershipPlan: MembershipPlan | null, payments: Payment[]): string[] {
    if (!membershipPlan || !membershipPlan.isActive) {
      return [];
    }

    const now = new Date();
    const startDate = new Date(membershipPlan.startDate);
    const overdueMonths: string[] = [];

    // Create a map of paid months for quick lookup
    const paidMonths = new Set(payments.filter(p => p.status === "paid").map(p => p.month));

    // Iterate through all months from start date to current month
    const currentMonth = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
    const currentMonthDate = new Date(now.getFullYear(), now.getMonth(), 1);

    while (currentMonth <= currentMonthDate) {
      const monthStr = this.formatMonth(currentMonth);
      const dueDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 10, 23, 59, 59);

      // If the due date has passed, the month is not paid, and it's not the current month
      if (now > dueDate && !paidMonths.has(monthStr)) {
        overdueMonths.push(monthStr);
      }

      // Move to next month
      currentMonth.setMonth(currentMonth.getMonth() + 1);
    }

    return overdueMonths;
  }

  /**
   * Checks if a specific month is overdue
   */
  static isPaymentOverdue(month: string): boolean {
    const now = new Date();
    const [year, monthStr] = month.split("-");
    const monthNumber = parseInt(monthStr, 10);
    const yearNumber = parseInt(year, 10);

    const dueDate = new Date(yearNumber, monthNumber - 1, 10, 23, 59, 59);
    return now > dueDate;
  }

  /**
   * Formats a date to YYYY-MM string
   */
  static formatMonth(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    return `${year}-${month}`;
  }

  /**
   * Gets the current month in YYYY-MM format
   */
  static getCurrentMonth(): string {
    return this.formatMonth(new Date());
  }

  /**
   * Validates weekly frequency (must be between 1 and 5)
   */
  static validateWeeklyFrequency(frequency: number): boolean {
    return Number.isInteger(frequency) && frequency >= 1 && frequency <= 5;
  }

  /**
   * Validates monthly fee (must be positive)
   */
  static validateMonthlyFee(fee: number): boolean {
    return fee > 0;
  }
}
