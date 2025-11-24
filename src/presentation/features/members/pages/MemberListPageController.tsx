import { useState, useEffect } from "react";
import { container } from "@core/container/bindings";
import { TYPES } from "@core/container/DIContainer";
import type { ListMembersUseCase } from "@application/member/use-cases/ListMembersUseCase";
import type { MemberListItemDTO } from "@application/member/dtos/MemberListItemDTO";
import { MemberListPage } from "./MemberListPage";

export default function MemberListPageController() {
  const [members, setMembers] = useState<MemberListItemDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");

  const listMembersUseCase = container.get<ListMembersUseCase>(TYPES.ListMembersUseCase);

  const loadMembers = async () => {
    setLoading(true);
    setError("");
    const result = await listMembersUseCase.execute({ page, limit, search });

    if (result.isError()) {
      setError(result.getError());
      console.error("Error loading members:", result.getError());
    } else {
      const { items, total } = result.getValue();
      setMembers(items);
      setTotal(total);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadMembers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search]);

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1); // Reset to first page on search
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  return (
    <MemberListPage
      members={members}
      loading={loading}
      error={error}
      page={page}
      totalPages={Math.ceil(total / limit)}
      totalMembers={total}
      onSearch={handleSearch}
      onPageChange={handlePageChange}
      onRefresh={loadMembers}
    />
  );
}
