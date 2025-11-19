import { MockMemberRepository } from '../../infrastructure/repositories/MockMemberRepository';
import { MockBioimpedanceRepository } from '../../infrastructure/repositories/MockBioimpedanceRepository';
import { SupabaseMemberRepository } from '../../infrastructure/repositories/SupabaseMemberRepository';
import { SupabaseBioimpedanceRepository } from '../../infrastructure/repositories/SupabaseBioimpedanceRepository';
import { RegisterMemberUseCase } from '../use-cases/RegisterMemberUseCase';
import { ListMembersUseCase } from '../use-cases/ListMembersUseCase';
import { GetMemberDetailsUseCase } from '../use-cases/GetMemberDetailsUseCase';
import { RecordBioimpedanceUseCase } from '../use-cases/RecordBioimpedanceUseCase';

// Determinar qué repositorio usar según variable de entorno
const USE_SUPABASE = import.meta.env.VITE_USE_SUPABASE === 'true';

// Repository instances
const memberRepository = USE_SUPABASE
    ? new SupabaseMemberRepository()
    : new MockMemberRepository();

const bioimpedanceRepository = USE_SUPABASE
    ? new SupabaseBioimpedanceRepository()
    : new MockBioimpedanceRepository();

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
