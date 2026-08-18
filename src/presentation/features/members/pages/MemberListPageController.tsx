import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { container } from "@core/container/bindings";
import { TYPES } from "@core/container/DIContainer";
import type { ListMembersUseCase } from "@application/member/use-cases/ListMembersUseCase";
import type { DeleteMemberUseCase } from "@application/member/use-cases/DeleteMemberUseCase";
import type { ApproveMemberUseCase } from "@application/member/use-cases/ApproveMemberUseCase";
import type { MemberListItemDTO } from "@application/member/dtos/MemberListItemDTO";
import { MemberListPage } from "./MemberListPage";
import { DeleteConfirmationModal } from "@presentation/shared/components/DeleteConfirmationModal";

export default function MemberListPageController() {
  const [members, setMembers] = useState<MemberListItemDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [searchParams] = useSearchParams();
  const [trainingGroupFilter, setTrainingGroupFilter] = useState("");
  const [showOnlyPending, setShowOnlyPending] = useState(() => searchParams.get("status") === "pending");
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [approveError, setApproveError] = useState("");

  // Delete state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<{ id: string; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const listMembersUseCase = container.get<ListMembersUseCase>(TYPES.ListMembersUseCase);
  const deleteMemberUseCase = container.get<DeleteMemberUseCase>(TYPES.DeleteMemberUseCase);
  const approveMemberUseCase = container.get<ApproveMemberUseCase>(TYPES.ApproveMemberUseCase);

  const loadMembers = async () => {
    setLoading(true);
    setError("");
    const result = await listMembersUseCase.execute({
      page,
      limit,
      search,
      trainingGroup: trainingGroupFilter || undefined,
      status: showOnlyPending ? "pending" : undefined,
    });

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
  }, [page, search, trainingGroupFilter, showOnlyPending]);

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1); // Reset to first page on search
  };

  const handleTrainingGroupFilterChange = (value: string) => {
    setTrainingGroupFilter(value);
    setPage(1);
  };

  const handleTogglePendingOnly = (value: boolean) => {
    setShowOnlyPending(value);
    setPage(1);
  };

  const handleApprove = async (id: string) => {
    setApproveError("");
    setApprovingId(id);
    const result = await approveMemberUseCase.execute(id);
    setApprovingId(null);

    if (result.isError()) {
      setApproveError(result.getError());
    } else {
      loadMembers();
    }
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleDeleteClick = (id: string, name: string) => {
    setMemberToDelete({ id, name });
    setDeleteError("");
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!memberToDelete) return;

    setIsDeleting(true);
    setDeleteError("");

    try {
      const result = await deleteMemberUseCase.execute(memberToDelete.id);

      if (result.isError()) {
        setDeleteError(result.getError());
      } else {
        setDeleteModalOpen(false);
        setMemberToDelete(null);
        // Refresh list
        loadMembers();
      }
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Error al eliminar deportista");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <MemberListPage
        members={members}
        loading={loading}
        error={error || approveError}
        page={page}
        totalPages={Math.ceil(total / limit)}
        totalMembers={total}
        trainingGroupFilter={trainingGroupFilter}
        showOnlyPending={showOnlyPending}
        approvingId={approvingId}
        onSearch={handleSearch}
        onTrainingGroupFilterChange={handleTrainingGroupFilterChange}
        onTogglePendingOnly={handleTogglePendingOnly}
        onApprove={handleApprove}
        onPageChange={handlePageChange}
        onRefresh={loadMembers}
        onDelete={handleDeleteClick}
      />

      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Eliminar Deportista"
        message="¿Estás seguro de que deseas eliminar a este deportista? Esta acción eliminará permanentemente todos sus datos asociados y no se puede deshacer."
        itemName={memberToDelete?.name}
        loading={isDeleting}
        error={deleteError}
      />
    </>
  );
}
