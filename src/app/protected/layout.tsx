import { createClient, ensureUserProfile } from "@/lib/supabase/server";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  await ensureUserProfile(supabase);

  return (
    <main className="min-h-screen w-full">
      <div className="flex min-h-screen w-full flex-col">
        <div className="flex-1 w-full">{children}</div>
      </div>
    </main>
  );
}
