export class Member {
  constructor(
    public id: string,
    public userId: string,
    public name: string,
    public email: string,
    public dateOfBirth: Date,
    public gender: "male" | "female" | "other",
    public createdAt: Date,
    public updatedAt: Date
  ) {}

  get age(): number {
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

export type CreateMemberDTO = Omit<Member, "id" | "createdAt" | "updatedAt" | "age">;
export type UpdateMemberDTO = Partial<Omit<CreateMemberDTO, "userId">>;
