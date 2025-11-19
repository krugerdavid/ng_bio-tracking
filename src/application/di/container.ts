import { MockMemberRepository } from '../../infrastructure/repositories/MockMemberRepository';
import { MockBioimpedanceRepository } from '../../infrastructure/repositories/MockBioimpedanceRepository';
import { SupabaseMemberRepository } from '../../infrastructure/repositories/SupabaseMemberRepository';
import { SupabaseBioimpedanceRepository } from '../../infrastructure/repositories/SupabaseBioimpedanceRepository';
import { SupabaseAuthRepository } from '../../infrastructure/repositories/SupabaseAuthRepository';
import { SupabaseUserProfileRepository } from '../../infrastructure/repositories/SupabaseUserProfileRepository';
import { RegisterMemberUseCase } from '../use-cases/RegisterMemberUseCase';
import { ListMembersUseCase } from '../use-cases/ListMembersUseCase';
import { GetMemberDetailsUseCase } from '../use-cases/GetMemberDetailsUseCase';
import { RecordBioimpedanceUseCase } from '../use-cases/RecordBioimpedanceUseCase';
import { LoginUseCase } from '../use-cases/auth/LoginUseCase';
import { LogoutUseCase } from '../use-cases/auth/LogoutUseCase';
import { GetCurrentUserUseCase } from '../use-cases/auth/GetCurrentUserUseCase';
import { CreateUserUseCase } from '../use-cases/admin/CreateUserUseCase';
import { ListUsersUseCase } from '../use-cases/admin/ListUsersUseCase';
import { DeleteUserUseCase } from '../use-cases/admin/DeleteUserUseCase';

// Determinar qué repositorio usar según variable de entorno
const USE_SUPABASE = import.meta.env.VITE_USE_SUPABASE === 'true';

// Repository instances
const memberRepository = USE_SUPABASE
    ? new SupabaseMemberRepository()
    : new MockMemberRepository();

const bioimpedanceRepository = USE_SUPABASE
    ? new SupabaseBioimpedanceRepository()
    : new MockBioimpedanceRepository();

const authRepository = new SupabaseAuthRepository();
const userProfileRepository = new SupabaseUserProfileRepository();

// Member use case instances
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

// Auth use case instances
export const loginUseCase = new LoginUseCase(authRepository);
export const logoutUseCase = new LogoutUseCase(authRepository);
export const getCurrentUserUseCase = new GetCurrentUserUseCase(authRepository);

// Admin use case instances
export const createUserUseCase = new CreateUserUseCase(userProfileRepository);
export const listUsersUseCase = new ListUsersUseCase(userProfileRepository);
export const deleteUserUseCase = new DeleteUserUseCase(userProfileRepository);

