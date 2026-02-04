import type { Result } from "@core/types/Result";
import type { Member, CreateMemberDTO, UpdateMemberDTO } from "./entities/Member";

export interface MemberRepository {
  create(data: CreateMemberDTO): Promise<Result<Member>>;
  findById(id: string): Promise<Result<Member | null>>;
  findAll(options?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<Result<{ members: Member[]; total: number }>>;
  findLatest(limit: number): Promise<Result<Member[]>>;
  update(id: string, data: UpdateMemberDTO): Promise<Result<Member>>;
  delete(id: string): Promise<Result<void>>;
}
