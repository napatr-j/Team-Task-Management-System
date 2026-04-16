import GroupTaskBoard from "@/components/groups/GroupTaskBoard";

interface GroupTaskBoardPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function GroupTaskBoardPage({ params }: GroupTaskBoardPageProps) {
  const { id } = await params;
  return <GroupTaskBoard groupId={id} />;
}
