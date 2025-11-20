import { injectable, inject } from 'inversify';
import type { Member, CreateMemberDTO } from '@domain/member/entities/Member';
import type { MemberRepository } from '@domain/member/MemberRepository';
import { TYPES } from '@core/container/DIContainer';

@injectable()
export class RegisterMemberUseCase {
    constructor(
        @inject(TYPES.MemberRepository) private memberRepository: MemberRepository
    ) {}

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

