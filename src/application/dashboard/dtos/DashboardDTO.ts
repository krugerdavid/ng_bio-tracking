export interface DashboardMemberByFrequency {
  frequency: string;
  count: number;
}

export interface DashboardLastMember {
  id: string;
  name: string;
  documentNumber: string;
  createdAt: Date;
}

export interface DashboardPendingApproval {
  id: string;
  name: string;
  email: string;
  trainingGroup?: string;
  createdAt: Date;
}

export interface DashboardLastPayment {
  id: string;
  memberId: string;
  memberName: string;
  amount: number;
  month: string;
  paymentDate: Date;
  createdAt: Date;
}

export interface DashboardResult {
  totalMembers: number;
  inArrearsCount: number;
  totalAmountInArrears: number;
  membersByFrequency: DashboardMemberByFrequency[];
  lastMembers: DashboardLastMember[];
  lastPayments: DashboardLastPayment[];
  pendingApprovals: DashboardPendingApproval[];
  revenueByMonth: { month: string; total: number }[];
  creditBalanceTotal: number;
}
