"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AddGroupSheet } from "@/components/groups/AddGroupSheet";
import { EmptyGroupState } from "@/components/groups/EmptyGroupState";
import { GroupGrid } from "@/components/groups/GroupGrid";
import { Group } from "@/types/group";

export default function GroupsPage() {
  const router = useRouter();
  const [groups, setGroups] = useState<Group[]>([]);
  const [searchValue, setSearchValue] = useState("");
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function fetchGroups() {
      setIsLoading(true);
      try {
        const res = await fetch("/api/groups");
        if (!res.ok) {
          setGroups([]);
          return;
        }

        const data = (await res.json()) as Group[];
        if (isMounted) {
          setGroups(data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchGroups();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredGroups = useMemo(
    () =>
      groups.filter((group) =>
        group.name.toLowerCase().includes(searchValue.toLowerCase()),
      ),
    [groups, searchValue],
  );

  const activeGroup = filteredGroups[0] ?? null;
  const otherGroups = filteredGroups.slice(1);

  const handleGroupCreated = (group: Group) => {
    setGroups((current) => [group, ...current]);
  };

  return (
    <main className="min-h-screen bg-bg px-5 py-8 text-text sm:px-8 lg:px-12">
      <div className="mx-auto flex max-w-[1320px] flex-col gap-8">
        <section className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm uppercase tracking-[0.32em] text-olive">Team Ecosystems</p>
            <h1 className="mt-3 text-4xl font-semibold text-text">Coordinate, build, and scale your groups</h1>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="min-w-[260px]">
              <Input
                type="search"
                placeholder="Search groups..."
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                className="border-[#D1D1D1] focus:border-olive focus:ring-olive"
              />
            </div>
            <Button
              type="button"
              className="bg-olive text-white hover:bg-oliveDark"
              onClick={() => setIsSheetOpen(true)}
            >
              + New Group
            </Button>
          </div>
        </section>

        {activeGroup ? (
          <section className="rounded-[24px] border border-[#E0E0E0] bg-surface p-8 shadow-soft">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-2xl">
                <p className="text-xs uppercase tracking-[0.32em] text-olive">ACTIVE PROJECT</p>
                <h2 className="mt-3 text-3xl font-semibold text-text">{activeGroup.name}</h2>
                <p className="mt-4 max-w-xl text-sm leading-7 text-textMuted">
                  {activeGroup.mission}
                </p>
              </div>
              <div className="grid gap-3 sm:auto-cols-min sm:grid-flow-col">
                <Button
                  type="button"
                  variant="ghost"
                  className="text-olive hover:opacity-80"
                  onClick={() => router.push(`/protected/groups/${activeGroup.id}`)}
                >
                  View Dashboard
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="text-textMuted hover:text-olive"
                  onClick={() => router.push(`/protected/groups/${activeGroup.id}`)}
                >
                  Manage Members
                </Button>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              {activeGroup.members.slice(0, 4).map((member) => (
                <span
                  key={member.id}
                  className="flex h-11 min-w-[96px] items-center gap-3 rounded-2xl bg-olive/10 px-4 py-3 text-sm text-text"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-olive shadow-sm">
                    {member.avatarInitials}
                  </span>
                  <span className="truncate">{member.email}</span>
                </span>
              ))}
            </div>
          </section>
        ) : null}

        <section className="space-y-6">
          {isLoading ? (
            <div className="rounded-[32px] border border-[#E0E0E0] bg-surface p-10 text-center text-textMuted shadow-soft">
              Loading groups...
            </div>
          ) : filteredGroups.length === 0 ? (
            <EmptyGroupState />
          ) : otherGroups.length > 0 ? (
            <GroupGrid groups={otherGroups} onSelect={(id) => router.push(`/protected/groups/${id}`)} />
          ) : null}
        </section>
      </div>

      <button
        type="button"
        onClick={() => setIsSheetOpen(true)}
        className="fixed bottom-8 right-8 z-20 inline-flex h-14 w-14 items-center justify-center rounded-full bg-olive text-white shadow-soft transition duration-200 hover:scale-105 hover:bg-oliveDark active:scale-95"
        aria-label="Create new group"
      >
        +
      </button>

      <AddGroupSheet
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        onGroupCreated={handleGroupCreated}
      />
    </main>
  );
}
