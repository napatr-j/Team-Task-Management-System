import Image from "next/image";

export function EmptyGroupState() {
  const illustration =
    "data:image/svg+xml,%3Csvg width='320' height='220' viewBox='0 0 320 220' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='320' height='220' rx='24' fill='%23F5F5F5'/%3E%3Ccircle cx='85' cy='90' r='35' fill='%2384934A' fill-opacity='0.12'/%3E%3Ccircle cx='120' cy='70' r='18' fill='%23492828' fill-opacity='0.16'/%3E%3Crect x='165' y='50' width='120' height='18' rx='9' fill='%2384934A' fill-opacity='0.14'/%3E%3Crect x='165' y='85' width='95' height='18' rx='9' fill='%23492828' fill-opacity='0.12'/%3E%3Crect x='45' y='150' width='230' height='18' rx='9' fill='%2384934A' fill-opacity='0.14'/%3E%3Crect x='45' y='180' width='165' height='18' rx='9' fill='%23492828' fill-opacity='0.1'/%3E%3C/svg%3E";

  return (
    <div className="rounded-[32px] border border-dashed border-[#D1D1D1] bg-surface px-8 py-12 text-center shadow-sm">
      <div className="mx-auto mb-8 w-full max-w-xs">
        <Image src={illustration} alt="Empty group illustration" width={320} height={220} unoptimized />
      </div>
      <p className="text-sm uppercase tracking-[0.25em] text-olive">No groups yet</p>
      <h2 className="mt-4 text-2xl font-semibold text-text">Start building your first collective</h2>
      <p className="mt-3 text-sm leading-6 text-textMuted">
        Create a team ecosystem, invite collaborators, and launch your next strategic project.
      </p>
    </div>
  );
}
