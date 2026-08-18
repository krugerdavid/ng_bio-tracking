import { useState, useEffect, useCallback } from "react";
import { container } from "@core/container/DIContainer";
import { TYPES } from "@core/container/DIContainer";
import type { GetDashboardUseCase } from "@application/dashboard/use-cases/GetDashboardUseCase";
import type { ApproveMemberUseCase } from "@application/member/use-cases/ApproveMemberUseCase";
import type { DashboardResult } from "@application/dashboard/dtos/DashboardDTO";
import { DashboardPage } from "./DashboardPage";

const getDashboardUseCase = container.get<GetDashboardUseCase>(TYPES.GetDashboardUseCase);
const approveMemberUseCase = container.get<ApproveMemberUseCase>(TYPES.ApproveMemberUseCase);

export default function DashboardPageController() {
  const [data, setData] = useState<DashboardResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [approvingId, setApprovingId] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    const result = await getDashboardUseCase.execute();
    if (result.isError()) {
      setError(result.getError());
      setData(null);
    } else {
      setData(result.getValue());
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    let cancelled = false;
    getDashboardUseCase.execute().then(result => {
      if (cancelled) return;
      if (result.isError()) {
        setError(result.getError());
        setData(null);
      } else {
        setData(result.getValue());
      }
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleApprove = async (id: string) => {
    setApprovingId(id);
    const result = await approveMemberUseCase.execute(id);
    setApprovingId(null);
    if (result.isSuccess()) {
      refresh();
    }
  };

  return (
    <DashboardPage
      data={data}
      loading={loading}
      error={error}
      onRefresh={refresh}
      onApprove={handleApprove}
      approvingId={approvingId}
    />
  );
}
