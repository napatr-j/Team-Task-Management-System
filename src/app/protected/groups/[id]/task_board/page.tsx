"use client";

import { useParams } from "next/navigation";
import GroupTaskBoard from "@/components/groups/GroupTaskBoard";

export default function GroupTaskBoardPage() {
  const params = useParams();
  const groupId = Array.isArray(params?.id) ? params.id[0] : params?.id;

  if (!groupId) {
    return null;
  }

  return <GroupTaskBoard groupId={groupId} />;
}
