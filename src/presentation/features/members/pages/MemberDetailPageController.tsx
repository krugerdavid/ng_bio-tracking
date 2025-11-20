import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { container } from "@core/container/bindings";
import { TYPES } from "@core/container/DIContainer";
import type { GetMemberDetailsUseCase, MemberDetails } from "@application/member/use-cases/GetMemberDetailsUseCase";
import type { RecordBioimpedanceUseCase } from "@application/bioimpedance/use-cases/RecordBioimpedanceUseCase";
import type { CreateBioimpedanceDTO } from "@domain/bioimpedance/entities/Bioimpedance";
import { MemberDetailPage } from "./MemberDetailPage";

export default function MemberDetailPageController() {
  const { memberId } = useParams<{ memberId: string }>();
  const navigate = useNavigate();
  const [details, setDetails] = useState<MemberDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  const getMemberDetailsUseCase = container.get<GetMemberDetailsUseCase>(TYPES.GetMemberDetailsUseCase);
  const recordBioimpedanceUseCase = container.get<RecordBioimpedanceUseCase>(TYPES.RecordBioimpedanceUseCase);

  const loadDetails = async () => {
    if (!memberId) return;

    setLoading(true);
    setError("");
    const result = await getMemberDetailsUseCase.execute(memberId);

    if (result.isError()) {
      setError(result.getError());
      console.error("Error loading member details:", result.getError());
      navigate("/");
    } else {
      setDetails(result.getValue());
    }

    setLoading(false);
  };

  useEffect(() => {
    if (memberId) {
      loadDetails();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [memberId]);

  const handleSubmit = async (bioData: CreateBioimpedanceDTO) => {
    if (!memberId) return;

    const result = await recordBioimpedanceUseCase.execute(bioData);

    if (result.isError()) {
      console.error("Error recording bioimpedance:", result.getError());
      throw new Error(result.getError());
    } else {
      await loadDetails();
    }
  };

  return <MemberDetailPage details={details} loading={loading} error={error} onSubmit={handleSubmit} />;
}
