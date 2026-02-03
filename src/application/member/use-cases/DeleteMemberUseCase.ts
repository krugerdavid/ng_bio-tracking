import { injectable, inject } from "inversify";
import { Result } from "@core/types/Result";
import type { MemberRepository } from "@domain/member/MemberRepository";
import { TYPES } from "@core/container/DIContainer";

@injectable()
export class DeleteMemberUseCase {
  constructor(@inject(TYPES.MemberRepository) private memberRepository: MemberRepository) {}

  async execute(id: string): Promise<Result<void>> {
    // Basic validation
    if (!id) {
      return Result.error("Member ID is required");
    }

    // Check if member exists before deletion
    const memberResult = await this.memberRepository.findById(id);

    if (memberResult.isError()) {
      return Result.error(memberResult.getError());
    }

    const member = memberResult.getValue();
    if (!member) {
      return Result.error("Member not found");
    }

    // Perform deletion
    return this.memberRepository.delete(id);
  }
}
