import { Task } from "@/types/calendar";

const priorityColor = {
  low: "bg-gray-400",
  medium: "bg-[#84934A]",
  high: "bg-[#492828]",
};

interface Props {
  task: Task;
  onClick: () => void;
}

export default function TaskCard({ task, onClick }: Props) {
  return (
    <div
      className={`flex items-center gap-2 bg-[#fff] rounded-lg px-2 py-1 shadow transition duration-200 cursor-pointer
        hover:shadow-lg hover:scale-105 hover:bg-[#ECECEC]`}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
    >
      <span className={`w-2 h-2 rounded-full ${priorityColor[task.priority]}`} />
      <span className="truncate text-sm text-[#1A1A1A]">{task.title}</span>
    </div>
  );
}