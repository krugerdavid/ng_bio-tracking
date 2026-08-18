import { injectable, inject } from "inversify";
import { Result } from "@core/types/Result";
import type { MemberRepository } from "@domain/member/MemberRepository";
import type { MembershipPlanRepository } from "@domain/payment/MembershipPlanRepository";
import type { PaymentRepository } from "@domain/payment/PaymentRepository";
import { TYPES } from "@core/container/DIContainer";
import type {
  DashboardResult,
  DashboardLastMember,
  DashboardLastPayment,
  DashboardMemberByFrequency,
  DashboardPendingApproval,
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
    const [membersResult, lastMembersResult, lastPaymentsResult, pendingApprovalsResult, revenueResult] =
      await Promise.all([
        this.memberRepository.findAll({ page: 1, limit: DASHBOARD_PAGE_SIZE }),
        this.memberRepository.findLatest(10),
        this.paymentRepository.findLatest(10),
        this.memberRepository.findAll({ page: 1, limit: 50, status: "pending" }),
        this.paymentRepository.getRevenueSummary(),
      ]);

    if (membersResult.isError()) {
      return Result.error(membersResult.getError());
    }

    const { members, total: totalMembers } = membersResult.getValue();
    const memberIds = members.map(m => m.id);

    // Fetch all plans and debt summaries in parallel
    const [plansResult, debtsResult] = await Promise.all([
      this.membershipPlanRepository.findAllByMemberIds(memberIds),
      this.memberRepository.getDebtSummaries(memberIds),
    ]);

    const allPlans = plansResult.isSuccess() ? plansResult.getValue() : [];
    const debtsMap = debtsResult.isSuccess() ? debtsResult.getValue() : new Map();

    const plansMap = new Map(allPlans.map(p => [p.memberId, p]));

    let inArrearsCount = 0;
    let totalAmountInArrears = 0;
    const frequencyCounts = new Map<string, number>();

    for (const member of members) {
      const plan = plansMap.get(member.id);
      const debt = debtsMap.get(member.id);

      if (plan?.isActive) {
        const label = `${plan.weeklyFrequency}x/semana`;
        frequencyCounts.set(label, (frequencyCounts.get(label) ?? 0) + 1);
      } else {
        const label = "N/A";
        frequencyCounts.set(label, (frequencyCounts.get(label) ?? 0) + 1);
      }

      // Use backend debt summary (considers credit_balance)
      if (debt && debt.totalDebtAfterCredit > 0) {
        inArrearsCount += 1;
        totalAmountInArrears += debt.totalDebtAfterCredit;
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

    const pendingApprovals: DashboardPendingApproval[] = pendingApprovalsResult.isSuccess()
      ? pendingApprovalsResult.getValue().members.map(m => ({
          id: m.id,
          name: m.name,
          email: m.email ?? "",
          trainingGroup: m.trainingGroup,
          createdAt: m.createdAt,
        }))
      : [];

    const revenueByMonth = revenueResult.isSuccess() ? revenueResult.getValue().monthlyRevenue : [];
    const creditBalanceTotal = revenueResult.isSuccess() ? revenueResult.getValue().creditBalanceTotal : 0;

    return Result.success({
      totalMembers,
      inArrearsCount,
      totalAmountInArrears,
      membersByFrequency,
      lastMembers,
      lastPayments,
      pendingApprovals,
      revenueByMonth,
      creditBalanceTotal,
    });
  }
}
