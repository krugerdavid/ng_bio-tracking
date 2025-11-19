import type { Bioimpedance, CreateBioimpedanceDTO } from '../entities/Bioimpedance';

export interface IBioimpedanceRepository {
    create(data: CreateBioimpedanceDTO): Promise<Bioimpedance>;
    findById(id: string): Promise<Bioimpedance | null>;
    findByMemberId(memberId: string): Promise<Bioimpedance[]>;
    delete(id: string): Promise<void>;
}
