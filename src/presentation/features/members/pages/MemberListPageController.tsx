import { useState, useEffect } from "react";
import { container } from "@core/container/bindings";
import { TYPES } from "@core/container/DIContainer";
import type { ListMembersUseCase } from "@application/member/use-cases/ListMembersUseCase";
import type { Member } from "@domain/member/entities/Member";
import { MemberListPage } from "./MemberListPage";

export default function MemberListPageController() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  const listMembersUseCase = container.get<ListMembersUseCase>(TYPES.ListMembersUseCase);

  const loadMembers = async () => {
    setLoading(true);
    setError("");
    const result = await listMembersUseCase.execute();

    if (result.isError()) {
      setError(result.getError());
      console.error("Error loading members:", result.getError());
    } else {
      setMembers(result.getValue());
    }

    setLoading(false);
  };

  useEffect(() => {
    loadMembers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <MemberListPage members={members} loading={loading} error={error} />;
}
