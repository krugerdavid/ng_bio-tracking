import { injectable, inject } from "inversify";
import { Result } from "@core/types/Result";
import type { MemberRepository } from "@domain/member/MemberRepository";
import type { MembershipPlanRepository } from "@domain/payment/MembershipPlanRepository";
import type { PaymentRepository } from "@domain/payment/PaymentRepository";
import { PaymentDomainService } from "@domain/payment/PaymentDomainService";
import { TYPES } from "@core/container/DIContainer";
import type {
  DashboardResult,
  DashboardLastMember,
  DashboardLastPayment,
  DashboardMemberByFrequency,
} from "../dtos/DashboardDTO";

const DASHBOARD_PAGE_SIZE = 5000;

@injectable()
export class GetDashboardUseCase {
  constructor(
    @inject(TYPES.MemberRepository) private memberRepository: MemberRepository,
    @inject(TYPES.MembershipPlanRepository) private membershipPlanRepository: MembershipPlanRepository,
    @inject(TYPES.PaymentRepository) private paymentRepository: PaymentRepository
  ) {}

  async execute(): Promise<Result<DashboardResult>> {
    const [membersResult, lastMembersResult, lastPaymentsResult] = await Promise.all([
      this.memberRepository.findAll({ page: 1, limit: DASHBOARD_PAGE_SIZE }),
      this.memberRepository.findLatest(10),
      this.paymentRepository.findLatest(10),
    ]);

    if (membersResult.isError()) {
      return Result.error(membersResult.getError());
    }

    const { members, total: totalMembers } = membersResult.getValue();
    const memberIds = members.map(m => m.id);

    const [plansResult, paymentsResult] = await Promise.all([
      this.membershipPlanRepository.findAllByMemberIds(memberIds),
      this.paymentRepository.findAllByMemberIds(memberIds),
    ]);

    const allPlans = plansResult.isSuccess() ? plansResult.getValue() : [];
    const allPayments = paymentsResult.isSuccess() ? paymentsResult.getValue() : [];

    const plansMap = new Map(allPlans.map(p => [p.memberId, p]));
    const paymentsMap = new Map<string, typeof allPayments>();
    allPayments.forEach(p => {
      if (!paymentsMap.has(p.memberId)) paymentsMap.set(p.memberId, []);
      paymentsMap.get(p.memberId)!.push(p);
    });

    let inArrearsCount = 0;
    let totalAmountInArrears = 0;
    const frequencyCounts = new Map<string, number>();

    for (const member of members) {
      const plan = plansMap.get(member.id);
      const payments = paymentsMap.get(member.id) ?? [];
      const overdueMonths = PaymentDomainService.getOverdueMonths(plan ?? null, payments);

      if (plan?.isActive) {
        const label = `${plan.weeklyFrequency}x/semana`;
        frequencyCounts.set(label, (frequencyCounts.get(label) ?? 0) + 1);
      } else {
        const label = "N/A";
        frequencyCounts.set(label, (frequencyCounts.get(label) ?? 0) + 1);
      }

      if (overdueMonths.length > 0 && plan) {
        inArrearsCount += 1;
        totalAmountInArrears += overdueMonths.length * plan.monthlyFee;
      }
    }

    const membersByFrequency: DashboardMemberByFrequency[] = Array.from(frequencyCounts.entries())
      .map(([frequency, count]) => ({ frequency, count }))
      .sort((a, b) => {
        if (a.frequency === "N/A") return 1;
        if (b.frequency === "N/A") return -1;
        return a.frequency.localeCompare(b.frequency);
      });

    const lastMembers: DashboardLastMember[] = lastMembersResult.isSuccess()
      ? lastMembersResult.getValue().map(m => ({
          id: m.id,
          name: m.name,
          documentNumber: m.documentNumber,
          createdAt: m.createdAt,
        }))
      : [];

    let lastPayments: DashboardLastPayment[] = [];
    if (lastPaymentsResult.isSuccess()) {
      const payments = lastPaymentsResult.getValue();
      const uniqueMemberIds = [...new Set(payments.map(p => p.memberId))];
      const memberResults = await Promise.all(uniqueMemberIds.map(id => this.memberRepository.findById(id)));
      const memberNames = new Map<string, string>();
      uniqueMemberIds.forEach((id, i) => {
        const r = memberResults[i];
        if (r?.isSuccess() && r.getValue()) memberNames.set(id, r.getValue()!.name);
      });
      lastPayments = payments.map(p => ({
        id: p.id,
        memberId: p.memberId,
        memberName: memberNames.get(p.memberId) ?? "—",
        amount: p.amount,
        month: p.month,
        paymentDate: p.paymentDate,
        createdAt: p.createdAt,
      }));
    }

    return Result.success({
      totalMembers,
      inArrearsCount,
      totalAmountInArrears,
      membersByFrequency,
      lastMembers,
      lastPayments,
    });
  }
}
