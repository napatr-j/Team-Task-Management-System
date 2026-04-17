import CalendarWorkspace from "@/components/calendar/CalendarWorkspace";

interface GroupCalendarPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function GroupCalendarPage({ params }: GroupCalendarPageProps) {
  const { id } = await params;
  return <CalendarWorkspace groupId={id} />;
}
