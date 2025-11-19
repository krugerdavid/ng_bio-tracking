import type { CreateMemberDTO, Member } from '../../domain/entities/Member';
import type { IMemberRepository } from '../../domain/repositories/IMemberRepository';

export class RegisterMemberUseCase {
    private memberRepository: IMemberRepository;

    constructor(memberRepository: IMemberRepository) {
        this.memberRepository = memberRepository;
    }

    async execute(data: CreateMemberDTO): Promise<Member> {
        // Validate email uniqueness
        const existingMembers = await this.memberRepository.findAll();
        const emailExists = existingMembers.some(m => m.email === data.email);

        if (emailExists) {
            throw new Error('Email already registered');
        }

        return await this.memberRepository.create(data);
    }
}
