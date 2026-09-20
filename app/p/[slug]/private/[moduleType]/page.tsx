import { notFound, redirect } from "next/navigation";
import { eq, and } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/db";
import { otomotifData, pertanianData, tags, moduleConfig, userModulePermissions } from "@/db/schema";
import { TagModuleForm } from "@/components/modules/tag-module-form";

interface ModulePageProps {
  params: Promise<{ slug: string; moduleType: string }>;
}

export default async function TagModulePage({ params }: ModulePageProps) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect(`/sign-in?redirect=${encodeURIComponent("/p/" + (await params).slug)}`);

  const { slug, moduleType } = await params;
  if (moduleType !== "otomotif" && moduleType !== "pertanian") notFound();

  const tag = await db.query.tags.findFirst({ where: and(eq(tags.slug, slug), eq(tags.app_id, "balikin_id")) });
  if (!tag) notFound();
  if (tag.ownerId !== session.user.id) {
    return <div className="py-12 text-center text-slate-600">Anda tidak memiliki akses ke modul ini.</div>;
  }

  const config = await db.query.moduleConfig.findFirst({
    where: and(eq(moduleConfig.moduleType, moduleType), eq(moduleConfig.app_id, "balikin_id")),
    columns: { isEnabled: true, isPaid: true },
  });
  const permission = config?.isPaid
    ? await db.query.userModulePermissions.findFirst({
        where: and(
          eq(userModulePermissions.userId, session.user.id),
          eq(userModulePermissions.moduleType, moduleType),
          eq(userModulePermissions.app_id, "balikin_id"),
          eq(userModulePermissions.isEnabled, true),
        ),
        columns: { id: true },
      })
    : config?.isEnabled ? { id: "free" } : null;
  if (!config?.isEnabled || !permission) {
    return <div className="py-12 text-center text-slate-600">Akses ke modul ini belum aktif.</div>;
  }

  const data = moduleType === "otomotif"
      ? await db.query.otomotifData.findFirst({ where: and(eq(otomotifData.tagId, tag.id), eq(otomotifData.userId, session.user.id), eq(otomotifData.app_id, "balikin_id")) })
      : await db.query.pertanianData.findFirst({ where: and(eq(pertanianData.tagId, tag.id), eq(pertanianData.userId, session.user.id), eq(pertanianData.app_id, "balikin_id")) });

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm font-medium text-brand-red">Tag: {tag.name || tag.slug}</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
          {moduleType === "otomotif" ? "Modul Otomotif" : "Modul Pertanian"}
        </h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Kelola data yang terhubung ke tag ini. Tag lain memiliki data modulnya sendiri.
        </p>
      </header>
      {moduleType === "otomotif" ? (
        <TagModuleForm moduleType="otomotif" tagId={tag.id} initialData={data} />
      ) : (
        <TagModuleForm moduleType="pertanian" tagId={tag.id} initialData={data} />
      )}
    </div>
  );
}
