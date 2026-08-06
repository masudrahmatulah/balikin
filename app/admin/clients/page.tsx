import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin";
import { ClientsTable } from "@/components/admin/clients-table";
import { getAllClients } from "@/app/actions/admin-client-actions";

export const dynamic = "force-dynamic";

export default async function AdminClientsPage() {
  const session = await getAdminSession();

  if (!session) {
    redirect("/sign-in?redirect=/admin/clients");
  }

  const result = await getAllClients();

  if ("error" in result) {
    redirect("/sign-in?redirect=/admin/clients");
  }

  return (
    <div className="space-y-6" role="main" aria-label="Admin Client Management">
      <header>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Manajemen Klien
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Kelola akun pengguna: tambah, edit, atau hapus klien
        </p>
      </header>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <ClientsTable users={result.users} />
      </div>
    </div>
  );
}
