import { useState, useEffect } from 'react';
import { container } from '@core/container/bindings';
import { TYPES } from '@core/container/DIContainer';
import type { ListMembersUseCase } from '@application/member/use-cases/ListMembersUseCase';
import type { Member } from '@domain/member/entities/Member';
import { MemberListPage } from './MemberListPage';

export default function MemberListPageController() {
    const [members, setMembers] = useState<Member[]>([]);
    const [loading, setLoading] = useState(true);

    const listMembersUseCase = container.get<ListMembersUseCase>(TYPES.ListMembersUseCase);

    useEffect(() => {
        loadMembers();
    }, []);

    const loadMembers = async () => {
        setLoading(true);
        try {
            const data = await listMembersUseCase.execute();
            setMembers(data);
        } catch (error) {
            console.error('Error loading members:', error);
        } finally {
            setLoading(false);
        }
    };

    return <MemberListPage members={members} loading={loading} />;
}

