import { CalendarEvent } from "@/types/calendar";

interface Props {
  event: CalendarEvent;
  onClick: () => void;
}

export default function EventCard({ event, onClick }: Props) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className="flex items-center justify-between gap-2 rounded-lg border border-[#D1D5DB] bg-[#FEF3C7] px-2 py-1 text-left text-xs text-[#92400E] transition hover:bg-[#FDE68A]"
    >
      <span className="truncate">{event.title}</span>
      <span className="whitespace-nowrap">{new Date(event.start_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
    </button>
  );
}
