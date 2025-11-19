import type { CreateBioimpedanceDTO, Bioimpedance } from '../../domain/entities/Bioimpedance';
import type { IBioimpedanceRepository } from '../../domain/repositories/IBioimpedanceRepository';
import type { IMemberRepository } from '../../domain/repositories/IMemberRepository';

export class RecordBioimpedanceUseCase {
    private bioimpedanceRepository: IBioimpedanceRepository;
    private memberRepository: IMemberRepository;

    constructor(
        bioimpedanceRepository: IBioimpedanceRepository,
        memberRepository: IMemberRepository
    ) {
        this.bioimpedanceRepository = bioimpedanceRepository;
        this.memberRepository = memberRepository;
    }

    async execute(data: CreateBioimpedanceDTO): Promise<Bioimpedance> {
        // Verify member exists
        const member = await this.memberRepository.findById(data.memberId);
        if (!member) {
            throw new Error('Member not found');
        }

        return await this.bioimpedanceRepository.create(data);
    }
}
