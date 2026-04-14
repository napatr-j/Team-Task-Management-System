import { Suspense } from "react";
import Sidebar from "../../../components/layout/Sidebar";
import TopBar from "../../../components/layout/TopBar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-team-bg text-team-text">
      <div className="flex min-h-screen">
        <Suspense
          fallback={
            <aside className="hidden md:flex h-screen w-20 items-center justify-center bg-[#E0E0E0] text-team-text">
              Loading...
            </aside>
          }
        >
          <Sidebar />
        </Suspense>

        <div className="flex-1 min-h-screen">
          <TopBar />
          <main className="w-full px-4 py-6 sm:px-6 lg:px-8">
            <Suspense fallback={<div className="rounded-[1.5rem] bg-team-surface p-6 shadow-soft">Loading dashboard...</div>}>
              {children}
            </Suspense>
          </main>
        </div>
      </div>
    </div>
  );
}
