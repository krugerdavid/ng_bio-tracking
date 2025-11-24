import { injectable, inject } from "inversify";
import { Result } from "@core/types/Result";
import type { Member, UpdateMemberDTO } from "@domain/member/entities/Member";
import type { MemberRepository } from "@domain/member/MemberRepository";
import { TYPES } from "@core/container/DIContainer";

@injectable()
export class UpdateMemberUseCase {
  constructor(@inject(TYPES.MemberRepository) private memberRepository: MemberRepository) {}

  async execute(id: string, data: UpdateMemberDTO): Promise<Result<Member>> {
    // Basic validation could go here
    if (!id) {
      return Result.error("Member ID is required");
    }

    return this.memberRepository.update(id, data);
  }
}
