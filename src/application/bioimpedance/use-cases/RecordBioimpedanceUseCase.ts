import { injectable, inject } from 'inversify';
import type { Bioimpedance, CreateBioimpedanceDTO } from '@domain/bioimpedance/entities/Bioimpedance';
import type { BioimpedanceRepository } from '@domain/bioimpedance/BioimpedanceRepository';
import type { MemberRepository } from '@domain/member/MemberRepository';
import { TYPES } from '@core/container/DIContainer';
import { NotFoundError } from '@core/errors/DomainError';

@injectable()
export class RecordBioimpedanceUseCase {
    constructor(
        @inject(TYPES.BioimpedanceRepository) private bioimpedanceRepository: BioimpedanceRepository,
        @inject(TYPES.MemberRepository) private memberRepository: MemberRepository
    ) {}

    async execute(data: CreateBioimpedanceDTO): Promise<Bioimpedance> {
        // Verify member exists
        const member = await this.memberRepository.findById(data.memberId);
        if (!member) {
            throw new NotFoundError('Member', data.memberId);
        }

        return await this.bioimpedanceRepository.create(data);
    }
}

