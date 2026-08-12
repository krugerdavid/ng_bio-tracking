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

export interface MemberRepository {
  create(data: CreateMemberDTO): Promise<Result<Member>>;
  findById(id: string): Promise<Result<Member | null>>;
  findAll(options?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<Result<{ members: Member[]; total: number }>>;
  findLatest(limit: number): Promise<Result<Member[]>>;
  update(id: string, data: UpdateMemberDTO): Promise<Result<Member>>;
  delete(id: string): Promise<Result<void>>;
  getDebtSummary(memberId: string): Promise<Result<DebtSummary | null>>;
  getDebtSummaries(memberIds: string[]): Promise<Result<Map<string, DebtSummary>>>;
  /** Invite or resend app access email. Pass email when member has none. */
  invite(id: string, email?: string): Promise<Result<{ member: Member; message: string }>>;
}
