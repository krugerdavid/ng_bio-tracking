import type { Bioimpedance, CreateBioimpedanceDTO } from '../../domain/entities/Bioimpedance';
import type { IBioimpedanceRepository } from '../../domain/repositories/IBioimpedanceRepository';

const STORAGE_KEY = 'bio-tracker-bioimpedances';

export class MockBioimpedanceRepository implements IBioimpedanceRepository {
    private bioimpedances: Bioimpedance[] = [];

    constructor() {
        this.loadFromStorage();
    }

    private loadFromStorage(): void {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            this.bioimpedances = parsed.map((b: any) => ({
                ...b,
                date: new Date(b.date),
                createdAt: new Date(b.createdAt),
            }));
        }
    }

    private saveToStorage(): void {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.bioimpedances));
    }

    async create(data: CreateBioimpedanceDTO): Promise<Bioimpedance> {
        const bioimpedance: Bioimpedance = {
            id: crypto.randomUUID(),
            ...data,
            createdAt: new Date(),
        };
        this.bioimpedances.push(bioimpedance);
        this.saveToStorage();
        return bioimpedance;
    }

    async findById(id: string): Promise<Bioimpedance | null> {
        return this.bioimpedances.find(b => b.id === id) || null;
    }

    async findByMemberId(memberId: string): Promise<Bioimpedance[]> {
        return this.bioimpedances
            .filter(b => b.memberId === memberId)
            .sort((a, b) => b.date.getTime() - a.date.getTime());
    }

    async delete(id: string): Promise<void> {
        this.bioimpedances = this.bioimpedances.filter(b => b.id !== id);
        this.saveToStorage();
    }
}
