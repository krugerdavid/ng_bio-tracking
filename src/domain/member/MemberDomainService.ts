import type { Member } from "./entities/Member";

/**
 * Domain service for Member business logic
 */
export class MemberDomainService {
  /**
   * Calculate age from date of birth
   */
  calculateAge(dateOfBirth: Date): number {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  }

  /**
   * Validate if member age is within acceptable range
   */
  validateAge(dateOfBirth: Date): boolean {
    const age = this.calculateAge(dateOfBirth);
    return age >= 0 && age <= 150; // Reasonable age range
  }

  /**
   * Validate email format
   */
  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate member data
   */
  validateMember(member: Partial<Member>): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (member.name && member.name.trim().length < 2) {
      errors.push("Name must be at least 2 characters long");
    }

    if (member.email && !this.validateEmail(member.email)) {
      errors.push("Invalid email format");
    }

    if (member.dateOfBirth && !this.validateAge(member.dateOfBirth)) {
      errors.push("Invalid date of birth");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
