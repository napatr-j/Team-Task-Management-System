export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen w-full">
      <div className="flex min-h-screen w-full flex-col">
        <div className="flex-1 w-full">{children}</div>
      </div>
    </main>
  );
}
