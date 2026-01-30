import PageClient from "./page_client";

type DashboardPageProps = {
  searchParams?: Record<string, string | string[] | undefined>;
};

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const sp = await searchParams ?? {};
  const isDemoMode = sp.demo !== undefined;
  return <PageClient demoMode={isDemoMode} />;
}
