import type { IMemberRepository } from '../../domain/repositories/IMemberRepository';
import type { IBioimpedanceRepository } from '../../domain/repositories/IBioimpedanceRepository';
import type { Member } from '../../domain/entities/Member';
import type { Bioimpedance } from '../../domain/entities/Bioimpedance';

export interface MemberDetails {
    member: Member;
    bioimpedances: Bioimpedance[];
}

export class GetMemberDetailsUseCase {
    private memberRepository: IMemberRepository;
    private bioimpedanceRepository: IBioimpedanceRepository;

    constructor(
        memberRepository: IMemberRepository,
        bioimpedanceRepository: IBioimpedanceRepository
    ) {
        this.memberRepository = memberRepository;
        this.bioimpedanceRepository = bioimpedanceRepository;
    }

    async execute(memberId: string): Promise<MemberDetails> {
        const member = await this.memberRepository.findById(memberId);
        if (!member) {
            throw new Error('Member not found');
        }

        const bioimpedances = await this.bioimpedanceRepository.findByMemberId(memberId);

        return {
            member,
            bioimpedances,
        };
    }
}
