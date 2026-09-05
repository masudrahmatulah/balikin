import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin";
import { getSiteSettings } from "@/app/actions/site-settings";
import { TagGreetingSettingsForm } from "@/components/admin/tag-greeting-settings-form";
import { WhatsappSettingsForm } from "@/components/admin/whatsapp-settings-form";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Pengaturan Situs - Admin",
  description: "Kelola pengaturan pesan, template halaman publik, dan nomor WhatsApp admin",
};

export default async function AdminSettingsPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect("/sign-in?redirect=/admin/settings");
  }
  if (session.user.role !== "admin") {
    redirect("/admin");
  }

  const settings = await getSiteSettings();

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Pengaturan Situs
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Kelola pesan, template, dan nomor WhatsApp yang tampil di halaman publik tag.
        </p>
      </div>

      <div className="space-y-8">
        <WhatsappSettingsForm initialNumber={settings.adminWhatsappNumber} />
        <TagGreetingSettingsForm initialTemplate={settings.tagGreetingTemplate} />
      </div>
    </div>
  );
}