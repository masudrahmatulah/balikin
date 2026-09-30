import { getUserModuleRequests } from "@/app/actions/module-request-actions";
import { RequestHistoryList } from "./request-history-list";

interface RequestHistoryWrapperProps {
  userId: string;
}

export async function RequestHistoryWrapper({ userId }: RequestHistoryWrapperProps) {
  const requests = await getUserModuleRequests();
  const normalizedRequests = requests.flatMap((request) => {
    if (
      (request.status !== 'pending' && request.status !== 'approved' && request.status !== 'rejected') ||
      !request.requestedAt
    ) {
      return [];
    }

    const status: 'pending' | 'approved' | 'rejected' = request.status;
    return [{
      id: request.id,
      moduleType: request.moduleType,
      status,
      requestedAt: request.requestedAt,
      reviewedAt: request.reviewedAt,
      reason: request.reason,
      rejectionReason: request.rejectionReason,
    }];
  });

  return <RequestHistoryList requests={normalizedRequests} />;
}
