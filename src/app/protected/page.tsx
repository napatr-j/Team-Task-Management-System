"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function ProtectedPage() {
  const [userJson, setUserJson] = useState<string>("Loading...");

  useEffect(() => {
    const supabase = createClient();

    async function loadUser() {
      const { data, error } = await supabase.auth.getSession();
      if (error || !data?.session?.user) {
        setUserJson("No active user session.");
        return;
      }

      setUserJson(JSON.stringify(data.session.user, null, 2));
    }

    loadUser();
  }, []);

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
