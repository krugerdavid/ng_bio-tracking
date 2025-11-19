import { MockMemberRepository } from '../../infrastructure/repositories/MockMemberRepository';
import { MockBioimpedanceRepository } from '../../infrastructure/repositories/MockBioimpedanceRepository';
import { RegisterMemberUseCase } from '../use-cases/RegisterMemberUseCase';
import { ListMembersUseCase } from '../use-cases/ListMembersUseCase';
import { GetMemberDetailsUseCase } from '../use-cases/GetMemberDetailsUseCase';
import { RecordBioimpedanceUseCase } from '../use-cases/RecordBioimpedanceUseCase';

// Repository instances (singleton pattern)
const memberRepository = new MockMemberRepository();
const bioimpedanceRepository = new MockBioimpedanceRepository();

// Use case instances
export const registerMemberUseCase = new RegisterMemberUseCase(memberRepository);
export const listMembersUseCase = new ListMembersUseCase(memberRepository);
export const getMemberDetailsUseCase = new GetMemberDetailsUseCase(
    memberRepository,
    bioimpedanceRepository
);
export const recordBioimpedanceUseCase = new RecordBioimpedanceUseCase(
    bioimpedanceRepository,
    memberRepository
);
