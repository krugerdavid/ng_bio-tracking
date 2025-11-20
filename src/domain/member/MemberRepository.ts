import type { Member, CreateMemberDTO, UpdateMemberDTO } from './entities/Member';

export interface MemberRepository {
    create(data: CreateMemberDTO): Promise<Member>;
    findById(id: string): Promise<Member | null>;
    findAll(): Promise<Member[]>;
    update(id: string, data: UpdateMemberDTO): Promise<Member>;
    delete(id: string): Promise<void>;
}

