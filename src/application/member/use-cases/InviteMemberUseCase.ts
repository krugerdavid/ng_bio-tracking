import { injectable, inject } from "inversify";
import { Result } from "@core/types/Result";
import type { MemberRepository } from "@domain/member/MemberRepository";
import type { Member } from "@domain/member/entities/Member";
import { TYPES } from "@core/container/DIContainer";

@injectable()
export class InviteMemberUseCase {
  constructor(@inject(TYPES.MemberRepository) private memberRepository: MemberRepository) {}

  async execute(memberId: string, email?: string): Promise<Result<{ member: Member; message: string }>> {
    if (!memberId) {
      return Result.error("Member ID is required");
    }
    return this.memberRepository.invite(memberId, email);
  }
}
