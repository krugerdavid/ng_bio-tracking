import { injectable, inject } from "inversify";
import { Result } from "@core/types/Result";
import type { Bioimpedance, UpdateBioimpedanceDTO } from "@domain/bioimpedance/entities/Bioimpedance";
import type { BioimpedanceRepository } from "@domain/bioimpedance/BioimpedanceRepository";
import { TYPES } from "@core/container/DIContainer";

@injectable()
export class UpdateBioimpedanceUseCase {
  constructor(@inject(TYPES.BioimpedanceRepository) private bioimpedanceRepository: BioimpedanceRepository) {}

  async execute(id: string, data: UpdateBioimpedanceDTO): Promise<Result<Bioimpedance>> {
    // Basic validation
    if (!id) {
      return Result.error("Bioimpedance ID is required");
    }

    // Check if bioimpedance exists
    const bioimpedanceResult = await this.bioimpedanceRepository.findById(id);

    if (bioimpedanceResult.isError()) {
      return Result.error(bioimpedanceResult.getError());
    }

    const bioimpedance = bioimpedanceResult.getValue();
    if (!bioimpedance) {
      return Result.error("Bioimpedance record not found");
    }

    // Perform update
    return this.bioimpedanceRepository.update(id, data);
  }
}
