import { getUserModuleRequests } from "@/app/actions/module-request-actions";
import { RequestHistoryList } from "./request-history-list";

interface RequestHistoryWrapperProps {
  userId: string;
}

export async function RequestHistoryWrapper({ userId }: RequestHistoryWrapperProps) {
  const requests = await getUserModuleRequests();

  return <RequestHistoryList requests={requests} />;
}
