export interface Member {
    id: string;
    userId: string;
    name: string;
    email: string;
    dateOfBirth: Date;
    gender: 'male' | 'female' | 'other';
    createdAt: Date;
    updatedAt: Date;
}

export type CreateMemberDTO = Omit<Member, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateMemberDTO = Partial<Omit<CreateMemberDTO, 'userId'>>;

