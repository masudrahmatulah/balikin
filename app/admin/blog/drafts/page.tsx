import { redirect } from "next/navigation";

export default function DraftsPage() {
  redirect("/admin/blog?status=draft");
}
