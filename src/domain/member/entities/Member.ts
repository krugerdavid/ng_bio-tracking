export class Member {
  constructor(
    public id: string,
    public name: string,
    public documentNumber: string,
    public email: string | undefined,
    public dateOfBirth: Date | undefined,
    public gender: "male" | "female" | "other" | undefined,
    public createdAt: Date,
    public updatedAt: Date,
    public userId?: string
  ) {}

  get age(): number {
    if (!this.dateOfBirth) return 0;
    const today = new Date();
    const birthDate = new Date(this.dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }
}

export type CreateMemberDTO = Omit<Member, "id" | "createdAt" | "updatedAt" | "age" | "userId">;
export type UpdateMemberDTO = Partial<CreateMemberDTO>;
