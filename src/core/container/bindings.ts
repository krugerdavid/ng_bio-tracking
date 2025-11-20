/**
 * Here we bind the dependencies to the container for the application.
 *
 * We use the `inversify` library to manage the dependencies.
 *
 * We use the singleton scope to ensure that the dependencies are only created once.
 */
import "reflect-metadata";

import { container } from "./DIContainer";
import { TYPES } from "./DIContainer";

// Infrastructure - Supabase Client
import { supabase } from "@infrastructure/supabase/client";

// Repositories
import { MemberRepositoryImpl } from "@infrastructure/member/MemberRepositoryImpl";
import { BioimpedanceRepositoryImpl } from "@infrastructure/bioimpedance/BioimpedanceRepositoryImpl";
import { AuthRepositoryImpl } from "@infrastructure/auth/AuthRepositoryImpl";
import { UserProfileRepositoryImpl } from "@infrastructure/user/UserProfileRepositoryImpl";

// Domain Services
import { MemberDomainService } from "@domain/member/MemberDomainService";
import { BioimpedanceDomainService } from "@domain/bioimpedance/BioimpedanceDomainService";
import { AuthDomain } from "@domain/auth/AuthDomain";
import { UserDomain } from "@domain/user/UserDomain";

// Use Cases - Member
import { RegisterMemberUseCase } from "@application/member/use-cases/RegisterMemberUseCase";
import { ListMembersUseCase } from "@application/member/use-cases/ListMembersUseCase";
import { GetMemberDetailsUseCase } from "@application/member/use-cases/GetMemberDetailsUseCase";

// Use Cases - Bioimpedance
import { RecordBioimpedanceUseCase } from "@application/bioimpedance/use-cases/RecordBioimpedanceUseCase";

// Use Cases - Auth
import { LoginUseCase } from "@application/auth/use-cases/LoginUseCase";
import { LogoutUseCase } from "@application/auth/use-cases/LogoutUseCase";
import { GetCurrentUserUseCase } from "@application/auth/use-cases/GetCurrentUserUseCase";

// Use Cases - Admin
import { CreateUserUseCase } from "@application/admin/use-cases/CreateUserUseCase";
import { ListUsersUseCase } from "@application/admin/use-cases/ListUsersUseCase";
import { DeleteUserUseCase } from "@application/admin/use-cases/DeleteUserUseCase";

// Infrastructure Services
container.bind(TYPES.SupabaseClient).toConstantValue(supabase);

// Repository Implementations
container.bind(TYPES.MemberRepository).to(MemberRepositoryImpl).inSingletonScope();

container.bind(TYPES.BioimpedanceRepository).to(BioimpedanceRepositoryImpl).inSingletonScope();

container.bind(TYPES.AuthRepository).to(AuthRepositoryImpl).inSingletonScope();

container.bind(TYPES.UserProfileRepository).to(UserProfileRepositoryImpl).inSingletonScope();

// Domain Services
container.bind(TYPES.MemberDomainService).to(MemberDomainService).inSingletonScope();

container.bind(TYPES.BioimpedanceDomainService).to(BioimpedanceDomainService).inSingletonScope();

container.bind(TYPES.AuthDomain).to(AuthDomain).inSingletonScope();

container.bind(TYPES.UserDomain).to(UserDomain).inSingletonScope();

// Use Cases - Member
container.bind(TYPES.RegisterMemberUseCase).to(RegisterMemberUseCase).inSingletonScope();

container.bind(TYPES.ListMembersUseCase).to(ListMembersUseCase).inSingletonScope();

container.bind(TYPES.GetMemberDetailsUseCase).to(GetMemberDetailsUseCase).inSingletonScope();

// Use Cases - Bioimpedance
container.bind(TYPES.RecordBioimpedanceUseCase).to(RecordBioimpedanceUseCase).inSingletonScope();

// Use Cases - Auth
container.bind(TYPES.LoginUseCase).to(LoginUseCase).inSingletonScope();

container.bind(TYPES.LogoutUseCase).to(LogoutUseCase).inSingletonScope();

container.bind(TYPES.GetCurrentUserUseCase).to(GetCurrentUserUseCase).inSingletonScope();

// Use Cases - Admin
container.bind(TYPES.CreateUserUseCase).to(CreateUserUseCase).inSingletonScope();

container.bind(TYPES.ListUsersUseCase).to(ListUsersUseCase).inSingletonScope();

container.bind(TYPES.DeleteUserUseCase).to(DeleteUserUseCase).inSingletonScope();

export { container };
