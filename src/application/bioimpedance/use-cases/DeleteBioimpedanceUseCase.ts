import { injectable, inject } from "inversify";
import { Result } from "@core/types/Result";
import type { BioimpedanceRepository } from "@domain/bioimpedance/BioimpedanceRepository";
import { TYPES } from "@core/container/DIContainer";

@injectable()
export class DeleteBioimpedanceUseCase {
  constructor(@inject(TYPES.BioimpedanceRepository) private bioimpedanceRepository: BioimpedanceRepository) {}

  async execute(id: string): Promise<Result<void>> {
    // Basic validation
    if (!id) {
      return Result.error("Bioimpedance ID is required");
    }

    // Check if bioimpedance exists before deletion
    const bioimpedanceResult = await this.bioimpedanceRepository.findById(id);

    if (bioimpedanceResult.isError()) {
      return Result.error(bioimpedanceResult.getError());
    }

    const bioimpedance = bioimpedanceResult.getValue();
    if (!bioimpedance) {
      return Result.error("Bioimpedance record not found");
    }

    // Perform deletion
    return this.bioimpedanceRepository.delete(id);
  }
}
