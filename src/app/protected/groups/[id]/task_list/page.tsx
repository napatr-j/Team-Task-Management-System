import GroupTaskList from "@/components/groups/GroupTaskList";

interface GroupTaskListPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function GroupTaskListPage({ params }: GroupTaskListPageProps) {
  const { id } = await params;
  return <GroupTaskList groupId={id} />;
}
