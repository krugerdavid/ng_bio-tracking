import type { Result } from "@core/types/Result";
import type { Member, CreateMemberDTO, UpdateMemberDTO } from "./entities/Member";

/** Debt summary from API: includes credit_balance and total_debt_after_credit. */
export interface DebtSummary {
  monthlyFee: number;
  owedMonths: string[];
  totalDebt: number;
  creditBalance: number;
  totalDebtAfterCredit: number;
}

export interface NeverLoggedInMember {
  id: string;
  name: string;
  email?: string;
  trainingGroup?: string;
}

export interface EngagementSummary {
  neverLoggedInCount: number;
  neverLoggedIn: NeverLoggedInMember[];
}

export interface MemberRepository {
  create(data: CreateMemberDTO): Promise<Result<Member>>;
  findById(id: string): Promise<Result<Member | null>>;
  findAll(options?: {
    page?: number;
    limit?: number;
    search?: string;
    trainingGroup?: string;
    status?: "pending" | "active";
  }): Promise<Result<{ members: Member[]; total: number }>>;
  findLatest(limit: number): Promise<Result<Member[]>>;
  update(id: string, data: UpdateMemberDTO): Promise<Result<Member>>;
  delete(id: string): Promise<Result<void>>;
  getDebtSummary(memberId: string): Promise<Result<DebtSummary | null>>;
  getDebtSummaries(memberIds: string[]): Promise<Result<Map<string, DebtSummary>>>;
  /** Invite or resend app access email. Pass email when member has none. */
  invite(id: string, email?: string): Promise<Result<{ member: Member; message: string }>>;
  /** Approve a pending self-registration: activates the linked user account. */
  approve(id: string): Promise<Result<{ member: Member; message: string }>>;
  getEngagementSummary(): Promise<Result<EngagementSummary>>;
}
