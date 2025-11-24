export interface MemberListItemDTO {
  id: string;
  name: string;
  documentNumber: string;
  email: string;
  age: number;
  frequency: string; // e.g., "3x/semana" or "N/A"
  status: "active" | "inactive" | "moroso";
  avatarUrl?: string;
}
