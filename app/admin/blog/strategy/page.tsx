import { redirect } from "next/navigation";
import { asc, eq } from "drizzle-orm";
import { getAdminSession } from "@/lib/admin";
import { db } from "@/db";
import { blogContentClusters, blogContentPlans } from "@/db/schema";
import { ContentStrategyClient } from "@/components/blog/content-strategy-client";

export default async function ContentStrategyPage() {
  const session = await getAdminSession();
  if (!session) redirect("/sign-in?redirect=/admin/blog/strategy");

  const [clusters, plans] = await Promise.all([
    db.select().from(blogContentClusters).where(eq(blogContentClusters.app_id, "balikin_id")).orderBy(asc(blogContentClusters.name)),
    db.select().from(blogContentPlans).where(eq(blogContentPlans.app_id, "balikin_id")).orderBy(asc(blogContentPlans.title)),
  ]);

  return (
    <ContentStrategyClient
      initialClusters={clusters.map((cluster) => ({
        ...cluster,
        createdAt: cluster.createdAt.toISOString(),
        updatedAt: cluster.updatedAt.toISOString(),
      }))}
      initialPlans={plans.map((plan) => ({
        ...plan,
        createdAt: plan.createdAt.toISOString(),
        updatedAt: plan.updatedAt.toISOString(),
        targetPublishDate: plan.targetPublishDate?.toISOString() || null,
      }))}
    />
  );
}
