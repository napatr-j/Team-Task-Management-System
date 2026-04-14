"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { LayoutDashboard, Users } from "lucide-react";

interface Group {
  id: string;
  name: string;
}

const navigation = [
  { label: "Dashboard", icon: LayoutDashboard, key: "dashboard" },
  { label: "Groups", icon: Users, key: "groups" },
];

const groupTools = ["Calendar", "Task Board", "Task List"];

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const selectedGroupId = searchParams.get("group");
  const [groups, setGroups] = useState<Group[]>([]);
  const [hoveredGroupId, setHoveredGroupId] = useState<string | null>(null);
  const activeSection = pathname?.startsWith("/protected/groups") ? "groups" : "dashboard";

  useEffect(() => {
    async function loadGroups() {
      try {
        const response = await fetch("/api/dashboard/groups", { cache: "no-store" });
        const data = (await response.json()) as Group[];
        setGroups(data);
      } catch {
        setGroups([]);
      }
    }

    loadGroups();
  }, []);

  const handleGroupClick = (groupId: string) => {
    const params = new URLSearchParams(Array.from(searchParams.entries()));
    params.set("group", groupId);
    router.push(`${pathname ?? "/protected/groups"}?${params.toString()}`);
  };

  const clearGroup = () => {
    const params = new URLSearchParams(Array.from(searchParams.entries()));
    params.delete("group");
    router.push(params.toString() ? `?${params.toString()}` : "/protected/dashboard");
  };

  return (
    <aside className="group hidden md:flex sticky top-0 h-screen w-20 flex-col justify-between overflow-hidden bg-[#E0E0E0] px-2 py-6 text-team-text transition-all duration-200 hover:w-72 hover:px-5">
      <div className="space-y-10">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-team-olive text-team-surface shadow-soft">
            <LayoutDashboard size={22} />
          </div>
          <div className="hidden overflow-hidden whitespace-nowrap transition-all duration-200 group-hover:block">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-team-olive">TeamSync</p>
            <p className="text-xs text-team-text/70">Workspace</p>
          </div>
        </div>

        <nav className="space-y-2">
          {navigation.map((item) => {
            const active = activeSection === item.key;
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                type="button"
                onClick={() => {
                  if (item.key === "dashboard") {
                    clearGroup();
                    router.push("/protected/dashboard");
                  } else {
                    router.push("/protected/groups");
                  }
                }}
                className={`flex w-full items-center gap-3 rounded-2xl border-l-4 border-transparent px-3 py-3 text-left text-sm transition-all duration-200 ${
                  active ? "border-team-olive bg-team-olive/10 font-semibold text-team-olive" : "text-team-text/80 hover:bg-team-olive/10"
                }`}
              >
                <Icon size={18} />
                <span className="hidden transition-opacity duration-200 group-hover:inline">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {groups.length > 0 && (
          <div className="space-y-3 border-t border-team-olive/20 pt-4">
            <div className="space-y-2">
              {groups.map((group) => (
                <div
                  key={group.id}
                  className="group"
                  onMouseEnter={() => setHoveredGroupId(group.id)}
                  onMouseLeave={() => setHoveredGroupId(null)}
                >
                  <button
                    type="button"
                    onClick={() => handleGroupClick(group.id)}
                    className="group flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm text-team-text/80 transition-all duration-200 hover:bg-team-olive/10"
                  >
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-2xl bg-team-olive/10 text-team-olive transition-transform duration-300 ease-out group-hover:scale-105 group-hover:shadow-lg">
                      {group.name.slice(0, 2).toUpperCase()}
                    </span>
                    <span className="hidden transition-opacity duration-200 group-hover:inline">{group.name}</span>
                  </button>

                  {hoveredGroupId === group.id && (
                    <div className="mt-2 space-y-2 rounded-2xl border border-team-olive/10 bg-[#F4F5EB] p-3">
                      <p className="text-[11px] uppercase tracking-[0.24em] text-team-text/60">Group tools</p>
                      {groupTools.map((item) => (
                        <button
                          key={item}
                          type="button"
                          className="flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-left text-sm text-team-text/80 transition-all duration-200 hover:bg-team-olive/10"
                        >
                          <span className="h-2.5 w-2.5 rounded-full bg-team-olive" />
                          <span>{item}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

    </aside>
  );
}
