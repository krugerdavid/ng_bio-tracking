/**
 * DIContainer is a container for the application.
 *
 * It is used to:
 * - inject dependencies into the application
 * - manage the lifecycle of the application
 *
 * Why do we do this?
 * To avoid magic strings, make code more readable, maintainable and testable
 */
import "reflect-metadata";

import { Container } from "inversify";

export const container = new Container();

// Service identifiers
export const TYPES = {
  // Infrastructure Services
  SupabaseClient: Symbol.for("SupabaseClient"),
  SupabaseClientType: Symbol.for("SupabaseClientType"),

  // REST API (Laravel)
  ApiClient: Symbol.for("ApiClient"),
  HttpClient: Symbol.for("HttpClient"),

  // Repositories
  MemberRepository: Symbol.for("MemberRepository"),
  BioimpedanceRepository: Symbol.for("BioimpedanceRepository"),
  AuthRepository: Symbol.for("AuthRepository"),
  UserProfileRepository: Symbol.for("UserProfileRepository"),
  PaymentRepository: Symbol.for("PaymentRepository"),
  MembershipPlanRepository: Symbol.for("MembershipPlanRepository"),

  // Domain Services
  MemberDomainService: Symbol.for("MemberDomainService"),
  BioimpedanceDomainService: Symbol.for("BioimpedanceDomainService"),
  AuthDomain: Symbol.for("AuthDomain"),
  UserDomain: Symbol.for("UserDomain"),

  // Repositories for Domain Services
  UserRepository: Symbol.for("UserRepository"),

  // Use Cases - Member
  RegisterMemberUseCase: Symbol.for("RegisterMemberUseCase"),
  ListMembersUseCase: Symbol.for("ListMembersUseCase"),
  GetMemberDetailsUseCase: Symbol.for("GetMemberDetailsUseCase"),
  UpdateMemberUseCase: Symbol.for("UpdateMemberUseCase"),
  DeleteMemberUseCase: Symbol.for("DeleteMemberUseCase"),
  InviteMemberUseCase: Symbol.for("InviteMemberUseCase"),

  // Use Cases - Bioimpedance
  RecordBioimpedanceUseCase: Symbol.for("RecordBioimpedanceUseCase"),
  UpdateBioimpedanceUseCase: Symbol.for("UpdateBioimpedanceUseCase"),
  DeleteBioimpedanceUseCase: Symbol.for("DeleteBioimpedanceUseCase"),

  // Use Cases - Auth
  LoginUseCase: Symbol.for("LoginUseCase"),
  LogoutUseCase: Symbol.for("LogoutUseCase"),
  GetCurrentUserUseCase: Symbol.for("GetCurrentUserUseCase"),
  AcceptInviteUseCase: Symbol.for("AcceptInviteUseCase"),
  RegisterUseCase: Symbol.for("RegisterUseCase"),
  ApproveMemberUseCase: Symbol.for("ApproveMemberUseCase"),
  GetMyMemberUseCase: Symbol.for("GetMyMemberUseCase"),

  // Use Cases - Admin
  CreateUserUseCase: Symbol.for("CreateUserUseCase"),
  ListUsersUseCase: Symbol.for("ListUsersUseCase"),
  UpdateUserUseCase: Symbol.for("UpdateUserUseCase"),
  DeleteUserUseCase: Symbol.for("DeleteUserUseCase"),

  // Use Cases - Payment
  RecordPaymentUseCase: Symbol.for("RecordPaymentUseCase"),
  UpdatePaymentUseCase: Symbol.for("UpdatePaymentUseCase"),
  DeletePaymentUseCase: Symbol.for("DeletePaymentUseCase"),
  GetPaymentStatusUseCase: Symbol.for("GetPaymentStatusUseCase"),
  UpdateMembershipPlanUseCase: Symbol.for("UpdateMembershipPlanUseCase"),
  GetMembershipPlanUseCase: Symbol.for("GetMembershipPlanUseCase"),

  // Audit (root only)
  AuditLogRepository: Symbol.for("AuditLogRepository"),
  ListAuditLogsUseCase: Symbol.for("ListAuditLogsUseCase"),

  // Dashboard (admin/root)
  GetDashboardUseCase: Symbol.for("GetDashboardUseCase"),
} as const;
