import { injectable, inject } from "inversify";
import { Result } from "@core/types/Result";
import type { MemberRepository } from "@domain/member/MemberRepository";
import type { Member } from "@domain/member/entities/Member";
import { TYPES } from "@core/container/DIContainer";

@injectable()
export class ListMembersUseCase {
  constructor(@inject(TYPES.MemberRepository) private memberRepository: MemberRepository) {}

  async execute(): Promise<Result<Member[]>> {
    return await this.memberRepository.findAll();
  }
}
