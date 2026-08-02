import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin";
import { TagsTable } from "@/components/admin/tags-table";
import { getAllTagsForAdmin } from "@/app/actions/admin-tag-actions";
import { TagsTableSkeleton } from "@/components/admin/skeletons";

export default async function AdminTagsPage() {
  const session = await getAdminSession();

  if (!session) {
    redirect("/sign-in?redirect=/admin/tags");
  }

  const tags = await getAllTagsForAdmin();

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
        <TagsTable tags={tags} />
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
