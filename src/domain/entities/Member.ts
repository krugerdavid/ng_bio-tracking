export interface Member {
    id: string;
    name: string;
    email: string;
    dateOfBirth: Date;
    gender: 'male' | 'female' | 'other';
    createdAt: Date;
    updatedAt: Date;
}

export type CreateMemberDTO = Omit<Member, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateMemberDTO = Partial<CreateMemberDTO>;
