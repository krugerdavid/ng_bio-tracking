import { injectable, inject } from "inversify";
import { Result } from "@core/types/Result";
import type { Member } from "@domain/member/entities/Member";
import type { Bioimpedance } from "@domain/bioimpedance/entities/Bioimpedance";
import type { MemberRepository } from "@domain/member/MemberRepository";
import type { BioimpedanceRepository } from "@domain/bioimpedance/BioimpedanceRepository";
import { TYPES } from "@core/container/DIContainer";

export interface MemberDetails {
  member: Member;
  bioimpedances: Bioimpedance[];
}

@injectable()
export class GetMemberDetailsUseCase {
  constructor(
    @inject(TYPES.MemberRepository) private memberRepository: MemberRepository,
    @inject(TYPES.BioimpedanceRepository) private bioimpedanceRepository: BioimpedanceRepository
  ) {}

  async execute(memberId: string): Promise<Result<MemberDetails>> {
    const [memberResult, bioimpedancesResult] = await Promise.all([
      this.memberRepository.findById(memberId),
      this.bioimpedanceRepository.findByMemberId(memberId),
    ]);

    if (memberResult.isError()) {
      return Result.error(memberResult.getError());
    }

    const member = memberResult.getValue();
    if (!member) {
      return Result.error(`Member with id ${memberId} not found`);
    }

    if (bioimpedancesResult.isError()) {
      return Result.error(bioimpedancesResult.getError());
    }

    const bioimpedances = bioimpedancesResult.getValue();

    return Result.success({
      member,
      bioimpedances,
    });
  }
}
