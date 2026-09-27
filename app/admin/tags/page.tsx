import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin";
import { TagsTable } from "@/components/admin/tags-table";
import { getTagOwnersForAdmin, getTagsForAdmin } from "@/app/actions/admin-tag-actions";
import { TagsTableSkeleton } from "@/components/admin/skeletons";

const UNCLAIMED_OWNER_VALUE = "__unclaimed__";

export default async function AdminTagsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string; status?: string; owner?: string }>;
}) {
  const session = await getAdminSession();

  if (!session) {
    redirect("/sign-in?redirect=/admin/tags");
  }

  const params = await searchParams;
  const status = params.status === 'normal' || params.status === 'lost' ? params.status : 'all';
  const owner = params.owner || 'all';
  const [result, owners] = await Promise.all([
    getTagsForAdmin({
      page: Number.parseInt(params.page || '1', 10),
      search: params.search,
      status,
      ownerId: owner,
    }),
    getTagOwnersForAdmin(),
  ]);

  return (
    <div className="space-y-6" role="main" aria-label="Admin Tags Management">
      <header>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Manajemen Tags
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Kelola semua QR codes di sistem
        </p>
      </header>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <TagsTable
          tags={result.tags}
          owners={owners}
          currentPage={result.page}
          totalPages={result.totalPages}
          totalTags={result.total}
          search={params.search || ''}
          statusFilter={status}
          ownerFilter={owner}
          unclaimedOwnerValue={UNCLAIMED_OWNER_VALUE}
        />
      </div>
    </div>
  );
}

export const AdminTagsPageLoading = () => {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="h-7 w-48 bg-gray-200 rounded animate-pulse" />
        <div className="h-4 w-64 bg-gray-100 rounded animate-pulse" />
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <TagsTableSkeleton />
      </div>
    </div>
  );
};
