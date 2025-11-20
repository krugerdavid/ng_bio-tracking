import { injectable, inject } from "inversify";
import { Result } from "@core/types/Result";
import type { Bioimpedance, CreateBioimpedanceDTO } from "@domain/bioimpedance/entities/Bioimpedance";
import type { BioimpedanceRepository } from "@domain/bioimpedance/BioimpedanceRepository";
import type { MemberRepository } from "@domain/member/MemberRepository";
import { TYPES } from "@core/container/DIContainer";

@injectable()
export class RecordBioimpedanceUseCase {
  constructor(
    @inject(TYPES.BioimpedanceRepository) private bioimpedanceRepository: BioimpedanceRepository,
    @inject(TYPES.MemberRepository) private memberRepository: MemberRepository
  ) {}

  async execute(data: CreateBioimpedanceDTO): Promise<Result<Bioimpedance>> {
    // Verify member exists
    const memberResult = await this.memberRepository.findById(data.memberId);
    if (memberResult.isError()) {
      return Result.error(memberResult.getError());
    }

    const member = memberResult.getValue();
    if (!member) {
      return Result.error(`Member with id ${data.memberId} not found`);
    }

    return await this.bioimpedanceRepository.create(data);
  }
}
