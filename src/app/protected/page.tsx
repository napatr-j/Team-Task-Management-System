import { createClient } from "@/lib/supabase/server";
import { Suspense } from "react";

export default async function ProtectedPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const userJson = JSON.stringify(user, null, 2);

  return (
    <div className="flex-1 w-full flex flex-col gap-12">
      <div className="w-full">
        <div className="bg-accent text-sm p-3 px-5 rounded-md flex gap-3 items-center">
          This is a protected page that you can only see as an authenticated user
        </div>
      </div>

      <div>
        <h2 className="font-bold text-2xl mb-4">Your user details</h2>
        <pre className="text-xs font-mono p-3 rounded border max-h-32 overflow-auto">
          {userJson}
        </pre>
      </div>

    </div>
  );
}