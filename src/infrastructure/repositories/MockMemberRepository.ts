import type { Member, CreateMemberDTO, UpdateMemberDTO } from '../../domain/entities/Member';
import type { IMemberRepository } from '../../domain/repositories/IMemberRepository';

const STORAGE_KEY = 'bio-tracker-members';

export class MockMemberRepository implements IMemberRepository {
    private members: Member[] = [];

    constructor() {
        this.loadFromStorage();
    }

    private loadFromStorage(): void {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            this.members = parsed.map((m: any) => ({
                ...m,
                dateOfBirth: new Date(m.dateOfBirth),
                createdAt: new Date(m.createdAt),
                updatedAt: new Date(m.updatedAt),
            }));
        }
    }

    private saveToStorage(): void {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.members));
    }

    async create(data: CreateMemberDTO): Promise<Member> {
        const member: Member = {
            id: crypto.randomUUID(),
            ...data,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        this.members.push(member);
        this.saveToStorage();
        return member;
    }

    async findById(id: string): Promise<Member | null> {
        return this.members.find(m => m.id === id) || null;
    }

    async findAll(): Promise<Member[]> {
        return [...this.members];
    }

    async update(id: string, data: UpdateMemberDTO): Promise<Member> {
        const index = this.members.findIndex(m => m.id === id);
        if (index === -1) {
            throw new Error('Member not found');
        }
        this.members[index] = {
            ...this.members[index],
            ...data,
            updatedAt: new Date(),
        };
        this.saveToStorage();
        return this.members[index];
    }

    async delete(id: string): Promise<void> {
        this.members = this.members.filter(m => m.id !== id);
        this.saveToStorage();
    }
}
