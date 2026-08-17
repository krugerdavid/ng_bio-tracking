import { injectable, inject } from "inversify";
import { Result } from "@core/types/Result";
import type { MemberDetails } from "./GetMemberDetailsUseCase";
import { GetMemberDetailsUseCase } from "./GetMemberDetailsUseCase";
import { TYPES } from "@core/container/DIContainer";

/**
 * Ficha propia de un usuario con role=member (alumno), a partir de su memberId vinculado.
 */
@injectable()
export class GetMyMemberUseCase {
  constructor(@inject(TYPES.GetMemberDetailsUseCase) private getMemberDetailsUseCase: GetMemberDetailsUseCase) {}

  async execute(memberId: string | undefined): Promise<Result<MemberDetails>> {
    if (!memberId) {
      return Result.error("Tu cuenta todavía no está vinculada a una ficha de alumno.");
    }
    return this.getMemberDetailsUseCase.execute(memberId);
  }
}
