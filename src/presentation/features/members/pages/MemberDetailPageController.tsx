import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { container } from '@core/container/bindings';
import { TYPES } from '@core/container/DIContainer';
import type { GetMemberDetailsUseCase, MemberDetails } from '@application/member/use-cases/GetMemberDetailsUseCase';
import type { RecordBioimpedanceUseCase } from '@application/bioimpedance/use-cases/RecordBioimpedanceUseCase';
import type { CreateBioimpedanceDTO } from '@domain/bioimpedance/entities/Bioimpedance';
import { MemberDetailPage } from './MemberDetailPage';

export default function MemberDetailPageController() {
    const { memberId } = useParams<{ memberId: string }>();
    const navigate = useNavigate();
    const [details, setDetails] = useState<MemberDetails | null>(null);
    const [loading, setLoading] = useState(true);

    const getMemberDetailsUseCase = container.get<GetMemberDetailsUseCase>(TYPES.GetMemberDetailsUseCase);
    const recordBioimpedanceUseCase = container.get<RecordBioimpedanceUseCase>(TYPES.RecordBioimpedanceUseCase);

    useEffect(() => {
        if (memberId) {
            loadDetails();
        }
    }, [memberId]);

    const loadDetails = async () => {
        if (!memberId) return;

        setLoading(true);
        try {
            const data = await getMemberDetailsUseCase.execute(memberId);
            setDetails(data);
        } catch (error) {
            console.error('Error loading member details:', error);
            navigate('/');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (bioData: CreateBioimpedanceDTO) => {
        if (!memberId) return;

        try {
            await recordBioimpedanceUseCase.execute(bioData);
            await loadDetails();
        } catch (error) {
            console.error('Error recording bioimpedance:', error);
            throw error;
        }
    };

    return <MemberDetailPage details={details} loading={loading} onSubmit={handleSubmit} />;
}

