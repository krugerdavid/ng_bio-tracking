import { injectable, inject } from "inversify";
import { Result } from "@core/types/Result";
import type { Member, CreateMemberDTO } from "@domain/member/entities/Member";
import type { MemberRepository } from "@domain/member/MemberRepository";
import { TYPES } from "@core/container/DIContainer";

@injectable()
export class RegisterMemberUseCase {
  constructor(@inject(TYPES.MemberRepository) private memberRepository: MemberRepository) {}

  async execute(data: CreateMemberDTO): Promise<Result<Member>> {
    // Validate email uniqueness
    const existingMembersResult = await this.memberRepository.findAll();
    if (existingMembersResult.isError()) {
      return Result.error(existingMembersResult.getError());
    }

    const existingMembers = existingMembersResult.getValue();
    const emailExists = existingMembers.some(m => m.email === data.email);

    if (emailExists) {
      return Result.error("Email already registered");
    }

    return await this.memberRepository.create(data);
  }
}
