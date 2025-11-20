import { injectable, inject } from 'inversify';
import type { Member } from '@domain/member/entities/Member';
import type { Bioimpedance } from '@domain/bioimpedance/entities/Bioimpedance';
import type { MemberRepository } from '@domain/member/MemberRepository';
import type { BioimpedanceRepository } from '@domain/bioimpedance/BioimpedanceRepository';
import { TYPES } from '@core/container/DIContainer';
import { NotFoundError } from '@core/errors/DomainError';

export interface MemberDetails {
    member: Member;
    bioimpedances: Bioimpedance[];
}

@injectable()
export class GetMemberDetailsUseCase {
    constructor(
        @inject(TYPES.MemberRepository) private memberRepository: MemberRepository,
        @inject(TYPES.BioimpedanceRepository) private bioimpedanceRepository: BioimpedanceRepository
    ) {}

    async execute(memberId: string): Promise<MemberDetails> {
        const member = await this.memberRepository.findById(memberId);
        if (!member) {
            throw new NotFoundError('Member', memberId);
        }

        const bioimpedances = await this.bioimpedanceRepository.findByMemberId(memberId);

        return {
            member,
            bioimpedances,
        };
    }
}

