import PageClient from "./page_client";

type DashboardPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  // Next.js (app router) provides searchParams as a Promise in server components
  const sp = (await searchParams) ?? {};
  const isDemoMode = sp.demo !== undefined;
  return <PageClient demoMode={isDemoMode} />;
}
