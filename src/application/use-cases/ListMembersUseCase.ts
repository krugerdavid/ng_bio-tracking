import type { IMemberRepository } from '@domain/repositories/IMemberRepository';
import type { Member } from '@domain/entities/Member';

export class ListMembersUseCase {
    private memberRepository: IMemberRepository;

    constructor(memberRepository: IMemberRepository) {
        this.memberRepository = memberRepository;
    }
    async execute(): Promise<Member[]> {
        return await this.memberRepository.findAll();
    }
}
