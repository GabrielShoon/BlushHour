import { AdminDashboard } from "./dashboard";

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; saved?: string; deleted?: string }>;
}) {
  const sp = await searchParams;
  const notice = sp.saved ? `Saved “${sp.saved}”.` : sp.deleted ? `Deleted “${sp.deleted}”.` : undefined;
  return <AdminDashboard tab={sp.tab === "ideas" ? "ideas" : "places"} notice={notice} />;
}
