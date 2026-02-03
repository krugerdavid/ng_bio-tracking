import type { Result } from "@core/types/Result";
import type { Bioimpedance, CreateBioimpedanceDTO, UpdateBioimpedanceDTO } from "./entities/Bioimpedance";

export interface BioimpedanceRepository {
  create(data: CreateBioimpedanceDTO): Promise<Result<Bioimpedance>>;
  findById(id: string): Promise<Result<Bioimpedance | null>>;
  findByMemberId(memberId: string): Promise<Result<Bioimpedance[]>>;
  update(id: string, data: UpdateBioimpedanceDTO): Promise<Result<Bioimpedance>>;
  delete(id: string): Promise<Result<void>>;
}
